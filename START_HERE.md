# 🎙️ Voice-Driven Q&A App - START HERE

## 🆓 **FREE VERSION - NO API KEYS REQUIRED!**

This app now works **completely FREE** with no API keys needed!

## 🚀 **Quick Start (3 Steps)**

### 1. Setup
```bash
cd voice-qa-app
./setup.sh
```

### 2. Start
```bash
npm run dev
```

### 3. Use
Visit: **http://localhost:3000**

---

## 🎉 **What Works for FREE:**
✅ **Content Extraction** - From any website  
✅ **Voice Recording** - Browser-based speech recognition  
✅ **AI Question Answering** - Smart keyword-based responses  
✅ **Text-to-Speech** - Browser voices (no API needed)  
✅ **Session Management** - Remembers your content  
✅ **Modern UI** - Responsive design with Tailwind CSS  

---

## 📱 **How to Use:**

### Step 1: Add Content
- Paste 3+ website URLs (try Wikipedia articles)
- Click "Extract Content"
- Wait for content to be processed

### Step 2: Ask Questions
- Click microphone to record your question, OR
- Type your question in the text box
- Click "Get Answer"

### Step 3: Listen to Answer
- Read the AI-generated answer
- Click speaker icon to hear it spoken
- Copy answer to clipboard if needed

---

## 🆓 **Example URLs to Test:**
```
https://en.wikipedia.org/wiki/Artificial_intelligence
https://en.wikipedia.org/wiki/Machine_learning  
https://en.wikipedia.org/wiki/Climate_change
```

## 🆓 **Example Questions:**
- "What is artificial intelligence?"
- "How does machine learning work?"
- "What are the main causes of climate change?"
- "Summarize the key points"

---

## 🌟 **Optional Upgrades (Paid):**

Want even better AI responses? Add to your `.env` file:

```env
# For advanced AI responses
OPENAI_API_KEY=your_key_here

# For premium voices  
ELEVENLABS_API_KEY=your_key_here
```

## 🛠️ **Local AI (Advanced Users):**

Install Ollama for local AI processing:
1. Visit: https://ollama.ai
2. Install Ollama
3. Run: `ollama pull llama2`
4. App will automatically use local AI!

---

## ⚡ **Performance:**
- **Content extraction:** 5-15 seconds
- **AI answers:** 1-3 seconds (free mode)
- **Voice recognition:** Real-time
- **Text-to-speech:** Instant (browser)

---

## 🐛 **Troubleshooting:**

**Backend not starting?**
```bash
cd backend
source venv/bin/activate
pip install -r requirements-minimal.txt
```

**Frontend issues?**
```bash
cd frontend  
npm install
```

**Voice not working?**
- Use Chrome, Edge, or Safari
- Grant microphone permissions
- Try typing question instead

---

## 📚 **More Info:**
- **Full docs:** README.md
- **Detailed setup:** RUNNING_INSTRUCTIONS.md
- **API docs:** http://localhost:8000/docs (when running)

---

**🎊 You're all set! Enjoy your FREE voice-driven Q&A app!**