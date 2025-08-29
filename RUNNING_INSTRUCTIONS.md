# Running Instructions - Voice-Driven Q&A App (FREE VERSION)

## 🆓 FREE Quick Start (No API Keys Required!)

### 1. Setup Environment File
```bash
cd voice-qa-app
cp .env.example .env
```

**No editing required!** The app works with free AI out of the box.

### 2. Run Setup Script
```bash
./setup.sh
```

### 3. Start Application
```bash
npm run dev
```

This starts both backend (port 8000) and frontend (port 3000) concurrently.

**Visit:** http://localhost:3000

## 🎉 What Works for FREE:
- ✅ Content extraction from websites
- ✅ Voice recording (browser Speech API)
- ✅ Basic AI question answering (keyword matching)
- ✅ Text-to-speech (browser voices)
- ✅ Session management
- ✅ Modern responsive UI

---

## 🛠️ Manual Setup (Step by Step)

### Backend Setup
```bash
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### Frontend Setup (New Terminal)
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## 📋 Prerequisites Check

### Required
- ✅ **Python 3.8+**: `python3 --version`
- ✅ **Node.js 16+**: `node --version`
- ✅ **npm**: `npm --version`

### API Keys
- ✅ **OpenAI API Key**: Required for AI and voice features
- ⚠️ **Anthropic API Key**: Alternative to OpenAI
- ⚠️ **ElevenLabs API Key**: Optional for enhanced TTS

### Browser Support
- ✅ **Chrome** (recommended for voice features)
- ✅ **Edge** (voice features supported)
- ✅ **Safari** (voice features supported)
- ❌ **Firefox** (limited voice support)

---

## 🧪 Quick Test

### 1. Test Backend
```bash
curl http://localhost:8000/health
```
Expected: `{"status": "healthy", "version": "1.0.0", "services": {...}}`

### 2. Test Frontend
Visit http://localhost:3000 - you should see the application interface.

### 3. Test Complete Flow
1. Add 3 URLs (try these examples):
   ```
   https://en.wikipedia.org/wiki/Artificial_intelligence
   https://en.wikipedia.org/wiki/Machine_learning
   https://en.wikipedia.org/wiki/Deep_learning
   ```

2. Click "Extract Content" - should show extracted content

3. Ask a question: "What is artificial intelligence?"

4. Test voice recording (grant microphone permission)

---

## 🐳 Docker Option

### Quick Docker Start
```bash
docker-compose up --build
```

This starts everything in containers:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Redis: localhost:6379

---

## ⚠️ Troubleshooting

### Common Issues

**"Backend API not available"**
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**"No AI service configured"**
- Check `.env` file has `OPENAI_API_KEY=your_key_here`
- Verify API key is valid at https://platform.openai.com/

**"Speech recognition not supported"**
- Use Chrome, Edge, or Safari
- Grant microphone permissions
- Ensure HTTPS (some browsers require it)

**Dependencies issues**
```bash
# Backend dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Port already in use**
```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Performance Tips

1. **For faster startup**: Use `npm run dev` (starts both services)
2. **For development**: Run backend and frontend in separate terminals
3. **For production**: Use Docker deployment

---

## 📊 Expected Response Times

- **Content extraction**: 5-15 seconds (depends on websites)
- **AI answers**: 2-5 seconds
- **Voice transcription**: 1-3 seconds
- **Text-to-speech**: 2-4 seconds

---

## 🎯 Usage Tips

### Best URLs to Test
```
https://en.wikipedia.org/wiki/Climate_change
https://www.bbc.com/news/technology
https://techcrunch.com/latest-news
https://en.wikipedia.org/wiki/Space_exploration
```

### Good Test Questions
- "What are the main topics covered?"
- "Summarize the key points"
- "What is [specific topic] according to the content?"
- "How does [topic A] relate to [topic B]?"

### Voice Recording Tips
- Speak clearly and at normal pace
- Ensure quiet environment
- Click stop when finished speaking
- Grant microphone permissions when prompted

---

**Need help? Check README.md for detailed documentation.**