import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children, pageTitle }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Overlay mobile avec transition améliorée */}
      <div 
        className={`fixed inset-0 bg-[#0B1C3F]/40 backdrop-blur-md z-20 lg:hidden transition-all duration-500 ease-in-out ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      ></div>

      <Sidebar 
        role={user?.role} 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar user={user} onMenuClick={toggleSidebar} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="w-full h-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
