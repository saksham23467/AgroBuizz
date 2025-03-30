import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { rippleVariants } from "@/lib/utils";

interface RippleProps {
  color?: string;
  duration?: number;
  className?: string;
}

const RippleEffect: React.FC<React.HTMLAttributes<HTMLDivElement> & RippleProps> = ({
  color = "rgba(255, 255, 255, 0.35)",
  duration = 800,
  className,
  children,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; size: number; id: number }>>([]);
  let nextId = 0;

  useEffect(() => {
    // Cleanup ripples after they've animated
    const timeoutIds: number[] = [];
    
    ripples.forEach((ripple) => {
      const timeoutId = window.setTimeout(() => {
        setRipples((prevRipples) => prevRipples.filter((r) => r.id !== ripple.id));
      }, duration);
      
      timeoutIds.push(timeoutId);
    });

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [ripples, duration]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate ripple size based on the element's dimensions
    const size = Math.max(rect.width, rect.height) * 2;
    
    // Add new ripple
    setRipples([...ripples, { x, y, size, id: nextId++ }]);
    
    // Forward the original onClick handler if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          initial="initial"
          animate="animate"
          variants={rippleVariants}
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            background: color,
            willChange: "transform, opacity"
          }}
          transition={{ duration: duration / 1000 }}
        />
      ))}
      {children}
    </div>
  );
};

export { RippleEffect };