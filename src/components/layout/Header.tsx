
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({
  toggleSidebar,
  sidebarOpen
}: HeaderProps) => {
  const navigate = useNavigate();
  const {
    trialInfo
  } = useApp();
  const {
    user,
    logout
  } = useAuth();
  const isMobile = useIsMobile();
  const [showSearch, setShowSearch] = useState(false);

  // Get display name from user metadata or fall back to email
  const userDisplayName = user?.user_metadata?.name || user?.email || 'User';
  
  return (
    <header className="sticky top-0 z-30 glass-header transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="mr-2 hover:rotate-12 transition-transform duration-300">
            <Menu className="h-5 w-5" />
          </Button>
          {!showSearch && <h1 className="text-xl font-semibold text-gray-800 animate-fade-in-up">MaintainWiz</h1>}
        </div>
        
        <div className="flex items-center space-x-2">
          {showSearch ? (
            <div className="relative flex items-center animate-fade-in-up">
              <Input type="search" placeholder="Search..." className="w-full sm:w-64 h-9 glass-input" autoFocus />
              <Button variant="ghost" size="sm" className="absolute right-0" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)} className="hover:rotate-12 transition-transform duration-300">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:rotate-12 transition-transform duration-300">
                <Bell className="h-5 w-5" />
              </Button>
              {trialInfo.isActive && (
                <div className="hidden md:block text-sm font-medium animate-pulse-gentle">
                  <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700">
                    Trial: {trialInfo.daysLeft} days left
                  </span>
                </div>
              )}
              
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 scale-on-hover">
                    <User className="h-5 w-5" />
                    {!isMobile && <span>{userDisplayName}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer hover-lift" onClick={() => navigate('/dashboard/accounts')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover-lift" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
