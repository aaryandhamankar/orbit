// Simple synthetic click sound
// Advanced Audio Synthesizer
export const playClickSound = (type = 'tap') => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'success') {
        // Celebratory Major Chord (C Majorish: C5, E5, G5)
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            osc.connect(gainNode);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            osc.start(now + i * 0.05);
            osc.stop(now + 0.4);
        });
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    }
    else if (type === 'destructive') {
        // Low Thud
        const osc = audioCtx.createOscillator();
        osc.connect(gainNode);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
    else if (type === 'nav') {
        // Soft Navigation Tick
        const osc = audioCtx.createOscillator();
        osc.connect(gainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
    else {
        // Standard Tap (High Pop)
        const osc = audioCtx.createOscillator();
        osc.connect(gainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
};
