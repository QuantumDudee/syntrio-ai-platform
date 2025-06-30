import React, { createContext, useContext, useState, useEffect } from 'react';
import { userStorage, UserProfile } from '../lib/userStorage';
import { sessionManager, SessionWarning, WorkInProgress } from '../lib/sessionManager';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionWarning: SessionWarning;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string }) => Promise<{ success: boolean; error?: string }>;
  backupWork: (workData: WorkInProgress) => void;
  restoreWork: () => WorkInProgress | null;
  clearWorkBackup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState<SessionWarning>({
    show: false,
    timeRemaining: 0,
    onExtend: () => {},
    onLogout: () => {}
  });

  useEffect(() => {
    // Set up session callbacks
    sessionManager.setSessionWarningCallback(setSessionWarning);
    sessionManager.setSessionExpiredCallback(() => {
      handleSessionExpired();
    });

    // Check for existing session
    const initializeAuth = () => {
      try {
        const currentSession = sessionManager.getCurrentSession();
        const currentUser = userStorage.getCurrentUser();
        
        if (currentSession && currentUser && sessionManager.isSessionValid()) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Clear invalid session
          sessionManager.clearSession();
          userStorage.clearCurrentUser();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted session
        sessionManager.clearSession();
        userStorage.clearCurrentUser();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      sessionManager.cleanup();
    };
  }, []);

  const handleSessionExpired = async () => {
    setUser(null);
    setIsAuthenticated(false);
    userStorage.clearCurrentUser();
    
    // Show notification about session expiry
    console.log('Session expired - user logged out automatically');
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = userStorage.authenticateUser(email, password);
      
      if (result.success && result.user) {
        // Create new session
        sessionManager.createSession(result.user.id, result.user.email, result.user.name);
        
        setUser(result.user);
        setIsAuthenticated(true);
        userStorage.setCurrentUser(result.user);
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = userStorage.createUser(name, email, password);
      
      if (result.success && result.user) {
        // Create new session
        sessionManager.createSession(result.user.id, result.user.email, result.user.name);
        
        setUser(result.user);
        setIsAuthenticated(true);
        userStorage.setCurrentUser(result.user);
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred during signup' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear session and user data
      sessionManager.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      userStorage.clearCurrentUser();
      
      // Hide any session warnings
      setSessionWarning({
        show: false,
        timeRemaining: 0,
        onExtend: () => {},
        onLogout: () => {}
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: { name: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const result = userStorage.updateUser(user.id, updates);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'An unexpected error occurred while updating profile' };
    }
  };

  const backupWork = (workData: WorkInProgress): void => {
    sessionManager.backupWorkInProgress(workData);
  };

  const restoreWork = (): WorkInProgress | null => {
    return sessionManager.restoreWorkInProgress();
  };

  const clearWorkBackup = (): void => {
    sessionManager.clearWorkBackup();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      sessionWarning,
      login, 
      signup, 
      logout, 
      updateProfile,
      backupWork,
      restoreWork,
      clearWorkBackup
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}