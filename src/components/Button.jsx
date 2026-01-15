import { motion } from 'framer-motion';


// Actually I'll use standard CSS modules or just utility classes defined in index.css + inline styles for specific overrides.
// Let's use Tailwind-like utility approach with standard CSS provided in index.css or just style objects.
// Since I haven't set up Tailwind, I'll use style objects and the classes I defined.

// Simple synthetic click sound
// Advanced Audio Synthesizer
import { playClickSound } from '../utils/sound';
// playClickSound is now used internally or potentially by other components, but we should not re-export it from here to satisfy Fast Refresh.
// If other components need it, they should import from ../utils/sound.js directly.



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
