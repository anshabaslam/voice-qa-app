import {
  BellIcon,
  BookOpenIcon,
  Bars3Icon,
  MoonIcon,
  Cog6ToothIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { Avatar } from "../../ui/Avatar";
import AvatarModal from "./components/AvatarModal";

interface HeaderProps {
  toggleSidebar: () => void;
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, onPageChange }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarPopoverOpen, setIsAvatarPopoverOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const avatarRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current &&
        popoverRef.current &&
        !avatarRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsAvatarPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAvatarClick = () => {
    setIsAvatarPopoverOpen(!isAvatarPopoverOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/70 dark:border-dark-700/70 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left Section - Mobile Menu Button & Search */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors lg:hidden"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Live Time Display */}
            <div className="flex items-center">
              <div className="px-4 py-2.5 w-52 bg-white/60 dark:bg-dark-800/60 backdrop-blur-xl backdrop-saturate-150 border border-gray-200/50 dark:border-dark-500/50 rounded-xl shadow-sm transition-all 150ms ease-in-out">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-900 dark:text-white font-mono">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentTime.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700" 
                style={{ transition: 'all 150ms ease-in-out' }}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <SunIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <MoonIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Documentation */}
              <button 
                onClick={() => onPageChange('documentation')}
                className="p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                title="View Documentation"
              >
                <BookOpenIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Settings */}
              <button className="p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                <Cog6ToothIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                <BellIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-900"></span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors sm:hidden"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Cog6ToothIcon className="w-5 h-5" />
              )}
            </button>

            {/* User Profile with Popover */}
            <div className="relative">
              <button
                ref={avatarRef}
                onClick={handleAvatarClick}
                className="focus:outline-none outline-none rounded-lg hover:scale-105"
                style={{ transition: 'all 150ms ease-in-out' }}
              >
                <Avatar
                  size={32}
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt={user?.name || "User"}
                  className="mask-scalloped rounded-none"
                />
              </button>

              {/* Avatar Modal Component */}
              <AvatarModal
                isOpen={isAvatarPopoverOpen}
                onClose={() => {
                  setIsAvatarPopoverOpen(false);
                  logout();
                }}
                avatarRef={avatarRef}
                popoverRef={popoverRef}
                user={{
                  name: user?.name || "John Doe",
                  email: user?.email || "john.doe@example.com",
                  role: "User",
                  avatar:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
                  isOnline: true,
                }}
              />
            </div>
          </div>
        </div>


        {/* Mobile Action Menu */}
        {isMobileMenuOpen && (
          <div className="px-4 pb-4 sm:hidden border-t border-gray-200/70 dark:border-dark-700/70">
            <div className="flex items-center justify-around mt-3 py-2">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
                <span className="text-xs">Theme</span>
              </button>

              {/* Documentation */}
              <button 
                onClick={() => {
                  onPageChange('documentation');
                  setIsMobileMenuOpen(false);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                <BookOpenIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-xs">Docs</span>
              </button>

              {/* Settings */}
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-xs">Settings</span>
              </button>

              {/* Notifications */}
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors relative">
                <div className="relative">
                  <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-900"></span>
                </div>
                <span className="text-xs">Alerts</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;