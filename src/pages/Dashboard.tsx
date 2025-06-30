import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import WizardNavigation from '../components/WizardNavigation';
import ContentSetupPage from '../components/wizard/ContentSetupPage';
import LanguageSelectionPage from '../components/wizard/LanguageSelectionPage';
import AvatarSelectionPage from '../components/wizard/AvatarSelectionPage';
import ConversationInterface from '../components/ConversationInterface';
import ProjectManager from '../components/ProjectManager';
import LingoApiSettings from '../components/LingoApiSettings';
import TavusApiSettings from '../components/TavusApiSettings';
import { MessageCircle, Settings, FolderOpen, User, Save, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

type Tab = 'setup' | 'projects' | 'settings';
type SetupStep = 1 | 2 | 3 | 4; // Step 4 is the conversation interface

interface SetupState {
  textContent: string;
  selectedLanguage: string;
  translatedText: string;
  bypassTranslation: boolean;
  selectedAvatar: string;
}

function Dashboard() {
  const { user, updateProfile, isLoading, backupWork, restoreWork, clearWorkBackup } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('setup');
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  
  // Setup state without voice settings
  const [setupState, setSetupState] = useState<SetupState>({
    textContent: '',
    selectedLanguage: 'en-US',
    translatedText: '',
    bypassTranslation: false,
    selectedAvatar: 'r4dcf31b60e1' // Default Anna - Professional Business avatar
  });

  // Settings form state
  const [profileName, setProfileName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Work restoration state
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [restoredWork, setRestoredWork] = useState<any>(null);

  // Initialize profile name when user data loads
  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user]);

  // Check for work to restore on component mount
  useEffect(() => {
    const savedWork = restoreWork();
    if (savedWork && (savedWork.textContent || savedWork.translatedText || savedWork.selectedLanguage !== 'en-US')) {
      setRestoredWork(savedWork);
      setShowRestorePrompt(true);
    }
  }, [restoreWork]);

  // Auto-backup work in progress
  useEffect(() => {
    const backupTimer = setInterval(() => {
      if (setupState.textContent.trim() || setupState.translatedText.trim() || setupState.selectedLanguage !== 'en-US') {
        backupWork({
          ...setupState,
          currentStep,
          timestamp: Date.now()
        });
      }
    }, 30000); // Backup every 30 seconds

    return () => clearInterval(backupTimer);
  }, [setupState, currentStep, backupWork]);

  const updateSetupState = (updates: Partial<SetupState>) => {
    setSetupState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as SetupStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SetupStep);
    }
  };

  const handleBackToSetup = () => {
    setCurrentStep(3); // Go back to Avatar Selection page
  };

  const canProceedFromStep = (step: SetupStep): boolean => {
    switch (step) {
      case 1:
        return setupState.textContent.trim().length >= 10;
      case 2:
        return setupState.bypassTranslation || setupState.translatedText.trim().length > 0 || setupState.selectedLanguage === 'en-US';
      case 3:
        return !!setupState.selectedAvatar;
      default:
        return true;
    }
  };

  const handleCreateProject = () => {
    setActiveTab('setup');
    setCurrentStep(1);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSaving(true);

    if (!profileName.trim()) {
      setProfileError('Please enter your full name.');
      setIsSaving(false);
      return;
    }

    if (profileName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters long.');
      setIsSaving(false);
      return;
    }

    if (profileName.trim() === user?.name) {
      setProfileError('No changes detected.');
      setIsSaving(false);
      return;
    }

    const result = await updateProfile({ name: profileName.trim() });

    if (result.success) {
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError(result.error || 'Failed to update profile. Please try again.');
    }

    setIsSaving(false);
  };

  const handleRestoreWork = () => {
    if (restoredWork) {
      setSetupState({
        textContent: restoredWork.textContent || '',
        selectedLanguage: restoredWork.selectedLanguage || 'en-US',
        translatedText: restoredWork.translatedText || '',
        bypassTranslation: restoredWork.bypassTranslation || false,
        selectedAvatar: restoredWork.selectedAvatar || 'r4dcf31b60e1'
      });
      setCurrentStep(restoredWork.currentStep || 1);
      setActiveTab('setup');
    }
    setShowRestorePrompt(false);
    clearWorkBackup();
  };

  const handleDiscardWork = () => {
    setShowRestorePrompt(false);
    clearWorkBackup();
  };

  const handleConversationCreated = (conversationUrl: string, conversationId: string) => {
    // Move to conversation interface step
    setCurrentStep(4);
    clearWorkBackup();
  };

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      {/* Work Restoration Prompt */}
      {showRestorePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <RotateCcw className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Restore Previous Work?</h3>
                <p className="text-sm text-gray-600">We found some unsaved work from your previous session.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Found:</strong> {restoredWork?.textContent ? `${restoredWork.textContent.substring(0, 100)}${restoredWork.textContent.length > 100 ? '...' : ''}` : 'Setup progress and settings'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Saved: {restoredWork?.timestamp ? new Date(restoredWork.timestamp).toLocaleString() : 'Unknown'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestoreWork}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                Restore Work
              </button>
              <button
                onClick={handleDiscardWork}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Syntrio, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Live AI Conversations - Create meaningful conversations with AI avatars through our guided setup process
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'setup', label: 'Conversation Setup', icon: MessageCircle },
                { id: 'projects', label: 'My Projects', icon: FolderOpen },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'setup' && (
            <div>
              {/* Setup Navigation - Only show for steps 1-3 */}
              {currentStep <= 3 && (
                <WizardNavigation
                  currentStep={currentStep}
                  totalSteps={3}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  canProceed={canProceedFromStep(currentStep)}
                  isLastStep={currentStep === 3}
                  nextLabel={currentStep === 3 ? 'Start Conversation' : undefined}
                />
              )}

              {/* Setup Content */}
              <div className="mt-8">
                {currentStep === 1 && (
                  <ContentSetupPage
                    textContent={setupState.textContent}
                    onTextChange={(text) => updateSetupState({ textContent: text })}
                  />
                )}

                {currentStep === 2 && (
                  <LanguageSelectionPage
                    originalText={setupState.textContent}
                    selectedLanguage={setupState.selectedLanguage}
                    onLanguageChange={(language) => updateSetupState({ selectedLanguage: language })}
                    translatedText={setupState.translatedText}
                    onTranslatedTextChange={(text) => updateSetupState({ translatedText: text })}
                    bypassTranslation={setupState.bypassTranslation}
                    onBypassChange={(bypass) => updateSetupState({ bypassTranslation: bypass })}
                  />
                )}

                {currentStep === 3 && (
                  <AvatarSelectionPage
                    selectedAvatar={setupState.selectedAvatar}
                    onAvatarChange={(avatar) => updateSetupState({ selectedAvatar: avatar })}
                    selectedBackground="" // Removed background functionality
                    onBackgroundChange={() => {}} // Removed background functionality
                    textContent={setupState.textContent}
                    selectedLanguage={setupState.selectedLanguage}
                    voiceSettings={{}} // Empty object since voice settings removed
                  />
                )}

                {currentStep === 4 && (
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Your AI Conversation is Ready!
                      </h1>
                      <p className="text-lg text-gray-600">
                        Start your interactive conversation with your configured AI avatar.
                      </p>
                    </div>
                    
                    <ConversationInterface
                      textContent={setupState.bypassTranslation ? setupState.textContent : setupState.translatedText || setupState.textContent}
                      replicaId={setupState.selectedAvatar}
                      onConversationCreated={handleConversationCreated}
                      onBackToSetup={handleBackToSetup}
                    />
                    
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setSetupState({
                            textContent: '',
                            selectedLanguage: 'en-US',
                            translatedText: '',
                            bypassTranslation: false,
                            selectedAvatar: 'r4dcf31b60e1'
                          });
                        }}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
                      >
                        Start New Conversation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectManager onCreateProject={handleCreateProject} />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-8">
              {/* Tavus AI Conversation Settings */}
              <TavusApiSettings />

              {/* Lingo.dev Translation API Settings */}
              <LingoApiSettings />

              {/* Profile Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {profileError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-red-700 text-sm">{profileError}</div>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="text-green-700 text-sm">{profileSuccess}</div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="profileName"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                      placeholder="Enter your full name"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="profileEmail"
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email address cannot be changed. Contact support if you need to update your email.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="text-gray-600">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving || profileName.trim() === user?.name}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;