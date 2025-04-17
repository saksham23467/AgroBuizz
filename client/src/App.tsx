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
import AnimatedPage from "@/components/AnimatedPage";
import { pageTransitionVariants, hardwareAcceleratedProps } from "@/lib/utils";

function Router() {
  const [location] = useLocation();

  // Enhanced page transition component wrappers with our AnimatedPage component
  const MotionHome = () => (
    <AnimatedPage>
      <Home />
    </AnimatedPage>
  );

  const MotionLogin = () => (
    <AnimatedPage>
      <Login />
    </AnimatedPage>
  );

  const MotionAbout = () => (
    <AnimatedPage>
      <About />
    </AnimatedPage>
  );

  const MotionAdminLogin = () => (
    <AnimatedPage>
      <AdminLogin />
    </AnimatedPage>
  );

  const MotionSeedMarket = () => (
    <AnimatedPage>
      <SeedMarket />
    </AnimatedPage>
  );

  const MotionEquipmentMarket = () => (
    <AnimatedPage>
      <EquipmentMarket />
    </AnimatedPage>
  );

  const MotionProduceMarket = () => (
    <AnimatedPage>
      <ProduceMarket />
    </AnimatedPage>
  );

  const MotionCheckout = () => (
    <AnimatedPage>
      <Checkout />
    </AnimatedPage>
  );

  const MotionSettings = () => (
    <AnimatedPage>
      <Settings />
    </AnimatedPage>
  );

  const MotionAdmin = () => (
    <AnimatedPage>
      <Admin />
    </AnimatedPage>
  );

  const MotionNotFound = () => (
    <AnimatedPage>
      <NotFound />
    </AnimatedPage>
  );

  return (
    <>
      <Header />
      <main className="dark-mode-transition page-transition-wrapper">
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
