import React, { useState, useRef, useEffect } from 'react';
import { Video, MessageCircle, Users, Clock, Play, Square, Loader, AlertCircle, CheckCircle, ExternalLink, Copy, Settings, Mic, ArrowLeft } from 'lucide-react';
import { tavusAPI, TavusAPI, ConversationRequest, ConversationResponse, ConversationStatus } from '../lib/tavusApi';

interface ConversationInterfaceProps {
  textContent: string;
  replicaId: string;
  onConversationCreated: (conversationUrl: string, conversationId: string) => void;
  onBackToSetup?: () => void;
}

interface ConversationSettings {
  conversationName: string;
  maxDuration: number;
}

function ConversationInterface({ textContent, replicaId, onConversationCreated, onBackToSetup }: ConversationInterfaceProps) {
  const [settings, setSettings] = useState<ConversationSettings>({
    conversationName: '',
    maxDuration: 1800 // 30 minutes
  });

  const [isCreating, setIsCreating] = useState(false);
  const [activeConversation, setActiveConversation] = useState<{
    id: string;
    url: string;
    status: string;
    startTime: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate conversation name from text content only if field is empty
  useEffect(() => {
    if (textContent && !settings.conversationName.trim()) {
      const words = textContent.trim().split(/\s+/).slice(0, 6).join(' ');
      const name = words.length > 40 ? words.substring(0, 37) + '...' : words;
      setSettings(prev => ({ 
        ...prev, 
        conversationName: name || 'Syntrio Interactive Session' 
      }));
    }
  }, [textContent]);

  // Auto-dismiss errors
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setError('');
      }, 8000);
    }
    
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusPollRef.current) {
        clearTimeout(statusPollRef.current);
      }
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current);
      }
    };
  }, []);

  const updateSetting = <K extends keyof ConversationSettings>(key: K, value: ConversationSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const startDurationTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    durationTimerRef.current = setInterval(() => {
      setCurrentDuration(prev => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const pollConversationStatus = async (conversationId: string) => {
    try {
      const status = await tavusAPI.getConversationStatus(conversationId);
      
      if (status) {
        setActiveConversation(prev => prev ? { ...prev, status: status.status } : null);
        
        if (status.status === 'active' && activeConversation?.status !== 'active') {
          startDurationTimer();
        } else if (status.status === 'ended' || status.status === 'failed') {
          stopDurationTimer();
          if (status.status === 'failed') {
            setError(status.error || 'Conversation failed');
          }
          setActiveConversation(null);
          return; // Stop polling
        }
      }
      
      // Continue polling if conversation is still active
      if (status?.status === 'creating' || status?.status === 'ready' || status?.status === 'active') {
        statusPollRef.current = setTimeout(() => pollConversationStatus(conversationId), 5000);
      }
    } catch (error) {
      console.error('Status polling error:', error);
      // Continue polling on error
      statusPollRef.current = setTimeout(() => pollConversationStatus(conversationId), 10000);
    }
  };

  const handleCreateConversation = async () => {
    if (!tavusAPI.isConfigured()) {
      setError('Please configure your Tavus API key in settings first.');
      return;
    }

    if (!replicaId.trim()) {
      setError('Please enter your Tavus replica ID.');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');
    setProgress(0);
    setCurrentDuration(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 90));
    }, 500);

    try {
      const request: ConversationRequest = {
        replica_id: replicaId.trim(),
        conversation_name: settings.conversationName.trim() || 'Syntrio Interactive Session',
        custom_greeting: 'Hello! I\'m your AI assistant. How can I help you today?',
        conversational_context: textContent.trim() || undefined,
        properties: {
          max_call_duration: settings.maxDuration,
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          language: 'english'
        }
      };

      console.log('🎭 Creating conversation with request:', request);

      const result: ConversationResponse = await tavusAPI.createConversation(request);

      clearInterval(progressInterval);

      if (result.success && result.conversation_id && result.conversation_url) {
        setProgress(100);
        
        setActiveConversation({
          id: result.conversation_id,
          url: result.conversation_url,
          status: result.status || 'creating',
          startTime: Date.now()
        });

        onConversationCreated(result.conversation_url, result.conversation_id);
        setSuccess('Conversation created successfully! Click "Join Conversation" to start.');
        
        // Start polling for status updates
        pollConversationStatus(result.conversation_id);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setProgress(0);
        setError(result.error || 'Failed to create conversation');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error('❌ Conversation creation error:', error);
      setError('An unexpected error occurred while creating conversation.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinConversation = () => {
    if (activeConversation) {
      window.open(activeConversation.url, '_blank', 'width=1200,height=800');
    }
  };

  const handleEndConversation = async () => {
    if (!activeConversation) return;

    try {
      const result = await tavusAPI.endConversation(activeConversation.id);
      
      if (result.success) {
        stopDurationTimer();
        setActiveConversation(null);
        setSuccess('Conversation ended successfully.');
      } else {
        setError(result.error || 'Failed to end conversation');
      }
    } catch (error) {
      console.error('End conversation error:', error);
      setError('Failed to end conversation');
    }
  };

  const handleCopyUrl = async () => {
    if (activeConversation) {
      try {
        await navigator.clipboard.writeText(activeConversation.url);
        setSuccess('Conversation URL copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'creating':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'creating':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'active':
        return <Video className="w-4 h-4" />;
      case 'ended':
        return <Square className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Back Button */}
      {onBackToSetup && (
        <div className="mb-6">
          <button
            onClick={onBackToSetup}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors duration-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Setup
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Interactive Conversation</h3>
        {!tavusAPI.isConfigured() && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
            <AlertCircle className="w-3 h-3" />
            API Key Required
          </span>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Conversation Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversation Name
          </label>
          <input
            type="text"
            value={settings.conversationName}
            onChange={(e) => updateSetting('conversationName', e.target.value)}
            placeholder="Enter conversation name..."
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            disabled={isCreating || !!activeConversation}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {settings.conversationName.length}/100 characters
            </p>
          </div>
        </div>

        {/* Max Duration Setting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Duration (minutes)
          </label>
          <select
            value={settings.maxDuration}
            onChange={(e) => updateSetting('maxDuration', parseInt(e.target.value))}
            className="dropdown-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 appearance-none cursor-pointer"
            disabled={isCreating || !!activeConversation}
          >
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={900}>15 minutes</option>
            <option value={1800}>30 minutes</option>
          </select>
        </div>

        {/* Active Conversation Status */}
        {activeConversation && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-green-900">Active Conversation</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(activeConversation.status)}`}>
                {getStatusIcon(activeConversation.status)}
                {activeConversation.status.charAt(0).toUpperCase() + activeConversation.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Conversation ID:</span>
                <div className="font-mono text-xs text-gray-900 break-all">{activeConversation.id}</div>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <div className="font-medium text-gray-900">
                  {TavusAPI.formatDuration(currentDuration)}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleJoinConversation}
                disabled={activeConversation.status === 'creating'}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                Join Conversation
              </button>
              
              <button
                onClick={handleCopyUrl}
                className="bg-white text-purple-600 border border-purple-300 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors duration-300 flex items-center justify-center"
                title="Copy conversation URL"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleEndConversation}
                className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
                title="End conversation"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Daily.co Meeting:</strong> Click "Join Conversation" to open the video chat in a new window. 
                The AI avatar will be ready to have a natural conversation with you.
              </p>
            </div>
          </div>
        )}

        {/* Create Conversation Button */}
        {!activeConversation && (
          <div>
            <button
              onClick={handleCreateConversation}
              disabled={
                isCreating || 
                !replicaId.trim() ||
                !tavusAPI.isConfigured()
              }
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isCreating ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Creating Conversation...
                </>
              ) : (
                <>
                  <MessageCircle className="w-6 h-6" />
                  Start Interactive Conversation
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isCreating && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Setting up your conversation...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration Notices */}
        {!tavusAPI.isConfigured() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Tavus API Key Required</p>
                <p>To create interactive conversations, please add your Tavus API key in the Settings tab.</p>
              </div>
            </div>
          </div>
        )}

        {!replicaId.trim() && tavusAPI.isConfigured() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Replica ID Required</p>
                <p>Please enter your Tavus replica ID to create conversations with your AI avatar.</p>
              </div>
            </div>
          </div>
        )}

        {/* Feature Information */}
        {tavusAPI.isConfigured() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Interactive Conversation Features</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Real-time video conversations with AI avatars</li>
                <li>Natural turn-taking and interruption handling</li>
                <li>Automatic greeting and conversational context</li>
                <li>WebRTC-powered video chat through Daily.co</li>
                <li>Automatic conversation recording and transcription</li>
                <li>Multi-language support for global conversations</li>
                <li>Session management with automatic timeouts</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationInterface;