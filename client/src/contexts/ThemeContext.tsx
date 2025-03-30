import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

// Define dark mode color palette
const DARK_MODE_COLORS = {
  background: "#121212",
  text: {
    primary: "#E0E0E0",
    secondary: "#B0B0B0"
  },
  accent: "#4CAF50",
  highlight: "#FF5722",
  border: "#424242"
};

// Type for the theme context
type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

// Create the theme context
export const ThemeContext = createContext<ThemeContextType | null>(null);

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateDarkModeMutation } = useAuth();
  const isDarkMode = user?.darkMode || false;

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    if (user) {
      updateDarkModeMutation.mutate(!isDarkMode);
    }
  };

  // Apply dark mode classes to the HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
      
      // Set CSS variables for dark mode colors
      document.documentElement.style.setProperty("--color-background", DARK_MODE_COLORS.background);
      document.documentElement.style.setProperty("--color-text-primary", DARK_MODE_COLORS.text.primary);
      document.documentElement.style.setProperty("--color-text-secondary", DARK_MODE_COLORS.text.secondary);
      document.documentElement.style.setProperty("--color-accent", DARK_MODE_COLORS.accent);
      document.documentElement.style.setProperty("--color-highlight", DARK_MODE_COLORS.highlight);
      document.documentElement.style.setProperty("--color-border", DARK_MODE_COLORS.border);
    } else {
      document.documentElement.classList.remove("dark-mode");
      
      // Reset CSS variables for light mode
      document.documentElement.style.removeProperty("--color-background");
      document.documentElement.style.removeProperty("--color-text-primary");
      document.documentElement.style.removeProperty("--color-text-secondary");
      document.documentElement.style.removeProperty("--color-accent");
      document.documentElement.style.removeProperty("--color-highlight");
      document.documentElement.style.removeProperty("--color-border");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}