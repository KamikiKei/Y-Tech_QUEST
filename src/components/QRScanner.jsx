import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scan, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import NeonButton from './NeonButton';
import soundManager from './SoundManager';

export default function QRScanner({ isOpen, onClose, onScan }) {
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS/Android 必須設定
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;
        
        // 映像が再生開始されたらスキャンループを回す
        videoRef.current.play().then(() => {
          requestRef.current = requestAnimationFrame(tick);
        }).catch(e => {
          console.error("Play error:", e);
          setError("ビデオの再生に失敗しました");
        });
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError('カメラの使用が許可されていないか、他のアプリで使用中です');
    }
  };

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const tick = () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      // 解析用の解像度は少し下げてもOK（速度優先）
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        console.log("QR Detected:", code.data);
        soundManager.playScan();
        onScan(code.data);
        onClose();
        return; // スキャン成功したらループを抜ける
      }
    }
    
    // スキャンを継続
    requestRef.current = requestAnimationFrame(tick);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        /* className に z-[9999] を追加。さらに style で強制する */
        className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 z-[9999]"
        style={{ zIndex: 99999 }}   
        >
          <motion.div className="relative w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full" />
                <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">System: Scanning...</span>
              </div>
              <button onClick={onClose} className="text-white/50 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>

            {/* Viewfinder */}
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* UI Overlay */}
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/40">
                <div className="absolute inset-0 border border-cyan-500/30" />
                {/* 4つの角 */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-400" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-400" />
                
                {/* スキャンライン */}
                <motion.div 
                  className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_#00f5ff]"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-white text-sm mb-6">{error}</p>
                  <NeonButton onClick={() => { stopCamera(); startCamera(); }} size="sm">
                    再試行
                  </NeonButton>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const code = prompt("QRコードの値を入力:");
                if(code) { onScan(code); onClose(); }
              }}
              className="w-full mt-8 py-3 text-white/40 text-xs font-mono tracking-widest hover:text-cyan-400 transition-colors"
            >
              [ MANUAL_INPUT_MODE ]
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}