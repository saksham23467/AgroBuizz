import React from "react";
import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/lib/utils";

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content in animation transitions for smooth page navigation
 */
const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransitionVariants}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;