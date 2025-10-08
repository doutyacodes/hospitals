'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  CheckCircle,
  Clock,
  Star,
  Stethoscope,
  GraduationCap,
  Award,
  Filter,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DoctorSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/hospital/doctors/search');
      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties');
      const data = await response.json();
      if (data.success) {
        setSpecialties(data.specialties || []);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const handleSendRequest = async (doctorId) => {
    setSendingRequest(doctorId);
    try {
      const response = await fetch('/api/hospital/doctors/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          message: 'We would like to invite you to join our hospital.'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the doctors list to update the status
        fetchDoctors();
      } else {
        alert(data.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request');
    } finally {
      setSendingRequest(null);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchQuery === '' ||
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialtyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = selectedSpecialty === 'all' ||
      doctor.specialtyId === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const getStatusBadge = (doctor) => {
    if (doctor.associationStatus === 'active') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Active in Hospital</span>
        </div>
      );
    }

    if (doctor.requestStatus === 'pending') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>Request Pending</span>
        </div>
      );
    }

    return null;
  };

  const canSendRequest = (doctor) => {
    return doctor.associationStatus !== 'active' && doctor.requestStatus !== 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
          >
            ← Back to Doctors
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Search Doctors</h1>
          <p className="text-slate-600">Find and invite doctors to join your hospital</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, specialty, or license number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* Specialty Filter (Desktop) */}
            <div className="hidden lg:block">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white min-w-[200px]"
              >
                <option value="all">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden mt-4 pt-4 border-t border-slate-200"
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-slate-600">
          Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Doctor Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Stethoscope className="w-8 h-8" />
                    </div>
                    {getStatusBadge(doctor)}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{doctor.name}</h3>
                  <p className="text-emerald-100 text-sm">{doctor.specialtyName || 'General Practice'}</p>
                </div>

                {/* Doctor Details */}
                <div className="p-6 space-y-4">
                  {/* Qualification */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Qualification</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{doctor.qualification}</p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">Experience</p>
                      <p className="text-sm font-medium text-slate-900">{doctor.experience} years</p>
                    </div>
                  </div>

                  {/* Rating */}
                  {doctor.rating && parseFloat(doctor.rating) > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Rating</p>
                        <p className="text-sm font-medium text-slate-900">
                          {parseFloat(doctor.rating).toFixed(1)} ({doctor.totalReviews} reviews)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* License Number */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">License Number</p>
                    <p className="text-sm font-mono text-slate-700">{doctor.licenseNumber}</p>
                  </div>

                  {/* Action Button */}
                  {canSendRequest(doctor) && (
                    <button
                      onClick={() => handleSendRequest(doctor.id)}
                      disabled={sendingRequest === doctor.id}
                      className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingRequest === doctor.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Send Join Request
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
