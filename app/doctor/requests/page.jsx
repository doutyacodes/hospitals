'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DoctorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const statusFilters = [
    { key: 'all', label: 'All Requests', color: 'gray' },
    { key: 'pending', label: 'Pending', color: 'amber' },
    { key: 'approved', label: 'Approved', color: 'emerald' },
    { key: 'declined', label: 'Declined', color: 'red' }
  ];

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch requests data
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'doctor') {
      fetchRequests();
    }
  }, [isAuthenticated, user, filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/doctor/requests' : `/api/doctor/requests?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        error('Failed to load requests');
      }
    } catch (err) {
      console.error('Requests fetch error:', err);
      error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, status) => {
    if (!responseMessage.trim() && status === 'declined') {
      error('Please provide a reason for declining the request');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/doctor/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status,
          responseMessage: responseMessage.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Request ${status} successfully!`);
        setRespondingTo(null);
        setResponseMessage('');
        fetchRequests();
      } else {
        error(data.error || 'Failed to respond to request');
      }
    } catch (err) {
      console.error('Response error:', err);
      error('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilterColor = (filterKey) => {
    switch (filterKey) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                Hospital Requests
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage collaboration requests from hospitals
              </p>
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
                  onClick={() => setFilter(filterOption.key)}
                  className={`whitespace-nowrap py-2 px-3 sm:py-4 sm:px-1 border-b-2 font-medium text-sm transition-colors ${
                    filter === filterOption.key
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {filterOption.label}
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
            {requests.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.id}
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
                                {request.hospitalName}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(request.requestedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Location:</p>
                              <p className="font-medium text-gray-900">
                                {request.hospitalCity}, {request.hospitalState}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Email:</p>
                              <p className="font-medium text-gray-900">{request.hospitalEmail}</p>
                            </div>
                          </div>

                          {request.hospitalDescription && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">About Hospital:</p>
                              <p className="text-gray-700 text-sm">{request.hospitalDescription}</p>
                            </div>
                          )}

                          {request.message && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">Request Message:</p>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-gray-700 text-sm">{request.message}</p>
                              </div>
                            </div>
                          )}

                          {request.responseMessage && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">Your Response:</p>
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-blue-700 text-sm">{request.responseMessage}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Responded on {new Date(request.respondedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              <span>{request.hospitalRating || '0.0'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                            <motion.button
                              onClick={() => setRespondingTo(request.id)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Respond
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filter !== 'all' ? filter : ''} requests found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {filter === 'all' 
                    ? "You haven't received any collaboration requests from hospitals yet."
                    : `No ${filter} requests to display. Try switching to a different filter.`
                  }
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Response Modal */}
      {respondingTo && (
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
                  Respond to Request
                </h2>
                <button
                  onClick={() => {
                    setRespondingTo(null);
                    setResponseMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Message (Optional for approval, required for decline)
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="Add a message with your response..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.button
                    onClick={() => handleResponse(respondingTo, 'declined')}
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {actionLoading ? 'Processing...' : 'Decline'}
                  </motion.button>
                  <motion.button
                    onClick={() => handleResponse(respondingTo, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
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