@echo off
echo Starting Dismart Dev Servers...
echo Web:   http://localhost:3000  /  http://172.20.10.2:3000
echo Admin: http://localhost:3001  /  http://172.20.10.2:3001
echo.
start "Dismart Web" cmd /k "pnpm --filter web dev -- --hostname 0.0.0.0 --port 3000"
start "Dismart Admin" cmd /k "pnpm --filter admin dev -- --hostname 0.0.0.0 --port 3001"
