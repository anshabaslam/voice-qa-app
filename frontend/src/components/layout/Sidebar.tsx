import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  MicrophoneIcon,
  Cog6ToothIcon,
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { 
  MicrophoneIcon as MicrophoneIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from '@heroicons/react/24/solid';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    {
      name: 'Dashboard',
      id: 'dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      name: 'Voice Q&A',
      id: 'voice-qa',
      icon: MicrophoneIcon,
      iconSolid: MicrophoneIconSolid,
    },
    {
      name: 'Analytics',
      id: 'analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
    },
    {
      name: 'Settings',
      id: 'settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center px-6 py-4">
        <MicrophoneIconSolid className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
          Voice Q&A
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = currentPage === item.id ? item.iconSolid : item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                currentPage === item.id
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center px-4 py-2 mb-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5 mr-3" />
          ) : (
            <SunIcon className="h-5 w-5 mr-3" />
          )}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>

        {/* User Info */}
        <div className="flex items-center px-4 py-2 mb-2 text-gray-600 dark:text-gray-300">
          <UserIcon className="h-5 w-5 mr-3" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white dark:bg-gray-800 h-full shadow-xl">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <SidebarContent />
      </div>
    </>
  );
}