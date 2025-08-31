import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  MicrophoneIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { 
  MicrophoneIcon as MicrophoneIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  BookOpenIcon as BookOpenIconSolid,
} from '@heroicons/react/24/solid';
import logoLight from '../../assets/logo-black.png';
import logoDark from '../../assets/logo-white.png';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
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
      name: 'Documentation',
      id: 'documentation',
      icon: BookOpenIcon,
      iconSolid: BookOpenIconSolid,
    },
    {
      name: 'Settings',
      id: 'settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
    },
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-gray-700/40" style={{ transition: 'all 150ms ease-in-out' }}>
        {!isCollapsed ? (
          <div className="flex">
            <img 
              src={theme === 'light' ? logoLight : logoDark} 
              alt="Voice Q&A Logo" 
              className={`${theme === 'light' ? 'h-[25px]' : 'h-[25px]'} w-auto object-contain max-w-[180px]`}
              style={{ transition: 'all 150ms ease-in-out' }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <MicrophoneIconSolid className="h-7 w-7 text-blue-600 dark:text-blue-400" style={{ transition: 'all 150ms ease-in-out' }} />
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isMobile && (
            <button
              onClick={handleCollapse}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white"
              style={{ transition: 'all 150ms ease-in-out' }}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white"
              style={{ transition: 'all 150ms ease-in-out' }}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        <nav className="space-y-4">
          <div>
            {/* Section Title */}
            {!isCollapsed && (
              <div className="mb-3 px-3">
                <h3 className="text-[12px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  MAIN MENU
                </h3>
              </div>
            )}

            {/* Menu Items */}
            <div className="">
              {navigation.map((item) => {
                const Icon = currentPage === item.id ? item.iconSolid : item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      if (isMobile) setIsMobileMenuOpen(false);
                    }}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium w-full ${
                      isActive
                        ? "bg-blue-100 dark:bg-gray-800/60 text-blue-900 dark:text-white backdrop-blur-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    style={{ transition: 'all 150ms ease-in-out' }}
                    title={isCollapsed ? item.name : ""}
                  >
                    <Icon
                      className={`h-4 w-5 shrink-0 ${
                        isActive
                          ? "text-blue-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                      style={{ transition: 'all 150ms ease-in-out' }}
                    />

                    {!isCollapsed && (
                      <span className="truncate">
                        {item.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-gray-700/40" style={{ transition: 'all 150ms ease-in-out' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center px-3 py-2.5 mb-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200 rounded-xl"
          style={{ transition: 'all 150ms ease-in-out' }}
        >
          {theme === 'light' ? (
            <MoonIcon className="h-4 w-5 shrink-0" />
          ) : (
            <SunIcon className="h-4 w-5 shrink-0" />
          )}
          {!isCollapsed && (
            <span className="ml-3 truncate text-[13px] font-medium">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
        </button>

        {/* User Info & Logout */}
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 rounded-xl bg-gray-200/30 dark:bg-white/[0.03] p-2.5 ring-1 ring-gray-300/50 dark:ring-white/5 mb-2">
            <div className="h-7 w-7 rounded-full bg-blue-600 dark:bg-gradient-to-br dark:from-blue-600 dark:to-blue-700 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
          style={{ transition: 'all 150ms ease-in-out' }}
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-5 shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 truncate text-[13px] font-medium">
              Sign Out
            </span>
          )}
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
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/60 backdrop-blur-sm transition-all duration-300" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative flex flex-col w-[280px] bg-gray-100 dark:bg-dark-900 h-full shadow-xl border-r border-gray-200 dark:border-gray-800/50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div 
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-gray-100 dark:bg-dark-900 border-r border-gray-200 dark:border-gray-800/50 shadow-xl ${
          isCollapsed ? "lg:w-[70px]" : "lg:w-[280px]"
        }`}
        style={{ transition: 'all 150ms ease-in-out' }}
      >
        <SidebarContent />
      </div>
    </>
  );
}