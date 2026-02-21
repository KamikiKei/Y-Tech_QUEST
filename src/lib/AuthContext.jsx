import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

// プロジェクト全体でこのキーに命を預ける
const SESSION_KEY = 'jamquest_session';

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
      setAuthError(null);

      // 1. 統一キーでセッション取得
      let sessionId = localStorage.getItem(SESSION_KEY);
      
      if (sessionId) {
        // 2. 自分の session_id を持ったデータのみ RLS で取得
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle(); // 存在しない場合にエラーを吐かせない

        if (data) {
          setPlayer(data);
        } else {
          // DBにない場合はゾンビセッションとして破棄
          localStorage.removeItem(SESSION_KEY);
          setPlayer(null);
        }
      } else {
        setPlayer(null);
      }
    } catch (error) {
      console.error('Player initialization failed:', error);
      setAuthError(`初期化失敗: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * プレイヤー登録
   * 圧倒的管理者の流儀：先に鍵を確定させてから門を叩く
   */
  const registerPlayer = async (nickname) => {
    const newSessionId = crypto.randomUUID();
    
    // 💡 重要：通信の「前」にセット。これで supabase.js の fetch が ID を拾える
    localStorage.setItem(SESSION_KEY, newSessionId);

    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          nickname: nickname.trim(),
          session_id: newSessionId,
          completed_missions: [],
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        localStorage.removeItem(SESSION_KEY);
        throw error;
      }

      setPlayer(data);
      return data;
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      throw error;
    }
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