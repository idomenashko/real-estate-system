import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UserIcon, 
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'דשבורד', path: '/dashboard', icon: HomeIcon },
    { name: 'נכסים', path: '/properties', icon: BuildingOfficeIcon },
    { name: 'עסקאות', path: '/deals', icon: CurrencyDollarIcon },
    { name: 'פרופיל', path: '/profile', icon: UserIcon },
  ];

  // Add admin link if user is admin
  if (isAdmin()) {
    navItems.push({ name: 'ניהול', path: '/admin', icon: CogIcon });
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <span className="mr-2 text-xl font-bold text-gray-900">מערכת נדל"ן</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 ml-2" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 ml-2">
                שלום, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="mr-4 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
              >
                התנתק
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 ml-3" />
                {item.name}
              </Link>
            ))}
            
            {/* Mobile user info and logout */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-3 py-2 text-sm text-gray-700">
                שלום, {user?.name}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-right px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
              >
                התנתק
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 