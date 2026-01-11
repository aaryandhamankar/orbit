import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, ArrowRight, Clock, MapPin } from 'lucide-react';
import Button from '../components/Button';

const Rides = ({ userData }) => {
    const [activeTab, setActiveTab] = useState('upcoming');

    // Dynamic upcoming ride based on user data
    const upcomingRides = [
        {
            id: 1,
            driver: 'Rohan Gupta',
            model: 'Swift Dzire',
            time: userData?.time || '09:15 AM',
            from: userData?.from || 'Koramangala',
            to: userData?.to || 'PES University',
            cost: 45,
            seatsLeft: 1
        }
    ];

    const pastRides = [
        {
            id: 2,
            date: 'Yesterday',
            from: 'Indiranagar',
            to: 'PES University',
            cost: 60,
            saved: 40
        },
        {
            id: 3,
            date: 'Mon, 12 Oct',
            from: 'Koramangala',
            to: 'MG Road',
            cost: 55,
            saved: 35
        },
        {
            id: 4,
            date: 'Fri, 9 Oct',
            from: 'HSR Layout',
            to: 'JP Nagar',
            cost: 45,
            saved: 20
        }
    ];

    return (
        <div style={{ paddingTop: '20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Your Rides</h1>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.05)',
                padding: '4px',
                borderRadius: '16px',
                marginBottom: '24px'
            }}>
                {['upcoming', 'active', 'past'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '12px',
                            background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: activeTab === tab ? '#fff' : 'var(--color-text-secondary)',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'upcoming' && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {upcomingRides.map(ride => (
                                <motion.div
                                    key={ride.id}
                                    whileHover={{
                                        y: -4,
                                        borderColor: 'rgba(217, 164, 88, 0.4)',
                                        backdropFilter: 'blur(25px)'
                                    }}
                                    className="glass-panel"
                                    style={{
                                        padding: '20px', borderRadius: '24px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem' }}>{ride.driver}</h3>
                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{ride.model}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <p style={{ fontWeight: '700', color: 'var(--color-brand-primary)' }}>{ride.time}</p>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>• Today</span>
                                        </div>
                                    </div>

                                    {/* Route Line */}
                                    <div style={{ position: 'relative', paddingLeft: '20px', marginBottom: '20px' }}>
                                        <div style={{ position: 'absolute', left: '4px', top: '5px', bottom: '5px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: '-20px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-brand-secondary)' }}></div>
                                                <p style={{ fontSize: '0.9rem' }}>{ride.from}</p>
                                            </div>
                                            <div style={{ paddingLeft: '20px', position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: '-20px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)', background: '#000' }}></div>
                                                <p style={{ fontSize: '0.9rem' }}>{ride.to}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Button variant="secondary" style={{ flex: 1, fontSize: '0.9rem', padding: '12px' }}>
                                            <MessageCircle size={18} /> Chat
                                        </Button>
                                        <Button variant="primary" style={{ flex: 1, fontSize: '0.9rem', padding: '12px' }}>
                                            Details
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
                            <div style={{
                                width: '80px', height: '80px', margin: '0 auto 20px auto',
                                borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Clock size={32} />
                            </div>
                            <p>No active rides right now.</p>
                        </div>
                    )}

                    {activeTab === 'past' && (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {pastRides.map(ride => (
                                <motion.div
                                    key={ride.id}
                                    whileHover={{
                                        y: -4,
                                        borderColor: 'rgba(217, 164, 88, 0.4)',
                                        backdropFilter: 'blur(25px)'
                                    }}
                                    className="glass-panel"
                                    style={{
                                        padding: '16px 20px', borderRadius: '20px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: '600', marginBottom: '4px' }}>{ride.date}</p>
                                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>₹{ride.cost} Paid</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            background: 'rgba(230, 184, 112, 0.1)',
                                            color: '#E6B870',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            Saved ₹{ride.saved}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Rides;
