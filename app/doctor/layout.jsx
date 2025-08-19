'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import DoctorNavbar from './components/DoctorNavbar';

export default function DoctorLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== 'doctor')) {
      // Allow access to login and signup pages
      if (pathname !== '/doctor/login' && !pathname.startsWith('/doctor/signup')) {
        router.push('/doctor/login');
      }
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Don't show navbar for login/signup pages
  const hideNavbar = pathname === '/doctor/login' || pathname.startsWith('/doctor/signup');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - only show for authenticated doctor pages */}
      {!hideNavbar && isAuthenticated && user?.userType === 'doctor' && (
        <DoctorNavbar />
      )}
      
      {/* Main Content */}
      <main className={hideNavbar ? '' : 'pt-0'}>
        {children}
      </main>
    </div>
  );
}