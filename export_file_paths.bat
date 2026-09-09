@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul

rem =========================
rem Config
rem =========================
set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "OUT_FILE=%ROOT_DIR%\src_structure.txt"

rem پوشه‌هایی که باید نادیده گرفته شوند
set "EXCLUDE_DIRS=node_modules .git dist .vscode .storybook .husky"

rem فقط این پسوندها ذخیره شوند
set "INCLUDE_EXTENSIONS=.css .scss .vue .js .ts .jsx .tsx "

rem =========================
rem Start
rem =========================
if exist "%OUT_FILE%" del "%OUT_FILE%"

call :scan "%ROOT_DIR%"

echo Scan complete. Output saved to %OUT_FILE%
pause
exit /b


:scan
set "CURRENT_DIR=%~1"

for /f "delims=" %%I in ('dir "%CURRENT_DIR%" /b /a 2^>nul') do (
    set "ITEM_NAME=%%I"
    set "ITEM_PATH=%CURRENT_DIR%\%%I"

    if exist "!ITEM_PATH!\" (
        call :is_excluded_dir "%%I"
        if "!IS_EXCLUDED!"=="0" (
            call :scan "!ITEM_PATH!"
        )
    ) else (
        call :is_included_ext "%%~xI"
        if "!IS_INCLUDED!"=="1" (
            echo !ITEM_PATH!>> "%OUT_FILE%"
        )
    )
)

exit /b


:is_excluded_dir
set "IS_EXCLUDED=0"
for %%D in (%EXCLUDE_DIRS%) do (
    if /I "%~1"=="%%D" set "IS_EXCLUDED=1"
)
exit /b


:is_included_ext
set "IS_INCLUDED=0"
for %%E in (%INCLUDE_EXTENSIONS%) do (
    if /I "%~1"=="%%E" set "IS_INCLUDED=1"
)
exit /b