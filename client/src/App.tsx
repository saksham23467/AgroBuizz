import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
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
import { ProtectedRoute, AdminRoute } from "@/components/protected-route";
import { CartProvider } from "@/contexts/CartContext";

function Router() {
  return (
    <>
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/about" component={About} />
          <Route path="/admin-login" component={AdminLogin} />
          {/* Public marketplace pages */}
          <Route path="/seed-market" component={SeedMarket} />
          <Route path="/equipment-market" component={EquipmentMarket} />
          <Route path="/produce-market" component={ProduceMarket} />
          {/* Protected routes that require authentication */}
          <ProtectedRoute path="/checkout" component={Checkout} />
          <ProtectedRoute path="/settings" component={Settings} />
          {/* Admin dashboard route */}
          <AdminRoute path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
