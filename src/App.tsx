
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Maintenance from "./pages/Maintenance";
import Warranties from "./pages/Warranties";
import ServiceProviders from "./pages/ServiceProviders";
import Accounts from "./pages/Accounts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public home page */}
                <Route path="/" element={<Home />} />
                
                {/* Auth routes (don't require authentication) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes with shared layout */}
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="warranties" element={<Warranties />} />
                  <Route path="providers" element={<ServiceProviders />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Legacy routes redirection */}
                <Route path="/maintenance" element={<Navigate to="/dashboard/maintenance" />} />
                <Route path="/warranties" element={<Navigate to="/dashboard/warranties" />} />
                <Route path="/providers" element={<Navigate to="/dashboard/providers" />} />
                <Route path="/accounts" element={<Navigate to="/dashboard/accounts" />} />
                <Route path="/settings" element={<Navigate to="/dashboard/settings" />} />
                
                {/* Not found route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
