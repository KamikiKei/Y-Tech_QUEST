import React from 'react';
import { motion } from 'framer-motion';
import soundManager from './SoundManager';

export default function NeonButton({ 
  children, 
  onClick, 
  variant = 'cyan', 
  size = 'md',
  disabled = false,
  className = '' 
}) {
  const colors = {
    cyan: {
      bg: '#0891b2',     // cyan-600
      bgDark: '#0e7490', // cyan-700
      border: '#22d3ee', // cyan-400
      glow: '#00f5ff',
    },
    magenta: {
      bg: '#c026d3',     // fuchsia-600
      bgDark: '#a21caf', // fuchsia-700
      border: '#e879f9', // fuchsia-400
      glow: '#ff00ff',
    },
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-10 py-5 text-xl', // 理想の画像に合わせて少し大きく
  };

  const c = colors[variant];

  return (
    <motion.button
      onClick={(e) => {
        soundManager.playClick();
        onClick?.(e);
      }}
      disabled={disabled}
      style={{
        background: `linear-gradient(180deg, ${c.bg}, ${c.bgDark})`,
        borderColor: c.border,
        color: '#ffffff',
        textShadow: `0 0 10px ${c.glow}`,
        boxShadow: disabled ? 'none' : `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${c.glow}40`,
      }}
      className={`
        relative overflow-hidden
        border-2
        ${sizes[size]}
        font-black tracking-[0.2em] uppercase
        rounded-2xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        boxShadow: disabled ? 'none' : `0 0 30px ${c.glow}60, 0 0 60px ${c.glow}30`,
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {/* 光の反射（Shimmer）エフェクト */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent, #ffffff, transparent)`,
        }}
        animate={{ x: ['-200%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* ボタンの表面を少し明るくするオーバーレイ */}
      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}