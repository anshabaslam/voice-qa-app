# Voice-Driven Q&A Application

A modern, full-stack application that processes web content and enables voice-based question answering using React (Frontend) and Python FastAPI (Backend).

## 🚀 Quick Start

```bash
# Clone or navigate to the project directory
cd voice-qa-app

# One-command setup and start
./setup.sh
```

After setup, visit http://localhost:3000 to use the application.

## ✨ Features

### Core Functionality
- **Content Ingestion**: Extract content from 3+ web links (websites, Wikipedia, news articles)
- **Voice Input**: Capture user questions via speech recognition
- **AI-Powered Q&A**: Generate intelligent answers using OpenAI or Anthropic AI
- **Dual Output**: Text display and audio playback of answers
- **Smart Error Handling**: Graceful handling of inaccessible/unsupported links

### Advanced Features
- **Real-time Voice Visualization**: Audio level indicators during recording
- **Fallback Audio Upload**: Automatic fallback to audio file transcription
- **Session Management**: Persistent Q&A sessions with Redis caching
- **Multiple AI Providers**: Support for OpenAI GPT and Anthropic Claude
- **Multiple TTS Options**: ElevenLabs, OpenAI TTS, and browser TTS fallback
- **Responsive Design**: Modern UI with Tailwind CSS
- **Error Boundaries**: Comprehensive error handling and recovery

## 🏗️ Architecture

```
voice-qa-app/
├── frontend/          # React TypeScript app with Vite
├── backend/           # FastAPI Python app with async support
├── docs/             # Documentation files
├── .env.example      # Environment variables template
└── setup.sh          # One-command setup script
```

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- Web Speech API for voice features
- Axios for API communication

**Backend:**
- FastAPI with async/await support
- Beautiful Soup & newspaper3k for content extraction
- OpenAI & Anthropic SDKs for AI integration
- Redis for session caching
- Pydantic for data validation

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 16+ ([Download](https://nodejs.org/))
- **Python**: Version 3.8+ ([Download](https://python.org/))
- **npm**: Usually comes with Node.js

### Optional (for enhanced features)
- **Redis**: For session caching ([Installation](https://redis.io/docs/getting-started/installation/))

### Browser Compatibility
- **Voice Features**: Chrome, Edge, Safari (latest versions)
- **General Use**: All modern browsers

## 🔧 Configuration

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Required API Keys:**
   ```env
   # Choose one AI service (OpenAI recommended)
   OPENAI_API_KEY=your_openai_key_here
   # OR
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ```

3. **Optional enhancements:**
   ```env
   # For enhanced text-to-speech (optional)
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   
   # For session caching (optional)
   REDIS_URL=redis://localhost:6379
   ```

### Getting API Keys

#### OpenAI (Recommended)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account and navigate to API Keys
3. Generate new secret key
4. Add to `.env` as `OPENAI_API_KEY`

#### Anthropic (Alternative)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account and get API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

#### ElevenLabs (Optional - Enhanced TTS)
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up and get API key
3. Add to `.env` as `ELEVENLABS_API_KEY`

## 🚀 Manual Setup (Alternative to setup.sh)

### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Optional: Redis Setup
```bash
# Install Redis (macOS with Homebrew)
brew install redis
redis-server

# Or run Redis directly
redis-server
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest tests/
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] Content extraction from valid URLs
- [ ] Voice recording and transcription
- [ ] Question answering with AI
- [ ] Text-to-speech playback
- [ ] Error handling for invalid URLs
- [ ] Responsive design on different screens

## 📚 API Documentation

When the backend is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

### Key Endpoints

```http
POST /api/links          # Extract content from URLs
POST /api/ask           # Ask questions about content
POST /api/tts           # Convert text to speech
POST /api/upload-audio  # Upload audio for transcription
GET  /api/health        # Health check
```

## 🐛 Troubleshooting

### Common Issues

#### "Backend API not available"
- Ensure backend server is running on port 8000
- Check if Python virtual environment is activated
- Verify all dependencies are installed

#### "Speech recognition not supported"
- Use Chrome, Edge, or Safari (latest versions)
- Ensure microphone permissions are granted
- Check if HTTPS is required (some browsers)

#### "No AI service configured"
- Verify API keys in `.env` file
- Ensure at least one of: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Check API key validity and account limits

#### "Content extraction failed"
- Verify URLs are accessible and valid
- Some sites may block automated access
- Try different URLs (Wikipedia, news sites work well)

#### Voice recording issues
- Grant microphone permissions
- Check browser compatibility
- Try the manual question input as fallback

### Performance Issues

#### Slow content extraction
- Some websites may be slow to respond
- Large pages take longer to process
- Consider shorter articles for testing

#### High API costs
- Monitor OpenAI/Anthropic usage
- Use shorter content extracts
- Consider caching responses

## 🚀 Production Deployment

For production deployment, consider:
- Using a process manager like PM2 for Node.js
- Setting up reverse proxy with nginx
- Using environment-specific configuration
- Implementing proper logging and monitoring

## 🤝 Contributing

### Development Guidelines
- Follow existing code style (ESLint + Prettier)
- Add tests for new features
- Update documentation
- Use conventional commit messages

### Code Style
```bash
# Frontend linting
cd frontend && npm run lint

# Backend formatting
cd backend && black . && isort .
```

## 📝 Usage Examples

### Example URLs to Test
```
https://en.wikipedia.org/wiki/Artificial_intelligence
https://www.bbc.com/news (any recent article)
https://techcrunch.com (any recent article)
https://en.wikipedia.org/wiki/Climate_change
```

### Example Questions
- "What is artificial intelligence?"
- "How does climate change affect the environment?"
- "What are the main points of this article?"
- "Summarize the key findings"

## 📊 Performance Metrics

### Expected Response Times
- Content extraction: 5-15 seconds (depends on website)
- AI question answering: 2-5 seconds
- Voice transcription: 1-3 seconds
- Text-to-speech: 2-4 seconds

### Scalability Notes
- Backend handles concurrent requests
- Redis caching improves repeat performance
- Consider rate limiting for production use

## 🔒 Security Considerations

### Implemented Measures
- Input validation and sanitization
- CORS configuration
- API rate limiting (configurable)
- No sensitive data logging
- Secure audio file handling

### Production Recommendations
- Use HTTPS in production
- Implement authentication if needed
- Set up monitoring and logging
- Regular security updates

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
1. Check this README for common issues
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify API key configuration

### Reporting Issues
Please provide:
- Operating system and browser version
- Error messages or console logs
- Steps to reproduce the issue
- Configuration details (without sensitive keys)

---

**Built with ❤️ using React, FastAPI, and modern web technologies**