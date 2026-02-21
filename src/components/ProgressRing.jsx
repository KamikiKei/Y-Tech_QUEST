import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ 
  progress, 
  size = 180, 
  strokeWidth = 12, 
  showPercentage = true 
}) {
  // ぼやけ（光彩）を収めるための余白を定義
  const glowGap = 40; 
  const containerSize = size + glowGap; // 全体の描画領域を広げる
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    /* 親のdivを広げたサイズに合わせる */
    <div className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
      
      {/* 背後のぼんやりしたグロー効果（これは絶対配置なのでそのままでOK） */}
      <div className="absolute inset-10 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

      {/* SVG自体のサイズを広げて、中心(cx, cy)をずらす */}
      <svg 
        width={containerSize} 
        height={containerSize} 
        className="transform -rotate-90 relative z-10 overflow-visible"
      >
        <circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 245, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        
        <motion.circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            // overflow-visible と padding 的な余白のおかげで、この影が欠けなくなります
            filter: 'drop-shadow(0 0 12px #00f5ff) drop-shadow(0 0 6px #ff00ff)',
          }}
        />
        
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#ff00ff" />
          </linearGradient>
        </defs>
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.div
            key={progress}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="text-4xl font-black text-white tracking-tighter italic">
              {Math.round(progress)}
              <span className="text-sm ml-1 text-cyan-400 font-mono not-italic">%</span>
            </span>
            <div className="text-[10px] text-cyan-400/60 font-mono uppercase tracking-[0.2em] mt-1">
              Data Syncing
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}