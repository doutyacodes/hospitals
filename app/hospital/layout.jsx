'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import HospitalNavbar from './components/HospitalNavbar';

export default function HospitalLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated or not hospital
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== 'hospital')) {
      // Allow access to login and signup pages
      if (pathname !== '/login' && !pathname.startsWith('/signup')) {
        router.push('/login');
      }
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't show navbar for login/signup pages
  const hideNavbar = pathname === '/login' || pathname.startsWith('/signup');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - only show for authenticated hospital pages */}
      {!hideNavbar && isAuthenticated && user?.userType === 'hospital' && (
        <HospitalNavbar />
      )}
      
      {/* Main Content */}
      <main className={hideNavbar ? '' : 'pt-0'}>
        {children}
      </main>
    </div>
  );
}