import { ChevronRightIcon, QuestionMarkCircleIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon, UserIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Avatar } from "../../../ui/Avatar";

interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarRef: React.RefObject<HTMLButtonElement | null>;
  user: User;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose, user, popoverRef }) => {
  if (!isOpen) return null;

  const menuItems = [
    { icon: UserIcon, label: "Profile Settings", shortcut: "⌘P" },
    { icon: Cog6ToothIcon, label: "Preferences", shortcut: "⌘," },
    { icon: QuestionMarkCircleIcon, label: "Help & Support", shortcut: "⌘H" },
  ];

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 z-50 animate-in slide-in-from-top-2 duration-200"
    >
      {/* Enhanced backdrop with stronger blur and less transparency */}
      <div
        className="relative border border-white/15 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(40px) saturate(220%) brightness(1.3)",
          WebkitBackdropFilter: "blur(40px) saturate(220%) brightness(1.3)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 34v4h4v2H6v4h-2v-4H0v-2h4v-4h2zm0-30v4h2v4H4V6H0V4h4V0h2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative p-6 rounded-2xl">
          {/* User Info Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar
                size={48}
                src={user.avatar}
                alt={user.name}
                className="rounded-xl border-2 border-white/15 dark:border-white/10"
              />
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black/20 dark:border-black/40"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-white text-lg drop-shadow-sm">
                {user.name}
              </h3>
              <p className="text-sm text-gray-200 dark:text-gray-200 drop-shadow-sm">
                {user.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 dark:bg-blue-500/30 text-blue-200 dark:text-blue-200 mt-1">
                {user.role}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-200 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-200 group"
                onClick={() => {
                  console.log(`Clicked: ${item.label}`);
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-300 dark:text-gray-300 group-hover:text-white dark:group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium drop-shadow-sm">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="text-xs text-gray-300 dark:text-gray-300 bg-black/20 dark:bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {item.shortcut}
                  </kbd>
                  <ChevronRightIcon className="w-3 h-3 text-gray-300 dark:text-gray-300 group-hover:text-white dark:group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Enhanced Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/25 dark:via-white/15 to-transparent"></div>

          {/* Sign Out */}
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 dark:text-red-300 hover:bg-red-500/20 dark:hover:bg-red-500/20 transition-all duration-200 group"
            onClick={() => {
              console.log("Sign out clicked");
              onClose();
            }}
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium drop-shadow-sm">Sign Out</span>
          </button>
        </div>

        {/* Enhanced bottom glow effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

        {/* Additional corner highlights */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/5 to-transparent rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default AvatarModal;