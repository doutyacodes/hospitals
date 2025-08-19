'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending, declined
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { error, success } = useToast();

  // Redirect if not authenticated or not hospital
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== 'hospital')) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch doctors data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'hospital') {
      fetchDoctors();
    }
  }, [isAuthenticated, user]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await fetch('/api/hospital/doctors');
      const data = await response.json();

      if (data.success) {
        setDoctors(data.data || []);
      } else {
        error('Failed to load doctors');
      }
    } catch (err) {
      console.error('Doctors fetch error:', err);
      error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleStatusUpdate = async (doctorId, newStatus) => {
    try {
      const response = await fetch(`/api/hospital/doctors/${doctorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Doctor status updated to ${newStatus}`);
        fetchDoctors(); // Refresh the list
      } else {
        error(data.message || 'Failed to update doctor status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      error('Failed to update doctor status');
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

  const specialties = [...new Set(doctors.map(doctor => doctor.specialtyName).filter(Boolean))];
  
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialtyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialtyName === selectedSpecialty;
    const matchesStatus = filterStatus === 'all' || doctor.status === filterStatus;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Hospital Doctors
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your hospital's medical staff and doctor collaborations
              </p>
            </div>
            <motion.button
              onClick={() => router.push('/hospital/doctors/search')}
              className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Doctors
            </motion.button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Doctors
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Doctors List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {loadingDoctors ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading doctors...</p>
                </div>
              </div>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Doctor Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl font-bold">
                          {doctor.doctorName?.charAt(0) || 'D'}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            Dr. {doctor.doctorName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doctor.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            doctor.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {doctor.status}
                          </span>
                        </div>
                        <p className="text-blue-600 font-medium mb-1">{doctor.specialtyName}</p>
                        <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {doctor.city}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {doctor.experienceYears}+ years exp.
                          </span>
                          {doctor.consultationFee && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              ₹{doctor.consultationFee}
                            </span>
                          )}
                        </div>
                        {doctor.bio && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{doctor.bio}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      {doctor.status === 'pending' && (
                        <>
                          <motion.button
                            onClick={() => handleStatusUpdate(doctor.id, 'active')}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            onClick={() => handleStatusUpdate(doctor.id, 'declined')}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Decline
                          </motion.button>
                        </>
                      )}
                      {doctor.status === 'active' && (
                        <motion.button
                          onClick={() => router.push(`/hospital/doctors/${doctor.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => router.push(`/hospital/doctors/${doctor.id}/sessions`)}
                        className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sessions
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No doctors found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm || selectedSpecialty || filterStatus !== 'all' 
                      ? 'Try adjusting your filters to see more results' 
                      : 'Start by searching and inviting doctors to collaborate with your hospital'
                    }
                  </p>
                  <motion.button
                    onClick={() => router.push('/hospital/doctors/search')}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Search Doctors
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}