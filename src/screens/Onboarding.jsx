import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from 'framer-motion';
import { ChevronRight, ChevronLeft, ShieldCheck, MapPin, Clock, Car, User, Users, Lock, Sun, Moon } from 'lucide-react';
import Button, { playClickSound } from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

// Defined outside to prevent re-renders losing focus
const Step1_Welcome = ({ nextStep, toggleTheme, currentTheme }) => {
    // Physics-based Orbit Interaction
    const orbitRotation = useMotionValue(0);
    const innerOrbitRotation = useTransform(orbitRotation, r => r * -1.2); // Inner moves faster & opposite

    useEffect(() => {
        // Idle Animation: Subtle continuous rotation
        const controls = animate(orbitRotation, 360, {
            ease: "linear",
            duration: 30, // 30s per revolution (Calm)
            repeat: Infinity,
            repeatType: "loop" // Ensure it loops
        });

        return () => controls.stop();
    }, [orbitRotation]);

    const handlePanStart = () => {
        animate(orbitRotation).stop(); // Pause on interaction
        if (navigator.vibrate) navigator.vibrate(5); // Tactile feedback
    };

    const handlePan = (_, info) => {
        // "Drag" the orbit
        const current = orbitRotation.get();
        orbitRotation.set(current + info.delta.x * 0.2); // 0.2 friction for weight
    };

    const handlePanEnd = () => {
        // "Subtle Resume" - Smoothly ramp back up to speed
        const current = orbitRotation.get();
        // Determine nearest "forward" direction or just continue
        animate(orbitRotation, current + 360, {
            ease: "linear",
            duration: 30,
            repeat: Infinity,
            repeatType: "loop"
        });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 0', position: 'relative' }}>

            {/* TOP: Theme Toggle */}
            <button
                onClick={() => {
                    playClickSound('tap');
                    toggleTheme();
                }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '25px',
                    background: 'var(--color-bg-card)',
                    border: 'var(--glass-border)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 50,
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'var(--glass-shadow)'
                }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentTheme}
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentTheme === 'dark' ? (
                            <Moon size={20} color="var(--color-text-primary)" />
                        ) : (
                            <Sun size={20} color="var(--color-text-primary)" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </button>

            {/* TOP: Brand Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginTop: '20px' }}
            >
                <h1 style={{
                    fontSize: '4.5rem',
                    fontWeight: '900',
                    letterSpacing: '8px',
                    lineHeight: 1,
                    background: 'var(--gradient-text)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '12px'
                }}>
                    ORBIT
                </h1>
                <p style={{
                    color: 'var(--color-brand-primary)',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    opacity: 0.9
                }}>
                    Commute Effortlessly
                </p>
            </motion.div>

            {/* MIDDLE: Floating Logo System - INTERACTIVE */}
            <div
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
                <motion.div
                    // Draggable Area Wrapper
                    onPanStart={handlePanStart}
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                    style={{
                        position: 'relative',
                        width: '300px',
                        height: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'grab',
                        touchAction: 'none' // Important for pan
                    }}
                    whileTap={{ cursor: 'grabbing', scale: 0.98 }}
                    animate={{
                        y: [0, -15, 0] // Floating effect separate from rotation
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Background Orbit Rings */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', pointerEvents: 'none' }}>

                        {/* Outer Orbit - Controlled by MotionValue */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: '-10%',
                                left: '-10%',
                                width: '120%',
                                height: '120%',
                                borderRadius: '50%',
                                border: currentTheme === 'light'
                                    ? '1px solid rgba(217, 164, 88, 0.4)'
                                    : '1px solid rgba(230, 184, 112, 0.08)',
                                rotate: orbitRotation
                            }}
                        >
                            {/* Particle 1 */}
                            <div style={{
                                position: 'absolute',
                                top: '14.65%', left: '85.35%',
                                transform: 'translate(-50%, -50%)',
                                width: '9px', height: '9px',
                                background: 'var(--color-brand-primary)', borderRadius: '50%',
                                boxShadow: '0 0 10px var(--color-brand-primary)',
                            }} />
                        </motion.div>

                        {/* Inner Orbit - Reverse & Faster */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: '0%',
                                left: '0%',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: currentTheme === 'light'
                                    ? '1px solid rgba(209, 109, 90, 0.4)'
                                    : '1px solid rgba(209, 109, 90, 0.08)',
                                rotate: innerOrbitRotation
                            }}
                        >
                            {/* Particle 2 */}
                            <div style={{
                                position: 'absolute',
                                top: '85.35%', left: '85.35%',
                                transform: 'translate(-50%, -50%)',
                                width: '7px', height: '7px',
                                background: 'var(--color-brand-secondary)', borderRadius: '50%',
                                boxShadow: '0 0 10px var(--color-brand-secondary)',
                            }} />
                        </motion.div>
                    </div>

                    {/* Main Logo & Glow */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '220px',
                            height: '220px',
                            background: 'radial-gradient(circle, rgba(217, 164, 88, 0.3) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                            zIndex: -1
                        }}></div>
                        <img
                            src="/orbit-logo-large.png"
                            alt="Orbit Logo"
                            style={{
                                width: '180px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 0 25px rgba(217, 164, 88, 0.6))'
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* BOTTOM: Action Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ textAlign: 'left', width: '100%', paddingLeft: '40px', paddingRight: '40px', paddingBottom: '20px' }}
            >
                <h2 style={{ fontSize: '2rem', lineHeight: '1.2', marginBottom: '16px' }}>
                    Move smarter.<br />
                    <span style={{
                        color: 'var(--color-brand-primary)',
                    }}>Together.</span>
                </h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '40px', maxWidth: '300px' }}>
                    Orbit connects you with students from your campus heading the same way.
                </p>
                <Button onClick={nextStep} variant="primary">
                    Get Started <ChevronRight size={20} />
                </Button>
            </motion.div>
        </div>
    );
};

const Step2_Verification = ({ nextStep, prevStep, formData, updateFormData }) => {
    const [status, setStatus] = useState('idle'); // idle, verifying, success

    const handleVerify = () => {
        if (!formData.name || !formData.collegeId) return;
        setStatus('verifying');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                nextStep();
            }, 800);
        }, 2000);
    };

    const handleSkip = () => {
        nextStep();
    };

    return (
        <div style={{ paddingTop: '40px', position: 'relative', height: '100%', overflowY: 'auto' }}>
            <button
                onClick={prevStep}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: '8px',
                    zIndex: 10
                }}
            >
                <ChevronLeft size={28} />
            </button>

            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <div style={{
                    width: '80px', height: '80px',
                    margin: '0 auto 20px auto',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="lock"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                style={{
                                    width: '100%', height: '100%',
                                    background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-secondary)'
                                }}
                            >
                                <Lock size={32} />
                            </motion.div>
                        )}
                        {status === 'verifying' && (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, rotate: 0 }}
                                animate={{ opacity: 1, rotate: 360 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    width: '100%', height: '100%',
                                    borderRadius: '50%',
                                    border: '3px solid transparent',
                                    borderTopColor: 'var(--color-brand-primary)',
                                    borderRightColor: 'var(--color-brand-secondary)',
                                }}
                                transition={{
                                    opacity: { duration: 0.2 },
                                    rotate: { repeat: Infinity, duration: 1, ease: 'linear' }
                                }}
                            />
                        )}
                        {status === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{
                                    width: '100%', height: '100%',
                                    background: 'rgba(217, 164, 88, 0.2)', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid var(--color-brand-primary)',
                                    color: 'var(--color-brand-primary)',
                                    boxShadow: '0 0 20px rgba(217, 164, 88, 0.4)'
                                }}
                            >
                                <ShieldCheck size={40} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <h2>{status === 'success' ? 'Verified!' : 'Campus Verification'}</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
                    {status === 'verifying' ? 'Verifying credentials...' : 'Join the trusted network (Optional)'}
                </p>
            </div>

            {status === 'idle' && (
                <div style={{ marginBottom: '30px' }}>
                    <Input
                        label="Full Name"
                        placeholder="e.g. Aaryan D."
                        icon={User}
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                    />
                    <Input
                        label="College Email / ID"
                        placeholder="e.g. aaryan@college.edu"
                        icon={ShieldCheck}
                        value={formData.collegeId}
                        onChange={(e) => updateFormData('collegeId', e.target.value)}
                    />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button
                    onClick={handleVerify}
                    variant="primary"
                    disabled={status !== 'idle' || !formData.name || !formData.collegeId}
                >
                    {status === 'idle' ? 'Verify Identity' : (status === 'verifying' ? 'Verifying...' : 'Verified')}
                </Button>

                {status === 'idle' && (
                    <button
                        onClick={handleSkip}
                        style={{
                            padding: '12px',
                            color: 'var(--color-text-secondary)',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            opacity: 0.8
                        }}
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    );
};

const Step3_Setup = ({ nextStep, prevStep, formData, updateFormData }) => (
    <div style={{ paddingTop: '40px', paddingBottom: '100px', overflowY: 'auto', height: '100%', position: 'relative' }}>
        <button
            onClick={prevStep}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '8px',
                zIndex: 10
            }}
        >
            <ChevronLeft size={28} />
        </button>
        <h2 style={{ marginBottom: '30px' }}>Your Daily Commute</h2>

        <Input
            label="Pickup Location"
            placeholder="e.g., Baner"
            icon={MapPin}
            value={formData.from}
            onChange={(e) => updateFormData('from', e.target.value)}
        />
        <Input
            label="Dropoff Location"
            placeholder="e.g., Loni"
            icon={MapPin}
            value={formData.to}
            onChange={(e) => updateFormData('to', e.target.value)}
        />

        <Select
            label="Departure Time"
            placeholder="Select Time"
            icon={Clock}
            value={formData.time}
            onChange={(e) => updateFormData('time', e.target.value)}
            options={[
                { value: "07:00 AM", label: "07:00 AM" },
                { value: "07:30 AM", label: "07:30 AM" },
                { value: "08:00 AM", label: "08:00 AM" },
                { value: "08:30 AM", label: "08:30 AM" },
                { value: "09:00 AM", label: "09:00 AM" },
                { value: "09:30 AM", label: "09:30 AM" },
                { value: "10:00 AM", label: "10:00 AM" },
                { value: "10:30 AM", label: "10:30 AM" },
                { value: "11:00 AM", label: "11:00 AM" },
                { value: "11:30 AM", label: "11:30 AM" },
                { value: "12:00 PM", label: "12:00 PM" },
                { value: "12:30 PM", label: "12:30 PM" },
                { value: "01:00 PM", label: "01:00 PM" },
                { value: "05:00 PM", label: "05:00 PM" },
                { value: "05:30 PM", label: "05:30 PM" },
                { value: "06:00 PM", label: "06:00 PM" }
            ]}
        />

        <Select
            label="Seats Required"
            placeholder="1 Seat"
            icon={Users}
            value={formData.seats}
            onChange={(e) => updateFormData('seats', e.target.value)}
            options={[
                { value: "1", label: "1 Seat" },
                { value: "2", label: "2 Seats" },
                { value: "3", label: "3 Seats" },
                { value: "4", label: "4 Seats" },
                { value: "5", label: "5 Seats" },
                { value: "6", label: "6 Seats" },
                { value: "7", label: "7 Seats" }
            ]}
        />

        <div style={{ marginTop: '20px' }}>
            <Button onClick={nextStep} variant="primary">
                Continue
            </Button>
        </div>
    </div>
);

const Step4_Mode = ({ handleComplete, prevStep }) => {
    const [role, setRole] = useState(null);

    const variants = {
        idle: (custom) => ({
            x: 0,
            y: custom === 'driver' ? -110 : 110,
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            zIndex: 1
        }),
        selected: {
            x: 0,
            y: 0,
            scale: 1.2,
            opacity: 1,
            filter: 'blur(0px)',
            zIndex: 10,
            boxShadow: '0 0 30px rgba(255,255,255,0.1)'
        },
        unselected: (custom) => ({
            x: 0,
            y: custom === 'driver' ? -400 : 400,
            scale: 0.5,
            opacity: 0,
            filter: 'blur(20px)',
            zIndex: 0
        })
    };

    return (
        <div style={{ height: '100%', padding: '20px 0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button
                onClick={prevStep}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: '8px',
                    zIndex: 20
                }}
            >
                <ChevronLeft size={28} />
            </button>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>How do you roll?</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '40px' }}>
                Tap to choose your orbit
            </p>

            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>

                {/* Connecting Line Animation */}
                <svg style={{ position: 'absolute', top: '50%', left: '50%', width: '2px', height: '200px', overflow: 'visible', zIndex: 0, transform: 'translateX(-1px)' }}>
                    {role && (
                        <motion.line
                            x1="0" y1="0" x2="0" y2="200"
                            stroke="url(#lineGradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        />
                    )}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={role === 'driver' ? '#E6B870' : '#D16D5A'} />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Driver Circle */}
                <motion.div
                    custom="driver"
                    variants={variants}
                    initial="idle"
                    animate={role === 'driver' ? 'selected' : (role === 'rider' ? 'unselected' : 'idle')}
                    onClick={() => {
                        playClickSound('tap');
                        setRole('driver');
                    }}
                    whileHover={{ scale: role ? 1.3 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'absolute',
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'rgba(230, 184, 112, 0.1)',
                        border: '1px solid rgba(230, 184, 112, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        padding: '10px'
                    }}
                >
                    <Car size={32} color="#E6B870" style={{ marginBottom: '4px' }} />
                    <span style={{ color: '#E6B870', fontWeight: '700', letterSpacing: '1px', fontSize: '0.9rem' }}>DRIVER</span>
                    <span style={{ color: 'rgba(230, 184, 112, 0.8)', fontSize: '0.7rem', marginTop: '2px', textAlign: 'center' }}>I have a vehicle</span>
                </motion.div>

                {/* Rider Circle */}
                <motion.div
                    custom="rider"
                    variants={variants}
                    initial="idle"
                    animate={role === 'rider' ? 'selected' : (role === 'driver' ? 'unselected' : 'idle')}
                    onClick={() => {
                        playClickSound('tap');
                        setRole('rider');
                    }}
                    whileHover={{ scale: role ? 1.3 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'absolute',
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'rgba(209, 109, 90, 0.1)',
                        border: '1px solid rgba(209, 109, 90, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        padding: '10px'
                    }}
                >
                    <User size={32} color="#D16D5A" style={{ marginBottom: '4px' }} />
                    <span style={{ color: '#D16D5A', fontWeight: '700', letterSpacing: '1px', fontSize: '0.9rem' }}>RIDER</span>
                    <span style={{ color: 'rgba(209, 109, 90, 0.8)', fontSize: '0.7rem', marginTop: '2px', textAlign: 'center' }}>I need a ride</span>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: role ? 1 : 0, y: role ? 0 : 20 }}
                style={{ padding: '0 20px', pointerEvents: role ? 'auto' : 'none' }}
            >
                <Button onClick={() => handleComplete(role)} variant="primary">
                    Continue <ChevronRight size={20} />
                </Button>
            </motion.div>
        </div>
    );
};

const Onboarding = ({ onComplete, toggleTheme, currentTheme }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        collegeId: '',
        from: '',
        to: '',
        time: '',
        seats: ''
    });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => Math.max(1, prev - 1));

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Wrapper to pass role + data
    const handleCompleteFlow = (role) => {
        onComplete({ ...formData, role });
    };

    return (
        <div style={{ padding: '24px', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%' }}
                >
                    {step === 1 && <Step1_Welcome nextStep={nextStep} toggleTheme={toggleTheme} currentTheme={currentTheme} />}
                    {step === 2 && <Step2_Verification nextStep={nextStep} prevStep={prevStep} formData={formData} updateFormData={updateFormData} />}
                    {step === 3 && <Step3_Setup nextStep={nextStep} prevStep={prevStep} formData={formData} updateFormData={updateFormData} />}
                    {step === 4 && <Step4_Mode handleComplete={handleCompleteFlow} prevStep={prevStep} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
