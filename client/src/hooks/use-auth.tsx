import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  userType: "admin" | "farmer" | "customer" | "vendor";
  darkMode: boolean | null;
}

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  userType?: "admin" | "farmer" | "customer" | "vendor";
  darkMode?: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  updateDarkModeMutation: UseMutationResult<User, Error, boolean>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isInit, setIsInit] = useState(false);
  
  // Fetch current user status
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<{ success: boolean, user: User } | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Only start fetching after the component is mounted
    enabled: isInit,
  });

  // Set isInit to true after the first render
  useEffect(() => {
    setIsInit(true);
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }
      
      return data.user;
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });
      
      // Refresh user data
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }
      
      return data.user;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      
      // Refresh user data
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update user preferences
  const updateDarkModeMutation = useMutation({
    mutationFn: async (darkMode: boolean) => {
      const res = await apiRequest("POST", "/api/user/preferences", { darkMode });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to update preferences");
      }
      
      return data.user;
    },
    onSuccess: (user: User) => {
      // Update the user data in cache
      queryClient.setQueryData(["/api/user"], { success: true, user });
      
      toast({
        title: "Preferences updated",
        description: `Dark mode ${user.darkMode ? 'enabled' : 'disabled'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update user type
  const updateUserTypeMutation = useMutation({
    mutationFn: async (userType: 'farmer' | 'customer' | 'vendor') => {
      const res = await apiRequest("POST", "/api/user/preferences", { userType });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to update user type");
      }
      
      return data.user;
    },
    onSuccess: (user: User) => {
      // Update the user data in cache
      queryClient.setQueryData(["/api/user"], { success: true, user });
      
      toast({
        title: "User Type Updated",
        description: `Your account type is now: ${user.userType}.`,
      });
      
      // Reload the page to apply new permissions and UI changes
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user?.user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateDarkModeMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}