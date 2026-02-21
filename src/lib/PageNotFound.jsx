import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Home } from 'lucide-react';
import NeonButton from '@/components/NeonButton';
import CyberBackground from '@/components/CyberBackground.jsx';

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const { player, isAuthenticated } = useAuth();
  const pageName = location.pathname.substring(1);

  // 管理者かどうか（必要であれば設定。今回はニックネームがAdminなら表示する例）
  const isAdmin = player?.nickname === 'Admin';

  return (
    <CyberBackground>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 bg-black/40 p-10 rounded-3xl border border-white/10 backdrop-blur-lg">
          
          {/* Error Code */}
          <div className="space-y-2">
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-fuchsia-500 opacity-80">
              404
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              System Error: Page Not Found
            </h2>
            <p className="text-gray-400 leading-relaxed">
              指定された領域 <span className="font-mono text-cyan-400">"{pageName}"</span> は、現在のネットワーク層には存在しません。
            </p>
          </div>
          
          {/* Admin Note (デバッグ用) */}
          {isAuthenticated && isAdmin && (
            <div className="mt-8 p-4 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/30 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 mt-1.5 animate-pulse"></div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-fuchsia-400 uppercase">Admin Console</p>
                  <p className="text-sm text-gray-300">
                    このページはまだ実装されていないようです。AIに指示してコンポーネントを作成してください。
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <div className="pt-6">
            <NeonButton 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 mx-auto"
            >
              <Home className="w-4 h-4" />
              DASHBOARDに戻る
            </NeonButton>
          </div>

        </div>
      </div>
    </CyberBackground>
  );
}