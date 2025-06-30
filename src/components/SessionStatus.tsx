import React, { useState, useEffect } from 'react';
import { Clock, Shield } from 'lucide-react';
import { sessionManager } from '../lib/sessionManager';

function SessionStatus() {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const remaining = sessionManager.getTimeRemaining();
      setTimeRemaining(sessionManager.formatTimeRemaining(remaining));
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const sessionInfo = sessionManager.getSessionInfo();
  
  if (!sessionInfo) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 px-3 py-1 rounded-lg hover:bg-gray-100"
      >
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline">Session: {timeRemaining}</span>
        <span className="sm:hidden">{timeRemaining}</span>
      </button>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64 z-50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-900">Session Active</span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Time remaining:</span>
              <span className="font-mono">{timeRemaining}</span>
            </div>
            <div className="flex justify-between">
              <span>Login time:</span>
              <span>{sessionInfo.loginTime}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Session extends automatically with activity
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionStatus;