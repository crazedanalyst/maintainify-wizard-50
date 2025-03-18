
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FileText, 
  Wrench,
  Users, 
  Settings, 
  ChevronLeft,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { properties, selectedProperty, setSelectedProperty } = useApp();
  const isMobile = useIsMobile();
  
  // Close sidebar on mobile when a link is clicked
  const handleLinkClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };
  
  // Navigation items
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Maintenance', path: '/dashboard/maintenance' },
    { icon: FileText, label: 'Warranties', path: '/dashboard/warranties' },
    { icon: Wrench, label: 'Service Providers', path: '/dashboard/providers' },
    { icon: Users, label: 'Accounts', path: '/dashboard/accounts' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];
  
  return (
    <>
      {/* Mobile overlay */}
      {open && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 glass-sidebar transition-all duration-500 ease-in-out",
          open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
          "md:translate-x-0 md:opacity-100 md:static md:z-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border/30">
            <h2 className="text-lg font-semibold text-sidebar-foreground">MaintainWiz</h2>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-sidebar-foreground hover:rotate-12 transition-transform duration-300">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Properties dropdown */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-sidebar-foreground/80">MY PROPERTIES</h3>
              <Button variant="ghost" size="sm" className="p-1 h-auto text-sidebar-foreground hover:rotate-180 transition-transform duration-500">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 stagger-children">
              {properties.map((property) => (
                <button
                  key={property.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm rounded-md transition-all duration-300",
                    selectedProperty?.id === property.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium scale-on-hover"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => setSelectedProperty(property)}
                >
                  {property.name}
                </button>
              ))}
            </div>
          </div>
          
          <Separator className="my-2 bg-sidebar-border/30" />
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 space-y-1 stagger-children">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-300",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground hover-lift"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                onClick={() => handleLinkClick(item.path)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-sidebar-border/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center pulse-on-hover">
                <span className="text-sm font-medium">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">User</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">Free Trial</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
