'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    todayAppointments: 0,
    pendingRequests: 0,
    associatedHospitals: 0,
    monthlyEarnings: 0,
    totalPatients: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { error } = useToast();

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'doctor') {
      fetchDashboardStats();
      fetchRecentRequests();
      fetchUpcomingSessions();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch('/api/doctor/dashboard/stats');
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
      const response = await fetch('/api/doctor/requests?status=pending&limit=5');
      const data = await response.json();

      if (data.success) {
        setRecentRequests(data.data || []);
      }
    } catch (err) {
      console.error('Recent requests error:', err);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      const response = await fetch('/api/doctor/sessions?limit=5');
      const data = await response.json();

      if (data.success) {
        // Filter active sessions only
        const activeSessions = (data.data || []).filter(session => session.isActive);
        setUpcomingSessions(activeSessions);
      }
    } catch (err) {
      console.error('Upcoming sessions error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'doctor') {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100">
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                Welcome back, Dr. {user?.doctorName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's an overview of your medical practice
              </p>
            </div>
            <motion.div
              className="hidden sm:flex w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl items-center justify-center shadow-lg"
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 0.6 }}
            >
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21ZM12 8C14.2 8 16 9.8 16 12S14.2 16 12 16S8 14.2 8 12S9.8 8 12 8Z"/>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6"
          >
            {[
              {
                title: 'Associated Hospitals',
                value: loadingStats ? '...' : stats.associatedHospitals,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-indigo-600',
                bgGradient: 'from-blue-50 to-indigo-50',
                trend: stats.associatedHospitals || '0'
              },
              {
                title: 'Active Sessions',
                value: loadingStats ? '...' : stats.totalSessions,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z" />
                  </svg>
                ),
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                trend: stats.totalSessions || '0'
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
                trend: stats.pendingRequests || '0'
              },
              {
                title: 'Today\'s Appointments',
                value: loadingStats ? '...' : stats.todayAppointments,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                ),
                gradient: 'from-green-500 to-emerald-600',
                bgGradient: 'from-green-50 to-emerald-50',
                trend: stats.todayAppointments || '0'
              },
              {
                title: 'Monthly Earnings',
                value: loadingStats ? '...' : `₹${stats.monthlyEarnings?.toLocaleString() || '0'}`,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                ),
                gradient: 'from-purple-500 to-pink-600',
                bgGradient: 'from-purple-50 to-pink-50',
                trend: `₹${stats.monthlyEarnings?.toLocaleString() || '0'}`
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
                <p className="text-gray-600 text-sm">Manage your medical practice</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Hospital Requests',
                  subtitle: 'Review collaboration requests',
                  href: '/doctor/requests',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  ),
                  gradient: 'from-blue-500 to-indigo-600',
                  bgGradient: 'from-blue-50 to-indigo-50'
                },
                {
                  title: 'My Sessions',
                  subtitle: 'Manage hospital sessions',
                  href: '/doctor/sessions',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z" />
                    </svg>
                  ),
                  gradient: 'from-emerald-500 to-teal-600',
                  bgGradient: 'from-emerald-50 to-teal-50'
                },
                {
                  title: 'Appointments',
                  subtitle: 'View patient appointments',
                  href: '/doctor/appointments',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  ),
                  gradient: 'from-purple-500 to-pink-600',
                  bgGradient: 'from-purple-50 to-pink-50'
                },
                {
                  title: 'Profile',
                  subtitle: 'Update doctor information',
                  href: '/doctor/profile',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

          {/* Recent Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Requests
                  </h2>
                  <p className="text-gray-600 text-sm">Hospital collaboration requests awaiting response</p>
                </div>
                <motion.button
                  onClick={() => router.push('/doctor/requests')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
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
                          <p className="font-medium text-gray-900">{request.hospitalName}</p>
                          <p className="text-sm text-gray-600">{request.hospitalCity}</p>
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
                    <p className="text-gray-600">No pending requests</p>
                    <p className="text-sm text-gray-500 mt-1">Hospital collaboration requests requiring response will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Active Sessions
                  </h2>
                  <p className="text-gray-600 text-sm">Your current hospital consultation sessions</p>
                </div>
                <motion.button
                  onClick={() => router.push('/doctor/sessions')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All
                </motion.button>
              </div>
              
              <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session, index) => (
                    <motion.div 
                      key={session.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          session.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{session.hospitalName}</p>
                          <p className="text-sm text-gray-600">
                            {session.dayOfWeek} • {session.startTime} - {session.endTime}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.hospitalCity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {session.maxTokens} tokens
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.avgMinutesPerPatient}min/patient
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600">No active sessions</p>
                    <p className="text-sm text-gray-500 mt-1">Create consultation sessions with hospitals to see them here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}