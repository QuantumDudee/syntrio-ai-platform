import React, { useState, useEffect } from 'react';
import { Languages, Globe, ToggleRight, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { lingoAPI, LanguageOption } from '../../lib/lingoApi';

interface LanguageSelectionPageProps {
  originalText: string;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  translatedText: string;
  onTranslatedTextChange: (text: string) => void;
  bypassTranslation: boolean;
  onBypassChange: (bypass: boolean) => void;
}

function LanguageSelectionPage({
  originalText,
  selectedLanguage,
  onLanguageChange,
  translatedText,
  onTranslatedTextChange,
  bypassTranslation,
  onBypassChange
}: LanguageSelectionPageProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [supportedLanguages] = useState<LanguageOption[]>(lingoAPI.getSupportedLanguages());

  const handleTranslate = async () => {
    if (!lingoAPI.isConfigured() || bypassTranslation) return;

    setIsTranslating(true);
    setError('');

    try {
      const result = await lingoAPI.translateText({
        text: originalText,
        target_language: selectedLanguage.split('-')[0], // Convert en-US to en
        source_language: 'auto'
      });

      if (result.success && result.translated_text) {
        onTranslatedTextChange(result.translated_text);
      } else {
        setError(result.error || 'Translation failed');
      }
    } catch (error) {
      setError('Translation service unavailable');
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (bypassTranslation) {
      onTranslatedTextChange(originalText);
    } else if (selectedLanguage !== 'en-US' && originalText.trim()) {
      handleTranslate();
    }
  }, [selectedLanguage, bypassTranslation]);

  const getLanguageByCode = (code: string) => {
    return supportedLanguages.find(lang => lang.code === code.split('-')[0]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Languages className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Language
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the language for your AI conversation. We support 85+ languages with automatic translation, or you can skip translation for development mode.
        </p>
      </div>

      <div className="space-y-6">
        {/* Development Mode Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Development Mode</h3>
              <p className="text-blue-700">
                Skip translation and use original text directly. Perfect for testing and development.
              </p>
            </div>
            <button
              onClick={() => onBypassChange(!bypassTranslation)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ${
                bypassTranslation ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                  bypassTranslation ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {bypassTranslation && (
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <ToggleRight className="w-5 h-5" />
                <span className="font-medium">Translation bypassed - using original text</span>
              </div>
            </div>
          )}
        </div>

        {/* Language Selection */}
        {!bypassTranslation && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Target Language</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {supportedLanguages.slice(0, 12).map((language) => (
                <button
                  key={language.code}
                  onClick={() => onLanguageChange(`${language.code}-${language.code.toUpperCase()}`)}
                  className={`p-3 border rounded-lg text-left transition-all duration-300 hover:shadow-md ${
                    selectedLanguage.startsWith(language.code)
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{language.flag}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{language.name}</div>
                      <div className="text-xs text-gray-500">{language.nativeName}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or select from all languages
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="dropdown-select w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 appearance-none cursor-pointer"
              >
                {supportedLanguages.map((language) => (
                  <option key={language.code} value={`${language.code}-${language.code.toUpperCase()}`}>
                    {language.flag} {language.name} ({language.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Text Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Text */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Text</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {originalText || 'No content entered yet...'}
              </p>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              {originalText.length} characters • English
            </div>
          </div>

          {/* Translated/Final Text */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {bypassTranslation ? 'Text for Conversation' : 'Translated Text'}
              </h3>
              {isTranslating && (
                <Loader className="w-5 h-5 animate-spin text-purple-600" />
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {bypassTranslation ? (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {originalText || 'Original text will be used...'}
                </p>
              ) : translatedText ? (
                <p className="text-gray-700 whitespace-pre-wrap">{translatedText}</p>
              ) : isTranslating ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Translating...</span>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {selectedLanguage === 'en-US' ? 'No translation needed for English' : 'Translation will appear here...'}
                </p>
              )}
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {(translatedText || originalText).length} characters • {getLanguageByCode(selectedLanguage)?.name || 'English'}
              </div>
              
              {bypassTranslation && (
                <div className="flex items-center gap-1 text-orange-600">
                  <ToggleRight className="w-4 h-4" />
                  <span className="text-sm">Bypassed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Translation Error</p>
                <p>{error}</p>
                <p className="mt-2">You can continue with the original text or enable development mode above.</p>
              </div>
            </div>
          </div>
        )}

        {/* API Configuration Notice */}
        {!lingoAPI.isConfigured() && !bypassTranslation && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Translation Service Not Configured</p>
                <p>To use translation features, please configure your Lingo.dev API key in settings, or enable development mode above to proceed with original text.</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Indicator */}
        {(bypassTranslation || translatedText || selectedLanguage === 'en-US') && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {bypassTranslation 
                  ? 'Ready to proceed with original text'
                  : selectedLanguage === 'en-US'
                  ? 'Ready to proceed with English text'
                  : 'Translation completed successfully'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LanguageSelectionPage;