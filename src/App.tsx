
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Auth routes (don't require authentication) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes (require authentication) */}
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/maintenance" element={<Layout><Maintenance /></Layout>} />
              <Route path="/warranties" element={<Layout><Warranties /></Layout>} />
              <Route path="/providers" element={<Layout><ServiceProviders /></Layout>} />
              <Route path="/accounts" element={<Layout><Accounts /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              
              {/* Not found route */}
              <Route path="*" element={<Layout requireAuth={false}><NotFound /></Layout>} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
