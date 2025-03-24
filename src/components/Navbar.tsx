// import { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { FiMenu, FiX, FiUser, FiHome, FiStar, FiSearch, FiSun, FiMoon } from 'react-icons/fi';
// import { ModeToggle } from './mode-toggle.tsx';
// import { useAuth } from '../context/AuthContext';
// import './Navbar.css'; // Import the CSS file

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const { currentUser, logout } = useAuth();
//   const location = useLocation();

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//       setIsDarkMode(savedTheme === 'dark');
//       document.documentElement.classList.toggle('dark', savedTheme === 'dark');
//     }
//   }, []);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const toggleTheme = () => {
//     const newTheme = !isDarkMode ? 'dark' : 'light';
//     setIsDarkMode(!isDarkMode);
//     document.documentElement.classList.toggle('dark', !isDarkMode);
//     localStorage.setItem('theme', newTheme);
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Failed to log out', error);
//     }
//   };

//   const isActive = (path: string) => {
//     return location.pathname === path ? 'text-primary-600 font-semibold' : 'text-secondary-700 hover:text-primary-600';
//   };

//   return (
//     <nav className="bg-white dark:bg-gray-800 shadow-md">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to="/" className="flex-shrink-0 flex items-center">
//               <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">ClearView</span>
//             </Link>
//             <div className="hidden md:ml-6 md:flex md:space-x-8">
//               <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/') ? 'border-primary-500' : 'border-transparent'} ${isActive('/')}`}>
//                 <FiHome className="mr-1" />
//                 Home
//               </Link>
//               <Link to="/for-you" className={`inline-flex items-center px-1 pt-1 border-b-2 ${isActive('/for-you') ? 'border-primary-500' : 'border-transparent'} ${isActive('/for-you')}`}>
//                 <FiStar className="mr-1" />
//                 For You
//               </Link>
//             </div>
//           </div>
//           <div className="hidden md:flex items-center space-x-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search news..."
//                 className="pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//               />
//               <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500" />
//             </div>
//             {/* <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none">
//               {isDarkMode ? <FiSun className="text-yellow-500" /> : <FiMoon className="text-gray-800" />}
//             </button> */}
//             <ModeToggle />
//             {currentUser ? (
//               <div className="flex items-center space-x-4">
//                 <Link to="/subscription" className="btn btn-outline">
//                   Subscribe
//                 </Link>
//                 <div className="relative group">
//                   <button className="flex items-center space-x-2 focus:outline-none">
//                     <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center text-primary-600 dark:text-primary-400">
//                       <FiUser />
//                     </div>
//                   </button>
//                   <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
//                     <Link to="/profile" className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-600">
//                       Profile
//                     </Link>
//                     <Link to="/preferences" className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-600">
//                       Preferences
//                     </Link>
//                     <Link to="/usage" className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-600">
//                       Usage
//                     </Link>
//                     <button
//                       onClick={handleLogout}
//                       className="block w-full text-left px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-600"
//                     >
//                       Sign out
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-4">
//                 <Link to="/subscription" className="btn btn-outline">
//                   Subscribe
//                 </Link>
//                 <Link to="/login" className="btn btn-primary">
//                   Login
//                 </Link>
//               </div>
//             )}
//           </div>
//           <div className="flex items-center md:hidden">
//             <button
//               onClick={toggleMenu}
//               className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
//             >
//               <span className="sr-only">Open main menu</span>
//               {isMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isMenuOpen && (
//         <div className="md:hidden">
//           <div className="pt-2 pb-3 space-y-1">
//             <Link
//               to="/"
//               className={`block pl-3 pr-4 py-2 border-l-4 ${
//                 isActive('/') ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-transparent text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300'
//               }`}
//             >
//               Home
//             </Link>
//             <Link
//               to="/for-you"
//               className={`block pl-3 pr-4 py-2 border-l-4 ${
//                 isActive('/for-you') ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-transparent text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300'
//               }`}
//             >
//               For You
//             </Link>
//           </div>
//           <div className="pt-4 pb-3 border-t border-secondary-200">
//             {currentUser ? (
//               <div>
//                 <div className="flex items-center px-4">
//                   <div className="flex-shrink-0">
//                     <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center text-primary-600 dark:text-primary-400">
//                       <FiUser className="h-6 w-6" />
//                     </div>
//                   </div>
//                   <div className="ml-3">
//                     <div className="text-base font-medium text-secondary-800 dark:text-secondary-200">
//                       {currentUser.displayName || currentUser.email}
//                     </div>
//                     <div className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{currentUser.email}</div>
//                   </div>
//                 </div>
//                 <div className="mt-3 space-y-1">
//                   <Link
//                     to="/profile"
//                     className="block px-4 py-2 text-base font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-600"
//                   >
//                     Profile
//                   </Link>
//                   <Link
//                     to="/preferences"
//                     className="block px-4 py-2 text-base font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-600"
//                   >
//                     Preferences
//                   </Link>
//                   <Link
//                     to="/usage"
//                     className="block px-4 py-2 text-base font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-600"
//                   >
//                     Usage
//                   </Link>
//                   <Link
//                     to="/subscription"
//                     className="block px-4 py-2 text-base font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-600"
//                   >
//                     Subscribe
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="block w-full text-left px-4 py-2 text-base font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-600"
//                   >
//                     Sign out
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-1 px-4">
//                 <Link
//                   to="/login"
//                   className="block text-center py-2 px-4 text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/subscription"
//                   className="block text-center mt-2 py-2 px-4 text-base font-medium rounded-md text-primary-600 bg-white border border-primary-600 hover:bg-primary-50"
//                 >
//                   Subscribe
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiHome, FiStar, FiSearch } from 'react-icons/fi';
import { ModeToggle } from './mode-toggle';
import { useAuth } from '../context/AuthContext';
import { cn } from "@/lib/utils";
import { useTheme } from '@/components/theme-provider';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
                <FiHome className="mr-1" />
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
                <FiStar className="mr-1" />
                For You
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
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/subscription" 
                  className="px-6 py-2 rounded-md border border-primary text-primary hover:bg-primary/10 font-medium transition-colors"
                >
                  Subscribe
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <FiUser />
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/preferences" 
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Preferences
                    </Link>
                    <Link 
                      to="/usage" 
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Usage
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/subscription" 
                  className="px-6 py-2 rounded-md border border-primary text-primary hover:bg-primary/10 font-medium transition-colors"
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
            {currentUser ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <FiUser className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-foreground">
                      {currentUser.displayName || currentUser.email}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{currentUser.email}</div>
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
    </nav>
  );
};

export default Navbar;