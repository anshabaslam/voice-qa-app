@echo off
echo 🎙️ Setting up Voice-Driven Q&A Application (FREE VERSION)...

REM Check if we're in the right directory
if not exist "setup.bat" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

REM Install root dependencies first (needed for concurrently)
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    npm install
)


REM Backend setup
echo 🐍 Setting up Python backend...
cd backend

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python 3.8+ is required but not found
        echo Please install Python from https://python.org
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    %PYTHON_CMD% -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Go back to root
cd ..

REM Frontend setup
echo ⚛️  Setting up React frontend...
cd frontend

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not found
    echo Please install Node.js 16+ from https://nodejs.org/
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is required but not found
    exit /b 1
)

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Go back to root
cd ..

echo ✅ Setup complete!
echo.
echo 🆓 FREE FEATURES INCLUDED:
echo    ✅ Content extraction from websites
echo    ✅ Voice recording (browser-based)
echo    ✅ Basic AI question answering
echo    ✅ Text-to-speech (browser-based)
echo    ✅ No API keys required!
echo.
echo 🌟 OPTIONAL UPGRADES:
echo    • Add OPENAI_API_KEY to .env for better AI responses
echo    • Install Ollama (ollama.ai) for local AI
echo    • Add ELEVENLABS_API_KEY for premium voice synthesis
echo.

echo 🚀 Setup completed! Application will start automatically...
echo.
echo    Frontend: http://localhost:5173/
echo    Backend: http://localhost:8000/
echo.