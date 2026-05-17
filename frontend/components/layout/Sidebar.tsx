'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { roleNavigation } from '@/lib/theme';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  
  const role = user?.role || 'Student';
  const navItems = roleNavigation[role as keyof typeof roleNavigation] || [];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 sidebar",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-full flex-col p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Icons.GraduationCap className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white font-bold text-xl tracking-tight"
            >
              Smart <span className="text-primary-light">SIS</span>
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const IconComponent = (Icons as any)[item.icon];
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/25 text-white shadow-glow" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}>
                  {IconComponent && <IconComponent size={22} />}
                </div>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Info */}
        <div className="mt-auto border-t border-white/10 pt-4">
          <div className={cn(
            "flex items-center gap-3 px-2 py-2",
            isSidebarOpen ? "justify-start" : "justify-center"
          )}>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold truncate w-32">
                  {user?.fullName}
                </span>
                <span className="text-white/40 text-xs truncate w-32">
                  {user?.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
