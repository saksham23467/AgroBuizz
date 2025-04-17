import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { darkModeTransition } from "@/lib/utils";

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
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to toggle dark mode with enhanced animation
  const toggleDarkMode = () => {
    if (user) {
      // Apply transition class before change
      document.documentElement.classList.add("dark-mode-transition");
      
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Update dark mode preference
      updateDarkModeMutation.mutate(!isDarkMode);
      
      // Remove transition class after transition is complete
      transitionTimeoutRef.current = setTimeout(() => {
        document.documentElement.classList.remove("dark-mode-transition");
      }, 300); // Match with transition duration
    }
  };

  // Apply dark mode classes to the HTML element with smooth transitions
  useEffect(() => {
    // Begin transition
    document.documentElement.classList.add("dark-mode-transition");
    
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
    
    // Remove transition class after transition is complete
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("dark-mode-transition");
    }, 300);
    
    return () => {
      clearTimeout(timeout);
    }
  }, [isDarkMode]);

  // Clean up any lingering timeouts
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Theme toggle icon animation
  const themeIconVariants = {
    light: { rotate: 0 },
    dark: { rotate: 180 },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isDarkMode ? "dark" : "light"}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.8 }}
          transition={darkModeTransition}
          className="contents"
        >
          {children}
        </motion.div>
      </AnimatePresence>
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