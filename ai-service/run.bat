@echo off
setlocal

if not defined AI_SERVICE_PORT set AI_SERVICE_PORT=5000
if not defined UVICORN_WORKERS set UVICORN_WORKERS=1

python -m uvicorn main:app --host 0.0.0.0 --port %AI_SERVICE_PORT% --reload