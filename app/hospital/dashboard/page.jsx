'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function HospitalDashboardPage() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    pendingRequests: 0,
    activeDoctors: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { error } = useToast();

  // Redirect if not authenticated or not hospital
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== 'hospital')) {
      router.push('/hospital/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'hospital') {
      fetchDashboardStats();
      fetchRecentRequests();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch('/api/hospital/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        error('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
      error('Failed to load dashboard data');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const response = await fetch('/api/hospital/requests?limit=5');
      const data = await response.json();

      if (data.success) {
        setRecentRequests(data.data);
      }
    } catch (err) {
      console.error('Recent requests error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'hospital') {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Welcome back, {user?.hospitalName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's an overview of your hospital operations
              </p>
            </div>
            <motion.div
              className="hidden sm:flex w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl items-center justify-center shadow-lg"
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 0.6 }}
            >
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: 'Total Doctors',
                value: loadingStats ? '...' : stats.totalDoctors,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                trend: '+12%'
              },
              {
                title: 'Active Doctors',
                value: loadingStats ? '...' : stats.activeDoctors,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-indigo-600',
                bgGradient: 'from-blue-50 to-indigo-50',
                trend: '+8%'
              },
              {
                title: 'Pending Requests',
                value: loadingStats ? '...' : stats.pendingRequests,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'from-amber-500 to-orange-600',
                bgGradient: 'from-amber-50 to-orange-50',
                trend: '+5%'
              },
              {
                title: 'Monthly Revenue',
                value: loadingStats ? '...' : `₹${stats.monthlyRevenue?.toLocaleString()}`,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                ),
                gradient: 'from-purple-500 to-pink-600',
                bgGradient: 'from-purple-50 to-pink-50',
                trend: '+15%'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                className={`relative bg-white rounded-xl p-6 shadow-lg border border-white/50 backdrop-blur-sm overflow-hidden`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-60`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="text-white">
                        {stat.icon}
                      </div>
                    </motion.div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-white/80 text-emerald-600`}>
                      {stat.trend}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold text-gray-800`}>
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Quick Actions
                </h2>
                <p className="text-gray-600 text-sm">Manage your hospital operations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Search Doctors',
                  subtitle: 'Find & invite doctors',
                  href: '/hospital/doctors',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  gradient: 'from-blue-500 to-indigo-600',
                  bgGradient: 'from-blue-50 to-indigo-50'
                },
                {
                  title: 'Doctor Requests',
                  subtitle: 'Manage collaboration requests',
                  href: '/hospital/requests',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  ),
                  gradient: 'from-emerald-500 to-teal-600',
                  bgGradient: 'from-emerald-50 to-teal-50'
                },
                {
                  title: 'Appointments',
                  subtitle: 'View patient appointments',
                  href: '/hospital/appointments',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z" />
                    </svg>
                  ),
                  gradient: 'from-purple-500 to-pink-600',
                  bgGradient: 'from-purple-50 to-pink-50'
                },
                {
                  title: 'Settings',
                  subtitle: 'Hospital configuration',
                  href: '/hospital/settings',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  gradient: 'from-gray-600 to-gray-700',
                  bgGradient: 'from-gray-50 to-gray-100'
                }
              ].map((action, index) => (
                <motion.button
                  key={action.title}
                  onClick={() => router.push(action.href)}
                  className={`group relative bg-gradient-to-br ${action.bgGradient} rounded-xl p-4 text-left transition-all duration-300 border border-white/50 shadow-md hover:shadow-lg overflow-hidden`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative z-10">
                    <motion.div 
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg mb-3`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {action.icon}
                    </motion.div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 group-hover:text-gray-700 transition-colors">
                      {action.subtitle}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recent Requests */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Doctor Requests
                </h2>
                <p className="text-gray-600 text-sm">Latest collaboration requests</p>
              </div>
              <motion.button
                onClick={() => router.push('/hospital/requests')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </motion.button>
            </div>
            
            <div className="space-y-3">
              {recentRequests.length > 0 ? (
                recentRequests.map((request, index) => (
                  <motion.div 
                    key={request.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        request.status === 'approved' ? 'bg-emerald-500' :
                        request.status === 'declined' ? 'bg-red-500' :
                        'bg-amber-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">Dr. {request.doctorName}</p>
                        <p className="text-sm text-gray-600">{request.specialtyName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        request.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {request.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                    </svg>
                  </div>
                  <p className="text-gray-600">No recent requests</p>
                  <p className="text-sm text-gray-500 mt-1">Doctor collaboration requests will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}