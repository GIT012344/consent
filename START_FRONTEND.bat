@echo off
echo ====================================
echo Starting Frontend on Port 3003
echo ====================================
echo.
set PORT=3003
echo Frontend will run on http://localhost:3003
echo Press Ctrl+C to stop the server
echo.
cd /d "C:\Users\jchayapol\consent"
npm start
pause
