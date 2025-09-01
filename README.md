# Voice-Driven Q&A Application

Extract content from websites and ask questions using voice input with AI-powered answers.

## ⚙️ Configuration Required

**Create .env file:**
```bash
cp .env.example .env
```

**Add your API keys (keep other values as default):**

1. **Groq API (FREE & Required):**
   - Visit: https://console.groq.com/keys
   - Create account and generate API key
   - Add to .env: `GROQ_API_KEY=your_groq_key_here`

2. **ElevenLabs API (Optional for better voice):**
   - Visit: https://elevenlabs.io/docs/api-reference/authentication
   - Sign up and get API key
   - Add to .env: `ELEVENLABS_API_KEY=your_elevenlabs_key_here`

**Note:** Keep all other environment variables exactly as shown in `.env.example`

## 🚀 Quick Start

**After configuration:** (run this in the root directory)
```bash
npm run dev
```

This single command:
- ✅ Installs all dependencies (frontend + backend)
- ✅ Sets up Python virtual environment
- ✅ Starts both services

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 🔧 Manual Setup (If npm run dev fails)

**1. Install root dependencies:**
```bash
npm install
```

**2. Setup Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**3. Setup Frontend:**
```bash
cd frontend
npm install
```

**4. Run Both Services:**

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate    # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## 📋 Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://python.org/))

## ✨ Features

- 🎤 **Voice Input**: Speech recognition for questions
- 🌐 **Web Content**: Extract from any website
- 🤖 **AI Answers**: Powered by Groq (free) or OpenAI
- 🔊 **Voice Output**: Text-to-speech responses
- 📱 **Responsive**: Works on desktop and mobile

## 🎯 How to Use

1. **Add Content Sources**: Enter 2-3 website URLs in the sidebar
2. **Extract Content**: Click "Extract Content" 
3. **Ask Questions**: Use voice button or type your question
4. **Get AI Answers**: Receive spoken and text responses

## 🧩 Technology Stack

**Frontend:** React + TypeScript + Vite + Tailwind CSS  
**Backend:** Python FastAPI + AI Services  
**AI:** Groq (free), OpenAI (paid), Ollama (local)  
**Voice:** Web Speech API + ElevenLabs TTS

## 🐛 Common Issues

**"Backend not available"** → Ensure Python 3.8+ is installed  
**"Voice not working"** → Use Chrome/Safari, enable microphone  
**"No AI response"** → Add URLs first, then ask questions  

## 📱 Browser Support

**Voice features:** Chrome, Safari, Edge (latest)  
**General use:** All modern browsers

## 📄 License

MIT License - See LICENSE file for details