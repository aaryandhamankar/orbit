import { Car, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from '../utils/sound';

const Header = ({ userData, onLogoClick, onToggleMode, toggleTheme, currentTheme }) => {
    const isDriver = userData?.role === 'driver';
    const isDark = currentTheme === 'dark';

    // Shared Glass Style for Floating Elements
    const glassStyle = {
        background: isDark ? 'rgba(13, 17, 23, 0.75)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.4)',
        borderRadius: '24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
    };

    return (
        <header style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '460px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            padding: '0 16px',
            zIndex: 100,
            pointerEvents: 'none'
        }}>
            {/* Left Island: Brand Logo */}
            <div
                onClick={onLogoClick}
                style={{
                    ...glassStyle,
                    padding: '0 16px 0 12px',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    gap: '8px'
                }}
            >
                <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-[var(--color-brand-primary)] opacity-20 rounded-full blur-md"></div>
                    <img src="/orbit-logo-v2.png" alt="Orbit" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
                </div>
                <span style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    letterSpacing: '2px',
                    // Use solid colors instead of transparent gradients for better visibility
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    fontFamily: "'Inter', sans-serif"
                }}>ORBIT</span>
            </div>

            {/* Right Side Container */}
            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>

                {/* Center Island: Theme Toggle (Separated) */}
                <div
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        playClickSound('tap');
                        toggleTheme();
                    }}
                    style={{
                        ...glassStyle,
                        width: '56px', // Square-ish pill for toggle
                        padding: 0,
                        borderRadius: '20px', // Slightly different radius for variety
                        cursor: 'pointer'
                    }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={currentTheme}
                            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isDark ? (
                                <Moon size={20} color="var(--color-text-secondary)" />
                            ) : (
                                <Sun size={20} color="#000" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Island: Mode Toggle */}
                <div
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        playClickSound('tap');
                        onToggleMode();
                    }}
                    style={{
                        ...glassStyle,
                        padding: '0 16px', // Pill shape
                        gap: '10px',
                        cursor: 'pointer',
                        // Optional: nuanced border for active mode
                        borderColor: isDriver
                            ? (isDark ? 'rgba(217, 164, 88, 0.4)' : 'rgba(217, 164, 88, 0.6)')
                            : (isDark ? 'rgba(234, 88, 12, 0.4)' : 'rgba(234, 88, 12, 0.6)')
                    }}
                >
                    <motion.div
                        initial={false}
                        animate={{
                            rotate: isDriver ? 0 : 360,
                            scale: isDriver ? 1 : 1
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            // Consistent colored background circle
                            background: isDriver
                                ? 'rgba(217, 164, 88, 0.2)'
                                : 'rgba(234, 88, 12, 0.2)',
                        }}
                    >
                        {isDriver ? (
                            <Car size={18} color="var(--color-brand-primary)" />
                        ) : (
                            <User size={18} color="var(--color-brand-secondary)" />
                        )}
                    </motion.div>

                    <span style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        // Consistent text color logic
                        color: isDriver
                            ? 'var(--color-brand-primary)'
                            : 'var(--color-brand-secondary)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}>
                        {isDriver ? 'Host' : 'Rider'}
                    </span>
                </div>

            </div>
        </header>
    );
};

export default Header;
