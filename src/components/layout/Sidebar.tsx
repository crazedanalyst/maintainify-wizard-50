
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FileText, 
  Tool, 
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
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Maintenance', path: '/maintenance' },
    { icon: FileText, label: 'Warranties', path: '/warranties' },
    { icon: Tool, label: 'Service Providers', path: '/providers' },
    { icon: Users, label: 'Accounts', path: '/accounts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  return (
    <>
      {/* Mobile overlay */}
      {open && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:z-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">MaintainWiz</h2>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Properties dropdown */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">MY PROPERTIES</h3>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {properties.map((property) => (
                <button
                  key={property.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm rounded-md transition-colors",
                    selectedProperty?.id === property.id
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setSelectedProperty(property)}
                >
                  {property.name}
                </button>
              ))}
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-brand-100 text-brand-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => handleLinkClick(item.path)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center">
                <span className="text-sm font-medium">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">User</p>
                <p className="text-xs text-gray-500 truncate">Free Trial</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
