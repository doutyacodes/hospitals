'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [statusSummary, setStatusSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingAppointment, setUpdatingAppointment] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const statusFilters = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'confirmed', label: 'Confirmed', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch appointments data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'doctor') {
      fetchAppointments();
    }
  }, [isAuthenticated, user, filter, currentPage, searchTerm]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (filter !== 'all') params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/doctor/appointments?${params}`);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.appointments || data.data || []);
        setStatusSummary(data.statusSummary || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        error('Failed to load appointments');
      }
    } catch (err) {
      console.error('Appointments fetch error:', err);
      error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
    try {
      setUpdatingAppointment(appointmentId);
      const response = await fetch('/api/doctor/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          status,
          doctorNotes: notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Appointment ${status} successfully!`);
        setSelectedAppointment(null);
        setDoctorNotes('');
        fetchAppointments();
      } else {
        error(data.message || 'Failed to update appointment');
      }
    } catch (err) {
      console.error('Update appointment error:', err);
      error('Network error. Please try again.');
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilterCount = (filterKey) => {
    if (filterKey === 'all') {
      return statusSummary.reduce((total, item) => total + item.count, 0);
    }
    const filterItem = statusSummary.find(item => item.status === filterKey);
    return filterItem ? filterItem.count : 0;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'doctor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  My Appointments
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Manage patient appointments and consultations
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by patient name or hospital..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-1 sm:space-x-8 overflow-x-auto">
              {statusFilters.map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => handleFilterChange(filterOption.key)}
                  className={`whitespace-nowrap py-2 px-3 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    filter === filterOption.key
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {filterOption.label}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    filter === filterOption.key
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getFilterCount(filterOption.key)}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {appointments.length > 0 ? (
              <>
                <div className="space-y-4 sm:space-y-6">
                  {appointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      className="bg-white rounded-xl shadow-lg border border-white/50 overflow-hidden"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-4">
                              <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                  {appointment.patientName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                    {appointment.status}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Token #{appointment.tokenNumber}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-emerald-600">
                                  ₹{appointment.consultationFee}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {appointment.estimatedTime}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Hospital:</p>
                                <p className="font-medium text-gray-900">{appointment.hospitalName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Patient Email:</p>
                                <p className="font-medium text-gray-900">{appointment.patientEmail}</p>
                              </div>
                            </div>

                            {appointment.specialty && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600">Specialty:</p>
                                <p className="font-medium text-gray-900">{appointment.specialtyName}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {appointment.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                              <motion.button
                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                disabled={updatingAppointment === appointment.id}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {updatingAppointment === appointment.id ? 'Processing...' : 'Confirm'}
                              </motion.button>
                              <motion.button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setDoctorNotes('');
                                }}
                                disabled={updatingAppointment === appointment.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Cancel
                              </motion.button>
                            </div>
                          )}

                          {appointment.status === 'confirmed' && (
                            <div className="flex flex-col gap-2 lg:w-48">
                              <motion.button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setDoctorNotes('');
                                }}
                                disabled={updatingAppointment === appointment.id}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Complete
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 rounded-md ${
                            currentPage === i + 1
                              ? 'bg-emerald-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filter !== 'all' ? filter : ''} appointments found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {filter === 'all' 
                    ? "You don't have any appointments yet. Patients will be able to book consultations with you once you set up your sessions."
                    : `No ${filter} appointments to display. Try switching to a different filter.`
                  }
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Complete/Cancel Appointment Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedAppointment.status === 'confirmed' ? 'Complete Appointment' : 'Cancel Appointment'}
                </h2>
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setDoctorNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{selectedAppointment.patientName}</h3>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.hospitalName} • {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedAppointment.status === 'confirmed' ? 'Consultation Notes' : 'Cancellation Reason'} (Optional)
                  </label>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder={selectedAppointment.status === 'confirmed' 
                      ? "Add consultation notes, diagnosis, prescriptions, etc..."
                      : "Reason for cancellation..."
                    }
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.button
                    onClick={() => {
                      setSelectedAppointment(null);
                      setDoctorNotes('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => updateAppointmentStatus(
                      selectedAppointment.id,
                      selectedAppointment.status === 'confirmed' ? 'completed' : 'cancelled',
                      doctorNotes
                    )}
                    disabled={updatingAppointment === selectedAppointment.id}
                    className={`flex-1 px-6 py-3 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 ${
                      selectedAppointment.status === 'confirmed'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:shadow-lg'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updatingAppointment === selectedAppointment.id 
                      ? 'Processing...' 
                      : selectedAppointment.status === 'confirmed' ? 'Complete Appointment' : 'Cancel Appointment'
                    }
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}