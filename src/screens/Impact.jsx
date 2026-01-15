import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

const CountUp = ({ to, duration = 2, delay = 0.5, suffix = "" }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString() + suffix);
    const [displayValue, setDisplayValue] = useState("0" + suffix);

    useEffect(() => {
        const controls = animate(count, to, {
            duration,
            delay,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(Math.round(latest).toLocaleString() + suffix)
        });
        return controls.stop;
    }, [to, duration, delay, count, suffix]);

    return <motion.span>{displayValue}</motion.span>;
};

const Impact = () => {
    return (
        <div style={{ paddingTop: '20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Your Impact</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>
                You didn’t just save money.<br />You reduced traffic today.
            </p>

            {/* Background Discovery Glow */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.5, 2] }}
                transition={{ duration: 3, delay: 0.2 }}
                style={{
                    position: 'fixed', top: '40%', left: '50%', x: '-50%', y: '-50%',
                    width: '400px', height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 0
                }}
            />

            {/* Main Stat Circle */}
            <div style={{
                position: 'relative',
                width: '260px',
                height: '260px',
                margin: '0 auto 40px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* SVG Progress Circles */}
                <svg width="260" height="260" viewBox="0 0 100 100" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                    {/* Background Track */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" strokeWidth="4" />
                    {/* Primary Progress */}
                    <motion.circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke="var(--color-brand-primary)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.75 }}
                        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                    />
                    {/* Secondary Progress */}
                    <motion.circle
                        cx="50" cy="50" r="38" fill="none"
                        stroke="var(--color-brand-secondary)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.6 }}
                        transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}
                    />
                </svg>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ y: -4, boxShadow: '0 0 40px rgba(217, 164, 88, 0.3)' }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel"
                    style={{
                        width: '180px',
                        height: '180px',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        boxShadow: '0 0 30px rgba(217, 164, 88, 0.2)',
                        border: '1px solid var(--color-border)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: 1 }}>
                        <CountUp to={24} />
                    </h2>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>kg CO₂ Saved</span>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{
                        y: -4,
                        borderColor: 'rgba(217, 164, 88, 0.4)',
                        backdropFilter: 'blur(25px)'
                    }}
                    transition={{ delay: 1.2 }}
                    className="glass-panel" style={{
                        padding: '20px', borderRadius: '24px',
                        border: '1px solid var(--color-border)',
                        transition: 'border-color 0.3s ease'
                    }}
                >
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Saved</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-success)' }}>
                        ₹<CountUp to={1240} delay={1.4} />
                    </p>
                </motion.div>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{
                        y: -4,
                        borderColor: 'rgba(217, 164, 88, 0.4)',
                        backdropFilter: 'blur(25px)'
                    }}
                    transition={{ delay: 1.2 }}
                    className="glass-panel" style={{
                        padding: '20px', borderRadius: '24px',
                        border: '1px solid var(--color-border)',
                        transition: 'border-color 0.3s ease'
                    }}
                >
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Rides Pooled</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        <CountUp to={12} delay={1.6} />
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{
                    y: -4,
                    borderColor: 'rgba(217, 164, 88, 0.4)',
                    backdropFilter: 'blur(25px)'
                }}
                transition={{ delay: 1.8 }}
                className="glass-panel" style={{
                    marginTop: '20px', padding: '24px', borderRadius: '24px',
                    border: '1px solid var(--color-border)',
                    transition: 'border-color 0.3s ease'
                }}
            >
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Badges Earned</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 2 }}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #FFA500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'black' }}
                    >
                        🚀
                    </motion.div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 2.1 }}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'black' }}
                    >
                        🌱
                    </motion.div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.2)' }}></div>
                </div>
            </motion.div>
        </div>
    );
};

export default Impact;
