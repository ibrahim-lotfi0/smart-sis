'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '@/lib/store/uiStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div 
        className={cn(
          "transition-all duration-300 flex flex-col min-h-screen",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        <Topbar />
        <main className="flex-1 p-6 md:p-8 animate-fade-in">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="p-6 text-center text-xs text-text-secondary opacity-60">
          &copy; 2026 Smart University Management System (SIS). All rights reserved.
        </footer>
      </div>
    </div>
  );
}
