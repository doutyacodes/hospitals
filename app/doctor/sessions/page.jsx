'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DoctorSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    hospitalId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    maxTokens: '',
    avgMinutesPerPatient: '15',
    notes: '',
  });
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch sessions data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'doctor') {
      fetchSessions();
      fetchAssociatedHospitals();
    }
  }, [isAuthenticated, user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/sessions');
      const data = await response.json();

      if (data.success) {
        setSessions(data.data);
      } else {
        error('Failed to load sessions');
      }
    } catch (err) {
      console.error('Sessions fetch error:', err);
      error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedHospitals = async () => {
    try {
      const response = await fetch('/api/doctor/hospitals');
      const data = await response.json();

      if (data.success) {
        setHospitals(data.hospitals || []);
      }
    } catch (err) {
      console.error('Hospitals fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.hospitalId || !formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.maxTokens) {
      error('Please fill in all required fields');
      return;
    }

    try {
      const url = editingSession ? '/api/doctor/sessions' : '/api/doctor/sessions';
      const method = editingSession ? 'PATCH' : 'POST';
      const body = editingSession 
        ? { ...formData, sessionId: editingSession.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        success(editingSession ? 'Session updated successfully!' : 'Session created successfully!');
        setShowCreateModal(false);
        setEditingSession(null);
        setFormData({
          hospitalId: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          maxTokens: '',
          avgMinutesPerPatient: '15',
          notes: '',
        });
        fetchSessions();
      } else {
        error(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Session operation error:', err);
      error('Network error. Please try again.');
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      hospitalId: session.hospitalId,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      maxTokens: session.maxTokens.toString(),
      avgMinutesPerPatient: session.avgMinutesPerPatient.toString(),
      notes: session.notes || '',
    });
    setShowCreateModal(true);
  };

  const toggleSessionStatus = async (sessionId, currentStatus) => {
    try {
      const response = await fetch('/api/doctor/sessions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Session ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchSessions();
      } else {
        error(data.error || 'Failed to update session status');
      }
    } catch (err) {
      console.error('Toggle session status error:', err);
      error('Network error. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      hospitalId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      maxTokens: '',
      avgMinutesPerPatient: '15',
      notes: '',
    });
    setEditingSession(null);
    setShowCreateModal(false);
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
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                My Sessions
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage your hospital consultation sessions
              </p>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create New Session
            </motion.button>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
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
            {sessions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    className="bg-white rounded-xl shadow-lg border border-white/50 overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {session.hospitalName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {session.hospitalCity}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.isActive 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {session.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.approvalStatus === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : session.approvalStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {session.approvalStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Day:</span>
                          <span className="font-medium text-gray-900">{session.dayOfWeek}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium text-gray-900">{session.startTime} - {session.endTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Max Tokens:</span>
                          <span className="font-medium text-gray-900">{session.maxTokens}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Avg per Patient:</span>
                          <span className="font-medium text-gray-900">{session.avgMinutesPerPatient} min</span>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{session.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          onClick={() => handleEdit(session)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => toggleSessionStatus(session.id, session.isActive)}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            session.isActive
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {session.isActive ? 'Deactivate' : 'Activate'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V9a2 2 0 012-2h3z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create your first hospital session to start seeing patients and manage your consultation schedule.
                </p>
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Your First Session
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Create/Edit Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSession ? 'Edit Session' : 'Create New Session'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital *
                  </label>
                  <select
                    name="hospitalId"
                    value={formData.hospitalId}
                    onChange={handleChange}
                    required
                    disabled={editingSession}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} - {hospital.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day of Week *
                    </label>
                    <select
                      name="dayOfWeek"
                      value={formData.dayOfWeek}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select day</option>
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens *
                    </label>
                    <input
                      type="number"
                      name="maxTokens"
                      value={formData.maxTokens}
                      onChange={handleChange}
                      required
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Minutes per Patient
                  </label>
                  <input
                    type="number"
                    name="avgMinutesPerPatient"
                    value={formData.avgMinutesPerPatient}
                    onChange={handleChange}
                    min="5"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="Any special notes or instructions..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <motion.button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingSession ? 'Update Session' : 'Create Session'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}