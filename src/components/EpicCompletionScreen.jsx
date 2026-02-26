import React, { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Trophy, Sparkles, Share2, Star } from 'lucide-react';

import NeonButton from './NeonButton';

import soundManager from './SoundManager';



// Circuit animation component

function CircuitLines() {

  const paths = [

    "M0,50 L100,50 L100,100 L200,100",

    "M400,0 L400,80 L300,80 L300,150",

    "M0,200 L150,200 L150,120 L250,120",

    "M400,250 L280,250 L280,180",

    "M200,0 L200,60 L100,60",

  ];



  return (

    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">

      {paths.map((d, i) => (

        <motion.path

          key={i}

          d={d}

          stroke="url(#circuitGradient)"

          strokeWidth="2"

          fill="none"

          initial={{ pathLength: 0, opacity: 0 }}

          animate={{ pathLength: 1, opacity: 1 }}

          transition={{ duration: 1.5, delay: i * 0.3, ease: "easeInOut" }}

        />

      ))}

      <defs>

        <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="0%">

          <stop offset="0%" stopColor="#00f5ff" />

          <stop offset="50%" stopColor="#ff00ff" />

          <stop offset="100%" stopColor="#00f5ff" />

        </linearGradient>

      </defs>

    </svg>

  );

}



// Holographic badge component

function HoloBadge({ title }) {

  return (

    <motion.div

      className="relative"

      style={{ perspective: '1000px' }}

    >

      <motion.div

        className="relative"

        animate={{ 

          rotateY: [0, 360],

        }}

        transition={{ 

          duration: 8, 

          repeat: Infinity, 

          ease: "linear" 

        }}

        style={{ transformStyle: 'preserve-3d' }}

      >

        {/* Front face */}

        <motion.div

          className="absolute inset-0 w-64 h-40 rounded-xl flex items-center justify-center"

          style={{

            background: 'linear-gradient(135deg, rgba(0,245,255,0.6) 0%, rgba(255,0,255,0.6) 50%, rgba(0,245,255,0.6) 100%)',

            border: '2px solid rgba(255,255,255,0.5)',

            backfaceVisibility: 'hidden',

          }}

        >

          {/* Holographic shimmer */}

          <motion.div

            className="absolute inset-0 rounded-xl"

            style={{

              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',

              backgroundSize: '200% 200%',

            }}

            animate={{

              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],

            }}

            transition={{ duration: 3, repeat: Infinity }}

          />

          

          {/* Content */}

          <div className="relative z-10 text-center">

            <div className="flex justify-center mb-2">

              {[...Array(3)].map((_, i) => (

                <motion.div

                  key={i}

                  animate={{ 

                    scale: [1, 1.2, 1],

                    opacity: [0.5, 1, 0.5],

                  }}

                  transition={{ 

                    duration: 1.5, 

                    delay: i * 0.2,

                    repeat: Infinity 

                  }}

                >

                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />

                </motion.div>

              ))}

            </div>

            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {title}
            </h3>

          </div>



          {/* Rainbow edge glow */}

          <motion.div

            className="absolute inset-0 rounded-xl"

            style={{

              boxShadow: '0 0 30px rgba(0,245,255,0.5), 0 0 60px rgba(255,0,255,0.3)',

            }}

            animate={{

              boxShadow: [

                '0 0 30px rgba(0,245,255,0.5), 0 0 60px rgba(255,0,255,0.3)',

                '0 0 40px rgba(255,0,255,0.5), 0 0 80px rgba(0,245,255,0.3)',

                '0 0 30px rgba(0,245,255,0.5), 0 0 60px rgba(255,0,255,0.3)',

              ],

            }}

            transition={{ duration: 2, repeat: Infinity }}

          />

        </motion.div>



        {/* Back face */}

        <motion.div

          className="w-64 h-40 rounded-xl flex items-center justify-center"

          style={{

            background: 'linear-gradient(135deg, rgba(255,0,255,0.6) 0%, rgba(0,245,255,0.6) 50%, rgba(255,0,255,0.6) 100%)',

            border: '2px solid rgba(255,255,255,0.5)',

            backfaceVisibility: 'hidden',

            transform: 'rotateY(180deg)',

          }}

        >

          {/* Back shimmer */}

          <motion.div

            className="absolute inset-0 rounded-xl"

            style={{

              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',

              backgroundSize: '200% 200%',

            }}

            animate={{

              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],

            }}

            transition={{ duration: 3, repeat: Infinity }}

          />

          

          {/* Back content */}

          <div className="relative z-10 text-center">

            <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />

            <p className="text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
              CERTIFIED
            </p>

            <p className="text-xs text-cyan-600">Y-Tech QUEST</p>

          </div>



          {/* Back glow */}

          <motion.div

            className="absolute inset-0 rounded-xl"

            style={{

              boxShadow: '0 0 30px rgba(255,0,255,0.5), 0 0 60px rgba(0,245,255,0.3)',

            }}

          />

        </motion.div>

      </motion.div>



      {/* Floating particles */}

      {[...Array(12)].map((_, i) => (

        <motion.div

          key={i}

          className="absolute w-1 h-1 rounded-full"

          style={{

            background: i % 2 === 0 ? '#00f5ff' : '#ff00ff',

            left: `${Math.random() * 100}%`,

            top: `${Math.random() * 100}%`,

          }}

          animate={{

            y: [0, -30, 0],

            opacity: [0, 1, 0],

            scale: [0, 1.5, 0],

          }}

          transition={{

            duration: 2 + Math.random(),

            delay: i * 0.2,

            repeat: Infinity,

          }}

        />

      ))}

    </motion.div>

  );

}



export default function EpicCompletionScreen({ player, onClose }) {

  const [phase, setPhase] = useState(0); // 0: blackout, 1: circuit, 2: reveal, 3: badge, 4: message



  useEffect(() => {

    soundManager.playEpicFanfare();

    

    const timers = [

      setTimeout(() => setPhase(1), 500),

      setTimeout(() => setPhase(2), 2000),

      setTimeout(() => setPhase(3), 3500),

      setTimeout(() => setPhase(4), 5000),

    ];



    return () => timers.forEach(clearTimeout);

  }, []);



  const handleShare = async () => {

    soundManager.playClick();

    const text = `🎮 Y-Tech QUEST 全ミッションクリア！\n\n称号: ${player.title}\n「${player.message}」\n\n#Y-Tech QUEST #南部コミセン合同新歓`;

    if (navigator.share) {

      try {

        await navigator.share({ text });

      } catch (err) {}

    } else {

      navigator.clipboard.writeText(text);

      alert('クリップボードにコピーしました！');

    }

  };



  return (

    <motion.div

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      className="fixed inset-0 z-50 overflow-hidden"

      style={{

        backgroundImage: `url('/img/congratulation.png')`,

        backgroundSize: 'cover',

        backgroundPosition: 'center',

      }}

    >

      {/* Phase 1: Circuit animation */}

      <AnimatePresence>

        {phase >= 1 && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            className="absolute inset-0"

          >

            <CircuitLines />

          </motion.div>

        )}

      </AnimatePresence>



      {/* Background particles */}

      {phase >= 2 && (

        <div className="absolute inset-0">

          {[...Array(50)].map((_, i) => (

            <motion.div

              key={i}

              className="absolute w-1 h-1 rounded-full bg-cyan-400"

              style={{

                left: `${Math.random() * 100}%`,

                top: `${Math.random() * 100}%`,

              }}

              initial={{ opacity: 0, scale: 0 }}

              animate={{

                opacity: [0, 0.8, 0],

                scale: [0, 1, 0],

                y: [0, -100],

              }}

              transition={{

                duration: 3,

                delay: i * 0.05,

                repeat: Infinity,

              }}

            />

          ))}

        </div>

      )}



      {/* Main content */}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">

        {/* Phase 2: Mission Complete text with slow motion */}

        <AnimatePresence>

          {phase >= 2 && (

            <motion.div

              initial={{ opacity: 0, scale: 2, y: -50 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}

              className="text-center mb-8"

            >

              <motion.div

                animate={{ 

                  textShadow: [

                    '0 0 20px #00afb5, 0 0 40px #00afb5',

                    '0 0 40px #bd00bd, 0 0 80px #bd00bd',

                    '0 0 20px #00afb5, 0 0 40px #00afb5',

                  ]

                }}

                transition={{ duration: 2, repeat: Infinity }}

              >

                <p className="text-white text-sm font-bold mb-2 drop-shadow-[0_0_8px_rgb(0, 0, 0,0.9)]">
                   ALL MISSIONS
                </p>

                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                  COMPLETE
                </h1>

              </motion.div>

            </motion.div>

          )}

        </AnimatePresence>



        {/* Phase 3: Holographic Badge */}

        <AnimatePresence>

          {phase >= 3 && (

            <motion.div

              initial={{ opacity: 0, scale: 0, rotateX: 90 }}

              animate={{ opacity: 1, scale: 1, rotateX: 0 }}

              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}

              className="mb-8"

            >

              <HoloBadge title={player.title || 'YU TECH EXPLORER'} />

            </motion.div>

          )}

        </AnimatePresence>



        {/* Phase 4: Player info and message */}

        <AnimatePresence>

          {phase >= 4 && (

            <motion.div

              initial={{ opacity: 0, y: 30 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.8 }}

              className="text-center w-full max-w-md"

            >

              {/* Player name */}

              <div className="mb-6">

                <p className="text-gray-500 text-xs tracking-wider mb-1">EXPLORER</p>

                <p className="text-xl font-bold text-white">{player.nickname}</p>

              </div>



              {/* Message */}

              <motion.div
  className="mb-8 p-4 bg-[#00033480]/70 backdrop-blur-md border-4 border-cyan-500/50" // bgを追加し、さらに背景をぼかしました
  animate={{
    borderColor: ['#ffd00080','#ffe77a80', '#ffd00080'], // 輝くグラデーションrgba(255, 224, 86, 0.5)rgba(255, 230, 120, 0.5)
  }}
  transition={{ duration: 3, repeat: Infinity }}
>
  <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
  <p className="text-lg text-white font-medium italic whitespace-pre-wrap drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
    「{player.message || 'クエストクリア！\n新たな冒険がここから始まる。'}」
  </p>
</motion.div>



              {/* Action buttons */}

              <div className="flex flex-col gap-3">

                <NeonButton onClick={handleShare} className="w-full flex items-center justify-center gap-2">

                  <Share2 className="w-5 h-5" />

                  シェアする

                </NeonButton>

                <NeonButton onClick={() => { soundManager.playClick(); onClose(); }} variant="magenta" className="w-full">

                  ダッシュボードに戻る

                </NeonButton>

              </div>



              <p className="text-gray-600 text-xs mt-4">

                📸 スクリーンショットで記念に残そう！

              </p>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </motion.div>

  );

}