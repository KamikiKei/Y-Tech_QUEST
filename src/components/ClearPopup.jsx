import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Rocket, Target, Trophy, Star, Flame, Sparkles } from 'lucide-react';
import soundManager from './SoundManager';

const messages = [
  { text: "ナイス！調子いいね！", icon: Zap, color: "#00f5ff" },
  { text: "その調子！", icon: Flame, color: "#ff6b00" },
  { text: "いい感じ！", icon: Star, color: "#ffd700" },
  { text: "順調に進んでる！", icon: Rocket, color: "#ff00ff" },
  { text: "サイバー探索者！", icon: Sparkles, color: "#00ff88" },
];

const lastMessages = [
  { text: "あと1つでゴール！", icon: Target, color: "#ff00ff" },
  { text: "ラストスパート！", icon: Rocket, color: "#ff6b00" },
  { text: "もう少しでクリア！", icon: Trophy, color: "#ffd700" },
];

export default function ClearPopup({ isOpen, onClose, completedCount, totalCount }) {
  const remaining = totalCount - completedCount;
  const isLastOne = remaining === 1;
  const isComplete = remaining === 0;

  useEffect(() => {
    if (isOpen) {
      soundManager.playSuccess();
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Don't show if complete (completion screen handles that)
  if (isComplete) return null;

  const messagePool = isLastOne ? lastMessages : messages;
  const selected = messagePool[Math.floor(Math.random() * messagePool.length)];
  const Icon = selected.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background flash */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
            style={{ background: `radial-gradient(circle, ${selected.color}30 0%, transparent 70%)` }}
          />

          {/* Main popup */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.1, 1], rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative"
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ 
                boxShadow: `0 0 60px ${selected.color}60, 0 0 100px ${selected.color}30`,
              }}
              animate={{
                boxShadow: [
                  `0 0 60px ${selected.color}60, 0 0 100px ${selected.color}30`,
                  `0 0 80px ${selected.color}80, 0 0 120px ${selected.color}50`,
                  `0 0 60px ${selected.color}60, 0 0 100px ${selected.color}30`,
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />

            <div 
              className="relative px-8 py-6 rounded-2xl border-2 backdrop-blur-lg"
              style={{ 
                background: `linear-gradient(135deg, ${selected.color}20 0%, #0a0a0f 100%)`,
                borderColor: `${selected.color}60`,
              }}
            >
              {/* Icon */}
              <motion.div
                className="flex justify-center mb-3"
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: `${selected.color}30` }}
                >
                  <Icon className="w-7 h-7" style={{ color: selected.color }} />
                </div>
              </motion.div>

              {/* Message */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-black text-center text-white mb-2"
              >
                {selected.text}
              </motion.h2>

              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <span className="text-sm font-mono" style={{ color: selected.color }}>
                  {completedCount} / {totalCount} CLEARED
                </span>
                {isLastOne && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-gray-400 mt-1"
                  >
                    あと1ミッションで称号獲得！
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Particle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  background: selected.color,
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 80,
                  y: Math.sin(i * 60 * Math.PI / 180) * 80,
                  opacity: 0,
                  scale: [1, 0],
                }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}