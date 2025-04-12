import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import { hardwareAcceleratedProps } from "@/lib/utils";

// Shared loading animation component for all protected routes
const LoadingAnimation = ({ message = "Loading..." }: { message?: string }) => {
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
            {message}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return <LoadingAnimation message="Loading..." />;
        }
        
        if (!user) {
          return <Redirect to="/auth" />;
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

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return <LoadingAnimation message="Verifying admin access..." />;
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

export function VendorRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return <LoadingAnimation message="Verifying vendor access..." />;
        }
        
        if (!user) {
          return <Redirect to="/auth" />;
        }
        
        if (user.userType !== 'vendor') {
          return <Redirect to="/" />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}

export function FarmerRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return <LoadingAnimation message="Verifying farmer access..." />;
        }
        
        if (!user) {
          return <Redirect to="/auth" />;
        }
        
        if (user.userType !== 'farmer') {
          return <Redirect to="/" />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}