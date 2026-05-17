"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/store/authStore';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', data);
      const authData = response.data;
      
      // Set auth in store
      setAuth(authData);
      
      // Set cookies for middleware
      document.cookie = `sis-token=${authData.token}; path=/; max-age=86400;`;
      document.cookie = `sis-role=${authData.role}; path=/; max-age=86400;`;
      
      // Redirect based on role
      router.push(`/${authData.role.toLowerCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 overflow-hidden relative">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 shadow-2xl relative z-10 border border-white/50">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow mb-4">
              <GraduationCap className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Smart <span className="text-primary">SIS</span></h1>
            <p className="text-text-secondary mt-2 text-sm font-medium">Welcome back! Please login to your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 animate-shake flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@uni.edu"
                  className={`sis-input pl-10 h-12 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`sis-input pl-10 h-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary/20" />
                <span className="text-xs text-text-secondary font-medium group-hover:text-primary transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-12 text-base shadow-glow flex items-center justify-center group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-text-secondary">
              Real Credentials: <br />
              <span className="font-bold text-primary">admin@university.edu</span> (Admin) <br />
              <span className="font-bold text-primary">sara@student.edu</span> (Student) <br />
              Password: <span className="font-bold">password123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
