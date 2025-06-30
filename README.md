# 🎭 Syntrio - Live AI Conversations

**Experience natural, interactive video conversations with AI avatars through our streamlined 3-step setup process.**

[![Built on Bolt](https://img.shields.io/badge/Built%20on-Bolt-purple?style=for-the-badge)](https://bolt.new)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Features

### 🚀 **Streamlined 3-Step Setup**
- **Content Setup**: Enter conversation topics with validation and examples
- **Language Selection**: 85+ languages with Lingo.dev translation or development mode bypass
- **Avatar Selection**: Choose from 4 professionally designed AI avatars

### 🤖 **AI Avatar Conversations**
- **Tavus CVI Integration**: Powered by Tavus Conversational Video Interface
- **Real-time Video Chat**: WebRTC-powered conversations through Daily.co
- **Natural Interactions**: Turn-taking, interruption handling, and contextual understanding
- **4 Preset Avatars**: Business Professional, Casual Friend, Educational Expert, Creative Presenter

### 🌍 **Multi-Language Support**
- **85+ Languages**: Comprehensive language support via Lingo.dev API
- **Smart Translation**: Automatic language detection and translation preview
- **Development Mode**: Bypass translation for testing and development

### 💾 **Persistent State Management**
- **Auto-save Functionality**: Prevents data loss during setup
- **Work Restoration**: Resume interrupted sessions
- **Session Management**: 24-hour secure sessions with activity tracking
- **Progress Tracking**: Visual progress indicators throughout the setup flow

### 🎨 **Modern UI/UX**
- **Purple Gradient Theme**: Beautiful, production-ready design
- **Responsive Design**: Optimized for all device sizes
- **Smooth Animations**: Micro-interactions and hover effects
- **Clean Navigation**: Intuitive wizard-style flow

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **AI Conversations**: Tavus CVI API
- **Translation**: Lingo.dev API
- **Video Chat**: Daily.co WebRTC
- **Deployment**: Netlify

## 🎯 How It Works

### 1. **Content Setup**
- Enter your conversation topic or context
- Character validation and helpful examples
- Auto-save functionality prevents data loss

### 2. **Language Selection**
- Choose from 85+ supported languages
- Real-time translation preview with Lingo.dev
- Development mode bypass for testing

### 3. **Avatar Selection**
- Select from 4 preset AI avatars:
  - **Anna** - Professional Business
  - **Nathan** - Casual Friendly
  - **Sabrina** - Educational Expert
  - **Steve** - Creative Presenter

### 4. **Start Conversation**
- Real-time video chat with AI avatar
- Natural conversation flow with context awareness
- WebRTC-powered through Daily.co integration

## 🔧 Configuration

### API Keys (Pre-configured for Demo)
The application comes pre-configured with API keys for demonstration purposes:

- **Tavus API**: Handles AI avatar conversations
- **Lingo.dev API**: Provides translation services

> **Note**: For production use, replace with your own API keys and implement proper environment variable management.

### Environment Variables
```env
# Tavus Configuration
VITE_TAVUS_API_KEY=your_tavus_api_key

# Lingo.dev Configuration  
VITE_LINGO_API_KEY=your_lingo_api_key
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── wizard/          # Setup wizard pages
│   ├── ConversationInterface.tsx
│   ├── DashboardNavbar.tsx
│   └── ...
├── context/             # React context providers
│   └── AuthContext.tsx
├── lib/                 # Utility libraries
│   ├── tavusApi.ts     # Tavus CVI integration
│   ├── lingoApi.ts     # Lingo.dev translation
│   ├── sessionManager.ts
│   └── userStorage.ts
├── pages/              # Main application pages
│   ├── Dashboard.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
└── App.tsx             # Main application component
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple to Pink gradients (`from-purple-500 to-pink-500`)
- **Background**: Dark gradients (`from-purple-900 via-blue-900 to-indigo-900`)
- **Accent**: Purple variations for UI elements
- **Text**: White and purple tones for contrast

### Typography
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable fonts with proper spacing
- **Interactive**: Hover states and micro-animations

## 🔒 Security Features

- **Session Management**: 24-hour secure sessions with automatic expiry
- **Activity Tracking**: User activity monitoring for session extension
- **Data Validation**: Input validation and sanitization
- **Secure Storage**: Local storage with encryption considerations

## 🚀 Deployment

### Netlify Deployment
The project is optimized for Netlify deployment:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Configure API keys in Netlify dashboard

### Custom Domain Setup
Follow Netlify's documentation for custom domain configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tavus**: AI avatar technology and conversational video interface
- **Lingo.dev**: Multi-language translation services
- **Daily.co**: WebRTC video chat infrastructure
- **Bolt**: Development platform and deployment tools

---

**Built with ❤️ using Bolt** - Powering the next generation of AI applications
