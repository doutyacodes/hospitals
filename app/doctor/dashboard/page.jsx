'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import {
  Activity,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  Play,
  ChevronRight,
  Stethoscope,
  DollarSign,
  UserCheck
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    todayAppointments: 0,
    pendingRequests: 0,
    associatedHospitals: 0,
    monthlyEarnings: 0,
    totalPatients: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [doctorStatus, setDoctorStatus] = useState('offline');
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { error, success } = useToast();

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
      fetchTodayAppointments();
      fetchDoctorStatus();
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

  const fetchTodayAppointments = async () => {
    try {
      const response = await fetch('/api/doctor/appointments/today');
      const data = await response.json();

      if (data.success) {
        setTodayAppointments(data.appointments?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error('Today appointments error:', err);
    }
  };

  const fetchDoctorStatus = async () => {
    try {
      const response = await fetch('/api/doctor/status');
      const data = await response.json();

      if (data.success) {
        setDoctorStatus(data.status || 'offline');
      }
    } catch (err) {
      console.error('Status error:', err);
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

  const getStatusColor = (status) => {
    const colors = {
      online: 'bg-green-500',
      consulting: 'bg-blue-500',
      on_break: 'bg-yellow-500',
      emergency: 'bg-red-500',
      offline: 'bg-gray-500'
    };
    return colors[status] || colors.offline;
  };

  const getStatusLabel = (status) => {
    const labels = {
      online: 'Online',
      consulting: 'In Consultation',
      on_break: 'On Break',
      emergency: 'Emergency',
      offline: 'Offline'
    };
    return labels[status] || 'Offline';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  Welcome, Dr. {user?.doctorName}
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(doctorStatus)} animate-pulse`}></div>
                  <span className="text-sm font-medium text-gray-600">{getStatusLabel(doctorStatus)}</span>
                </div>
              </div>
              <p className="text-gray-600">Ready to provide exceptional care today</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/doctor/consultation')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-5 h-5" />
              <span>Start Consultations</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Today's Appointments</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</h3>
                <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  View schedule
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <Calendar className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Patients</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalPatients}</h3>
                <p className="text-blue-600 text-sm mt-2 flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  Lifetime
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Monthly Earnings</p>
                <h3 className="text-3xl font-bold text-gray-900">₹{stats.monthlyEarnings.toLocaleString()}</h3>
                <p className="text-purple-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  This month
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Sessions</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalSessions}</h3>
                <p className="text-orange-600 text-sm mt-2 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {stats.associatedHospitals} hospitals
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center">
                <Activity className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  Today's Appointments
                </h2>
                <p className="text-sm text-gray-600 mt-1">Manage your consultation schedule</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/doctor/consultation')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start
              </motion.button>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No appointments today</p>
                <p className="text-gray-400 text-sm mt-2">You're all set for the day!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push('/doctor/consultation')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        #{appointment.tokenNumber}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-600">{appointment.estimatedTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status.toUpperCase()}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}

                {todayAppointments.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push('/doctor/consultation')}
                    className="w-full py-3 text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    View All Appointments →
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Consultation Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Consultation Hub</h3>
                <Stethoscope className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-emerald-100 text-sm mb-6">
                Manage your patient consultations, update status, and provide care
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/doctor/consultation')}
                className="w-full py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Open Consultation Page
              </motion.button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => router.push('/doctor/appointments')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">All Appointments</p>
                    <p className="text-xs text-gray-600">View complete history</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => router.push('/doctor/sessions')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Manage Sessions</p>
                    <p className="text-xs text-gray-600">Schedule & availability</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => router.push('/doctor/requests')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center relative">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    {stats.pendingRequests > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {stats.pendingRequests}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Hospital Requests</p>
                    <p className="text-xs text-gray-600">{stats.pendingRequests} pending</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Quick Tip</h4>
                  <p className="text-sm text-gray-700">
                    Use the <span className="font-semibold">Consultation Page</span> to efficiently manage your patient queue, update your status, and complete consultations with medical records.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
