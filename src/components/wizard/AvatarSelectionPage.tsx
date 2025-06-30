import React from 'react';
import { Video, User, Briefcase, GraduationCap, Palette, CheckCircle, AlertCircle } from 'lucide-react';

interface AvatarSelectionPageProps {
  selectedAvatar: string;
  onAvatarChange: (avatarId: string) => void;
  selectedBackground: string;
  onBackgroundChange: (backgroundId: string) => void;
  textContent: string;
  selectedLanguage: string;
  voiceSettings: any;
}

interface PresetAvatar {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

function AvatarSelectionPage({
  selectedAvatar,
  onAvatarChange,
  textContent,
  selectedLanguage
}: AvatarSelectionPageProps) {
  const presetAvatars: PresetAvatar[] = [
    {
      id: 'r4dcf31b60e1',
      name: 'Anna - Professional Business',
      description: 'Perfect for business meetings and professional discussions',
      icon: <Briefcase className="w-6 h-6" />
    },
    {
      id: 'rfe12d8b9597',
      name: 'Nathan - Casual Friendly',
      description: 'Great for informal conversations and brainstorming',
      icon: <User className="w-6 h-6" />
    },
    {
      id: 'rbfadb437a1e',
      name: 'Sabrina - Educational Expert',
      description: 'Ideal for learning sessions and knowledge sharing',
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      id: 'r4d9b2288937',
      name: 'Steve - Creative Presenter',
      description: 'Best for creative projects and innovative discussions',
      icon: <Palette className="w-6 h-6" />
    }
  ];

  const selectedAvatarData = presetAvatars.find(avatar => avatar.id === selectedAvatar);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Video className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your AI Avatar
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select your AI avatar to create the perfect conversation experience.
        </p>
      </div>

      <div className="space-y-8">
        {/* Avatar Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Select Your AI Avatar</h3>
          
          <div className="space-y-3">
            {presetAvatars.map((avatar) => (
              <label
                key={avatar.id}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedAvatar === avatar.id
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="avatar"
                  value={avatar.id}
                  checked={selectedAvatar === avatar.id}
                  onChange={() => onAvatarChange(avatar.id)}
                  className="sr-only"
                />
                
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-lg text-white flex-shrink-0 ${
                    selectedAvatar === avatar.id 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gray-400'
                  }`}>
                    {avatar.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{avatar.name}</h4>
                    <p className="text-gray-600 text-sm">{avatar.description}</p>
                  </div>
                </div>
                
                {selectedAvatar === avatar.id && (
                  <div className="flex-shrink-0">
                    <div className="bg-purple-500 text-white rounded-full p-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Final Review */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-purple-900 mb-6">Conversation Setup Review</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-purple-800 mb-2">Content & Language</h4>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Context:</span> {textContent.substring(0, 100)}
                    {textContent.length > 100 && '...'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Language:</span> {selectedLanguage}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-purple-800 mb-2">Selected Avatar</h4>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  {selectedAvatarData ? (
                    <>
                      <p className="text-sm font-medium text-gray-900 mb-1">{selectedAvatarData.name}</p>
                      <p className="text-sm text-gray-600 mb-2">{selectedAvatarData.description}</p>
                      <p className="text-xs text-gray-500">ID: {selectedAvatarData.id}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No avatar selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ready Indicator */}
          {selectedAvatar && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Ready to start your conversation!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Avatar selected. Click "Start Conversation" to begin your AI interaction.
              </p>
            </div>
          )}

          {/* Missing Configuration Warning */}
          {!selectedAvatar && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Configuration Incomplete</p>
                  <p>Please select an AI avatar to proceed.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AvatarSelectionPage;