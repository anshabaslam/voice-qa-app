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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900" style={{ transition: 'background-color 150ms ease-in-out' }}>
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={onPageChange} 
        onCollapseChange={setSidebarCollapsed}
      />
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[280px]'}`} style={{ transition: 'all 150ms ease-in-out' }}>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} onPageChange={onPageChange} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ transition: 'all 150ms ease-in-out' }}>
          {children}
        </main>
      </div>
    </div>
  );
}