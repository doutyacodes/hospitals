'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    bio: '',
    consultationFee: '',
    specialtyId: '',
    city: '',
    state: '',
    address: '',
    licenseNumber: '',
    bankAccount: ''
  });
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch profile data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'doctor') {
      fetchProfile();
      fetchSpecialties();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.doctor);
        setFormData({
          name: data.doctor.name || '',
          email: data.doctor.email || '',
          phone: data.doctor.phone || '',
          qualification: data.doctor.qualification || '',
          experience: data.doctor.experience?.toString() || '',
          bio: data.doctor.bio || '',
          consultationFee: data.doctor.consultationFee?.toString() || '',
          specialtyId: data.doctor.specialtyId || '',
          city: data.doctor.city || '',
          state: data.doctor.state || '',
          address: data.doctor.address || '',
          licenseNumber: data.doctor.licenseNumber || '',
          bankAccount: data.doctor.bankAccount || ''
        });
      } else {
        error('Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties');
      const data = await response.json();

      if (data.success) {
        setSpecialties(data.specialties);
      }
    } catch (err) {
      console.error('Specialties fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        success('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      } else {
        error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        qualification: profile.qualification || '',
        experience: profile.experience?.toString() || '',
        bio: profile.bio || '',
        consultationFee: profile.consultationFee?.toString() || '',
        specialtyId: profile.specialtyId || '',
        city: profile.city || '',
        state: profile.state || '',
        address: profile.address || '',
        licenseNumber: profile.licenseNumber || '',
        bankAccount: profile.bankAccount || ''
      });
    }
    setIsEditing(false);
  };

  if (authLoading || loading) {
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
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage your professional information and settings
              </p>
            </div>
            {!isEditing ? (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <motion.button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {profile && (
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl shadow-lg border border-white/50 overflow-hidden">
                <div className="p-6 sm:p-8">
                  {/* Profile Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21ZM12 8C14.2 8 16 9.8 16 12S14.2 16 12 16S8 14.2 8 12S9.8 8 12 8Z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">Dr. {profile.name}</h2>
                      <p className="text-gray-600 mt-1">{profile.qualification}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {profile.experience} years experience
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {profile.city}
                        </div>
                        <div className="flex items-center text-sm text-emerald-600 font-medium">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ₹{profile.consultationFee} consultation
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-8">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medical License Number *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="licenseNumber"
                              value={formData.licenseNumber}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.licenseNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specialty *
                          </label>
                          {isEditing ? (
                            <select
                              name="specialtyId"
                              value={formData.specialtyId}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="">Select specialty</option>
                              {specialties.map((specialty) => (
                                <option key={specialty.id} value={specialty.id}>
                                  {specialty.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="py-2 text-gray-900">
                              {specialties.find(s => s.id === profile.specialtyId)?.name || 'Not specified'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Qualification *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="qualification"
                              value={formData.qualification}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                              placeholder="MBBS, MD (Cardiology)"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.qualification}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Years of Experience *
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              name="experience"
                              value={formData.experience}
                              onChange={handleChange}
                              required
                              min="0"
                              max="50"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.experience} years</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Consultation Fee (₹) *
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              name="consultationFee"
                              value={formData.consultationFee}
                              onChange={handleChange}
                              required
                              min="0"
                              step="50"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">₹{profile.consultationFee}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Professional Bio *
                        </label>
                        {isEditing ? (
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            placeholder="Describe your medical expertise, experience, and approach to patient care..."
                          />
                        ) : (
                          <p className="py-2 text-gray-900 whitespace-pre-wrap">{profile.bio}</p>
                        )}
                      </div>
                    </div>

                    {/* Location Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          ) : (
                            <p className="py-2 text-gray-900">{profile.state}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            placeholder="Your practice address..."
                          />
                        ) : (
                          <p className="py-2 text-gray-900">{profile.address || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    {/* Banking Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Account Details
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="bankAccount"
                            value={formData.bankAccount}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            placeholder="Bank Name - ****1234"
                          />
                        ) : (
                          <p className="py-2 text-gray-900">{profile.bankAccount || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}