import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Phone, X, ShieldCheck } from 'lucide-react';
import Button from './Button';

const SOSFeature = ({ isActive = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activationType, setActivationType] = useState(null); // 'security' | 'circle'

    const handleSOSClick = () => {
        if (navigator.vibrate) navigator.vibrate(50); // Short tactical vibrate
        setIsOpen(true);
    };

    const handleActivate = (type) => {
        // Serious feedback
        if (navigator.vibrate) navigator.vibrate([200]); // Long vibration confirmation
        setIsActivated(true);

        // Simulate "Silent Dispatch"
        setTimeout(() => {
            setIsOpen(false);
            setIsActivated(false);
        }, 3000);
    };

    if (!isActive) return null;

    return (
        <>
            {/* 1. Persistent Floating Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSOSClick}
                style={{
                    position: 'fixed',
                    bottom: '110px', // Above Nav Bar
                    right: '25px',
                    zIndex: 200, // Above everything
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(220, 38, 38, 0.1)', // Red tint
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444', // Red 500
                    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)'
                }}
            >
                <ShieldAlert size={24} />
            </motion.button>

            {/* 2. Bottom Sheet Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Dimmed Background */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0, 0, 0, 0.8)', // Darker for focus
                                backdropFilter: 'blur(4px)',
                                zIndex: 201
                            }}
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'var(--color-bg-deep)',
                                borderTopLeftRadius: '24px',
                                borderTopRightRadius: '24px',
                                padding: '24px',
                                zIndex: 202,
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
                            }}
                        >
                            {!activationType ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                            Emergency Sharing
                                        </h2>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            style={{ padding: '8px', color: 'var(--color-text-secondary)' }}
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>
                                        Share your live location and ride details instantly.
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button
                                            onClick={() => handleActivate('security')}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                borderRadius: '16px',
                                                background: 'rgba(220, 38, 38, 0.1)',
                                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                                color: '#EF4444',
                                                display: 'flex', alignItems: 'center', gap: '16px',
                                                fontSize: '1rem', fontWeight: '600'
                                            }}
                                        >
                                            <ShieldAlert size={24} />
                                            Share with Campus Security
                                        </button>

                                        <button
                                            onClick={() => handleActivate('circle')}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                borderRadius: '16px',
                                                background: 'rgba(255, 183, 3, 0.1)', // Amber tint
                                                border: '1px solid rgba(255, 183, 3, 0.3)',
                                                color: '#FBBC05', // Google Amber
                                                display: 'flex', alignItems: 'center', gap: '16px',
                                                fontSize: '1rem', fontWeight: '600'
                                            }}
                                        >
                                            <Users size={24} />
                                            Share with Safe Circle (3)
                                        </button>
                                    </div>

                                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: '500' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* Activation State - Dynamic based on Type */
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ textAlign: 'center', padding: '20px 0 40px' }}
                                >
                                    <motion.div
                                        animate={activationType === 'security'
                                            ? { boxShadow: ['0 0 20px rgba(239, 68, 68, 0.2)', '0 0 50px rgba(239, 68, 68, 0.4)', '0 0 20px rgba(239, 68, 68, 0.2)'] }
                                            : { boxShadow: ['0 0 20px rgba(251, 188, 5, 0.2)', '0 0 50px rgba(251, 188, 5, 0.4)', '0 0 20px rgba(251, 188, 5, 0.2)'] }
                                        }
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: activationType === 'security' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 188, 5, 0.1)',
                                            border: activationType === 'security' ? '2px solid #EF4444' : '2px solid #FBBC05',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 24px',
                                            color: activationType === 'security' ? '#EF4444' : '#FBBC05'
                                        }}
                                    >
                                        {activationType === 'security' ? <ShieldAlert size={40} /> : <Users size={40} />}
                                    </motion.div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                                        {activationType === 'security' ? 'Alert Sent' : 'Details Shared'}
                                    </h3>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                        {activationType === 'security'
                                            ? 'Campus Security has received your location.'
                                            : 'Live location sent to your Trusted Contacts.'}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default SOSFeature;
