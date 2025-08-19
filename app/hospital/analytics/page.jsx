'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function HospitalAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    appointmentStats: {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      completed: 0
    },
    doctorStats: {
      total: 0,
      active: 0,
      pending: 0,
      specialties: []
    },
    revenueStats: {
      thisMonth: 0,
      lastMonth: 0,
      growth: 0,
      chartData: []
    },
    patientStats: {
      totalPatients: 0,
      newPatients: 0,
      returningPatients: 0,
      avgAge: 0
    },
    timeStats: {
      avgWaitTime: 0,
      avgConsultationTime: 0,
      peakHours: []
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, quarter, year
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { error } = useToast();

  // Redirect if not authenticated or not hospital
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'hospital')) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch analytics data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'hospital') {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, user, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hospital/analytics?period=${selectedPeriod}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        error('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Hospital Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights into your hospital operations and performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Key Metrics Overview */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: 'Total Appointments',
                value: analyticsData.appointmentStats.total,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-indigo-600',
                bgGradient: 'from-blue-50 to-indigo-50',
                change: '+12%'
              },
              {
                title: 'Active Doctors',
                value: analyticsData.doctorStats.active,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                change: '+5%'
              },
              {
                title: 'Total Patients',
                value: analyticsData.patientStats.totalPatients,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                ),
                gradient: 'from-purple-500 to-pink-600',
                bgGradient: 'from-purple-50 to-pink-50',
                change: '+18%'
              },
              {
                title: 'Monthly Revenue',
                value: `₹${analyticsData.revenueStats.thisMonth?.toLocaleString() || '0'}`,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                ),
                gradient: 'from-amber-500 to-orange-600',
                bgGradient: 'from-amber-50 to-orange-50',
                change: `${analyticsData.revenueStats.growth > 0 ? '+' : ''}${analyticsData.revenueStats.growth}%`
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
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
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-60`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className={`bg-gradient-to-r ${metric.gradient} p-3 rounded-xl shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="text-white">
                        {metric.icon}
                      </div>
                    </motion.div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-white/80 ${
                      metric.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold text-gray-800`}>
                      {metric.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Appointment Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Appointment Breakdown</h2>
                  <p className="text-gray-600 text-sm">Status distribution of appointments</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Confirmed', value: analyticsData.appointmentStats.confirmed, color: 'bg-emerald-500' },
                  { label: 'Completed', value: analyticsData.appointmentStats.completed, color: 'bg-blue-500' },
                  { label: 'Pending', value: analyticsData.appointmentStats.pending, color: 'bg-amber-500' },
                  { label: 'Cancelled', value: analyticsData.appointmentStats.cancelled, color: 'bg-red-500' }
                ].map((status) => (
                  <div key={status.label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{status.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{status.value}</span>
                      <span className="text-xs text-gray-500">
                        ({calculatePercentage(status.value, analyticsData.appointmentStats.total)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Doctor Specialties</h2>
                  <p className="text-gray-600 text-sm">Distribution of medical specialties</p>
                </div>
              </div>

              <div className="space-y-3">
                {analyticsData.doctorStats.specialties.length > 0 ? (
                  analyticsData.doctorStats.specialties.map((specialty, index) => (
                    <div key={specialty.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{specialty.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(specialty.count / analyticsData.doctorStats.total) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{specialty.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No specialty data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Patient and Time Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Patient Insights</h2>
                  <p className="text-gray-600 text-sm">Patient demographics and patterns</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analyticsData.patientStats.newPatients}</p>
                    <p className="text-sm text-gray-600">New Patients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">{analyticsData.patientStats.returningPatients}</p>
                    <p className="text-sm text-gray-600">Returning Patients</p>
                  </div>
                </div>
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-lg font-semibold text-gray-700">Average Age: {analyticsData.patientStats.avgAge} years</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Time Analytics</h2>
                  <p className="text-gray-600 text-sm">Operational efficiency metrics</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{analyticsData.timeStats.avgWaitTime}min</p>
                    <p className="text-sm text-gray-600">Avg Wait Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{analyticsData.timeStats.avgConsultationTime}min</p>
                    <p className="text-sm text-gray-600">Avg Consultation</p>
                  </div>
                </div>
                {analyticsData.timeStats.peakHours.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Peak Hours</p>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.timeStats.peakHours.map((hour) => (
                        <span key={hour} className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                          {hour}:00
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Revenue Trends */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Revenue Trends</h2>
                  <p className="text-gray-600 text-sm">Financial performance over time</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-lg font-bold text-green-600">₹{analyticsData.revenueStats.thisMonth?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Month</p>
                  <p className="text-lg font-bold text-gray-700">₹{analyticsData.revenueStats.lastMonth?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">Revenue chart will be displayed here</p>
                <p className="text-sm text-gray-400 mt-1">Connect with charting library for visualization</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}