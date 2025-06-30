interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string; // In production, this would be hashed
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

class UserStorageManager {
  private readonly USERS_KEY = 'voiceverse_users';
  private readonly CURRENT_USER_KEY = 'voiceverse_current_user';

  // Get all users from localStorage
  private getAllUsers(): StoredUser[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  // Save all users to localStorage
  private saveAllUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
      throw new Error('Failed to save user data');
    }
  }

  // Generate a unique user ID
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Hash password (simple implementation for demo - use proper hashing in production)
  private hashPassword(password: string): string {
    // In production, use bcrypt or similar
    return btoa(password + 'voiceverse_salt');
  }

  // Verify password
  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  // Check if email already exists
  emailExists(email: string): boolean {
    const users = this.getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Create a new user
  createUser(name: string, email: string, password: string): { success: boolean; error?: string; user?: UserProfile } {
    try {
      // Validate input
      if (!name.trim()) {
        return { success: false, error: 'Full name is required' };
      }

      if (name.trim().length < 2) {
        return { success: false, error: 'Full name must be at least 2 characters long' };
      }

      if (!email.trim()) {
        return { success: false, error: 'Email address is required' };
      }

      if (!email.includes('@') || !email.includes('.')) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (!password) {
        return { success: false, error: 'Password is required' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // Check if email already exists
      if (this.emailExists(email)) {
        return { success: false, error: 'An account with this email address already exists' };
      }

      const users = this.getAllUsers();
      const now = new Date().toISOString();
      
      const newUser: StoredUser = {
        id: this.generateUserId(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: this.hashPassword(password),
        createdAt: now,
        updatedAt: now
      };

      users.push(newUser);
      this.saveAllUsers(users);

      // Return user profile (without password)
      const userProfile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };

      return { success: true, user: userProfile };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }

  // Authenticate user
  authenticateUser(email: string, password: string): { success: boolean; error?: string; user?: UserProfile } {
    try {
      if (!email.trim()) {
        return { success: false, error: 'Please enter your email address' };
      }

      if (!password) {
        return { success: false, error: 'Please enter your password' };
      }

      const users = this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

      if (!user) {
        return { success: false, error: 'No account found with this email address' };
      }

      if (!this.verifyPassword(password, user.password)) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      // Return user profile (without password)
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return { success: true, user: userProfile };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  // Update user profile
  updateUser(userId: string, updates: { name?: string }): { success: boolean; error?: string; user?: UserProfile } {
    try {
      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          return { success: false, error: 'Full name is required' };
        }

        if (updates.name.trim().length < 2) {
          return { success: false, error: 'Full name must be at least 2 characters long' };
        }
      }

      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      const user = users[userIndex];
      
      // Update user data
      if (updates.name !== undefined) {
        user.name = updates.name.trim();
      }
      
      user.updatedAt = new Date().toISOString();
      
      users[userIndex] = user;
      this.saveAllUsers(users);

      // Update current user session if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedProfile: UserProfile = {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        this.setCurrentUser(updatedProfile);
      }

      // Return updated user profile (without password)
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return { success: true, user: userProfile };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update profile. Please try again.' };
    }
  }

  // Set current user session
  setCurrentUser(user: UserProfile): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving current user session:', error);
    }
  }

  // Get current user session
  getCurrentUser(): UserProfile | null {
    try {
      const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
      console.error('Error reading current user session:', error);
      return null;
    }
  }

  // Clear current user session
  clearCurrentUser(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error clearing current user session:', error);
    }
  }

  // Get user statistics
  getUserStats(): { totalUsers: number; latestUser?: string } {
    const users = this.getAllUsers();
    const latestUser = users.length > 0 
      ? users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : undefined;

    return {
      totalUsers: users.length,
      latestUser: latestUser?.name
    };
  }

  // Clear all user data (for development/testing)
  clearAllData(): void {
    try {
      localStorage.removeItem(this.USERS_KEY);
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

// Export singleton instance
export const userStorage = new UserStorageManager();

// Export types
export type { UserProfile, StoredUser };