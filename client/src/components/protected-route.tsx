import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { motion } from "framer-motion";

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
            <motion.div 
              className="flex items-center justify-center min-h-screen dark-mode-transition"
              initial="initial"
              animate="animate"
              variants={loaderVariants}
            >
              <motion.div
                variants={loaderVariants}
                animate="pulse"
                className="bg-card dark:bg-[#1E1E1E] p-8 rounded-lg shadow-lg flex flex-col items-center"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <motion.p 
                  className="text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Loading...
                </motion.p>
              </motion.div>
            </motion.div>
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
            <motion.div 
              className="flex items-center justify-center min-h-screen dark-mode-transition"
              initial="initial"
              animate="animate"
              variants={loaderVariants}
            >
              <motion.div
                variants={loaderVariants}
                animate="pulse"
                className="bg-card dark:bg-[#1E1E1E] p-8 rounded-lg shadow-lg flex flex-col items-center"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <motion.p 
                  className="text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Verifying admin access...
                </motion.p>
              </motion.div>
            </motion.div>
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