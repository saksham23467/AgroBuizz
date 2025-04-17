import React from "react";
import { motion } from "framer-motion";
import { Link as WouterLink, useLocation } from "wouter";
import { RippleEffect } from "./ripple-effect";
import { cn } from "@/lib/utils";

interface AnimatedLinkProps {
  href: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  activeClassName?: string;
  rippleColor?: string;
  rippleDuration?: number;
  hoverScale?: number;
  onClick?: () => void;
}

const AnimatedLink: React.FC<AnimatedLinkProps> = ({
  href,
  icon,
  className = "",
  children,
  activeClassName = "text-primary",
  rippleColor = "rgba(76, 175, 80, 0.25)",
  rippleDuration = 800,
  hoverScale = 1.05,
  onClick,
}) => {
  const [location] = useLocation();
  const isActive = location === href;
  
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <RippleEffect 
      color={rippleColor} 
      duration={rippleDuration}
      className="inline-block"
    >
      <WouterLink href={href}>
        <motion.a
          className={cn(
            "flex items-center cursor-pointer", 
            className,
            isActive && activeClassName
          )}
          onClick={handleClick}
          whileHover={{ scale: hoverScale }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {icon && (
            <motion.span 
              className="mr-2"
              whileHover={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.span>
          )}
          {children}
        </motion.a>
      </WouterLink>
    </RippleEffect>
  );
};

export { AnimatedLink };