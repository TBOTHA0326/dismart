@echo off
echo Starting Dismart Dev Servers...
echo Web:   http://localhost:3000  /  http://172.20.10.5:3000
echo Admin: http://localhost:3001  /  http://172.20.10.5:3001
echo.
start "Dismart Web" cmd /k "cd apps\web && pnpm dev"
start "Dismart Admin" cmd /k "cd apps\admin && pnpm dev"
