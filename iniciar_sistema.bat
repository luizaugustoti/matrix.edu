@echo off
setlocal

cd /d "%~dp0"
set "ROOT=%CD%"
set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend"

echo =====================================================
echo Iniciando EFG Sistema...
echo =====================================================

if not exist "%BACKEND_DIR%" (
    echo Pasta do backend nao encontrada: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo Pasta do frontend nao encontrada: %FRONTEND_DIR%
    pause
    exit /b 1
)

if exist "%BACKEND_DIR%\.venv\Scripts\activate.bat" (
    echo Iniciando backend com ambiente virtual...
    start "EFG Backend" /D "%BACKEND_DIR%" cmd /k "call .venv\Scripts\activate.bat && uvicorn app.main:app --reload"
) else (
    echo Iniciando backend com Python do sistema...
    start "EFG Backend" /D "%BACKEND_DIR%" cmd /k "python -m uvicorn app.main:app --reload"
)

if exist "%FRONTEND_DIR%\node_modules" (
    echo Iniciando frontend...
    start "EFG Frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev"
) else (
    echo Frontend sem dependencias. Instalando e iniciando...
    start "EFG Frontend" /D "%FRONTEND_DIR%" cmd /k "npm install && npm run dev"
)

echo.
echo Sistema iniciando em segundo plano.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Se quiser fechar, feche as janelas do terminal abertas.
endlocal
