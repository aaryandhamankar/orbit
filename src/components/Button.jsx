import { motion } from 'framer-motion';


// Actually I'll use standard CSS modules or just utility classes defined in index.css + inline styles for specific overrides.
// Let's use Tailwind-like utility approach with standard CSS provided in index.css or just style objects.
// Since I haven't set up Tailwind, I'll use style objects and the classes I defined.

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

const Button = ({ children, variant = 'primary', sound, onClick, className = '', style, ...props }) => {
    const isPrimary = variant === 'primary';

    const baseStyle = {
        width: '100%',
        padding: '16px 24px',
        borderRadius: '36px',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
    };

    const primaryStyle = {
        background: 'var(--gradient-orbit)',
        color: 'var(--color-bg-deep)', // Dark text (from theme bg) on bright gradient
        boxShadow: 'var(--shadow-button)', // Dynamic shadow
    };

    const destructiveStyle = {
        background: 'rgba(255, 77, 77, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 77, 77, 0.2)',
        color: '#ff4d4d',
    };

    const secondaryStyle = {
        background: 'var(--color-bg-card)',
        backdropFilter: 'blur(10px)',
        border: 'var(--glass-border)',
        color: 'var(--color-text-primary)',
    };

    const getVariantStyle = () => {
        if (variant === 'primary') return primaryStyle;
        if (variant === 'danger') return destructiveStyle;
        return secondaryStyle;
    };

    const hoverStyles = {
        primary: { background: '#0d1117', color: 'var(--color-brand-primary)' },
        danger: { background: '#ff4d4d', color: '#fff' },
        secondary: { background: '#fff', color: '#0d1117' }
    };

    const currentHover = hoverStyles[variant] || hoverStyles.secondary;

    return (
        <motion.button
            whileHover="hover"
            whileTap={{
                scale: 0.95,
                boxShadow: 'none',
                filter: 'brightness(0.95)'
            }}
            variants={{
                hover: {
                    boxShadow: variant === 'primary' ? 'var(--shadow-button)' : 'none',
                    filter: 'brightness(1.05)'
                }
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ ...baseStyle, ...getVariantStyle(), ...style }}
            onClick={(e) => {
                if (navigator.vibrate) navigator.vibrate(10);

                // Determine sound type
                let soundType = 'tap';
                if (sound) soundType = sound;
                else if (variant === 'danger') soundType = 'destructive';
                // variant === 'primary' defaults to tap unless explicit sound="success" is passed

                playClickSound(soundType);
                if (onClick) onClick(e);
            }}
            className={`${className} ${isPrimary ? 'animate-breathe' : ''}`}
            {...props}
        >
            {/* Glow effect for primary */}
            {isPrimary && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 100%)',
                    opacity: 0.15,
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
            )}

            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {children}
                    <motion.div
                        variants={{
                            initial: { scaleX: 0 },
                            hover: { scaleX: 1 }
                        }}
                        initial="initial"
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            bottom: -2,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'currentColor',
                            transformOrigin: 'left',
                            borderRadius: '2px'
                        }}
                    />
                </div>
            </span>
        </motion.button>
    );
};

export default Button;
