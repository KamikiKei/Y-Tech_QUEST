import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scan, Check, Code, Cpu, Globe, Gamepad2, Camera, Music, Palette, Zap, MapPin, Users, Apple, Calculator, BookOpen, Dice6 } from 'lucide-react';
import NeonButton from './NeonButton';

const iconMap = {
  code: Code,
  cpu: Cpu,
  globe: Globe,
  gamepad: Gamepad2,
  camera: Camera,
  music: Music,
  palette: Palette,
  zap: Zap,
  apple: Apple,
  calculator: Calculator,
  'book-open': BookOpen,
  dice: Dice6,
};

export default function MissionDetailModal({ mission, isCompleted, isOpen, onClose, onScan }) {
  if (!mission) return null;
  
  const Icon = iconMap[mission.icon] || Zap;
  const accentColor = mission.color || '#00f5ff';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}15 0%, #0a0a0f 50%, #0a0a0f 100%)`,
                border: `1px solid ${accentColor}40`,
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute top-0 left-0 w-full h-32 opacity-30"
                style={{
                  background: `radial-gradient(ellipse at top, ${accentColor}40 0%, transparent 70%)`,
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="relative p-6">
                {/* Icon and status */}
                <div className="flex items-start gap-4 mb-6">
                  <motion.div
                    className="relative w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}30 0%, ${accentColor}10 100%)`,
                      border: `2px solid ${accentColor}60`,
                    }}
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
                      <Check className="w-8 h-8" style={{ color: accentColor }} />
                    ) : (
                      <Icon className="w-8 h-8" style={{ color: accentColor }} />
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isCompleted && (
                        <span 
                          className="px-2 py-0.5 text-xs font-bold rounded-full"
                          style={{ 
                            background: `${accentColor}20`,
                            color: accentColor,
                            border: `1px solid ${accentColor}40`,
                          }}
                        >
                          CLEARED
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white">{mission.name}</h2>
                  </div>
                </div>

                {/* Activity Photo */}
                {mission.photo_url && (
                  <div className="mb-6 -mx-2">
                    <div className="relative rounded-xl overflow-hidden border border-gray-700/50">
                      <img 
                        src={mission.photo_url} 
                        alt={`${mission.name}の活動写真`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-3 text-xs text-gray-300 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        活動風景
                      </span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    サークル紹介
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {mission.description || 'このサークルのブースを訪れてQRコードをスキャンしよう！'}
                  </p>
                </div>

                {/* Mission info */}
                <div className="bg-black/30 rounded-xl p-4 mb-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-400">ブースでQRコードをスキャンしてクリア</span>
                  </div>
                </div>

                {/* Action button */}
                {isCompleted ? (
                  <div className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30"
                    >
                      <Check className="w-5 h-5 text-cyan-400" />
                      <span className="text-cyan-400 font-bold">ミッションクリア済み</span>
                    </motion.div>
                  </div>
                ) : (
                  <NeonButton
                    onClick={onScan} // ← ここが直接 handleQRScan を呼んでいると、空のスキャンが走る危険がある
                    className="w-full flex items-center justify-center gap-3"
                    size="lg"
                  >
                    <Scan className="w-5 h-5" />
                      QRコードをスキャン
                  </NeonButton>
                )}
              </div>

              {/* Bottom decoration */}
              <div 
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}