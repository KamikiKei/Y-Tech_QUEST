import { createClient } from '@supabase/supabase-js';

// シニアエンジニアの解決策: 
// JavaScriptファイルで TypeScript の型アサーション(as any)は使えません。
// 代わりに JSDoc を使って、この変数を any として扱うようエディタに伝えます。

/** @type {any} */
const meta = import.meta;
const env = meta.env || process.env;

const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Critical: Supabase environment variables are missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options) => {
      // localStorageのキーはプロジェクト内で 'jamquest_session' に統一
      const sessionId = typeof window !== 'undefined' 
        ? localStorage.getItem('jamquest_session') || '' 
        : '';
      
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          // DB側の get_session_id() 関数で受け取るための独自ヘッダー
          'x-session-id': sessionId,
        },
      });
    },
  },
});