import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import { hardwareAcceleratedProps } from "@/lib/utils";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  const loaderVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: { repeat: Infinity, duration: 1.5 }
    }
  };

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <AnimatePresence mode="wait">
              <motion.div 
                className="flex items-center justify-center min-h-screen dark-mode-transition hw-accelerate"
                initial="initial"
                animate="animate"
                variants={loaderVariants}
                style={hardwareAcceleratedProps}
              >
                <motion.div
                  variants={loaderVariants}
                  animate="pulse"
                  className="bg-card dark:bg-[#1E1E1E] p-8 rounded-lg shadow-lg flex flex-col items-center"
                  style={{
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)"
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                  >
                    <Loader2 className="h-10 w-10 text-primary mb-4" />
                  </motion.div>
                  <motion.p 
                    className="text-muted-foreground text-sm"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.2 }}
                  >
                    Loading...
                  </motion.p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          );
        }
        
        if (!user) {
          return <Redirect to="/login" />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}

export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  const loaderVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: { repeat: Infinity, duration: 1.5 }
    }
  };

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <AnimatePresence mode="wait">
              <motion.div 
                className="flex items-center justify-center min-h-screen dark-mode-transition hw-accelerate"
                initial="initial"
                animate="animate"
                variants={loaderVariants}
                style={hardwareAcceleratedProps}
              >
                <motion.div
                  variants={loaderVariants}
                  animate="pulse"
                  className="bg-card dark:bg-[#1E1E1E] p-8 rounded-lg shadow-lg flex flex-col items-center"
                  style={{
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)"
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                  >
                    <Loader2 className="h-10 w-10 text-primary mb-4" />
                  </motion.div>
                  <motion.p 
                    className="text-muted-foreground text-sm"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.2 }}
                  >
                    Verifying admin access...
                  </motion.p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          );
        }
        
        if (!user) {
          return <Redirect to="/admin-login" />;
        }
        
        if (user.role !== 'admin') {
          return <Redirect to="/" />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}