import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { modalVariants, loginModalVariants, hardwareAcceleratedProps } from "@/lib/utils";

interface AnimatedModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "login" | "alert";
  showCloseButton?: boolean;
  preventOutsideClose?: boolean;
}

export function AnimatedModal({
  title,
  description,
  isOpen,
  onClose,
  children,
  className,
  variant = "default",
  showCloseButton = true,
  preventOutsideClose = false
}: AnimatedModalProps) {
  // Select variant based on type
  const variants = variant === "login" ? loginModalVariants : modalVariants;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !preventOutsideClose) onClose();
      }}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <DialogContent
            className={cn(
              "max-w-md border-0 p-0 overflow-hidden shadow-lg",
              variant === "login" && "login-modal-enter",
              className
            )}
            onEscapeKeyDown={() => !preventOutsideClose && onClose()}
            asChild
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              style={hardwareAcceleratedProps}
            >
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              )}

              <div className="px-6 py-6">
                {title && (
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                  </DialogHeader>
                )}
                
                <div className="mt-4">{children}</div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}