import { createClient } from '@supabase/supabase-js';

// /** @type {any} */ という JSDoc を使うことで、
// TypeScript の型チェックをこの一行だけ無効化（any化）できます。
/** @type {any} */
const meta = import.meta;
const env = meta.env || process.env;

const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options) => {
      const sessionId = typeof window !== 'undefined' 
        ? localStorage.getItem('jamquest_session') || '' 
        : '';
      
      const newOptions = {
        ...options,
        headers: {
          ...options?.headers,
          'x-session-id': sessionId,
        },
      };
      return fetch(url, newOptions);
    },
  },
});