'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const endpoint = user?.userType === 'doctor' 
        ? `/api/doctor/requests?status=${filter !== 'all' ? filter : ''}`
        : `/api/hospital/requests?status=${filter !== 'all' ? filter : ''}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        error('Failed to fetch requests');
      }
    } catch (err) {
      console.error('Requests fetch error:', err);
      error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status, responseMessage = '') => {
    try {
      const endpoint = user?.userType === 'doctor' 
        ? '/api/doctor/requests'
        : '/api/hospital/requests';

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status,
          responseMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Request ${status} successfully`);
        fetchRequests();
      } else {
        error('Failed to update request');
      }
    } catch (err) {
      console.error('Update request error:', err);
      error('Failed to update request');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusConfig[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getRequestActions = (request) => {
    if (user?.userType === 'doctor') {
      // Doctor can approve/decline hospital requests
      if (request.status === 'pending') {
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => updateRequestStatus(request.id, 'approved')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Approve
            </button>
            <button
              onClick={() => updateRequestStatus(request.id, 'declined')}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Decline
            </button>
          </div>
        );
      }
    } else {
      // Hospital can cancel pending requests
      if (request.status === 'pending') {
        return (
          <button
            onClick={() => updateRequestStatus(request.id, 'cancelled')}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Cancel
          </button>
        );
      }
    }
    return null;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.userType === 'doctor' ? 'Hospital Requests' : 'Doctor Requests'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.userType === 'doctor' 
              ? 'Manage collaboration requests from hospitals'
              : 'Track your collaboration requests sent to doctors'
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex space-x-4">
            {['all', 'pending', 'approved', 'declined'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500">
                {user?.userType === 'doctor' 
                  ? 'Hospital collaboration requests will appear here'
                  : 'Your doctor collaboration requests will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {user?.userType === 'doctor' ? 'Hospital' : 'Doctor'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {user?.userType === 'doctor' ? 'Location' : 'Specialty'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request, index) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user?.userType === 'doctor' ? request.hospitalName : `Dr. ${request.doctorName}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.userType === 'doctor' ? request.hospitalEmail : request.doctorEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user?.userType === 'doctor' ? request.hospitalCity : request.specialtyName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.message || 'No message provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {getRequestActions(request)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}