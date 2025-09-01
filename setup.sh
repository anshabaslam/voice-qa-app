#!/bin/bash

# Voice-Driven Q&A Application Setup Script (Free Version)
echo "🎙️ Setting up Voice-Driven Q&A Application (FREE VERSION)..."

# Check if we're in the right directory
if [ ! -f "setup.sh" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install root dependencies first (needed for concurrently)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "🆓 FREE SETUP OPTIONS:"
    echo "   1. No API keys needed - uses free AI fallback"
    echo "   2. Optional: Add OPENAI_API_KEY for better AI responses"
    echo "   3. Optional: Install Ollama for local AI (ollama.ai)"
    echo ""
fi

# Backend setup
echo "🐍 Setting up Python backend..."
cd backend

# Check if Python 3.8+ is available
python_version=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
if [ -z "$python_version" ]; then
    echo "❌ Python 3.8+ is required but not found"
    echo "Please install Python from https://python.org"
    exit 1
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies (minimal version for faster setup)
echo "Installing Python dependencies (lightweight version)..."
pip install --upgrade pip

# Try minimal requirements first
if [ -f "requirements-minimal.txt" ]; then
    echo "Using minimal requirements for faster setup..."
    pip install -r requirements-minimal.txt
else
    echo "Installing full requirements..."
    pip install -r requirements.txt
fi

# Go back to root
cd ..

# Frontend setup
echo "⚛️  Setting up React frontend..."
cd frontend

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not found"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not found"
    exit 1
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Go back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "🆓 FREE FEATURES INCLUDED:"
echo "   ✅ Content extraction from websites"
echo "   ✅ Voice recording (browser-based)"
echo "   ✅ Basic AI question answering"
echo "   ✅ Text-to-speech (browser-based)"
echo "   ✅ No API keys required!"
echo ""
echo "🌟 OPTIONAL UPGRADES:"
echo "   • Add OPENAI_API_KEY to .env for better AI responses"
echo "   • Install Ollama (ollama.ai) for local AI"
echo "   • Add ELEVENLABS_API_KEY for premium voice synthesis"
echo ""

echo "🚀 Setup completed! Application will start automatically..."
echo ""
echo "   Frontend: http://localhost:5173/"
echo "   Backend: http://localhost:8000/"
echo ""