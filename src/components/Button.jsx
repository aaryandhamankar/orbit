import { motion } from 'framer-motion';


// Actually I'll use standard CSS modules or just utility classes defined in index.css + inline styles for specific overrides.
// Let's use Tailwind-like utility approach with standard CSS provided in index.css or just style objects.
// Since I haven't set up Tailwind, I'll use style objects and the classes I defined.

const Button = ({ children, variant = 'primary', onClick, className = '', ...props }) => {
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
        color: '#000', // Black text on bright gradient for readability
        boxShadow: '0 4px 25px rgba(217, 164, 88, 0.6), 0 0 15px rgba(217, 164, 88, 0.3)', // Enhanced glow
    };

    const destructiveStyle = {
        background: 'rgba(255, 77, 77, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 77, 77, 0.2)',
        color: '#ff4d4d',
    };

    const secondaryStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
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
                boxShadow: variant === 'primary'
                    ? '0 4px 15px rgba(217, 164, 88, 0.4)'
                    : (variant === 'danger' ? '0 4px 15px rgba(255, 77, 77, 0.3)' : '0 4px 15px rgba(255, 255, 255, 0.1)'),
                filter: 'brightness(0.95)'
            }}
            variants={{
                hover: {
                    boxShadow: variant === 'primary'
                        ? '0 8px 30px rgba(217, 164, 88, 0.4)'
                        : (variant === 'danger' ? '0 8px 30px rgba(255, 77, 77, 0.4)' : '0 8px 30px rgba(255, 255, 255, 0.2)'),
                    filter: 'brightness(1.15)'
                }
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ ...baseStyle, ...getVariantStyle() }}
            onClick={onClick}
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
                <div style={{ position: 'relative' }}>
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
