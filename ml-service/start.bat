@echo off
echo ============================================
echo  ExamAI — Gemini ML Service
echo ============================================

cd /d D:\jaswant\gravity-work\ml-service

REM ── Force pip cache to D: drive ──
set PIP_CACHE_DIR=D:\jaswant\.cache\pip

REM ── Create pip cache folder if missing ──
if not exist "D:\jaswant\.cache\pip" mkdir "D:\jaswant\.cache\pip"

REM ── Create venv if missing ──
if not exist venv (
  echo Creating virtual environment...
  python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing packages...
pip install --cache-dir "D:\jaswant\.cache\pip" flask flask-cors requests gunicorn

REM ── Load GEMINI_API_KEY from project .env ──
for /f "tokens=1,2 delims==" %%A in ('type ..\\.env ^| findstr /r "^VITE_GEMINI_API_KEY"') do (
  set GEMINI_API_KEY=%%B
)

REM Strip any trailing whitespace/CR from the key
set GEMINI_API_KEY=%GEMINI_API_KEY: =%

if "%GEMINI_API_KEY%"=="" (
  echo ERROR: GEMINI_API_KEY not found in .env
  pause
  exit /b 1
)

echo.
echo ============================================
echo  Starting ML service on http://localhost:5050
echo  Engine: Gemini 2.5 Flash
echo  Press Ctrl+C to stop.
echo ============================================
echo.

REM Use gunicorn for production; fallback to python for Windows (gunicorn is Linux-only)
python app.py
