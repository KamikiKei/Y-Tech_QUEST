import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, User, Zap, RefreshCw, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// base44 ではなく標準の supabase クライアントをインポート
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
    const sessionId = localStorage.getItem('jamquest_session');
    if (!sessionId) {
      navigate(createPageUrl('Entry'));
      return;
    }

    try {
      // supabase.from().select() を使用してデータを直接取得
      const { data: players, error: pError } = await supabase
        .from('players')
        .select('*')
        .eq('session_id', sessionId);

      const { data: missionList, error: mError } = await supabase
        .from('missions')
        .select('*')
        .order('order', { ascending: true });

      if (pError || mError) throw pError || mError;

      if (!players || players.length === 0) {
        navigate(createPageUrl('Entry'));
        return;
      }

      const currentPlayer = players[0];
      const missionIds = missionList.map(m => m.id);
      
      const validCompletedMissions = (currentPlayer.completed_missions || [])
        .filter(id => missionIds.includes(id)); // 存在するミッションIDだけに絞り込む

      // 重複を削除して確実にユニークなIDだけにする処理を追加
      const uniqueCompletedMissions = [...new Set(validCompletedMissions)];

      if (uniqueCompletedMissions.length !== (currentPlayer.completed_missions || []).length) {
        await supabase
          .from('players')
          .update({ completed_missions: uniqueCompletedMissions })
          .eq('id', currentPlayer.id);
    
        currentPlayer.completed_missions = uniqueCompletedMissions;
      }

      setPlayer(currentPlayer);
      setMissions(missionList);

      if (currentPlayer.completed_at) {
        setShowCompletion(true);
      }
    } catch (err) {
      console.error('データ読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  };

// Dashboard.jsx の handleQRScan 関数
// Dashboard.jsx の handleQRScan 関数をこれに丸ごと差し替え
const handleQRScan = async (qrCode) => {
  // プレイヤー情報がない場合は中断
  if (!player) return;

  try {
    // 1. サーバー側の関数(RPC)を呼び出し、QRコードの検証と更新を一度に行う
    // これにより、フロントに正解データを持たせる必要がなくなります
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

    // 3. 成功したら最新のプレイヤーデータを再読み込み
    // これにより、UI側の「クリア済みリスト」も最新の状態に同期されます
    await loadData(); 
    
    // 4. クリア演出の実行
    soundManager.playClear();

    if (result.is_all_complete) {
      setTimeout(() => setShowCompletion(true), 1000);
    } else {
      setClearedCount(result.completed_count);
      setShowClearPopup(true);
      
      // 特定のクリア数（例: 5個）でシークレット演出を出す場合
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
    
  const mission = missions.find(m => m.qr_code === qrCode);
  if (!mission) {
    alert('無効なQRコードです');
    return;
  }

  // 1. 最新のクリア済みリストを作成
  const currentCompleted = player.completed_missions || [];
  if (currentCompleted.includes(mission.id)) return;

  const newCompletedMissions = [...new Set([...player.completed_missions, mission.id])];  
  
  // 2. 完了判定を「新しいリストの長さ」で厳密に行う
  const isAllComplete = newCompletedMissions.length === missions.length && missions.length > 0;
  const updateData = { completed_missions: newCompletedMissions };

  // Dashboard.jsx の handleQRScan 内
  // Dashboard.jsx の handleQRScan 内
  if (isAllComplete) {
    updateData.completed_at = new Date().toISOString();
    
    // 🎲 称号とメッセージの「セット」を用意する
    const gachaResults = [
      {
        title: 'LEGENDARY EXPLORER',
        message: 'すべての未知を踏破した探求者よ。\n君の好奇心が、新たな道を切り開く。'
      },
      {
        title: 'MASTER OF CREATION',
        message: '技術と表現の交差点へようこそ。\n次は君がセカイを創る番だ。'
      },
      {
        title: 'CYBER NAVIGATOR',
        message: '広大な情報の海を渡り切った航海士。\nさあ、君だけの最適解を見つけ出せ。'
      },
      {
        title: 'STORY WEAVER',
        message: '点と点が繋がり、ひとつの線になった。\nここから君の新しい物語が始まる。'
      }
    ];
    
    // ガチャを引いて、結果を変数に入れる
    const result = gachaResults[Math.floor(Math.random() * gachaResults.length)];
    
    // データベースに称号とメッセージの両方を保存！
    updateData.title = result.title;
    updateData.message = result.message;
  }

  try {
    const { data: updatedPlayer, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', player.id)
      .select()
      .single();

    if (error) throw error;

    // ステートを更新
    setPlayer(updatedPlayer);
    setClearedCount(newCompletedMissions.length);
    setJustCompleted(mission.id);

    // 演出の制御
    if (isAllComplete) {
      soundManager.playClear();
      setTimeout(() => setShowCompletion(true), 1000);
    } else {
      soundManager.playClear();
      setShowClearPopup(true);
      
      // シークレットミッションの判定（elseブロックの中に安全に収めました）
      if (newCompletedMissions.length === 5 && !secretMissionShown) {
        setTimeout(() => {
          soundManager.playSecretUnlock();
          setShowSecretMission(true);
          setSecretMissionShown(true);
        }, 2800);
      }
    } // ← elseブロックの終わり

  } catch (err) { // ← tryブロックの終わり ＋ catchの始まり
    console.error('Update Error:', err);
  }
};

  // --- 以下、提供されたリッチなデザイン部分を維持 ---
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

// Dashboard.jsx の return 部分を以下に差し替え
return (
  /* 全体のコンテナ：背景色を指定し、スクロールをブラウザに任せる */
  <div className="min-h-screen w-full bg-[#0a0a0f] text-white relative">
    
    {/* 1. 背景レイヤー：z-0 で一番奥に配置 */}
    <div 
      className="fixed inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none"
      style={{ backgroundImage: `url('/img/dashboard.png')` }}
    />
    <div className="fixed inset-0 z-10 bg-black/60 pointer-events-none" />

    {/* 2. Header：z-50 で最前面に固定 */}
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

    {/* 3. メインコンテンツ：z-20 で中間に配置。pt-24 でヘッダー分の余白を作る */}
    <div className="relative z-20 w-full max-w-md mx-auto pt-24 pb-32">
      <main className="px-6 flex flex-col items-center">
        {/* Progress Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12 w-full text-center"
        >
          <div className="relative mb-8">
            <ProgressRing progress={progress} size={180} />
          </div>
          
          <div className="space-y-4">
            <p className="text-cyan-500 font-mono text-sm tracking-[0.3em] uppercase opacity-70">
              Data Synchronization
            </p>
            <p className="text-2xl font-black italic">
              {player?.completed_missions?.length || 0} / {missions.length} UNITS
            </p>
          </div>
        </motion.section>

        {/* Mission List */}
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

    {/* 4. Floating Scan Button：z-50 でヘッダーと同じ高さに固定 */}
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

    {/* モーダル・スキャナー群：AnimatePresence で包んでアニメーションと存在を保証する */}
    <AnimatePresence>
      {scannerOpen && (
        <QRScanner 
          key="qr-scanner-modal"
          isOpen={scannerOpen} 
          onClose={() => setScannerOpen(false)} 
          onScan={handleQRScan} 
        />
      )}

      {selectedMission && (
        <MissionDetailModal 
          key="mission-detail-modal"
          mission={selectedMission} 
          isCompleted={player?.completed_missions?.includes(selectedMission?.id)}
          isOpen={!!selectedMission}
          onClose={() => setSelectedMission(null)}
          onScan={() => { setSelectedMission(null); setScannerOpen(true); }}
        />
      )}

      {showClearPopup && (
        <ClearPopup
          key="clear-popup"
          isOpen={showClearPopup}
          onClose={() => setShowClearPopup(false)}
          completedCount={clearedCount}
          totalCount={missions.length}
        />
      )}

      {showSecretMission && (
        <SecretMissionModal
          key="secret-modal"
          isOpen={showSecretMission}
          onClose={() => setShowSecretMission(false)}
          onComplete={() => setSecretMissionCompleted(true)}
        />
      )}

      {/* Dashboard.jsx の return 内 */}
{showCompletion && player?.completed_at && missions.length > 0 && (
  <EpicCompletionScreen
    key="epic-completion"
    player={player}
    onClose={() => setShowCompletion(false)}
  />
)}
    </AnimatePresence>
  </div>
);
}