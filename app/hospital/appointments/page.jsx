'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { error, success } = useToast();

  // Redirect if not authenticated or not hospital
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== 'hospital')) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch appointments data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'hospital') {
      fetchAppointments();
      fetchDoctors();
    }
  }, [isAuthenticated, user]);

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(appointment => 
        appointment.appointmentDate?.startsWith(selectedDate)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status === selectedStatus
      );
    }

    if (selectedDoctor) {
      filtered = filtered.filter(appointment => 
        appointment.doctorId === selectedDoctor
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, selectedDate, selectedStatus, selectedDoctor]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await fetch('/api/hospital/appointments');
      const data = await response.json();

      if (data.success) {
        setAppointments(data.data || []);
      } else {
        error('Failed to load appointments');
      }
    } catch (err) {
      console.error('Appointments fetch error:', err);
      error('Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/hospital/doctors?status=active');
      const data = await response.json();

      if (data.success) {
        setDoctors(data.data || []);
      }
    } catch (err) {
      console.error('Doctors fetch error:', err);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`/api/hospital/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Appointment ${newStatus}`);
        fetchAppointments(); // Refresh the list
      } else {
        error(data.message || 'Failed to update appointment');
      }
    } catch (err) {
      console.error('Status update error:', err);
      error('Failed to update appointment');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

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

  const today = new Date().toISOString().split('T')[0];

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
                Hospital Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track patient appointments with your hospital doctors
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => router.push('/hospital/appointments/schedule')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 active:scale-95 transition-all duration-200 touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Schedule New
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Filters */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Appointments
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by patient name, doctor, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Doctor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.doctorName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Appointments List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {loadingAppointments ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading appointments...</p>
                </div>
              </div>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Appointment Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z" />
                        </svg>
                      </div>

                      {/* Appointment Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-blue-600 font-medium mb-1">
                          Dr. {appointment.doctorName}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z" />
                            </svg>
                            {formatDate(appointment.appointmentDate)}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(appointment.appointmentTime)}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {appointment.patientEmail}
                          </span>
                          {appointment.patientPhone && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {appointment.patientPhone}
                            </span>
                          )}
                        </div>
                        {appointment.purpose && (
                          <p className="text-gray-600 text-sm mt-2">
                            <span className="font-medium">Purpose:</span> {appointment.purpose}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:min-w-[280px] lg:justify-end">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 touch-manipulation min-h-[44px]"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200 touch-manipulation min-h-[44px]"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition-all duration-200 touch-manipulation min-h-[44px]"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/hospital/appointments/${appointment.id}`)}
                        className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-gray-700 hover:to-gray-800 active:scale-95 transition-all duration-200 touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No appointments found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm || selectedDate || selectedStatus !== 'all' || selectedDoctor
                      ? 'Try adjusting your filters to see more results' 
                      : 'Patient appointments will appear here once scheduled'
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}