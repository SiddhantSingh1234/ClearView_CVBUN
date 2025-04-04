import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiHome, FiStar, FiSearch, FiSun, FiMoon, FiMessageSquare } from 'react-icons/fi';
import { ModeToggle } from './mode-toggle';
import { useAuth } from '../context/AuthContext';
import { cn } from "@/lib/utils";
import { useTheme } from '@/components/theme-provider';
import Chatbot from './chatbot'; // Import the chatbot component
import { Camera, User, Settings, BarChart2, LogOut } from 'lucide-react';
import { Home, Star, Newspaper, Video, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const { userData, logout } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">ClearView</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                to="/" 
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2",
                  isActive('/') 
                    ? "border-primary text-primary font-semibold" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Home className="mr-1" size={16} />
                Home
              </Link>
              <Link 
                to="/for-you" 
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2",
                  isActive('/for-you') 
                    ? "border-primary text-primary font-semibold" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Star className="mr-1" size={16} />
                For You
              </Link>
              <Link 
                to="/news" 
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2",
                  isActive('/news') 
                    ? "border-primary text-primary font-semibold" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Newspaper className="mr-1" size={16} />
                News
              </Link>
              <Link 
                to="/videos" 
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2",
                  isActive('/videos') 
                    ? "border-primary text-primary font-semibold" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Video className="mr-1" size={16} />
                Videos
              </Link>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search news..."
                className="pl-10 pr-4 py-2 border rounded-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
            <ModeToggle />
            {/* Chatbot Button */}
            <button 
              onClick={() => setIsChatbotOpen(true)}
              className="font-medium flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageSquare size={16} />
              <span>Chatbot</span>
            </button>
            {/* {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)}               />}
                    <FiMessageSquare />
                    <span>Chatbot</span> */}
            {userData ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/subscription" 
                  className="font-medium flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <FiUser />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-10">
                      <Link 
                        to="/profile" 
                        className="px-4 py-2 flex items-center text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="mr-2" size={16} />
                        Profile
                      </Link>
                      <Link 
                        to="/preferences" 
                        className="px-4 py-2 flex items-center text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="mr-2" size={16} />
                        Preferences
                      </Link>
                      <Link 
                        to="/usage" 
                        className="px-4 py-2 flex items-center text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <BarChart2 className="mr-2" size={16} />
                        Usage
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <LogOut className="mr-2" size={16} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/subscription" 
                  className="font-medium flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </Link>
                <Link 
                  to="/login" 
                  className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={cn(
                "block pl-3 pr-4 py-2 border-l-4",
                isActive('/') 
                  ? "border-primary bg-primary/10 text-primary font-medium" 
                  : "border-transparent text-muted-foreground hover:bg-accent hover:border-muted"
              )}
            >
              Home
            </Link>
            <Link
              to="/for-you"
              className={cn(
                "block pl-3 pr-4 py-2 border-l-4",
                isActive('/for-you') 
                  ? "border-primary bg-primary/10 text-primary font-medium" 
                  : "border-transparent text-muted-foreground hover:bg-accent hover:border-muted"
              )}
            >
              For You
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t">
            {userData ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <FiUser className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-foreground">
                      {userData.username || userData.email}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{userData.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/preferences"
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Preferences
                  </Link>
                  <Link
                    to="/usage"
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Usage
                  </Link>
                  <Link
                    to="/subscription"
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Subscribe
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <Link
                  to="/login"
                  className="block text-center py-2 px-4 text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/subscription"
                  className="block text-center mt-2 py-2 px-4 text-base font-medium rounded-md text-primary bg-background border border-primary hover:bg-primary/10 transition-colors"
                >
                  Subscribe
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Chatbot Component */}
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
    </nav>
  );
};

export default Navbar;