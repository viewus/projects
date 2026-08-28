@echo off
setlocal
title Projects Builder and Code Minifier
color 0b

echo ==============================================================================
echo                 PROJECTS AUTOMATED MINIFIER AND BUILDER
echo ==============================================================================
echo.
echo Source directory : %~dp0codeprojects
echo Output directory : %~dp0
echo.
echo Processing and building projects... Please wait.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build_projects.ps1"

echo.
echo ==============================================================================
echo Build script finished. Press any key to close this window...
echo ==============================================================================
pause >nul
