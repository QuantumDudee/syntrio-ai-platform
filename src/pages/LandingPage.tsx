import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Video, Users, Settings, Upload, Star, Zap, Globe, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

function LandingPage() {
  const [demoText, setDemoText] = useState('');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto text-center w-full">
          <div className="mb-16">
            <h1 className="gradient-headline text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{ letterSpacing: '0.02em' }}>
              Meet Your AI
              <span className="gradient-headline block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ letterSpacing: '0.02em' }}>
                Conversation Partner
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Syntrio - Live AI Conversations
            </p>
            <p className="text-lg text-purple-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience natural, interactive video conversations with AI avatars. 
              Our guided 3-step setup process helps you create meaningful AI conversations tailored to your needs.
            </p>
          </div>

          {/* Demo Input */}
          <div className="max-w-4xl mx-auto mb-12 w-full">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full">
              <h3 className="text-2xl font-semibold text-white mb-6">Start Your Conversation Journey</h3>
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="What would you like to discuss with your AI partner? (e.g., 'I want to practice my presentation skills' or 'Help me brainstorm marketing ideas')..."
                className="w-full h-32 p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
              />
              <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
                <Link
                  to="/signup"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start Conversation
                </Link>
                <Link
                  to="/dashboard"
                  className="flex-1 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/30 transition-all duration-300 hover:bg-white/30 flex items-center justify-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Launch Conversation Setup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm w-full">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Streamlined AI Conversation Creation
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Our intuitive 3-step guided setup makes it easy to create personalized AI conversation experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "3-Step Guided Setup",
                description: "Streamlined flow: content setup, language selection, and avatar selection for quick conversation creation"
              },
              {
                icon: <Video className="w-8 h-8" />,
                title: "Preset AI Avatars",
                description: "Choose from 4 professionally designed AI avatars: Business Professional, Casual Friend, Educational Expert, and Creative Presenter"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Smart Translation",
                description: "85+ language support with Lingo integration, plus development mode bypass for seamless testing"
              },
              {
                icon: <Settings className="w-8 h-8" />,
                title: "Tavus CVI Integration",
                description: "Powered by Tavus Conversational Video Interface for natural, real-time AI avatar interactions"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Real-Time Conversations",
                description: "WebRTC-powered video chat with natural turn-taking, interruption handling, and contextual understanding"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Persistent State Management",
                description: "Auto-save functionality prevents data loss, with smooth navigation between setup steps and progress tracking"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/15"
              >
                <div className="text-purple-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-purple-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How Syntrio Works
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Three simple steps to create your perfect AI conversation experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              {
                step: "1",
                title: "Content Setup",
                description: "Enter your conversation topic or context with character validation and helpful examples",
                icon: <Settings className="w-8 h-8" />
              },
              {
                step: "2", 
                title: "Language Selection",
                description: "Choose from 85+ languages with translation preview or bypass for development mode",
                icon: <Globe className="w-8 h-8" />
              },
              {
                step: "3",
                title: "Avatar Selection",
                description: "Choose from 4 preset avatars and start your conversation with Tavus CVI integration",
                icon: <Video className="w-8 h-8" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">{step.step}</span>
                </div>
                <div className="text-purple-400 mb-4 flex justify-center">{step.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-purple-100">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 text-purple-400 transform translate-x-4">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center w-full">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-12 border border-white/20 w-full">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to start your AI conversation?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join the future of AI interaction with Syntrio's streamlined 3-step conversation creation process
            </p>
            <div className="flex justify-center">
              <Link
                to="/signup"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                Launch Conversation Setup
              </Link>
            </div>
            
            {/* Built on Bolt Badge */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-purple-200 text-sm">
                Built on <span className="font-semibold text-white">Bolt</span> - Powering the next generation of AI applications
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;