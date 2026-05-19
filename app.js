// app.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 1. Настройки твоей базы данных (возьми из Supabase Settings -> API)
const SUPABASE_URL = 'https://bgkyseldpfefdqlwnsjm.supabase.co' 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJna3lzZWxkcGZlZmRxbHduc2ptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE1MjgwOCwiZXhwIjoyMDk0NzI4ODA4fQ.RdQTOZCL4ox9W_IUcXuktiopgznGkmJpUGg2Ywwg0k0' 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Логика игры
let clicks = 0;
const tgId = 123456789; // В будущем тут будет реальный ID игрока из Telegram

// Функция, которая срабатывает при клике на кнопку в игре
async function handleKick() {
    clicks++;
    
    // Обновляем счетчик на экране (если на сайте есть элемент с id="score")
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = clicks;

    // Отправляем данные в Supabase (в таблицу users)
    const { data, error } = await supabase
        .from('users')
        .upsert({ telegram_id: tgId, clicks: clicks })

    if (error) {
        console.error('Ошибка сохранения в базу:', error.message)
    } else {
        console.log('Данные в Supabase обновлены! Клик:', clicks)
    }
}

// Делаем функцию доступной для кликов из HTML
window.handleKick = handleKick;
