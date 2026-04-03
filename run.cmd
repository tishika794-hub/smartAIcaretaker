@echo off
echo Starting CarerOS Hackathon Prototype...

echo.
echo [1/2] Starting Python Backend Server on port 8000...
start cmd /k "cd %~dp0\backend && \Users\91901\AppData\Local\Python\bin\python.exe server.py"

echo.
echo [2/2] Starting Frontend Server on port 8080...
start cmd /k "cd %~dp0\frontend && \Users\91901\AppData\Local\Python\bin\python.exe -m http.server 8080"

echo.
echo Launching your browser to view the prototype!
timeout /t 2 /nobreak > nul
start http://localhost:8080

echo.
echo Both servers are now running in separate windows.
echo Close those command prompt windows when you are done.
pause
