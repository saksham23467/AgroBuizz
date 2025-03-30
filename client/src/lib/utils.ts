import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation variants presets for consistent animations across components
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

export const slideUpVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

export const fadeInScaleVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.9
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

export const popVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.8,
    transition: { 
      duration: 0.2
    }
  }
}

// Staggered children animation helpers
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2
    }
  }
}

// Button hover animation
export const buttonHoverVariants = {
  rest: { 
    scale: 1,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" 
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { 
    scale: 0.98,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.1
    }
  }
}

// Dark mode transition helper
export const darkModeTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
}
