import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPlayer, savePlayer, clearPlayer } from '@/lib/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    initializePlayer();
  }, []);

  const initializePlayer = () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const stored = getPlayer();
      setPlayer(stored);
    } catch (error) {
      console.error('Player initialization failed:', error);
      setAuthError(`初期化失敗: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const registerPlayer = (nickname) => {
    const newPlayer = {
      session_id: crypto.randomUUID(),
      nickname: nickname.trim(),
      completed_missions: [],
      started_at: new Date().toISOString(),
      completed_at: null,
      title: null,
      message: null,
    };
    savePlayer(newPlayer);
    setPlayer(newPlayer);
    return newPlayer;
  };

  return (
    <AuthContext.Provider value={{
      player,
      setPlayer,
      isAuthenticated: !!player,
      isLoading,
      authError,
      registerPlayer,
      refreshPlayer: initializePlayer,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
