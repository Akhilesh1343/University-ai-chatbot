import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ThemeToggle from '../components/ThemeToggle';
import { Send, Menu, Sparkles, RefreshCw, AlertCircle, BookOpen, Calendar, Award, CreditCard, Briefcase, Building, Mail, Activity, Clock, GraduationCap, Globe, Shield } from 'lucide-react';

export default function ChatbotPage() {
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mode and Language State
  const [mode, setMode] = useState('university'); // 'university' | 'general'
  const [language, setLanguage] = useState('English'); // 'English' | 'Hindi' | 'Hinglish'

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick Action Buttons
  const quickActions = [
    { label: "Exam Schedule", query: "When is the examination schedule?", icon: Calendar },
    { label: "Tuition Fees", query: "How do I pay my tuition fees?", icon: CreditCard },
    { label: "My Attendance", query: "What is my overall attendance?", icon: Activity },
    { label: "Courses", query: "What courses and electives are offered?", icon: BookOpen },
    { label: "Scholarships", query: "What merit and need-based scholarships are available?", icon: Sparkles },
    { label: "Hostel Details", query: "What are the hostel room charges and mess timings?", icon: Building },
    { label: "Placements", query: "What are the latest placement statistics?", icon: Briefcase },
    { label: "Contact", query: "What are the official university contacts?", icon: Mail },
  ];

  const microPromptChips = [
    "Scholarship inquiry",
    "Bus route & timing",
    "Internal marks criteria",
    "Hostel curfew hours",
    "B.Tech Admissions"
  ];

  // Fetch Conversation History on Mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Check if navigate passed an initial query
  useEffect(() => {
    if (location.state?.initialQuery || location.state?.initialPrompt) {
      const q = location.state.initialQuery || location.state.initialPrompt;
      window.history.replaceState({}, document.title);
      handleSendMessage(q);
    }
  }, [location.state]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  const loadConversation = async (convId) => {
    setCurrentConvId(convId);
    setErrorMsg('');
    try {
      const res = await API.get(`/chat/conversations/${convId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setErrorMsg("Failed to load conversation history.");
    }
  };

  const handleNewChat = () => {
    setCurrentConvId(null);
    setMessages([]);
    setErrorMsg('');
    setInputMessage('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text || loading) return;

    setInputMessage('');
    setErrorMsg('');

    // Optimistic User Message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await API.post('/chat', {
        conversation_id: currentConvId,
        message: text,
        mode: mode,
        language: language
      });

      const { conversation_id, message: assistantMsg } = res.data;

      if (!currentConvId && conversation_id) {
        setCurrentConvId(conversation_id);
      }

      setMessages(prev => [...prev, assistantMsg]);
      fetchConversations();
    } catch (err) {
      console.error("Chat message error:", err);
      const serverErr = err.response?.data?.error;
      setErrorMsg(serverErr || "Connection error. Please make sure the Flask backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (convId, newTitle) => {
    try {
      await API.put(`/chat/conversations/${convId}`, { title: newTitle });
      fetchConversations();
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  const handleDelete = async (convId) => {
    try {
      await API.delete(`/chat/conversations/${convId}`);
      if (currentConvId === convId) {
        handleNewChat();
      }
      fetchConversations();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  return (
    <div className="h-screen flex bg-surface text-gray-900 font-body overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConvId={currentConvId}
        onSelectConversation={loadConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRename}
        onDeleteConversation={handleDelete}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-surface dark:bg-[#080c14]">
        {/* Chat Header Bar */}
        <header className="bg-white dark:bg-[#0f172a] border-b border-gray-300 dark:border-gray-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <img
              src="/images/abes_logo_icon.png"
              alt="ABES Logo"
              className="h-9 w-9 object-contain rounded-lg shrink-0 shadow-xs"
            />

            <div>
              <h2 className="font-headline font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                ABES AI Student Assistant
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-label font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  AI Online
                </span>
              </h2>
              <p className="text-[11px] text-gray-700 dark:text-gray-400 font-body font-semibold">Verified Knowledge RAG & Intelligent Intent Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Knowledge Mode Selector */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-label font-bold">
              <button
                onClick={() => setMode('university')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  mode === 'university'
                    ? 'bg-gray-900 text-amber-300 dark:bg-amber-500 dark:text-gray-950 shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Strictly uses verified ABES database and knowledge base"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>University Mode</span>
              </button>
              <button
                onClick={() => setMode('general')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  mode === 'general'
                    ? 'bg-gray-900 text-amber-300 dark:bg-amber-500 dark:text-gray-950 shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="General Educational Assistance"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>General AI</span>
              </button>
            </div>

            {/* Multilingual Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs font-label font-bold text-gray-800 dark:text-gray-200">
              <Globe className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-0 outline-none font-bold text-xs cursor-pointer text-gray-900 dark:text-gray-100 dark:bg-gray-800"
              >
                <option value="English" className="dark:bg-gray-800 dark:text-gray-100">English</option>
                <option value="Hindi" className="dark:bg-gray-800 dark:text-gray-100">हिंदी (Hindi)</option>
                <option value="Hinglish" className="dark:bg-gray-800 dark:text-gray-100">Hinglish</option>
              </select>
            </div>

            {/* Quick Dark Mode Toggle */}
            <ThemeToggle />

            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-label font-bold flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>
        </header>

        {/* Chat Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Welcome Screen Card */}
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto my-4 space-y-5">
              <div className="bg-white dark:bg-[#0f172a] rounded-xl p-6 sm:p-8 border border-gray-300 dark:border-gray-800 shadow-sm text-center space-y-4">
                <img
                  src="/images/abes_logo_icon.png"
                  alt="ABES Logo"
                  className="w-16 h-16 object-contain mx-auto rounded-xl shadow-xs"
                />

                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-headline font-bold text-gray-900 dark:text-gray-100">
                    Greetings! I am your <span className="text-red-800 dark:text-amber-400">ABES AI Assistant</span>.
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-body font-medium">
                    Ask me anything about examination schedules, tuition fees, scholarships, hostel rules, or attendance. Select your preferred language or mode above.
                  </p>
                </div>

                {/* Smart Quick Action Buttons */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs font-label font-extrabold text-gray-800 dark:text-gray-300 uppercase tracking-wider mb-2.5">⚡ Smart Quick Actions</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickActions.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(action.query)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-label font-bold transition-all shadow-xs"
                        >
                          <Icon className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                          <span>{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Active Messages */}
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              message={msg}
              conversationId={currentConvId}
            />
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto justify-start my-3">
              <img
                src="/images/abes_logo_icon.png"
                alt="ABES Logo"
                className="w-8 h-8 rounded object-contain shrink-0 shadow-sm mt-0.5"
              />
              <div className="bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-800 rounded-xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                <span className="text-xs font-label font-bold text-gray-900 dark:text-gray-100">Consulting ABES knowledge base...</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-800 dark:bg-amber-400 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-red-800 dark:bg-amber-400 animate-ping delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-red-800 dark:bg-amber-400 animate-ping delay-200"></span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="max-w-2xl mx-auto p-3.5 bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-950 dark:text-red-300 rounded-lg text-xs font-label font-bold flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Message Input Box */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#0f172a] border-t border-gray-300 dark:border-gray-800 shrink-0 shadow-md">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {/* Suggested Micro-Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="font-label text-xs text-gray-900 dark:text-gray-300 shrink-0 font-extrabold">Try asking:</span>
              {microPromptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="shrink-0 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 px-2.5 py-1 rounded-full font-label text-xs font-bold transition-colors border border-gray-300 dark:border-gray-700 shadow-xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Active Input Field */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 focus-within:border-gray-900 dark:focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-gray-700 transition-all"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={language === 'Hindi' ? "अपनी समस्या या प्रश्न यहाँ पूछें..." : language === 'Hinglish' ? "Apna question yahan likhein..." : "Inquire about exams, fees, attendance, hostel, or scholarships..."}
                disabled={loading}
                className="flex-1 bg-transparent border-0 outline-none font-body text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-bold placeholder:text-gray-500 dark:placeholder:text-gray-400 py-2 px-1 min-w-0"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                  inputMessage.trim() && !loading
                    ? 'bg-gray-900 text-white hover:bg-red-800 dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
