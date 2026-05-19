@echo off
chcp 65001 > nul
title Albion Coin - Full Stack Runner

:: 1. Проверяем Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден! Установи его и поставь галочку "Add Python to PATH".
    goto end
)

:: 2. Ставим зависимости
echo [1/3] Проверка и установка библиотек...
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn pydantic

echo.
echo [2/3] Запуск Python бэкенда (database.py) на порту 8000...
:: Запускаем в отдельном фоновом окне, чтобы он не вешал батник
start "Albion Backend" cmd /k "python database.py"

timeout /t 2 >nul

echo.
echo [3/3] Запуск веб-сервера (index.html) на порту 3000...
echo Игра автоматически откроется в браузере!
echo.

:: Запускаем встроенный сервер Питона на порту 3000 и сразу открываем браузер
start http://localhost:3000
python -m http.server 3000

:end
pause