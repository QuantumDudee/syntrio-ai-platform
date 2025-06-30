import React from 'react';
import { Clock, Shield, LogOut, RefreshCw } from 'lucide-react';

interface SessionWarningProps {
  show: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

function SessionWarning({ show, timeRemaining, onExtend, onLogout }: SessionWarningProps) {
  if (!show) return null;

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-100 p-2 rounded-full">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Session Expiring Soon</h3>
            <p className="text-sm text-gray-600">Your session will expire in {formatTime(timeRemaining)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>For your security, we automatically log you out after 24 hours of inactivity. Any work in progress will be saved automatically.</p>
              </div>
            </div>
          </div>

          {/* Time remaining bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Time remaining</span>
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(10, (timeRemaining / (5 * 60 * 1000)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Extend Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Save & Logout
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your work will be automatically saved before logout
        </p>
      </div>
    </div>
  );
}

export default SessionWarning;