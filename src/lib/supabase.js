import { createClient } from '@supabase/supabase-js'

// 環境変数から設定を読み込みます
// @ts-ignore
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
// @ts-ignore
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// Supabaseクライアントを初期化してエクスポートします
export const supabase = createClient(supabaseUrl, supabaseAnonKey)