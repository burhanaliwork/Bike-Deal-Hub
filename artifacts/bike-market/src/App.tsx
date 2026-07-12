import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getStoredAuth } from "@/lib/accountAuth";
import HomePage from "@/pages/home";
import ListingsPage from "@/pages/listings";
import BikeDetailPage from "@/pages/bike-detail";
import MyListingsPage from "@/pages/my-listings";
import SellPage from "@/pages/sell";
import FavoritesPage from "@/pages/favorites";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import ShowroomDashboardPage from "@/pages/showroom-dashboard";
import ShowroomPage from "@/pages/showroom";
import NotFound from "@/pages/not-found";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthTokenSetter() {
  useEffect(() => {
    setAuthTokenGetter(async () => {
      const stored = getStoredAuth();
      return stored?.token ?? null;
    });
  }, []);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/listings" component={ListingsPage} />
      <Route path="/listings/:id" component={BikeDetailPage} />
      <Route path="/my-listings" component={MyListingsPage} />
      <Route path="/sell" component={SellPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/showroom" component={ShowroomDashboardPage} />
      <Route path="/showrooms/:id" component={ShowroomPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <AuthTokenSetter />
        <Router />
        <Toaster />
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
