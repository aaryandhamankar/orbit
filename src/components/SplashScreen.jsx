import { motion } from 'framer-motion';
import { useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
    useEffect(() => {
        // Total duration matches the animation sequence + a little buffer
        const timer = setTimeout(() => {
            onComplete();
        }, 3200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: '#0D1117', // Match app background
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                {/* 1. Logo Entry & Scale */}
                <motion.img
                    src="/orbit-logo-large.png"
                    alt="Orbit Logo"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: [0.8, 1, 0.9] // Pulse effect
                    }}
                    transition={{
                        opacity: { duration: 0.6 },
                        scale: { duration: 2, times: [0, 0.6, 1], ease: "easeInOut" }
                    }}
                    style={{
                        width: '180px',
                        objectFit: 'contain',
                        zIndex: 10,
                        filter: 'drop-shadow(0 0 30px rgba(217, 164, 88, 0.8))'
                    }}
                />

                {/* 2. Revolving Particles */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, ease: "linear", repeat: 0, delay: 0.5 }} // Spin once fast
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                    }}
                >
                    <div style={{
                        position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
                        width: '8px', height: '8px',
                        background: 'var(--color-brand-primary)', borderRadius: '50%',
                        boxShadow: '0 0 10px var(--color-brand-primary)'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, 50%)',
                        width: '6px', height: '6px',
                        background: 'var(--color-brand-secondary)', borderRadius: '50%',
                        boxShadow: '0 0 10px var(--color-brand-secondary)'
                    }} />
                </motion.div>

                {/* 3. Locking Ring */}
                <motion.div
                    initial={{ scale: 1.5, opacity: 0, rotate: 45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{
                        delay: 1.8,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                        damping: 10
                    }}
                    style={{
                        position: 'absolute',
                        inset: -20,
                        border: '2px solid rgba(217, 164, 88, 0.3)',
                        borderRadius: '50%',
                        zIndex: 5
                    }}
                />
                {/* Outer faint ring */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: [0, 0.5, 0] }} // Ripple out
                    transition={{
                        delay: 1.8,
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '1px solid rgba(217, 164, 88, 0.2)',
                        borderRadius: '50%',
                        zIndex: 1
                    }}
                />
            </div>
        </motion.div>
    );
};

export default SplashScreen;
