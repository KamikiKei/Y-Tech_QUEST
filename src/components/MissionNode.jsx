import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Zap, Code, Cpu, Globe, Gamepad2, Camera, 
  Music, Palette, Apple, Calculator, BookOpen,
  Layers, Film, Video, Divide, Info, Heart, Dice6 
} from 'lucide-react';
import soundManager from './SoundManager';

const iconMap = {
  music: Music,
  gamepad: Gamepad2,
  layers: Layers,     // YUVR_TECH
  film: Film,         // アニメーション PJ
  video: Video,       // 動画 PJ
  book: BookOpen,     // 文芸 PJ
  'book-open': BookOpen, // 予備
  dice: Dice6,        // TRPG PJ用
  divide: Divide,     // Toπsion
  info: Info,         // 学生情報局
  heart: Heart,       // フェリーチェの会
  zap: Zap,
  code: Code,
  cpu: Cpu,
  globe: Globe,
  camera: Camera,
  palette: Palette,
  apple: Apple,
  calculator: Calculator,
};

export default function MissionNode({ mission, isCompleted, index, onClick, isJustCompleted }) {
  // アイコン名の小文字化とハイフンの正規化
  const iconKey = (mission.icon || 'zap').toLowerCase().replace(/\s+/g, '-');
  const Icon = iconMap[iconKey] || Zap;
  const accentColor = mission.color || '#00f5ff';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => {
        soundManager.playClick();
        onClick?.();
      }}
      className="relative cursor-pointer group"
    >
      {/* 縦の接続線（PC表示用） */}
      {index < 9 && ( // 10個あるので index 9 まで線を表示
        <div className="absolute left-1/2 -bottom-4 w-px h-8 bg-gradient-to-b from-cyan-500/30 to-transparent hidden md:block" />
      )}
      
      <motion.div
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-500
          ${isCompleted 
            ? 'bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-transparent border-cyan-400' 
            : 'bg-[#0f0f18]/80 border-gray-700/50 hover:border-cyan-500/50'
          }
        `}
        whileHover={{ scale: 1.02, y: -2 }}
        style={{
          boxShadow: isCompleted 
            ? `0 0 30px ${accentColor}40, 0 0 60px ${accentColor}20, inset 0 0 30px ${accentColor}10`
            : 'none',
        }}
      >
        {/* ⚡️ クリアした瞬間の閃光エフェクト */}
        <AnimatePresence>
          {isJustCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 rounded-xl z-20"
              style={{
                boxShadow: `0 0 50px ${accentColor}, inset 0 0 20px ${accentColor}`,
                background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`
              }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 relative z-10">
          {/* アイコン表示部 */}
          <motion.div
            className={`
              relative w-14 h-14 rounded-lg flex items-center justify-center
              ${isCompleted 
                ? 'bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/20' 
                : 'bg-gray-800/50'
              }
            `}
            animate={isCompleted ? {
              boxShadow: [
                `0 0 20px ${accentColor}40`,
                `0 0 40px ${accentColor}60`,
                `0 0 20px ${accentColor}40`,
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Check className="w-7 h-7 text-cyan-400" />
              </motion.div>
            ) : (
              <Icon className="w-7 h-7 text-gray-500 group-hover:text-cyan-400/70 transition-colors" />
            )}
            
            {/* クリア時の波紋 */}
            {isCompleted && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{ border: `2px solid ${accentColor}` }}
                animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* テキスト内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-lg truncate ${isCompleted ? 'text-white' : 'text-gray-300'}`}>
                {mission.name || mission.title}
              </h3>
              {isCompleted && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30"
                >
                  CLEARED
                </motion.span>
              )}
            </div>
            <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
              {mission.description || 'ブースを訪れてQRをスキャン'}
            </p>
          </div>

          {/* インジケーター */}
          <div className={`
            w-3 h-3 rounded-full
            ${isCompleted 
              ? 'bg-cyan-400 shadow-lg shadow-cyan-500/50' 
              : 'bg-gray-600'
            }
          `}>
            {isCompleted && (
              <motion.div
                className="w-full h-full rounded-full bg-cyan-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}