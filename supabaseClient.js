import { createClient } from '@supabase/supabase-js'

// Забираем URL базы и публичный ключ из переменных окружения (.env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Инициализируем и экспортируем клиент для работы с базой
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
