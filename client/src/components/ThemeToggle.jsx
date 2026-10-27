import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-gray-800/90 hover:bg-gray-700 text-amber-300 border border-amber-400/30 hover:border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
          : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300 hover:border-gray-400 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 animate-[spin_10s_linear_infinite] transition-transform" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="ml-2 font-label font-bold text-xs">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
