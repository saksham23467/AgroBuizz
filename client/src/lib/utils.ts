import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Transition, Variants } from "framer-motion"

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

// Enhanced animation variants with TypeScript types
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.85, 
    y: 10,
    perspective: 1000,
    rotateX: 5
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    perspective: 1000,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
      mass: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.85, 
    y: 10,
    transition: {
      duration: 0.25
    }
  }
}

// Enhanced login modal animation
export const loginModalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20,
    filter: "blur(8px)",
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    filter: "blur(0px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    transition: {
      type: "spring",
      damping: 22,
      stiffness: 300,
      duration: 0.4
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -20,
    filter: "blur(8px)",
    transition: {
      duration: 0.25
    }
  }
}

// Page transition variants
export const pageTransitionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    filter: "blur(4px)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

// Enhanced icon animation
export const iconHoverVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.15, 
    rotate: [0, -5, 5, -3, 0],
    transition: {
      rotate: {
        duration: 0.5,
        ease: "easeInOut",
        repeat: 0
      },
      scale: {
        duration: 0.2,
      }
    }
  },
  tap: { scale: 0.95 }
}

// Ripple animation for buttons (can be applied via CSS)
export const rippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.5
  },
  animate: {
    scale: 1.5,
    opacity: 0,
    transition: {
      duration: 0.8
    }
  }
}

// Enhanced hover effect for animated links
export const linkHoverVariants: Variants = {
  rest: { 
    x: 0,
    opacity: 1,
  },
  hover: { 
    color: "var(--color-accent, #4CAF50)",
    textShadow: "0 0 1px rgba(76, 175, 80, 0.5)",
    x: 3,
    transition: {
      duration: 0.2,
    }
  }
}

// Form field animation
export const formFieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.08,
      duration: 0.3
    }
  })
}

// Create staggered children delays
export function createStaggeredDelay(count: number, baseDelay: number = 0.05): number[] {
  return Array.from({ length: count }, (_, i) => baseDelay * i);
}

// Hardware-accelerated animation properties
export const hardwareAcceleratedProps = {
  willChange: "transform, opacity",
  backfaceVisibility: "hidden" as const,
  transformStyle: "preserve-3d" as const,
  perspective: 1000
}
