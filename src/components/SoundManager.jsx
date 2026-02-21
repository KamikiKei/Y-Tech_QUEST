// Sound effects manager using Web Audio API
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioContext) {
      try {
        // @ts-ignore
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        // @ts-ignore
        this.audioContext = new AudioContextClass();
      } catch (e) {
        // AudioContextは使用不可能な物を晴場に
        console.warn('AudioContext is not available', e);
      }
    }
    return this.audioContext;
  }

  // Generate beep sound
  playBeep(frequency = 800, duration = 0.1, type = 'sine') {
    if (!this.enabled) return;
    const ctx = this.init();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // Button click sound
  playClick() {
    this.playBeep(600, 0.05, 'square');
    setTimeout(() => this.playBeep(800, 0.05, 'square'), 30);
  }

  // Success/Clear sound
  playSuccess() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.15, 'sine'), i * 100);
    });
  }

  // Mission clear fanfare - warm orchestral chord
  playClear() {
    if (!this.enabled) return;
    const ctx = this.init();
    const now = ctx.currentTime;
    
    // Play a warm harp-like arpeggio chord (not electronic)
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C major chord with octave
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Use sine wave for softer, warmer sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      // Gentle fade in and out like a harp/chime
      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.05);
      
      osc.start(now + i * 0.05);
      osc.stop(now + 1 + i * 0.05);
    });
    
    // Add a soft bell-like overtone
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.connect(bellGain);
    bellGain.connect(ctx.destination);
    bell.type = 'sine';
    bell.frequency.setValueAtTime(1046.5, now + 0.25); // High C
    bellGain.gain.setValueAtTime(0, now + 0.25);
    bellGain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    bell.start(now + 0.25);
    bell.stop(now + 1.3);
  }

  // QR scan beep
  playScan() {
    this.playBeep(1200, 0.08, 'square');
    setTimeout(() => this.playBeep(1600, 0.08, 'square'), 80);
  }

  // Error sound
  playError() {
    this.playBeep(200, 0.2, 'sawtooth');
  }

  // Epic fanfare for completion - sparkly, magical sound
  playEpicFanfare() {
    if (!this.enabled) return;
    const ctx = this.init();
    const now = ctx.currentTime;
    
    // Ascending sparkle arpeggio with high frequencies
    const sparkleNotes = [
      { freq: 1046.5, delay: 0 },      // C6
      { freq: 1318.5, delay: 0.08 },   // E6
      { freq: 1568, delay: 0.16 },     // G6
      { freq: 2093, delay: 0.24 },     // C7
      { freq: 2637, delay: 0.32 },     // E7
      { freq: 3136, delay: 0.4 },      // G7
    ];
    
    sparkleNotes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.15, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    });
    
    // Add bell-like overtones for sparkle
    const bells = [
      { freq: 2093, delay: 0.5 },
      { freq: 2637, delay: 0.55 },
      { freq: 3136, delay: 0.6 },
    ];
    
    bells.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1);
      
      osc.start(now + delay);
      osc.stop(now + delay + 1.2);
    });
  }

  // Secret unlock sound
  playSecretUnlock() {
    const mystery = [
      { freq: 400, delay: 0 },
      { freq: 450, delay: 100 },
      { freq: 500, delay: 200 },
      { freq: 600, delay: 300 },
      { freq: 800, delay: 450 },
      { freq: 1000, delay: 550 },
      { freq: 1200, delay: 650 },
    ];
    mystery.forEach(({ freq, delay }) => {
      setTimeout(() => this.playBeep(freq, 0.12, 'sine'), delay);
    });
  }

  // Hover sound
  playHover() {
    this.playBeep(400, 0.03, 'sine');
  }

  // Mini game sounds
  playGameStart() {
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 0.1, 'square'), i * 80);
    });
  }

  playGameWin() {
    this.playSuccess();
    setTimeout(() => this.playSuccess(), 300);
  }

  playGameTap() {
    this.playBeep(800 + Math.random() * 400, 0.05, 'square');
  }
}

export const soundManager = new SoundManager();
export default soundManager;