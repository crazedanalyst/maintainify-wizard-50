
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

const Layout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="glass-card p-8 text-center animate-pulse-gentle">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Background decorative elements */}
      <div className="glass-orb w-96 h-96 -top-48 -left-48 animate-spin-slow"></div>
      <div className="glass-orb w-80 h-80 top-1/2 -right-40 animate-pulse-gentle"></div>
      <div className="glass-orb w-64 h-64 bottom-20 left-1/3 animate-float"></div>
      
      {/* Main layout */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="p-4 sm:p-6 md:p-8 animate-fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
