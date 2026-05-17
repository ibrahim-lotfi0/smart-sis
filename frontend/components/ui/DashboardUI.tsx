import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  const colors = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    success: 'text-risk-low bg-risk-low/10',
    warning: 'text-risk-medium bg-risk-medium/10',
    danger: 'text-risk-high bg-risk-high/10',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trend.isUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          )}>
            {trend.isUp ? '+' : '-'}{trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-text-secondary text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mt-1 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'low' | 'medium' | 'high' | 'primary' | 'secondary' | 'neutral';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const variants = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
  };

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5", variants[variant])}>
      {children}
    </span>
  );
}
