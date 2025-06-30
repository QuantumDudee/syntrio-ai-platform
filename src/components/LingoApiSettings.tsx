import React from 'react';
import { Globe, CheckCircle, Shield, Info } from 'lucide-react';

function LingoApiSettings() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Lingo.dev Translation API</h3>
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
            <p>Lingo.dev API is pre-configured and ready to use. No setup required!</p>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Supported Languages (85+)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>🇺🇸 English</div>
              <div>🇪🇸 Spanish</div>
              <div>🇫🇷 French</div>
              <div>🇩🇪 German</div>
              <div>🇮🇹 Italian</div>
              <div>🇧🇷 Portuguese</div>
              <div>🇯🇵 Japanese</div>
              <div>🇰🇷 Korean</div>
              <div>🇨🇳 Chinese</div>
              <div>🇸🇦 Arabic</div>
            </div>
            <p className="mt-2 text-xs">
              Plus 75+ additional languages available for translation.
            </p>
          </div>
        </div>
      </div>

      {/* Translation Features */}
      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-2">Translation Features</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Real-time translation with preview</li>
              <li>Automatic language detection</li>
              <li>Development mode bypass option</li>
              <li>Character and word count validation</li>
              <li>Retry logic for reliable translations</li>
              <li>Rate limiting protection</li>
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
              <li>Direct communication with Lingo.dev API</li>
              <li>All translation features are immediately available</li>
              <li>No manual setup or configuration required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LingoApiSettings;