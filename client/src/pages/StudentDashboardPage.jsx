import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import {
  Calendar, Bell, Sparkles, MessageSquare,
  Clock, MapPin, Heart, AlertTriangle, BookOpen,
  Bookmark, Ticket, Plus, Trash2, Tag, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [insightsData, setInsightsData] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [breathingText, setBreathingText] = useState('Inhale deeply...');

  // New Deadline Form State
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academics');
  const [newDate, setNewDate] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');

  // New Ticket Form State
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketIssue, setTicketIssue] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General');

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [attRes, profRes, insRes, dlRes, savedRes, tktRes] = await Promise.all([
          API.get('/attendance'),
          API.get('/student/profile'),
          API.get('/student/insights'),
          API.get('/student/deadlines'),
          API.get('/student/saved'),
          API.get('/tickets')
        ]);
        setAttendanceData(attRes.data);
        setProfileData(profRes.data);
        setInsightsData(insRes.data.insights || []);
        setDeadlines(dlRes.data.deadlines || []);
        setSavedAnswers(savedRes.data.saved_answers || []);
        setTickets(tktRes.data.tickets || []);
      } catch (err) {
        console.error("Failed to fetch student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, navigate]);

  // Breathing animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingText(prev => (prev === 'Inhale deeply...' ? 'Exhale slowly...' : 'Inhale deeply...'));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddDeadline = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    try {
      await API.post('/student/deadlines', {
        title: newTitle,
        category: newCategory,
        deadline: newDate,
        priority: newPriority
      });
      setNewTitle('');
      setNewDate('');
      setShowDeadlineForm(false);
      const res = await API.get('/student/deadlines');
      setDeadlines(res.data.deadlines || []);
    } catch (err) {
      console.error("Failed to add deadline:", err);
    }
  };

  const handleDeleteDeadline = async (id) => {
    try {
      await API.delete(`/student/deadlines/${id}`);
      setDeadlines(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Failed to delete deadline:", err);
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      await API.delete(`/student/saved/${id}`);
      setSavedAnswers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete saved answer:", err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketIssue) return;
    try {
      await API.post('/tickets', {
        issue: ticketIssue,
        category: ticketCategory,
        priority: "Medium"
      });
      setTicketIssue('');
      setShowTicketForm(false);
      const res = await API.get('/tickets');
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-body">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-900 text-xs font-label font-bold">Loading Student Portal Dashboard...</p>
        </div>
      </div>
    );
  }

  const student = user;
  const exams = profileData?.upcoming_exams || [];
  const notices = profileData?.recent_notices || [];
  const events = profileData?.upcoming_events || [];

  const overallPct = attendanceData?.overall_percentage ?? student?.attendance_pct ?? 0;
  const subjects = attendanceData?.subjects || [];
  const hasWarning = attendanceData?.has_warning || subjects.some(s => s.attendance_percentage < 75.0);
  const feeStatus = student?.fee_status || 'Paid';

  const ringCircumference = 251.2;
  const attendanceOffset = ringCircumference - (ringCircumference * (overallPct / 100));

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-[#080c14] text-gray-900 dark:text-gray-100 font-body selection:bg-primary-container selection:text-white pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Hero Banner Section with background_campus.jpeg */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* 1. LOWEST LAYER (z-0): background_campus.jpeg */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 scale-102 transition-transform duration-700"
            style={{ backgroundImage: `url('/images/background_campus.jpeg')` }}
          />

          {/* 2. MIDDLE LAYER (z-1): Dark Navy Overlay (48% Opacity) */}
          <div className="absolute inset-0 bg-[#050c1c]/48 bg-gradient-to-b from-[#030712]/60 via-[#050c1c]/48 to-[#030712]/65 pointer-events-none z-1" />

          {/* 3. HIGHEST LAYER (z-10): Student Welcome Text & Information */}
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-300 text-gray-950 rounded-lg text-xs font-label font-extrabold uppercase tracking-wider shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Autonomous Student Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-headline font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              Welcome back, {student?.name || 'Ajay Chaudhary'}! 👋
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-100 font-label font-bold drop-shadow-xs">
              <span>{student?.course}</span>
              <span>•</span>
              <span>{student?.semester} ({student?.section || 'Section A'})</span>
              <span>•</span>
              <span>ID: <strong className="font-mono text-amber-300 font-bold">{student?.student_id}</strong></span>
              {student?.branch && <span>• Branch: <strong className="text-white">{student.branch}</strong></span>}
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => navigate('/chat')}
              className="px-5 py-3 bg-red-800 hover:bg-red-700 text-white font-label font-extrabold rounded-xl shadow-md text-xs flex items-center gap-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>Consult AI Assistant</span>
            </button>
          </div>
        </section>

        {/* AI Student Insights Bar */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="font-headline text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              🤖 AI Student Insights & Notifications
            </h2>
            <span className="font-label text-xs text-gray-700 dark:text-gray-400 font-bold">Calculated from Real-Time DB</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {insightsData.map((ins, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-gray-800/60 flex items-start gap-3 shadow-2xs">
                <span className="text-2xl shrink-0">{ins.icon}</span>
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-xs text-gray-900 dark:text-gray-100">{ins.title}</h4>
                  <p className="font-body text-[11px] text-gray-700 dark:text-gray-300 font-medium leading-tight">{ins.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Low Attendance Warning Alert */}
        {hasWarning && (
          <div className="p-4 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-950 dark:text-red-300 rounded-xl text-xs font-label font-bold flex items-center gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0" />
            <div>
              <p className="font-headline font-bold text-red-950 dark:text-red-300 text-sm">Attendance Threshold Notice</p>
              <p className="text-red-900 dark:text-red-400 font-medium">You have subject(s) below the 75% mandatory threshold required for end-semester examinations.</p>
            </div>
          </div>
        )}

        {/* Attendance & Status Metrics Bento Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline text-xl font-bold text-gray-900 dark:text-gray-100">Attendance & Academic Status</h2>
            <span className="font-label text-xs text-gray-700 dark:text-gray-400 font-mono font-bold">SQLite DB Live Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attendance Ring */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl p-6 flex flex-col items-center justify-center border border-gray-300 dark:border-gray-800 shadow-xs text-center space-y-2">
              <div className="relative w-28 h-28 my-1">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-gray-200 dark:text-gray-800" cx="56" cy="56" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                  <circle
                    className="progress-ring-circle"
                    cx="56"
                    cy="56"
                    fill="transparent"
                    r="40"
                    stroke="url(#stitchGradient)"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={attendanceOffset}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                  <defs>
                    <linearGradient id="stitchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e11d48" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-headline font-bold text-gray-900 dark:text-gray-100">{overallPct}%</span>
                </div>
              </div>
              <span className="font-label text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-300">Overall Attendance</span>
              <span className={`px-3 py-1 rounded text-[11px] font-label font-extrabold uppercase ${
                overallPct >= 75 ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-red-100 dark:bg-red-950/80 text-red-950 dark:text-red-300 border border-red-300 dark:border-red-800'
              }`}>
                {overallPct >= 75 ? 'Eligible for Exams (>= 75%)' : 'Shortage Warning (< 75%)'}
              </span>
            </div>

            {/* Attendance Metrics Card */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Class Attendance Summary</h3>
                <div className="space-y-2 text-xs font-label">
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-700 dark:text-gray-400 font-bold">Total Classes Conducted:</span>
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">{attendanceData?.total_classes || 0}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-700 dark:text-gray-400 font-bold">Classes Attended:</span>
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-400">{attendanceData?.total_attended || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700 dark:text-gray-400 font-bold">Classes Missed:</span>
                    <span className="font-extrabold text-red-700 dark:text-red-400">{attendanceData?.total_absent || 0}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/chat', { state: { initialQuery: "What is my attendance?" } })}
                className="w-full py-2 bg-gray-900 hover:bg-red-800 dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400 text-white font-label font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-gray-950" />
                <span>Ask AI Assistant About Attendance</span>
              </button>
            </div>

            {/* Study Focus / Breathing Widget */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Study Wellness</span>
                <Heart className="w-4 h-4 text-red-700 dark:text-red-400 fill-red-700 dark:fill-red-400" />
              </div>

              <div className="text-center py-2 space-y-2">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto border border-gray-300 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-red-700 dark:bg-amber-400 opacity-60 animate-ping"></div>
                </div>
                <p className="text-xs font-body italic text-gray-800 dark:text-gray-200 font-bold">{breathingText}</p>
              </div>

              <div className="text-center text-xs font-label">
                <span className="text-gray-800 dark:text-gray-300 font-bold">Tuition Fee Clearance: <strong className="text-emerald-800 dark:text-emerald-400 uppercase font-extrabold">{feeStatus}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Deadlines & Saved Answers Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Upcoming Deadlines Card */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-800 dark:text-amber-400" />
                  ⏰ Upcoming Deadlines
                </h3>
                <p className="font-body text-xs text-gray-700 dark:text-gray-400 font-medium">Academic, exam & fee due date tracker</p>
              </div>
              <button
                onClick={() => setShowDeadlineForm(!showDeadlineForm)}
                className="px-2.5 py-1 bg-gray-900 hover:bg-red-800 dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400 text-white rounded text-xs font-label font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Add Deadline Inline Form */}
            {showDeadlineForm && (
              <form onSubmit={handleAddDeadline} className="p-3 bg-gray-50 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700 rounded-lg space-y-3 font-label text-xs">
                <div>
                  <label className="block text-gray-800 dark:text-gray-300 font-bold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Assignment 2 Submission"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded outline-none font-bold text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-800 dark:text-gray-300 font-bold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded font-bold text-gray-900 dark:text-gray-100"
                    >
                      <option value="Examinations">Examinations</option>
                      <option value="Academics">Academics</option>
                      <option value="Fees">Fees</option>
                      <option value="Scholarships">Scholarships</option>
                      <option value="Library">Library</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-800 dark:text-gray-300 font-bold mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded font-bold text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowDeadlineForm(false)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-red-800 dark:bg-amber-500 text-white dark:text-gray-950 font-bold rounded">Save Deadline</button>
                </div>
              </form>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {deadlines.length === 0 ? (
                <p className="text-xs text-gray-700 dark:text-gray-400 font-bold py-4 text-center">No upcoming deadlines registered.</p>
              ) : (
                deadlines.map((dl) => (
                  <div key={dl.id} className="p-3 bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-xs text-gray-900 dark:text-gray-100">{dl.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          dl.computed_status.includes("Overdue") ? "bg-red-100 dark:bg-red-950/80 text-red-950 dark:text-red-300 border border-red-300 dark:border-red-800" :
                          dl.computed_status.includes("Today") ? "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800" :
                          "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        }`}>
                          {dl.computed_status}
                        </span>
                      </div>
                      {dl.description && <p className="font-body text-xs text-gray-700 dark:text-gray-300">{dl.description}</p>}
                      <p className="font-label text-[11px] font-bold text-gray-800 dark:text-gray-300">Due Date: <strong className="text-red-800 dark:text-amber-400">{dl.deadline}</strong> • Priority: {dl.priority}</p>
                    </div>
                    <button onClick={() => handleDeleteDeadline(dl.id)} className="text-gray-400 hover:text-red-700 dark:hover:text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Saved Information Answers Card */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
                  📌 Saved Information
                </h3>
                <p className="font-body text-xs text-gray-700 dark:text-gray-400 font-medium">Important pinned chatbot answers & notices</p>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {savedAnswers.length === 0 ? (
                <p className="text-xs text-gray-700 dark:text-gray-400 font-bold py-4 text-center">No saved answers yet. Click '📌 Save Answer' in chatbot responses to pin here.</p>
              ) : (
                savedAnswers.map((s) => (
                  <div key={s.id} className="p-3.5 bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-lg space-y-1 relative">
                    <div className="flex items-center justify-between pr-6">
                      <span className="font-label text-[10px] font-extrabold uppercase tracking-wider text-red-800 dark:text-amber-400 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">{s.category}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    <h4 className="font-headline font-bold text-xs text-gray-900 dark:text-gray-100">{s.title}</h4>
                    <p className="font-body text-xs text-gray-800 dark:text-gray-300 line-clamp-3 leading-relaxed">{s.content}</p>
                    <button
                      onClick={() => handleDeleteSaved(s.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-700 dark:hover:text-red-400 p-1"
                      title="Remove saved answer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Support Tickets Section */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
            <div>
              <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                📝 Support Tickets & Helpdesk Requests
              </h3>
              <p className="font-body text-xs text-gray-700 dark:text-gray-400 font-medium">Track submitted student issues, payment queries & administrative requests</p>
            </div>
            <button
              onClick={() => setShowTicketForm(!showTicketForm)}
              className="px-3 py-1.5 bg-gray-900 hover:bg-red-800 dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400 text-white rounded-lg text-xs font-label font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Support Ticket
            </button>
          </div>

          {/* Ticket Submission Form */}
          {showTicketForm && (
            <form onSubmit={handleCreateTicket} className="p-4 bg-gray-50 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700 rounded-lg space-y-3 font-label text-xs">
              <h4 className="font-headline font-bold text-gray-900 dark:text-gray-100 text-sm">Submit New Support Ticket</h4>
              <div>
                <label className="block text-gray-800 dark:text-gray-300 font-bold mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded font-bold text-gray-900 dark:text-gray-100 outline-none"
                >
                  <option value="Finance & Fees">Finance & Fees</option>
                  <option value="Academics">Academics</option>
                  <option value="Examinations">Examinations</option>
                  <option value="Hostel & Mess">Hostel & Mess</option>
                  <option value="Library">Library</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-800 dark:text-gray-300 font-bold mb-1">Describe Issue / Query</label>
                <textarea
                  required
                  rows="3"
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  placeholder="Provide clear details regarding your issue..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded font-bold text-gray-900 dark:text-gray-100 outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowTicketForm(false)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-red-800 dark:bg-amber-500 text-white dark:text-gray-950 font-bold rounded">Submit Ticket</button>
              </div>
            </form>
          )}

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 font-label font-extrabold uppercase tracking-wider bg-gray-50 dark:bg-gray-800/80">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Issue Summary</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-label text-gray-900 dark:text-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-700 dark:text-gray-400 font-bold">
                      No support tickets submitted yet.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-red-800 dark:text-amber-400">{t.ticket_code}</td>
                      <td className="py-3 px-3 font-bold text-gray-900 dark:text-gray-100">{t.category}</td>
                      <td className="py-3 px-3 font-body font-medium text-gray-900 dark:text-gray-200 max-w-xs truncate">{t.issue}</td>
                      <td className="py-3 px-3 font-bold text-gray-800 dark:text-gray-300">{t.priority}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                          t.status === 'Resolved' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                          t.status === 'In Progress' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                          'bg-purple-100 dark:bg-purple-950/80 text-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700 dark:text-gray-400 font-mono text-[11px] font-bold">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Subject-Wise Attendance Breakdown Table */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
            <div>
              <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-800 dark:text-amber-400" />
                Subject-Wise Attendance Breakdown
              </h3>
              <p className="font-body text-xs text-gray-700 dark:text-gray-400 font-medium">Real-time attendance metrics per course subject</p>
            </div>

            <span className="font-label text-xs font-extrabold text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-3 py-1 rounded self-start sm:self-auto">
              {subjects.length} Enrolled Subjects
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 font-label font-extrabold uppercase tracking-wider bg-gray-50 dark:bg-gray-800/80">
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Attended</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Absent</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-label text-gray-900 dark:text-gray-200">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-700 dark:text-gray-400 font-bold text-xs">
                      Attendance records currently synchronizing.
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub, idx) => {
                    const isLow = sub.attendance_percentage < 75.0;
                    return (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-3 font-headline font-bold text-gray-900 dark:text-gray-100">{sub.subject}</td>
                        <td className="py-3 px-3 font-mono font-bold text-red-800 dark:text-amber-400">{sub.subject_code}</td>
                        <td className="py-3 px-3 font-extrabold text-emerald-800 dark:text-emerald-400">{sub.attended_classes}</td>
                        <td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-bold">{sub.total_classes}</td>
                        <td className="py-3 px-3 text-red-700 dark:text-red-400 font-extrabold">{sub.absent_classes}</td>
                        <td className="py-3 px-3 font-headline font-extrabold text-sm">
                          <span className={isLow ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}>
                            {sub.attendance_percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-3 font-label font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                            isLow ? 'bg-red-100 dark:bg-red-950/80 text-red-950 dark:text-red-300 border border-red-300 dark:border-red-800' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}>
                            {isLow ? '⚠️ Warning (<75%)' : '🟢 Compliant'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Examinations Schedule Section */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl p-6 border border-gray-300 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
            <div>
              <h3 className="font-headline text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-800 dark:text-amber-400" />
                Examination Schedule
              </h3>
              <p className="font-body text-xs text-gray-700 dark:text-gray-400 font-medium">Autonomous End-Semester Examination Timetable</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 font-label font-extrabold uppercase tracking-wider bg-gray-50 dark:bg-gray-800/80">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Exam Date</th>
                  <th className="py-2.5 px-3">Time Slot</th>
                  <th className="py-2.5 px-3">Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-label text-gray-900 dark:text-gray-200">
                {exams.map((ex, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 font-headline font-bold text-gray-900 dark:text-gray-100">{ex.subject}</td>
                    <td className="py-3 px-3 text-red-800 dark:text-amber-400 font-extrabold">{ex.exam_date}</td>
                    <td className="py-3 px-3 text-gray-800 dark:text-gray-300 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      {ex.exam_time}
                    </td>
                    <td className="py-3 px-3 text-gray-800 dark:text-gray-300 font-bold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                        {ex.venue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notices & Events Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl p-5 border border-gray-300 dark:border-gray-800 shadow-xs space-y-3">
            <h3 className="font-headline text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              <Bell className="w-4 h-4 text-red-800 dark:text-amber-400" />
              Campus Announcements
            </h3>

            <div className="space-y-2.5">
              {notices.map((n, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-300 dark:border-gray-750 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-label font-extrabold text-red-800 dark:text-amber-400 text-[10px] uppercase tracking-wider">{n.category}</span>
                    <span className="text-gray-700 dark:text-gray-400 font-mono font-bold text-[10px]">{n.date}</span>
                  </div>
                  <h4 className="font-headline font-bold text-gray-900 dark:text-gray-100 text-xs">{n.title}</h4>
                  <p className="font-body text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-xl p-5 border border-gray-300 dark:border-gray-800 shadow-xs space-y-3">
            <h3 className="font-headline text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Upcoming Events & Hackathons
            </h3>

            <div className="space-y-2.5">
              {events.map((ev, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border border-gray-300 dark:border-gray-750 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-headline font-bold text-gray-900 dark:text-gray-100 text-xs">{ev.title}</h4>
                    <p className="font-body text-[11px] text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-800 dark:text-amber-400" />
                      {ev.venue}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono font-bold text-[10px] rounded uppercase">
                    {ev.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <BottomNav />

      <Footer />
    </div>
  );
}
