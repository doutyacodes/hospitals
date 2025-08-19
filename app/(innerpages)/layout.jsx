'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function InnerPagesLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user) {
      if (user.userType === 'doctor' && pathname === '/dashboard') {
        router.replace('/doctor/dashboard');
      } else if (user.userType === 'hospital' && pathname === '/dashboard') {
        router.replace('/hospital/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
        <Sidebar />
        <main className="flex-1 lg:ml-72 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}