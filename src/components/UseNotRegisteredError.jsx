import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * システムエラー（未登録エラー等）を表示するコンポーネント
 * * @param {Object} props
 * @param {string} props.message - 表示するエラーメッセージ
 */
const UseNotRegisteredError = ({ message }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-white">
      {/* 背景の装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-md w-full bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6 border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-500 animate-pulse" />
        </div>
        
        <h2 className="text-2xl font-black italic mb-4 uppercase tracking-tighter text-red-500">
          Critical Error
        </h2>
        
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-8">
          <p className="text-gray-300 font-mono text-xs leading-relaxed break-words">
            {/* ここで渡された message を表示します */}
            {message || 'SYSTEM_INITIALIZATION_FAILED: No detailed message available.'}
          </p>
        </div>

        <button 
          onClick={() => window.location.href = '/'}
          className="w-full py-4 bg-transparent border border-red-500/50 hover:bg-red-500/10 text-red-500 transition-all duration-300 rounded-xl font-black italic text-sm tracking-widest uppercase"
        >
          Re-initialize System
        </button>

        <p className="mt-6 text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">
          Authority: Y-Tech Quest Administrator
        </p>
      </div>
    </div>
  );
};

export default UseNotRegisteredError;