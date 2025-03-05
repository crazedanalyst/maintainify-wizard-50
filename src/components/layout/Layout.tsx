
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}`}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="p-4 sm:p-6 md:p-8 mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
