import React from 'react';
import { MessageCircle, CheckCircle, Shield, Info } from 'lucide-react';

function TavusApiSettings() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Tavus Interactive Conversations</h3>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Pre-configured for Demo
        </span>
      </div>

      {/* Demo Configuration Notice */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Ready for Hackathon Demo</p>
            <p>Tavus API is pre-configured and ready to use. No setup required!</p>
          </div>
        </div>
      </div>

      {/* Conversation Features Information */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-2">Interactive Conversation Features</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Real-time video conversations with AI avatars using Tavus CVI</li>
              <li>Natural turn-taking and interruption handling</li>
              <li>Custom greetings and conversational context</li>
              <li>WebRTC-powered video chat through Daily.co integration</li>
              <li>Multi-language conversation support</li>
              <li>Automatic conversation recording and transcription</li>
              <li>Session management with configurable timeouts</li>
              <li>Up to 250 conversation minutes per month (varies by plan)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Demo Configuration</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>API key is pre-configured for hackathon demonstration</li>
              <li>Direct communication with Tavus CVI API</li>
              <li>Conversations use encrypted WebRTC connections</li>
              <li>All features are immediately available without setup</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Available Avatars */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Available AI Avatars</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>• Anna - Professional Business</div>
              <div>• Nathan - Casual Friendly</div>
              <div>• Sabrina - Educational Expert</div>
              <div>• Steve - Creative Presenter</div>
            </div>
            <p className="mt-2 text-xs">
              All avatars are pre-configured and ready for immediate use in conversations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TavusApiSettings;