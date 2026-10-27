import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ThumbsUp, ThumbsDown, Check, BookOpen, Volume2, VolumeX, Bookmark, Copy, Ticket, Tag, Smile } from 'lucide-react';
import API from '../services/api';

export default function ChatMessage({ message, conversationId }) {
  const isUser = message.sender === 'user';
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [ticketMsg, setTicketMsg] = useState('');

  // Feedback handler
  const handleFeedback = async (rating) => {
    if (feedbackSubmitted) return;
    setFeedback(rating);
    setFeedbackSubmitted(true);
    try {
      await API.post('/feedback', {
        message_id: message.id,
        conversation_id: conversationId,
        rating: rating
      });
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  // Text-To-Speech Handler
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = message.content.replace(/[*_#`[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Save Answer Handler
  const handleSaveAnswer = async () => {
    if (isSaved) return;
    try {
      const titleSnippet = message.content.slice(0, 30).replace(/[*_#]/g, '') + "...";
      await API.post('/student/saved', {
        title: titleSnippet,
        content: message.content,
        category: message.intent || "General Query"
      });
      setIsSaved(true);
    } catch (err) {
      console.error("Failed to save answer:", err);
    }
  };

  // Copy Answer Handler
  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Create Ticket Handler
  const handleCreateTicket = async () => {
    if (ticketCreated) return;
    try {
      const res = await API.post('/tickets', {
        issue: message.content,
        category: message.intent || "General Support",
        priority: "Medium"
      });
      setTicketCreated(true);
      setTicketMsg(res.data.ticket?.ticket_code || "Ticket Created");
    } catch (err) {
      console.error("Failed to create support ticket:", err);
    }
  };

  return (
    <div className={`flex gap-3 mb-6 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
      {/* Assistant Avatar Crest */}
      {!isUser && (
        <img
          src="/images/abes_logo_icon.png"
          alt="ABES Logo"
          className="w-8 h-8 rounded object-contain shrink-0 shadow-sm mt-0.5"
        />
      )}

      {/* Message Bubble Container */}
      <div className={`group relative flex flex-col p-4 text-sm leading-relaxed transition-all max-w-[90%] sm:max-w-[85%] ${
        isUser
          ? 'bg-gray-900 text-white dark:bg-gradient-to-r dark:from-red-900 dark:to-red-950 dark:border dark:border-red-800/60 rounded-xl rounded-br-xs shadow-sm'
          : 'bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-800 rounded-xl rounded-tl-xs shadow-sm'
      }`}>
        {/* Header Sender & Badges */}
        <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-800 font-label font-bold text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 ${isUser ? 'text-amber-300 font-extrabold' : 'text-red-900 dark:text-amber-400 font-headline font-bold text-sm'}`}>
              {isUser ? 'YOU' : 'ABES AI Assistant'}
            </span>

            {/* Intent Badge */}
            {message.intent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[10px] font-bold">
                <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Detected topic: {message.intent}</span>
              </span>
            )}

            {/* Sentiment Badge */}
            {message.sentiment && message.sentiment !== "🙂 Neutral" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[10px] font-bold">
                <Smile className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Mood detected: {message.sentiment}</span>
              </span>
            )}
          </div>

          <span className={`text-[10px] font-bold ${isUser ? 'text-slate-300 dark:text-slate-400' : 'text-gray-700 dark:text-gray-400'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>

        {/* Message Content */}
        {isUser ? (
          <p className="whitespace-pre-wrap font-body font-medium text-white">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-900 dark:text-gray-100 font-body font-medium prose-headings:font-headline prose-headings:font-bold prose-headings:text-red-900 prose-headings:dark:text-amber-400 prose-p:my-1.5 prose-p:text-gray-900 prose-p:dark:text-gray-200 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:dark:text-white prose-a:text-red-800 prose-a:dark:text-amber-400 prose-a:font-bold prose-a:underline hover:prose-a:text-red-950 dark:hover:prose-a:text-amber-300">
            <ReactMarkdown components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Verified Knowledge Source Badges */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-1.5 text-xs text-gray-800 dark:text-gray-300 font-label">
            <span className="font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1 text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
              Verified ABES Source:
            </span>
            {message.sources.map((src, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded font-label text-[10px] font-bold">
                {src}
              </span>
            ))}
          </div>
        )}

        {/* Smart Action Toolbar (Listen, Save, Copy, Ticket, Feedback) */}
        {!isUser && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs font-label">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Listen Button */}
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                  isPlaying
                    ? 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
                }`}
              >
                {isPlaying ? <VolumeX className="w-3.5 h-3.5 text-red-700 dark:text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-gray-700 dark:text-gray-400" />}
                <span>{isPlaying ? 'Stop' : 'Listen'}</span>
              </button>

              {/* Save Answer Button */}
              <button
                onClick={handleSaveAnswer}
                disabled={isSaved}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                  isSaved
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-amber-700 dark:text-amber-400 fill-amber-700 dark:fill-amber-400' : 'text-gray-700 dark:text-gray-400'}`} />
                <span>{isSaved ? 'Saved' : 'Save Answer'}</span>
              </button>

              {/* Copy Text Button */}
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded text-[11px] font-bold transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-700 dark:text-gray-400" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Create Support Ticket Button */}
              <button
                onClick={handleCreateTicket}
                disabled={ticketCreated}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                  ticketCreated
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                <span>{ticketCreated ? `Ticket ${ticketMsg}` : 'Create Support Ticket'}</span>
              </button>
            </div>

            {/* Feedback Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleFeedback('like')}
                disabled={feedbackSubmitted}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  feedback === 'like'
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300 font-bold'
                }`}
                title="Helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFeedback('dislike')}
                disabled={feedbackSubmitted}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  feedback === 'dislike'
                    ? 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-300 font-bold border border-red-300 dark:border-red-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-red-800 dark:text-red-400 font-bold'
                }`}
                title="Not Helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {feedbackSubmitted && (
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Recorded
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar Crest */}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-red-800 text-white flex items-center justify-center shrink-0 font-label-md text-[10px] font-extrabold mt-1 shadow-xs">
          YOU
        </div>
      )}
    </div>
  );
}
