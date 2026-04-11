import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, User, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlayer, updatePlayer } from '@/lib/storage';
import { MISSIONS, resolveMissionByQR } from '@/lib/missions';
import { createPageUrl } from '@/utils';
import CyberBackground from '@/components/CyberBackground';
import NeonButton from '@/components/NeonButton';
import ProgressRing from '@/components/ProgressRing';
import MissionNode from '@/components/MissionNode';
import QRScanner from '@/components/QRScanner';
import MissionDetailModal from '@/components/MissionDetailModal';
import ClearPopup from '@/components/ClearPopup';
import SecretMissionModal from '@/components/SecretMissionModal';
import EpicCompletionScreen from '@/components/EpicCompletionScreen';
import soundManager from '@/components/SoundManager';

export default function Dashboard() {
  const [player, setPlayer] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showClearPopup, setShowClearPopup] = useState(false);
  const [clearedCount, setClearedCount] = useState(0);
  const [showSecretMission, setShowSecretMission] = useState(false);
  const [secretMissionCompleted, setSecretMissionCompleted] = useState(false);
  const [secretMissionShown, setSecretMissionShown] = useState(false);
  const navigate = useNavigate();
  const TITLES = [
  { title: "LEGENDARY DECODER", message: "電子の海を統べる者。お前の解析に不可能はない。" },
  { title: "NEON PHANTOM", message: "光の中に消え、影の中に現れる。実体なき英雄。" },
  { title: "BINARY EMPEROR", message: "0と1の帝王。全ての論理回路はお前の前に跪く。" },
  { title: "GHOST PROTOCOL", message: "存在しないはずの英雄。伝説の影を追え。" }
];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedPlayer = getPlayer();
    if (!storedPlayer) {
      navigate(createPageUrl('Entry'));
      return;
    }
    setPlayer(storedPlayer);
    setMissions(MISSIONS);
    if (storedPlayer.completed_at) setShowCompletion(true);
    setLoading(false);
  };

  const handleQRScan = (qrCode) => {
    if (!player) return;

    const mission = resolveMissionByQR(qrCode);
    if (!mission) {
      alert('無効なQRコードです');
      return;
    }

    if (player.completed_missions.includes(mission.id)) {
      return;
    }

    const newCompleted = [...player.completed_missions, mission.id];
    const isAllComplete = newCompleted.length >= MISSIONS.length;

    const patch = { completed_missions: newCompleted };

    // --- 称号ガチャロジック ---
    if (isAllComplete && !player.title) {
      const TITLES = [
        { title: "GOD IN THE SHELL",  message: "電子の海に魂を刻みし者。君の解析に不可能はない。" },
        { title: "NEON PHANTOM",      message: "光の中に消え、影の中に現れる。実体なきデジタル・ゴースト。" },
        { title: "BINARY EMPEROR",    message: "0と1を統べる帝王。全ての論理回路は君の前に跪く。" },
        { title: "GHOST PROTOCOL",    message: "存在しないはずの英雄。伝説の影を追う孤高のランナー。" },
        { title: "CHROMATIC DRIFTER", message: "極彩色の境界を漂う者。君の軌跡がネオンを灯す。" },
        { title: "SILICON SHAMAN",    message: "シリコンに魂を吹き込む祈祷師。電子の啓示を体現せよ。" },
      ];
      const selected = TITLES[Math.floor(Math.random() * TITLES.length)];
      patch.title = selected.title;
      patch.message = selected.message;
      patch.completed_at = new Date().toISOString();
    }

    const updatedPlayer = updatePlayer(patch);
    setPlayer(updatedPlayer);
    soundManager.playClear();

    if (isAllComplete) {
      setTimeout(() => setShowCompletion(true), 1200);
    } else {
      setClearedCount(newCompleted.length);
      setShowClearPopup(true);

      if (newCompleted.length === 5 && !secretMissionShown) {
        setTimeout(() => {
          soundManager.playSecretUnlock();
          setShowSecretMission(true);
          setSecretMissionShown(true);
        }, 2800);
      }
    }
  };

  const progress = player && missions.length > 0
    ? ((player.completed_missions?.length || 0) / missions.length) * 100
    : 0;

  if (loading) {
    return (
      <CyberBackground>
        <div className="h-screen w-full flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_#00f5ff]" />
          </motion.div>
        </div>
      </CyberBackground>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white relative">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ backgroundImage: `url('/img/dashboard.png')` }}
      />
      <div className="fixed inset-0 z-10 bg-black/60 pointer-events-none" />

      <header className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            <span className="font-black text-lg tracking-tighter uppercase italic">Y-Tech QUEST</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px] uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
            <User className="w-3 h-3" />
            <span>{player?.nickname}</span>
          </div>
        </div>
      </header>

      <div className="relative z-20 w-full max-w-md mx-auto pt-24 pb-32">
        <main className="px-6 flex flex-col items-center">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-12 w-full text-center"
          >
            <div className="relative mb-8">
              <ProgressRing progress={progress} size={180} />
            </div>
            <div className="space-y-4">
              <p className="text-cyan-500 font-mono text-sm tracking-[0.3em] uppercase opacity-70">Data Synchronization</p>
              <p className="text-2xl font-black italic">{player?.completed_missions?.length || 0} / {missions.length} UNITS</p>
            </div>
          </motion.section>

          <section className="w-full space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-fuchsia-500 pl-4 mb-8">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Mission Nodes</h2>
            </div>
            <div className="grid gap-4">
              {missions.map((mission, index) => (
                <MissionNode
                  key={mission.id}
                  mission={{ ...mission, title: mission.name }}
                  index={index}
                  isCompleted={player?.completed_missions?.includes(mission.id)}
                  isJustCompleted={justCompleted === mission.id}
                  onClick={() => setSelectedMission(mission)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6">
        <div className="w-full max-w-xs">
          <NeonButton onClick={() => setScannerOpen(true)} className="w-full h-16 rounded-2xl">
            <div className="flex items-center justify-center gap-3">
              <Scan className="w-6 h-6" />
              <span className="font-black italic">QR SCANNER</span>
            </div>
          </NeonButton>
        </div>
      </div>

      <AnimatePresence>
        {scannerOpen && (
          <QRScanner key="qr-scanner" isOpen={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleQRScan} />
        )}
        {selectedMission && (
          <MissionDetailModal 
            key="mission-modal"
            mission={selectedMission} 
            isCompleted={player?.completed_missions?.includes(selectedMission?.id)}
            isOpen={!!selectedMission}
            onClose={() => setSelectedMission(null)}
            onScan={() => { setSelectedMission(null); setScannerOpen(true); }}
          />
        )}
        {showClearPopup && (
          <ClearPopup key="clear-popup" isOpen={showClearPopup} onClose={() => setShowClearPopup(false)} completedCount={clearedCount} totalCount={missions.length} />
        )}
        {showSecretMission && (
          <SecretMissionModal key="secret-modal" isOpen={showSecretMission} onClose={() => setShowSecretMission(false)} onComplete={() => setSecretMissionCompleted(true)} />
        )}
        {showCompletion && player?.completed_at && missions.length > 0 && (
          <EpicCompletionScreen key="epic-completion" player={player} onClose={() => setShowCompletion(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}