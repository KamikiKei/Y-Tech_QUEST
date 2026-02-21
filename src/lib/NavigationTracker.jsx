import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function NavigationTracker() {
  const location = useLocation();
  const { player, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && player) {
      const pathname = location.pathname;
      // パスからページ名を抽出（例: /dashboard -> dashboard）
      const pageName = pathname === '/' ? 'home' : pathname.replace(/^\//, '');

      // Supabaseにログを送信
      supabase
        .from('activity_logs')
        .insert({
          player_id: player.id,
          page_name: pageName
        })
        .then(({ error }) => {
          if (error) console.warn('Logging failed:', error);
        });
    }
  }, [location, isAuthenticated, player]);

  return null;
}