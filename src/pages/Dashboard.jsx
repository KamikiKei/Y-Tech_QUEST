import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, User, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  // セッションIDの取得先を統一（localStorage のキーに注意）
  const sessionId = localStorage.getItem('jamquest_session'); 
  if (!sessionId) {
    navigate(createPageUrl('Entry'));
    return;
  }

  try {
    // 💡 修正ポイント：
    // クライアント側で重複チェックをして update を投げるのではなく、
    // 「現在の最新状態を安全に取得する」RPCを1回呼ぶだけにする。
    const { data, error } = await supabase.rpc('get_player_status_secure', {
      p_session_id: sessionId
    });

    if (error) throw error;

    // data には player 情報と missions 一覧を結合して返させるのが効率的
    setPlayer(data.player);
    setMissions(data.missions);
    
    if (data.player.completed_at) setShowCompletion(true);
  } catch (err) {
    console.error('データ同期エラー:', err);
  } finally {
    setLoading(false);
  }
};

  /**
   * 圧倒的管理者によるセキュアなスキャン処理
   * サーバー側関数(RPC)にすべての判定を任せ、フロントエンドの不正操作を封殺します。
   */
  const handleQRScan = async (qrCode) => {
    if (!player) return;

    try {
      const { data: result, error } = await supabase.rpc('complete_mission_secure', {
        p_qr_code: qrCode,
        p_player_id: player.id
      });

      if (error) {
        if (error.message.includes('INVALID_QR_CODE')) {
          alert('無効なQRコードです');
        } else {
          console.error('RPC Error:', error);
          alert('通信エラーが発生しました');
        }
        return;
      }

      // 同期と演出
      await loadData(); 
      soundManager.playClear();

      if (result.is_all_complete) {
        setTimeout(() => setShowCompletion(true), 1000);
      } else {
        setClearedCount(result.completed_count);
        setShowClearPopup(true);
        
        if (result.completed_count === 5 && !secretMissionShown) {
          setTimeout(() => {
            soundManager.playSecretUnlock();
            setShowSecretMission(true);
            setSecretMissionShown(true);
          }, 2800);
        }
      }
    } catch (err) {
      console.error('System Error:', err);
      alert('重大なシステムエラーが発生しました');
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