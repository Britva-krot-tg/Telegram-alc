//supabase-config.js
import {createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://bgkyseldpfefdqlwnsjm.supabase.co' //
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJna3lzZWxkcGZlZmRxbHduc2ptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE1MjgwOCwiZXhwIjoyMDk0NzI4ODA4fQ.RdQTOZCL4ox9W_IUcXuktiopgznGkmJpUGg2Ywwg0k0' //

//создаём клиента 
export const supabase = createClient(SUPABASE_URL,SUPABASE_ANON_KEY)
