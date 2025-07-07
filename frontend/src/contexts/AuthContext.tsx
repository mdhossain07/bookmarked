import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import AuthService from "@/services/authService";
import { authToasts } from "@/lib/toast-helpers";
import type { UserDocument } from "bookmarked-types";

interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

// Auth context types
interface AuthContextType {
  user: UserDocument | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (data: IRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuthentication: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const queryClient = useQueryClient();

  // Simple initialization - just mark as initialized without any API calls
  // Authentication checks will be performed on-demand by protected routes
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Function to check authentication on-demand (used by protected routes)
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      // Try custom auth
      const profile = await AuthService.getProfile();
      if (profile && profile.data && profile.data.user) {
        setIsAuthenticated(true);
        setUserProfile(profile.data.user);
        return true;
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
        return false;
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.warn("Error checking authentication status:", error);
      }
      setIsAuthenticated(false);
      setUserProfile(null);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await AuthService.login({ email, password });

      if (response.success) {
        // Fetch user profile after successful login
        const profile = await AuthService.getProfile();
        if (profile && profile.data && profile.data.user) {
          setIsAuthenticated(true);
          setUserProfile(profile.data.user);
        }
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      setIsAuthenticated(false);
      setUserProfile(null);
      throw error;
    }
  };

  // Register function
  const registerUser = async (data: IRegisterRequest): Promise<void> => {
    try {
      const response = await AuthService.register(data);

      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }

      // Registration successful, but don't auto-login
      // User should be redirected to login page
    } catch (error: any) {
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    await handleLogout();
  };

  // Internal logout handler
  const handleLogout = async (): Promise<void> => {
    try {
      // Logout from custom auth system
      await AuthService.logout();
    } catch (error) {
      console.warn("Logout service call failed:", error);
    } finally {
      setIsAuthenticated(false);
      setUserProfile(null);
      // Clear any cached queries
      queryClient.clear();
      // Show logout success toast
      authToasts.logoutSuccess();
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      // Try custom auth
      const profile = await AuthService.getProfile();
      if (profile && profile.data && profile.data.user) {
        setUserProfile(profile.data.user);
        setIsAuthenticated(true);
      } else {
        setUserProfile(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      // Only log non-401 errors to avoid spam during normal logout/unauthenticated states
      if (error?.response?.status !== 401) {
        console.warn("Error refreshing user data:", error);
      }
      setUserProfile(null);
      setIsAuthenticated(false);
    }
  };

  // Determine loading state
  const isLoading = !isInitialized;

  // Context value
  const value: AuthContextType = {
    user: userProfile || null,
    isAuthenticated,
    isLoading,
    login,
    registerUser,
    logout,
    refreshUser,
    checkAuthentication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
