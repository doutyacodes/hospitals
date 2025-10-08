'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import {
  Play,
  Coffee,
  AlertTriangle,
  Power,
  Clock,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  Settings,
  Repeat,
  UserX,
  Zap,
  PlayCircle
} from 'lucide-react';

export default function DoctorConsultationPage() {
  const [doctorStatus, setDoctorStatus] = useState('offline');
  const [currentSession, setCurrentSession] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRecallSettings, setShowRecallSettings] = useState(false);
  const [recallInterval, setRecallInterval] = useState(5);
  const [recallEnabled, setRecallEnabled] = useState(true);
  const [missedTokens, setMissedTokens] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [breakDuration, setBreakDuration] = useState(15);
  const [breakReason, setBreakReason] = useState('');

  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'doctor') {
      fetchDoctorStatus();
      fetchTodayAppointments();

      const interval = setInterval(() => {
        fetchTodayAppointments(true); // Preserve current token during auto-refresh
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

        if (data.currentSession) {
          setRecallInterval(data.currentSession.recallCheckInterval || 5);
          setRecallEnabled(data.currentSession.recallEnabled !== false);

          // Restore current token from session (for reload persistence)
          if (data.currentSession.currentToken > 0) {
            setCurrentToken(data.currentSession.currentToken);
            setSessionStarted(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching doctor status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async (preserveCurrentToken = false) => {
    try {
      const response = await fetch('/api/doctor/appointments/today');
      const data = await response.json();

      if (data.success) {
        setTodayAppointments(data.appointments || []);

        // Calculate completed count
        const completed = data.appointments.filter(apt => apt.status === 'completed');
        setCompletedCount(completed.length);

        // Find missed tokens (confirmed but skipped)
        const confirmedTokens = data.appointments
          .filter(apt => apt.status === 'confirmed')
          .map(apt => apt.tokenNumber);

        if (currentToken) {
          const missed = confirmedTokens.filter(t => t < currentToken);
          setMissedTokens(missed);
        }
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const startSession = async () => {
    try {
      setUpdating(true);

      // Call first token
      await callNextToken(true);
      setSessionStarted(true);
      setDoctorStatus('consulting');
      success('Session started! Calling first token...');
    } catch (err) {
      error('Failed to start session');
    } finally {
      setUpdating(false);
    }
  };

  const callNextToken = async (isFirstCall = false) => {
    try {
      setUpdating(true);

      // Call the API to get next token (handles recall logic)
      const response = await fetch('/api/doctor/consultation/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setCurrentToken(data.tokenNumber);

        if (data.isRecall) {
          success(`🔁 Recalling Token #${data.tokenNumber} (${data.missedTokensCount} missed)`);
        } else {
          success(`📢 Calling Token #${data.tokenNumber}`);
        }

        await fetchTodayAppointments(true); // Preserve the current token we just set
      } else {
        error(data.message || 'No more appointments for today');
      }
    } catch (err) {
      error('Failed to call next token');
    } finally {
      setUpdating(false);
    }
  };

  const completeConsultation = async () => {
    if (!currentToken) return;

    try {
      setUpdating(true);

      const appointment = todayAppointments.find(apt => apt.tokenNumber === currentToken);
      if (!appointment) return;

      // Mark as completed
      const response = await fetch('/api/doctor/consultation/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          diagnosis: 'Consultation completed',
          doctorNotes: '',
          prescription: '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Token #${currentToken} completed`);

        // Update completed count
        setCompletedCount(prev => prev + 1);

        // Auto-call next token
        setTimeout(() => {
          callNextToken();
        }, 500);
      } else {
        error(data.message || 'Failed to complete consultation');
      }
    } catch (err) {
      error('Failed to complete consultation');
    } finally {
      setUpdating(false);
    }
  };

  const markNoShow = async (tokenNumber) => {
    try {
      setUpdating(true);

      const appointment = todayAppointments.find(apt => apt.tokenNumber === tokenNumber);
      if (!appointment) return;

      const response = await fetch('/api/doctor/consultation/no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id }),
      });

      const data = await response.json();

      if (data.success) {
        success(`Token #${tokenNumber} marked as no-show`);

        // Add to missed tokens if not already there
        if (!missedTokens.includes(tokenNumber)) {
          setMissedTokens(prev => [...prev, tokenNumber]);
        }

        // Auto-call next token
        setTimeout(() => {
          callNextToken();
        }, 500);
      } else {
        error(data.message || 'Failed to mark as no-show');
      }
    } catch (err) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          recallCheckInterval: recallInterval,
          recallEnabled: recallEnabled,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success('Recall settings updated');
        setShowRecallSettings(false);
        fetchDoctorStatus();
      } else {
        error(data.message || 'Failed to update settings');
      }
    } catch (err) {
      error('Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const updateDoctorStatus = async (newStatus, breakType = null) => {
    try {
      setUpdating(true);
      const body = { status: newStatus };

      if (newStatus === 'on_break' && breakType) {
        body.breakType = breakType;
        if (breakType === 'timed') {
          body.breakDuration = breakDuration;
        }
        body.breakReason = breakReason || null;
      }

      const response = await fetch('/api/doctor/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setDoctorStatus(newStatus);
        setShowStatusModal(false);
        setBreakReason('');
        success(`Status updated to ${newStatus}`);
        fetchDoctorStatus();
      } else {
        error(data.message || 'Failed to update status');
      }
    } catch (err) {
      error('Failed to update status');
    } finally {
      setUpdating(false);
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

  const currentAppointment = todayAppointments.find(apt => apt.tokenNumber === currentToken);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Management</h1>
            <p className="text-gray-600 mt-1">Manage your consultation queue</p>
          </div>

          {/* Doctor Status Controls */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
              doctorStatus === 'online' ? 'bg-green-100 text-green-700' :
              doctorStatus === 'consulting' ? 'bg-blue-100 text-blue-700' :
              doctorStatus === 'on_break' ? 'bg-yellow-100 text-yellow-700' :
              doctorStatus === 'emergency' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {doctorStatus === 'online' && <Zap size={18} />}
              {doctorStatus === 'consulting' && <Activity size={18} />}
              {doctorStatus === 'on_break' && <Coffee size={18} />}
              {doctorStatus === 'emergency' && <AlertTriangle size={18} />}
              {doctorStatus === 'offline' && <Power size={18} />}
              <span className="capitalize">{doctorStatus.replace('_', ' ')}</span>
            </div>

            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 transition-colors"
              title="Change Status"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Start Session or Current Token */}
        {!sessionStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center mb-6"
          >
            <PlayCircle className="w-24 h-24 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
            <p className="text-gray-600 mb-8">Click below to start your consultation session</p>
            <button
              onClick={startSession}
              disabled={updating || todayAppointments.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="w-6 h-6" />
                Start Session
              </div>
            </button>
            {todayAppointments.length === 0 && (
              <p className="mt-4 text-sm text-red-600">No appointments scheduled for today</p>
            )}
          </motion.div>
        ) : (
          <>
            {/* Current Token Display */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 mb-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 mb-2">Current Token</p>
                  <p className="text-5xl font-bold">#{currentToken || '—'}</p>
                  {currentAppointment && (
                    <p className="text-emerald-100 mt-2">{currentAppointment.patientName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 mb-1">Progress</p>
                  <p className="text-3xl font-bold">{completedCount}</p>
                  <p className="text-sm text-emerald-100">completed</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={completeConsultation}
                disabled={!currentToken || updating}
                className="px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Complete & Next
              </button>

              <button
                onClick={() => currentToken && markNoShow(currentToken)}
                disabled={!currentToken || updating}
                className="px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                No Show & Next
              </button>
            </div>

            {/* Recall Settings & Missed Tokens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Recall Settings */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Repeat className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold">Recall Settings</h3>
                  </div>
                  <button
                    onClick={() => setShowRecallSettings(true)}
                    className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200"
                  >
                    <Settings className="w-5 h-5 text-purple-600" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recall Interval</span>
                    <span className="text-xl font-bold text-purple-600">Every {recallInterval}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      recallEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {recallEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {recallEnabled && (
                    <div className="text-sm text-gray-600">
                      Next recall at: Token {currentToken ? currentToken + recallInterval - (currentToken % recallInterval || recallInterval) : recallInterval}
                    </div>
                  )}
                </div>
              </div>

              {/* Missed Tokens */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserX className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold">Missed Tokens</h3>
                </div>
                {missedTokens.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No missed tokens</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {missedTokens.map((token) => (
                      <div
                        key={token}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg font-semibold"
                      >
                        #{token}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Today's Appointments List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Today's Appointments</h2>
              {todayAppointments.length === 0 ? (
                <p className="text-center py-12 text-gray-500">No appointments</p>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`border-2 rounded-lg p-4 ${
                        appointment.tokenNumber === currentToken
                          ? 'border-emerald-500 bg-emerald-50'
                          : appointment.status === 'completed'
                          ? 'border-green-200 bg-green-50'
                          : appointment.status === 'no_show'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                            appointment.status === 'no_show' ? 'bg-red-100 text-red-600' :
                            appointment.tokenNumber === currentToken ? 'bg-emerald-600 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            #{appointment.tokenNumber}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                            <p className="text-sm text-gray-600">{appointment.estimatedTime}</p>
                            {appointment.patientComplaints && (
                              <p className="text-sm text-gray-700 mt-1">{appointment.patientComplaints}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'no_show' ? 'bg-red-100 text-red-800' :
                            appointment.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Recall Settings Modal */}
      <AnimatePresence>
        {showRecallSettings && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRecallSettings(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Repeat className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">Recall Settings</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Recall Interval</label>
                  <p className="text-sm text-gray-600 mb-3">
                    After how many patients should missed tokens be recalled?
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={recallInterval}
                      onChange={(e) => setRecallInterval(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-purple-600 w-12 text-center">
                      {recallInterval}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recallEnabled}
                      onChange={(e) => setRecallEnabled(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Enable auto-recall</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={updateRecallSettings}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  onClick={() => setShowRecallSettings(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Change Status</h3>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Online */}
                  <button
                    onClick={() => updateDoctorStatus('online')}
                    disabled={updating || doctorStatus === 'online'}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      doctorStatus === 'online'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap size={24} className="text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Online</p>
                        <p className="text-sm text-gray-600">Available for consultations</p>
                      </div>
                      {doctorStatus === 'online' && (
                        <CheckCircle size={20} className="ml-auto text-green-600" />
                      )}
                    </div>
                  </button>

                  {/* Break */}
                  <div className={`p-4 rounded-xl border-2 ${
                    doctorStatus === 'on_break' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <Coffee size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">On Break</p>
                        <p className="text-sm text-gray-600 mb-3">Temporarily unavailable</p>

                        {/* Break Duration */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Break Duration
                          </label>
                          <select
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="indefinite">Indefinite</option>
                            <option value="5">5 minutes</option>
                            <option value="10">10 minutes</option>
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                          </select>
                        </div>

                        {/* Break Reason */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason (Optional)
                          </label>
                          <input
                            type="text"
                            value={breakReason}
                            onChange={(e) => setBreakReason(e.target.value)}
                            placeholder="e.g., Lunch break"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateDoctorStatus('on_break', breakDuration === 'indefinite' ? 'indefinite' : 'timed')}
                            disabled={updating}
                            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                          >
                            {updating ? 'Updating...' : 'Start Break'}
                          </button>
                        </div>
                      </div>
                      {doctorStatus === 'on_break' && (
                        <CheckCircle size={20} className="text-yellow-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Emergency */}
                  <button
                    onClick={() => updateDoctorStatus('emergency')}
                    disabled={updating || doctorStatus === 'emergency'}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      doctorStatus === 'emergency'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={24} className="text-red-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Emergency</p>
                        <p className="text-sm text-gray-600">Handling urgent case</p>
                      </div>
                      {doctorStatus === 'emergency' && (
                        <CheckCircle size={20} className="ml-auto text-red-600" />
                      )}
                    </div>
                  </button>

                  {/* Offline */}
                  <button
                    onClick={() => updateDoctorStatus('offline')}
                    disabled={updating || doctorStatus === 'offline'}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      doctorStatus === 'offline'
                        ? 'border-gray-500 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <Power size={24} className="text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Offline</p>
                        <p className="text-sm text-gray-600">End consultation session</p>
                      </div>
                      {doctorStatus === 'offline' && (
                        <CheckCircle size={20} className="ml-auto text-gray-600" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
