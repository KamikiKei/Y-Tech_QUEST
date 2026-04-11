import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlayer, savePlayer } from '@/lib/storage';
import { createPageUrl } from '@/utils';
import CyberBackground from '@/components/CyberBackground';
import NeonButton from '@/components/NeonButton';

export default function Entry() {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const existing = getPlayer();
    if (existing) {
      navigate(createPageUrl('Dashboard'));
    }
    setTimeout(() => setShowInput(true), 1000);
  }, []);

  const handleStart = () => {
    if (!nickname.trim()) return;
    setIsLoading(true);
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
    navigate(createPageUrl('Dashboard'));
  };
  return (
    /* h-screen, flex, items-center, justify-center で「画面の正方形のど真ん中」を確保 */
    <div 
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url('/img/entry.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* z-10 で前面に出し、flex flex-col items-center で
         中身のロゴや入力欄を縦一列に並べて中央に揃える 
      */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center p-6 text-center">
        
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{ 
              textShadow: [
                '0 0 20px #00f5ff',
                '0 0 40px #00f5ff',
                '0 0 20px #00f5ff',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400">
              Y-Tech QUEST
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg"
          >
            南部コミセン合同新歓ミッション
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 mx-auto"
          >
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3 text-sm text-gray-300">
              <p className="leading-relaxed">
                📍 会場内の<span className="text-cyan-400 font-bold">学生団体・サークルブース</span>を回って<br/>
                🔍 各ブースの<span className="text-cyan-400 font-bold">QRコード</span>をスキャン<br/>
                🏆 全ミッションクリアで<span className="text-fuchsia-400 font-bold">称号GET！</span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Terminal Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={showInput ? { opacity: 1, scale: 1 } : {}}
          className="w-full"
        >
          <div className="bg-[#0f0f18]/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 text-left">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-gray-500 text-sm ml-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                player_init.sh
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-cyan-400 text-sm mb-2 font-mono">
                  {'>>'} ニックネームを入力
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    maxLength={20}
                    placeholder="your_name_here"
                    className="w-full bg-black/50 border border-cyan-500/50 rounded-lg px-4 py-3 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-5 bg-cyan-400"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  ※ 20文字以内で入力してください
                </p>
              </div>

              <NeonButton
                onClick={handleStart}
                disabled={!nickname.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    ミッション開始
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </NeonButton>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            会場内のサークルブースを回って<br />
            すべてのミッションをクリアしよう！
          </motion.p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-gray-600 text-xs tracking-widest uppercase">
            SYSTEM ARCHITECT: YUVR
          </p>
        </motion.div>
      </div>
    </div>
  );
}