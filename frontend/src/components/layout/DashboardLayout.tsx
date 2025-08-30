import { useState } from 'react';
import { Sidebar } from './Sidebar';
import Header from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function DashboardLayout({ children, currentPage, onPageChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}