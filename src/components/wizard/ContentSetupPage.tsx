import React from 'react';
import { Type, AlertCircle, CheckCircle } from 'lucide-react';

interface ContentSetupPageProps {
  textContent: string;
  onTextChange: (text: string) => void;
}

function ContentSetupPage({ textContent, onTextChange }: ContentSetupPageProps) {
  const characterCount = textContent.length;
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const isValid = textContent.trim().length >= 10;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Type className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Set Your Conversation Context
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter the topic or context for your AI conversation. This helps the AI understand what you'd like to discuss and provides better, more relevant responses.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="space-y-6">
          <div>
            <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-3">
              Conversation Topic or Context
            </label>
            <textarea
              id="textContent"
              value={textContent}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="I'd like to discuss sustainable technology trends and how they might impact my business over the next five years. I'm particularly interested in renewable energy solutions and their cost-effectiveness..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical transition-all duration-300 text-base"
              maxLength={2000}
            />
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{characterCount}/2000 characters</span>
                <span>•</span>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>~{Math.ceil(wordCount / 150)} min read</span>
              </div>
              
              {isValid ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Ready to proceed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Minimum 10 characters</span>
                </div>
              )}
            </div>
          </div>

          {/* Examples Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-4">Example Conversation Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Business Strategy",
                  example: "I want to discuss marketing strategies for my startup, focusing on digital channels and customer acquisition."
                },
                {
                  title: "Learning & Education",
                  example: "Help me understand machine learning concepts and how I can apply them to solve real-world problems."
                },
                {
                  title: "Creative Projects",
                  example: "I'm working on a creative writing project and need help developing compelling characters and storylines."
                },
                {
                  title: "Personal Development",
                  example: "I'd like to explore time management techniques and productivity strategies for remote work."
                }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => onTextChange(item.example)}
                  className="text-left p-4 bg-white border border-blue-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-300"
                >
                  <div className="font-medium text-blue-900 text-sm mb-2">{item.title}</div>
                  <div className="text-blue-700 text-sm">{item.example}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-purple-900 mb-3">💡 Tips for Better Conversations</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Be specific about your goals and what you want to achieve</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Include relevant background information or context</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Mention your experience level or any constraints</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>The more context you provide, the more helpful the AI can be</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentSetupPage;