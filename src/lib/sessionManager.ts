interface SessionData {
  userId: string;
  email: string;
  name: string;
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
  sessionId: string;
  deviceInfo: string;
}

interface SessionWarning {
  show: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

interface WorkInProgress {
  textContent: string;
  selectedLanguage: string;
  voiceSettings: any;
  timestamp: number;
}

class SessionManager {
  private readonly SESSION_KEY = 'voiceverse_session';
  private readonly WORK_BACKUP_KEY = 'voiceverse_work_backup';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly ACTIVITY_THRESHOLD = 30 * 1000; // 30 seconds
  
  private activityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private expiryTimer: NodeJS.Timeout | null = null;
  private lastActivityTime = Date.now();
  
  private sessionWarningCallback: ((warning: SessionWarning) => void) | null = null;
  private sessionExpiredCallback: (() => void) | null = null;

  constructor() {
    this.initializeActivityTracking();
    this.checkExistingSession();
  }

  // Initialize activity tracking
  private initializeActivityTracking(): void {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, this.handleUserActivity.bind(this), true);
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.handleUserActivity();
      }
    });
  }

  // Handle user activity
  private handleUserActivity(): void {
    const now = Date.now();
    
    // Only update if enough time has passed to avoid excessive updates
    if (now - this.lastActivityTime > this.ACTIVITY_THRESHOLD) {
      this.lastActivityTime = now;
      this.updateSessionActivity();
    }
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }

  // Get device info for session tracking
  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    
    return `${platform} - ${language} - ${userAgent.substring(0, 50)}...`;
  }

  // Create new session
  createSession(userId: string, email: string, name: string): SessionData {
    const now = Date.now();
    const sessionData: SessionData = {
      userId,
      email,
      name,
      loginTime: now,
      lastActivity: now,
      expiresAt: now + this.SESSION_DURATION,
      sessionId: this.generateSessionId(),
      deviceInfo: this.getDeviceInfo()
    };

    this.saveSession(sessionData);
    this.startSessionTimers(sessionData);
    
    return sessionData;
  }

  // Save session to localStorage
  private saveSession(sessionData: SessionData): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Get current session
  getCurrentSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return null;

      const session: SessionData = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.expireSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      this.clearSession();
      return null;
    }
  }

  // Update session activity
  private updateSessionActivity(): void {
    const session = this.getCurrentSession();
    if (!session) return;

    const now = Date.now();
    session.lastActivity = now;
    
    // Extend session if user is active
    if (session.expiresAt - now < this.SESSION_DURATION / 2) {
      session.expiresAt = now + this.SESSION_DURATION;
    }

    this.saveSession(session);
  }

  // Extend session manually
  extendSession(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const now = Date.now();
    session.expiresAt = now + this.SESSION_DURATION;
    session.lastActivity = now;
    
    this.saveSession(session);
    this.startSessionTimers(session);
    
    return true;
  }

  // Check existing session on app load
  private checkExistingSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.startSessionTimers(session);
    }
  }

  // Start session timers
  private startSessionTimers(session: SessionData): void {
    this.clearTimers();

    const now = Date.now();
    const timeUntilWarning = session.expiresAt - now - this.WARNING_TIME;
    const timeUntilExpiry = session.expiresAt - now;

    // Set warning timer
    if (timeUntilWarning > 0) {
      this.warningTimer = setTimeout(() => {
        this.showSessionWarning();
      }, timeUntilWarning);
    } else if (timeUntilExpiry > 0) {
      // If we're already in warning period
      this.showSessionWarning();
    }

    // Set expiry timer
    if (timeUntilExpiry > 0) {
      this.expiryTimer = setTimeout(() => {
        this.expireSession();
      }, timeUntilExpiry);
    }
  }

  // Show session warning
  private showSessionWarning(): void {
    const session = this.getCurrentSession();
    if (!session) return;

    const timeRemaining = Math.max(0, session.expiresAt - Date.now());
    
    if (this.sessionWarningCallback) {
      this.sessionWarningCallback({
        show: true,
        timeRemaining,
        onExtend: () => {
          this.extendSession();
          this.hideSessionWarning();
        },
        onLogout: () => {
          this.expireSession();
        }
      });
    }
  }

  // Hide session warning
  private hideSessionWarning(): void {
    if (this.sessionWarningCallback) {
      this.sessionWarningCallback({
        show: false,
        timeRemaining: 0,
        onExtend: () => {},
        onLogout: () => {}
      });
    }
  }

  // Expire session
  private expireSession(): void {
    this.backupWorkInProgress();
    this.clearSession();
    this.clearTimers();
    
    if (this.sessionExpiredCallback) {
      this.sessionExpiredCallback();
    }
  }

  // Clear session
  clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      this.clearTimers();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Clear all timers
  private clearTimers(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  // Backup work in progress
  backupWorkInProgress(workData?: WorkInProgress): void {
    try {
      if (workData) {
        localStorage.setItem(this.WORK_BACKUP_KEY, JSON.stringify({
          ...workData,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error backing up work:', error);
    }
  }

  // Restore work in progress
  restoreWorkInProgress(): WorkInProgress | null {
    try {
      const backup = localStorage.getItem(this.WORK_BACKUP_KEY);
      if (!backup) return null;

      const workData: WorkInProgress = JSON.parse(backup);
      
      // Check if backup is recent (within 24 hours)
      const isRecent = Date.now() - workData.timestamp < 24 * 60 * 60 * 1000;
      
      return isRecent ? workData : null;
    } catch (error) {
      console.error('Error restoring work:', error);
      return null;
    }
  }

  // Clear work backup
  clearWorkBackup(): void {
    try {
      localStorage.removeItem(this.WORK_BACKUP_KEY);
    } catch (error) {
      console.error('Error clearing work backup:', error);
    }
  }

  // Get session time remaining
  getTimeRemaining(): number {
    const session = this.getCurrentSession();
    if (!session) return 0;
    
    return Math.max(0, session.expiresAt - Date.now());
  }

  // Format time remaining for display
  formatTimeRemaining(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '<1m';
    }
  }

  // Set session warning callback
  setSessionWarningCallback(callback: (warning: SessionWarning) => void): void {
    this.sessionWarningCallback = callback;
  }

  // Set session expired callback
  setSessionExpiredCallback(callback: () => void): void {
    this.sessionExpiredCallback = callback;
  }

  // Validate session
  isSessionValid(): boolean {
    const session = this.getCurrentSession();
    return session !== null && Date.now() < session.expiresAt;
  }

  // Get session info for display
  getSessionInfo(): { timeRemaining: string; deviceInfo: string; loginTime: string } | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    return {
      timeRemaining: this.formatTimeRemaining(this.getTimeRemaining()),
      deviceInfo: session.deviceInfo,
      loginTime: new Date(session.loginTime).toLocaleString()
    };
  }

  // Cleanup on app unload
  cleanup(): void {
    this.clearTimers();
    
    // Remove event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleUserActivity.bind(this), true);
    });
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export types
export type { SessionData, SessionWarning, WorkInProgress };