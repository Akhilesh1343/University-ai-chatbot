import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { GraduationCap, MessageSquare, LayoutDashboard, HelpCircle, ShieldAlert, LogOut, Menu, X, Users, BarChart3, Settings, Info, Bell, CheckCheck, Trash2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkRead = async () => {
    try {
      await API.put('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await API.delete('/notifications/clear');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 dark:bg-[#080c14]/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm pt-safe transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img 
            src="/images/abes_logo.png" 
            alt="ABES Engineering College" 
            className="h-10 w-auto object-contain hidden sm:block transition-transform group-hover:scale-105" 
          />
          <img 
            src="/images/abes_logo_icon.png" 
            alt="ABES EC" 
            className="h-9 w-9 object-contain block sm:hidden rounded-lg shadow-xs transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
              <span className="font-label text-[10px] text-gray-700 dark:text-gray-300 font-extrabold uppercase tracking-wider truncate">AI Student Portal</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-gray-100/90 dark:bg-gray-900/90 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all ${
              isActive('/') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/dashboard') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>

          <Link
            to="/insights"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/insights') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Insights
          </Link>

          <Link
            to="/community"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/community') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Community
          </Link>

          <Link
            to="/chat"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/chat') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Assistant
          </Link>

          <Link
            to="/about-abes"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/about-abes') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            About ABES
          </Link>

          <Link
            to="/settings"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/settings') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>

          <Link
            to="/faqs"
            className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
              isActive('/faqs') ? 'bg-primary-container dark:bg-amber-400 dark:text-gray-950 text-white shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            FAQs
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all flex items-center gap-1.5 ${
                isActive('/admin') ? 'bg-red-800 text-white shadow-sm' : 'text-red-800 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* User Auth CTA & Notification Bell & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-300 relative">
              {/* Notification Bell Dropdown Button */}
              <button
                onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); if (!notifDropdownOpen && unreadCount > 0) handleMarkRead(); }}
                className="relative p-2 text-gray-800 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors"
                title="System Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-700 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notifDropdownOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-300 rounded-xl shadow-lg z-50 overflow-hidden font-body text-xs">
                  <div className="p-3 bg-gray-900 text-white flex items-center justify-between font-label font-bold">
                    <span className="flex items-center gap-1.5 text-xs text-amber-300">
                      <Bell className="w-4 h-4 text-amber-300" /> System Notifications
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={handleMarkRead} title="Mark read" className="text-gray-300 hover:text-white">
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={handleClearNotifications} title="Clear all" className="text-gray-300 hover:text-white">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-gray-700 font-bold">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => { setNotifDropdownOpen(false); navigate(n.link || '/dashboard'); }}
                          className={`p-3 hover:bg-gray-50 cursor-pointer space-y-0.5 transition-colors ${n.is_read ? 'opacity-70' : 'bg-red-50/50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-label font-extrabold text-[10px] text-red-800 uppercase">{n.category}</span>
                            <span className="text-[9px] text-gray-500 font-bold">{n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          <h4 className="font-headline font-bold text-gray-900 text-xs">{n.title}</h4>
                          <p className="font-body text-xs text-gray-800 leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="text-right">
                <p className="text-xs font-label font-extrabold text-gray-900 dark:text-gray-100 leading-tight">{user.name}</p>
                <p className="text-[11px] text-red-800 dark:text-amber-400 font-mono font-bold">{user.student_id}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:text-red-800 dark:hover:text-amber-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-label font-bold bg-gray-900 dark:bg-amber-400 dark:text-gray-950 hover:bg-red-800 dark:hover:bg-amber-300 text-white rounded-lg shadow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c121e] px-4 pt-3 pb-6 space-y-2 w-full shadow-lg transition-colors">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Dashboard
          </Link>
          <Link
            to="/insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Insights & Analytics
          </Link>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Student Community
          </Link>
          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            AI Assistant
          </Link>
          <Link
            to="/about-abes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            About ABES Engineering College
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Settings
          </Link>
          <Link
            to="/faqs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            FAQs
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-label font-bold text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Portal
            </Link>
          )}

          {/* Mobile Theme Toggle Row */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-100 dark:bg-gray-900/90 rounded-xl border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-label font-bold text-gray-700 dark:text-gray-300">Appearance Mode</span>
            <ThemeToggle showLabel />
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-[11px] font-bold text-red-800 dark:text-amber-400">{user.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 text-xs font-label font-bold bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-label font-bold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-gray-900 dark:bg-amber-400 dark:text-gray-950 text-white rounded-lg text-xs font-label font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
