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
import Header from "@/components/Header";

function Router() {
  return (
    <>
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/seed-market" component={SeedMarket} />
          <Route path="/equipment-market" component={EquipmentMarket} />
          <Route path="/produce-market" component={ProduceMarket} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
