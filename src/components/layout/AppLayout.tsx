import { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar - hidden on mobile/tablet */}
      <div className="hidden md:block">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        {/* Fixed Top Navbar */}
        <Navbar />
        
        {/* Scrollable Content - padding for fixed nav bars */}
        <main className="flex-1 overflow-y-auto pt-[60px] pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        
        {/* Fixed Bottom Nav - mobile/tablet only */}
        <BottomNav />
      </div>
    </div>
  );
}
