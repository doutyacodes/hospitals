'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function ReportsPage() {
  const [reportData, setReportData] = useState({
    overview: {
      totalRevenue: 0,
      totalAppointments: 0,
      totalDoctors: 0,
      avgRating: 0
    },
    monthlyTrends: [],
    topDoctors: [],
    appointmentsByStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { user, isAuthenticated } = useAuth();
  const { error } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchReportData();
    }
  }, [isAuthenticated, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Simulate report data - in real app, this would be an API call
      setTimeout(() => {
        setReportData({
          overview: {
            totalRevenue: 125000,
            totalAppointments: 245,
            totalDoctors: 12,
            avgRating: 4.7
          },
          monthlyTrends: [
            { month: 'Jan', revenue: 95000, appointments: 180 },
            { month: 'Feb', revenue: 110000, appointments: 210 },
            { month: 'Mar', revenue: 125000, appointments: 245 }
          ],
          topDoctors: [
            { name: 'Dr. Sarah Johnson', appointments: 45, revenue: 22500 },
            { name: 'Dr. Michael Chen', appointments: 38, revenue: 19000 },
            { name: 'Dr. Emily Davis', appointments: 32, revenue: 16000 }
          ],
          appointmentsByStatus: [
            { status: 'Completed', count: 180, percentage: 73 },
            { status: 'Cancelled', count: 35, percentage: 14 },
            { status: 'No Show', count: 20, percentage: 8 },
            { status: 'Pending', count: 10, percentage: 4 }
          ]
        });
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Reports fetch error:', err);
      error('Failed to fetch report data');
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            {user?.userType === 'doctor' 
              ? 'Track your performance and patient insights'
              : 'Track performance and insights for your hospital'
            }
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchReportData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Revenue',
                  value: `₹${reportData.overview.totalRevenue.toLocaleString()}`,
                  icon: '💰',
                  color: 'bg-green-500',
                  bgColor: 'bg-green-50'
                },
                {
                  title: 'Total Appointments',
                  value: reportData.overview.totalAppointments,
                  icon: '📅',
                  color: 'bg-blue-500',
                  bgColor: 'bg-blue-50'
                },
                {
                  title: 'Active Doctors',
                  value: reportData.overview.totalDoctors,
                  icon: '👨‍⚕️',
                  color: 'bg-purple-500',
                  bgColor: 'bg-purple-50'
                },
                {
                  title: 'Average Rating',
                  value: `${reportData.overview.avgRating}/5`,
                  icon: '⭐',
                  color: 'bg-yellow-500',
                  bgColor: 'bg-yellow-50'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${stat.bgColor} p-6 rounded-xl border border-gray-100`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className="text-3xl">{stat.icon}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="space-y-4">
                  {reportData.monthlyTrends.map((trend, index) => (
                    <div key={trend.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{trend.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">₹{trend.revenue.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{trend.appointments} appointments</div>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(trend.revenue / 150000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Doctors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Doctors</h3>
                <div className="space-y-4">
                  {reportData.topDoctors.map((doctor, index) => (
                    <div key={doctor.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">{doctor.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">₹{doctor.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{doctor.appointments} appointments</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Appointment Status Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportData.appointmentsByStatus.map((status, index) => (
                  <div key={status.status} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-lg font-bold mb-2 ${
                      status.status === 'Completed' ? 'bg-green-500' :
                      status.status === 'Cancelled' ? 'bg-red-500' :
                      status.status === 'No Show' ? 'bg-gray-500' : 'bg-yellow-500'
                    }`}>
                      {status.percentage}%
                    </div>
                    <div className="text-sm font-medium text-gray-900">{status.status}</div>
                    <div className="text-xs text-gray-500">{status.count} appointments</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Export Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Export to Excel
                </button>
                <button className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Export to PDF
                </button>
                <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                  </svg>
                  Download Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}