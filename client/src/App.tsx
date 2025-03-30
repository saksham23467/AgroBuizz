import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SeedMarket from "@/pages/SeedMarket";
import EquipmentMarket from "@/pages/EquipmentMarket";
import ProduceMarket from "@/pages/ProduceMarket";
import Checkout from "@/pages/Checkout";
import About from "@/pages/About";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute, AdminRoute } from "@/components/protected-route";
import { CartProvider } from "@/contexts/CartContext";

function Router() {
  const [location] = useLocation();
  
  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    out: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  // Wrap each component with motion for animations
  const MotionHome = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <Home />
    </motion.div>
  );

  const MotionLogin = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <Login />
    </motion.div>
  );

  const MotionAbout = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <About />
    </motion.div>
  );
  
  const MotionAdminLogin = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <AdminLogin />
    </motion.div>
  );

  const MotionSeedMarket = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <SeedMarket />
    </motion.div>
  );

  const MotionEquipmentMarket = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <EquipmentMarket />
    </motion.div>
  );

  const MotionProduceMarket = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <ProduceMarket />
    </motion.div>
  );

  const MotionCheckout = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <Checkout />
    </motion.div>
  );

  const MotionSettings = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <Settings />
    </motion.div>
  );

  const MotionAdmin = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <Admin />
    </motion.div>
  );

  const MotionNotFound = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="fade-in"
    >
      <NotFound />
    </motion.div>
  );

  return (
    <>
      <Header />
      <main className="dark-mode-transition">
        <AnimatePresence mode="wait">
          <Switch location={location} key={location}>
            <Route path="/" component={MotionHome} />
            <Route path="/login" component={MotionLogin} />
            <Route path="/about" component={MotionAbout} />
            <Route path="/admin-login" component={MotionAdminLogin} />
            {/* Public marketplace pages */}
            <Route path="/seed-market" component={MotionSeedMarket} />
            <Route path="/equipment-market" component={MotionEquipmentMarket} />
            <Route path="/produce-market" component={MotionProduceMarket} />
            {/* Protected routes that require authentication */}
            <ProtectedRoute path="/checkout" component={MotionCheckout} />
            <ProtectedRoute path="/settings" component={MotionSettings} />
            {/* Admin dashboard route */}
            <AdminRoute path="/admin" component={MotionAdmin} />
            <Route component={MotionNotFound} />
          </Switch>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
