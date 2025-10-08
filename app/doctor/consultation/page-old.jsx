'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import {
  Play,
  Pause,
  Coffee,
  AlertTriangle,
  Power,
  Clock,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Plus,
  Save,
  Bell,
  Phone,
  Settings,
  Repeat,
  UserX
} from 'lucide-react';

export default function DoctorConsultationPage() {
  const [doctorStatus, setDoctorStatus] = useState('offline'); // online, consulting, on_break, emergency, offline
  const [currentSession, setCurrentSession] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [currentToken, setCurrentToken] = useState(0);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showRecallSettings, setShowRecallSettings] = useState(false);
  const [recallInterval, setRecallInterval] = useState(5);
  const [recallEnabled, setRecallEnabled] = useState(true);
  const [missedTokens, setMissedTokens] = useState([]);
  const [isRecall, setIsRecall] = useState(false);

  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch doctor status and today's appointments
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'doctor') {
      fetchDoctorStatus();
      fetchTodayAppointments();

      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchTodayAppointments();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchDoctorStatus = async () => {
    try {
      const response = await fetch('/api/doctor/status');
      const data = await response.json();

      if (data.success) {
        setDoctorStatus(data.status);
        setCurrentSession(data.currentSession);

        // Get recall settings if session exists
        if (data.currentSession) {
          setRecallInterval(data.currentSession.recallCheckInterval || 5);
          setRecallEnabled(data.currentSession.recallEnabled !== false);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const response = await fetch('/api/doctor/appointments/today');
      const data = await response.json();

      if (data.success) {
        setTodayAppointments(data.appointments || []);
        setCurrentToken(data.currentToken || 0);
        setActiveAppointment(data.activeAppointment || null);

        // Calculate missed tokens
        const missed = (data.appointments || []).filter(
          apt => apt.status === 'confirmed' &&
          apt.tokenNumber < (data.currentToken || 0) &&
          !apt.actualStartTime &&
          !apt.missedAppointment
        );
        setMissedTokens(missed);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const updateDoctorStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setDoctorStatus(newStatus);
        success(`Status updated to ${newStatus}`);
      } else {
        error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const callNextToken = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/consultation/next', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setCurrentToken(data.tokenNumber);
        // Don't set as active appointment - just calling the token
        setIsRecall(data.isRecall || false);

        if (data.isRecall) {
          success(`🔁 Recalling Token #${data.tokenNumber} (${data.missedTokensCount || 0} missed tokens)`);
        } else {
          success(`📢 Calling Token #${data.tokenNumber}`);
        }

        // Refresh appointments to update missed tokens
        fetchTodayAppointments();
      } else {
        error(data.message || 'No more appointments for today');
      }
    } catch (err) {
      console.error('Error calling next token:', err);
      error('Failed to call next token');
    } finally {
      setUpdating(false);
    }
  };

  const startConsultation = async (appointmentId) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/consultation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });

      const data = await response.json();

      if (data.success) {
        setActiveAppointment(data.appointment);
        setDoctorStatus('consulting');
        success('Consultation started');
      } else {
        error(data.message || 'Failed to start consultation');
      }
    } catch (err) {
      console.error('Error starting consultation:', err);
      error('Failed to start consultation');
    } finally {
      setUpdating(false);
    }
  };

  const completeConsultation = async () => {
    if (!activeAppointment) return;

    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/consultation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: activeAppointment.id,
          doctorNotes: consultationNotes,
          prescription,
          diagnosis,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success('Consultation completed successfully');
        setActiveAppointment(null);
        setConsultationNotes('');
        setPrescription('');
        setDiagnosis('');
        setShowNotesModal(false);
        setDoctorStatus('online');
        fetchTodayAppointments();
      } else {
        error(data.message || 'Failed to complete consultation');
      }
    } catch (err) {
      console.error('Error completing consultation:', err);
      error('Failed to complete consultation');
    } finally {
      setUpdating(false);
    }
  };

  const markNoShow = async (appointmentId, tokenNumber) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/consultation/no-show', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Token #${tokenNumber} marked as no-show - Moving to next`);

        // Clear active appointment if it's the one marked as no-show
        if (activeAppointment?.id === appointmentId) {
          setActiveAppointment(null);
        }

        // Refresh appointments
        await fetchTodayAppointments();

        // Automatically call next token
        setTimeout(() => {
          callNextToken();
        }, 500);
      } else {
        error(data.message || 'Failed to mark as no-show');
      }
    } catch (err) {
      console.error('Error marking no-show:', err);
      error('Failed to mark as no-show');
    } finally {
      setUpdating(false);
    }
  };

  const updateRecallSettings = async () => {
    if (!currentSession) {
      error('No active session found');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/session/recall-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          recallCheckInterval: recallInterval,
          recallEnabled: recallEnabled,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success('Recall settings updated successfully');
        setShowRecallSettings(false);
        fetchDoctorStatus();
      } else {
        error(data.message || 'Failed to update recall settings');
      }
    } catch (err) {
      console.error('Error updating recall settings:', err);
      error('Failed to update recall settings');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      online: {
        label: 'Online',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-500',
        icon: Activity,
        description: 'Available for consultations'
      },
      consulting: {
        label: 'In Consultation',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-500',
        icon: Users,
        description: 'Currently with a patient'
      },
      on_break: {
        label: 'On Break',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-500',
        icon: Coffee,
        description: 'Temporarily unavailable'
      },
      emergency: {
        label: 'Emergency',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-500',
        icon: AlertTriangle,
        description: 'Handling emergency'
      },
      offline: {
        label: 'Offline',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-500',
        icon: Power,
        description: 'Not available'
      }
    };
    return configs[status] || configs.offline;
  };

  const statusConfig = getStatusConfig(doctorStatus);
  const StatusIcon = statusConfig.icon;

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with Status Control */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full ${statusConfig.bgColor}`}>
                <StatusIcon className={`w-8 h-8 ${statusConfig.textColor}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultation Management</h1>
                <p className="text-gray-600 mt-1">{statusConfig.description}</p>
              </div>
            </div>

            {/* Status Controls */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateDoctorStatus('online')}
                disabled={updating || doctorStatus === 'online'}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  doctorStatus === 'online'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Online</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateDoctorStatus('on_break')}
                disabled={updating || doctorStatus === 'on_break'}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  doctorStatus === 'on_break'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center space-x-2">
                  <Coffee className="w-4 h-4" />
                  <span>Break</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateDoctorStatus('emergency')}
                disabled={updating || doctorStatus === 'emergency'}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  doctorStatus === 'emergency'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border-2 border-red-600 text-red-600 hover:bg-red-50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Emergency</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateDoctorStatus('offline')}
                disabled={updating || doctorStatus === 'offline'}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  doctorStatus === 'offline'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white border-2 border-gray-600 text-gray-600 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center space-x-2">
                  <Power className="w-4 h-4" />
                  <span>Offline</span>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Current Token & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Current Token Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Current Token</h3>
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-5xl font-bold mb-2">#{currentToken || '—'}</div>
            <p className="text-emerald-100">
              {activeAppointment ? `Patient: ${activeAppointment.patientName}` : 'No active consultation'}
            </p>
          </motion.div>

          {/* Today's Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Stats</h3>
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Appointments</span>
                <span className="text-2xl font-bold text-gray-900">{todayAppointments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="text-2xl font-bold text-green-600">
                  {todayAppointments.filter(a => a.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {todayAppointments.filter(a => a.status === 'confirmed').length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={callNextToken}
                disabled={updating}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Call Next Token</span>
                </div>
              </motion.button>

              {activeAppointment && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNotesModal(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Complete Consultation</span>
                  </div>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchTodayAppointments}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh List</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Recall Settings & Missed Tokens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recall Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Repeat className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recall Settings</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRecallSettings(true)}
                className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
              >
                <Settings className="w-5 h-5 text-purple-600" />
              </motion.button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recall Interval</span>
                <span className="text-xl font-bold text-purple-600">Every {recallInterval} patients</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  recallEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {recallEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Missed Tokens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <UserX className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Missed Tokens</h3>
            </div>
            <div className="space-y-2">
              {missedTokens.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No missed tokens</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {missedTokens.map((token) => (
                      <div
                        key={token.id}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg font-semibold text-sm"
                      >
                        #{token.tokenNumber}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {missedTokens.length} patient{missedTokens.length > 1 ? 's' : ''} will be recalled
                    {recallEnabled && currentToken > 0 && (
                      <> at token #{currentToken + recallInterval - (currentToken % recallInterval || recallInterval)}</>
                    )}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Today's Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Appointments</h2>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 rounded-lg p-4 ${
                    activeAppointment?.id === appointment.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold relative ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                          appointment.status === 'no_show' ? 'bg-red-100 text-red-600' :
                          activeAppointment?.id === appointment.id ? 'bg-emerald-600 text-white' :
                          appointment.isRecalled ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          #{appointment.tokenNumber}
                          {appointment.isRecalled && (
                            <Repeat className="w-4 h-4 absolute -top-1 -right-1 text-orange-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{appointment.patientName}</h3>
                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                          <p>Email: {appointment.patientEmail}</p>
                          <p>Phone: {appointment.patientPhone}</p>
                          <p>Time: {appointment.estimatedTime}</p>
                          {appointment.patientComplaints && (
                            <p className="text-gray-700 font-medium">Complaints: {appointment.patientComplaints}</p>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getAppointmentStatusColor(appointment.status)}`}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {appointment.status === 'confirmed' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startConsultation(appointment.id)}
                            disabled={updating || activeAppointment?.id === appointment.id}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
                          >
                            <div className="flex items-center space-x-2">
                              <Play className="w-4 h-4" />
                              <span>Start</span>
                            </div>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markNoShow(appointment.id, appointment.tokenNumber)}
                            disabled={updating}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                          >
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4" />
                              <span>No Show</span>
                            </div>
                          </motion.button>
                        </>
                      )}
                      {activeAppointment?.id === appointment.id && (
                        <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium flex items-center space-x-2">
                          <Activity className="w-4 h-4 animate-pulse" />
                          <span>In Progress</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Complete Consultation Modal */}
      <AnimatePresence>
        {showNotesModal && activeAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNotesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Consultation</h2>
                <p className="text-gray-600 mb-6">Patient: {activeAppointment.patientName} (Token #{activeAppointment.tokenNumber})</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis *
                    </label>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter diagnosis..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prescription
                    </label>
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Medicine 1: Dosage, Frequency, Duration&#10;Medicine 2: Dosage, Frequency, Duration&#10;..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor's Notes
                    </label>
                    <textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Additional notes, observations, follow-up instructions..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={completeConsultation}
                    disabled={updating || !diagnosis.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {updating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Complete & Save</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNotesModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recall Settings Modal */}
      <AnimatePresence>
        {showRecallSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRecallSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Repeat className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Recall Settings</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recall Interval
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    After how many patients should missed tokens be recalled?
                  </p>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={recallInterval}
                      onChange={(e) => setRecallInterval(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-2xl font-bold text-purple-600 w-16 text-center">
                      {recallInterval}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Missed tokens will be recalled every {recallInterval} patient{recallInterval > 1 ? 's' : ''}
                  </p>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recallEnabled}
                      onChange={(e) => setRecallEnabled(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable auto-recall for missed tokens
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2 ml-8">
                    Automatically call missed tokens at the configured interval
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={updateRecallSettings}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Settings'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRecallSettings(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
