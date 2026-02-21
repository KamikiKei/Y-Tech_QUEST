import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// シニアエンジニアの知恵：fetchのインターセプターを「より安全」にする
// src/lib/supabase.js 内の createClient 部分
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options) => {
      const sessionId = typeof window !== 'undefined' 
        ? localStorage.getItem('jamquest_session') || '' 
        : '';
      
      // 💡 圧倒的修正：Headers オブジェクトを使って安全にマージする
      const headers = new Headers(options?.headers || {});
      headers.set('x-session-id', sessionId);
      
      return fetch(url, {
        ...options,
        headers: headers, // 消滅させずに渡す
      });
    },
  },
});