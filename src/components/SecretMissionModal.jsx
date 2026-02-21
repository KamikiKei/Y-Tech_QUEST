import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Target, Trophy, Timer } from 'lucide-react';
import NeonButton from './NeonButton';
import soundManager from './SoundManager';

export default function SecretMissionModal({ isOpen, onClose, onComplete }) {
  const [gameState, setGameState] = useState('intro'); // intro, playing, success, failed
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targetGoal] = useState(10);

  const spawnTarget = useCallback(() => {
    const newTarget = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
    };
    setTargets(prev => [...prev, newTarget]);
    
    // Remove target after 1.5 seconds
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 1500);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnInterval = setInterval(spawnTarget, 800);
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(spawnInterval);
          clearInterval(timerInterval);
          if (score >= targetGoal) {
            setGameState('success');
            soundManager.playGameWin();
            onComplete();
          } else {
            setGameState('failed');
            soundManager.playError();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
    };
  }, [gameState, score, targetGoal, spawnTarget, onComplete]);

  useEffect(() => {
    if (gameState === 'playing' && score >= targetGoal) {
      setGameState('success');
      soundManager.playGameWin();
      onComplete();
    }
  }, [score, targetGoal, gameState, onComplete]);

  const handleTargetClick = (targetId) => {
    soundManager.playGameTap();
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 1);
  };

  const startGame = () => {
    soundManager.playGameStart();
    setGameState('playing');
    setScore(0);
    setTimeLeft(15);
    setTargets([]);
  };

  const resetGame = () => {
    setGameState('intro');
    setScore(0);
    setTimeLeft(15);
    setTargets([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-lg relative"
          >
            {/* Close button (only in intro/results) */}
            {gameState !== 'playing' && (
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}

            <div className="bg-gradient-to-br from-purple-900/50 to-fuchsia-900/30 border-2 border-fuchsia-500/50 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-fuchsia-500/30 bg-black/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap className="w-6 h-6 text-fuchsia-400" />
                    </motion.div>
                    <h2 className="text-lg font-bold text-white">SECRET MISSION</h2>
                  </div>
                  {gameState === 'playing' && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Target className="w-4 h-4" />
                        <span className="font-mono font-bold">{score}/{targetGoal}</span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <Timer className="w-4 h-4" />
                        <span className="font-mono font-bold">{timeLeft}s</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Game area */}
              <div className="relative h-80 bg-[#0a0a15]">
                {/* Grid background */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,0,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />

                {gameState === 'intro' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center mb-4"
                    >
                      <Target className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">ターゲットハント</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      15秒以内に{targetGoal}個のターゲットをタップしてクリア！
                    </p>
                    <NeonButton onClick={startGame} variant="magenta">
                      ゲームスタート
                    </NeonButton>
                  </motion.div>
                )}

                {gameState === 'playing' && (
                  <>
                    {targets.map(target => (
                      <motion.button
                        key={target.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute w-12 h-12 -ml-6 -mt-6"
                        style={{ left: `${target.x}%`, top: `${target.y}%` }}
                        onClick={() => handleTargetClick(target.id)}
                      >
                        <motion.div
                          className="w-full h-full rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center"
                          animate={{ 
                            boxShadow: ['0 0 20px #ff00ff', '0 0 40px #00ffff', '0 0 20px #ff00ff'],
                          }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Zap className="w-6 h-6 text-white" />
                        </motion.div>
                      </motion.button>
                    ))}
                    
                    {/* Progress bar */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
                          style={{ width: `${(score / targetGoal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {gameState === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4"
                    >
                      <Trophy className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                      MISSION CLEAR!
                    </h3>
                    <p className="text-gray-400 mb-4">シークレットミッションクリア！</p>
                    <NeonButton onClick={onClose}>
                      閉じる
                    </NeonButton>
                  </motion.div>
                )}

                {gameState === 'failed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mb-4">
                      <X className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">TIME UP...</h3>
                    <p className="text-gray-500 text-sm mb-4">スコア: {score}/{targetGoal}</p>
                    <div className="flex gap-3">
                      <NeonButton onClick={resetGame} variant="magenta" size="sm">
                        リトライ
                      </NeonButton>
                      <NeonButton onClick={onClose} size="sm">
                        閉じる
                      </NeonButton>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}