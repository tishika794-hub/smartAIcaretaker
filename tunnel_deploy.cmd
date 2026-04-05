@echo off
echo Starting CarerOS Server and Tunnel...

start cmd /k "cd %~dp0\backend && python server.py"
start cmd /k "npx localtunnel --port 8000"

echo Commands launched! Look for two new terminal windows.
echo One window will show your public link (e.g. https://xxxx.loca.lt)
