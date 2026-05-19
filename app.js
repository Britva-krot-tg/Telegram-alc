api/app.js
import supabase from '@/superbase'
import { useTelegram } from '@/telegram'
import { useScoreStore } from '../stores/score'

const { user } = useTelegram()

const MY_ID = user?.id ?? 'YOUR DEV ID' // Для разработки. В вебе нет user.id — он появляется только тогда, когда приложение запущено в рамках Telegram

// Авторизация пользователя
export async function getOrCreateUser() {
  const potentialUser = await supabase
    .from('users')
    .select()
    .eq('telegram', MY_ID)

  // Проверяем, существует ли уже текущий пользователь
  if (potentialUser.data.length !== 0) {
    return potentialUser.data[0]
  }
  
  // Если нет, то создаем нового
  const newUser = {
    telegram: MY_ID,
    friends: {},
    tasks: {},
    score: 0,
  }

  await supabase.from('users').insert(newUser)
  return newUser
}

// Добавляем обновление счета у текущего пользователя
export async function updateScore(score) {
  await supabase.from('users').update({ score }).eq('telegram', MY_ID)
}

// Завершаем задачу и начисляем бонусные баллы за ее выполнение
export async function completeTask(user, task) {
  await supabase
    .from('users')
    .update({ tasks: { ...user.tasks, [task.id]: true } })
    .eq('telegram', MY_ID)

  const score = useScoreStore()
  const newScore = score.score + task.amount
  await updateScore(newScore)
  score.setScore(newScore)
}

// Регистрируем реферала
export async function registerRef(userName, refId) {
// Получаем данные пользователя, который поделился своей реферальной ссылкой
const { data } = await supabase.from('users').select().eq('telegram', refId)

  const refUser = data[0]

  // Добавляем нас в список его рефералов, а также начисляем баллы
  await supabase
    .from('users')
    .update({
      friends: { ...refUser.friends, [MY_ID]: userName },
      score: refUser.score + 50,
    })
    .eq('telegram', refId)
}

// Получаем список всех задач (он статический)
export async function getTasks() {
  const { data } = await supabase.from('tasks').select('*')

  return data
}
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
