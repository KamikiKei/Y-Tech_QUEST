import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    initializePlayer();
  }, []);

  const initializePlayer = async () => {
    try {
      setIsLoading(true);
      // 1. ローカルストレージから session_id を取得
      let sessionId = localStorage.getItem('rally_session_id');
      
      if (sessionId) {
        // 2. すでにIDがあれば、Supabaseからプレイヤー情報を取得
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (data) {
          setPlayer(data);
        } else {
          // IDはあるがDBにない場合は一度リセット
          localStorage.removeItem('rally_session_id');
        }
      }
    } catch (error) {
      console.error('Player initialization failed:', error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // プレイヤー登録（最初の一回）
  // registerPlayer 関数内の修正
const registerPlayer = async (nickname) => {
  const newSessionId = crypto.randomUUID();
  const newPlayer = {
    nickname,
    session_id: newSessionId,
    completed_missions: [],
    started_at: new Date().toISOString()
  };

  // 💡 ここでも RLS が効くため、自分の session_id を持ったデータのみ insert 可能
  const { data, error } = await supabase
    .from('players')
    .insert(newPlayer)
    .select()
    .single();

  if (error) throw error;

  // キー名を 'jamquest_session' に統一
  localStorage.setItem('jamquest_session', newSessionId);
  setPlayer(data);
  return data;
};

  return (
    <AuthContext.Provider value={{ 
      player, 
      setPlayer,
      isAuthenticated: !!player, 
      isLoading,
      authError,
      registerPlayer,
      refreshPlayer: initializePlayer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);