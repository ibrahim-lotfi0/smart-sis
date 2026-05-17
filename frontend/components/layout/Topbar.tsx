'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';

export default function Topbar() {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Clear cookies for middleware
    document.cookie = 'sis-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'sis-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <header className="h-16 glass sticky top-0 z-30 flex items-center justify-between px-6 border-b border-primary/5">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors"
        >
          <Icons.Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full">
          <Icons.Calendar size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary">Spring 2026 Semester</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <button className="p-2 hover:bg-primary/5 rounded-full text-secondary transition-colors relative">
            <Icons.Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-primary/10 mx-1"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50/50 text-red-500 rounded-lg transition-colors group"
        >
          <Icons.LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
