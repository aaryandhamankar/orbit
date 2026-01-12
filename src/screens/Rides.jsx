import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Clock, MapPin, User } from 'lucide-react';
import Button, { playClickSound } from '../components/Button';
import Chat from './Chat';
import RideDetails from './RideDetails';

const Rides = ({ userData, pastRides, upcomingRide, onViewRideDetails }) => {
    const [activeTab, setActiveTab] = useState(upcomingRide ? 'upcoming' : 'history');

    // Effect to switch to history if upcomingRide disappears (completion)
    // Note: This might auto-switch if user cancels too. Acceptable for now.
    // We only want to auto-switch if we were on 'upcoming' and it became null.
    // Simple approach: logic in render or initial state is often enough, 
    // but if we navigate here FROM home after completion, upcomingRide is null, so initial state 'history' is correct.

    // Auto-switch to 'past' if we have a very recent ride (simple heuristic: if first ride is "Today")
    // Or just let user navigate. For now, let's keep it simple.
    // Actually, user asked to "open in past tab". 
    // We can do this with a useEffect if specific logic is needed, 
    // but better to just default to 'upcoming' unless specified. 
    // Let's stick to props for data.
    const [subScreen, setSubScreen] = useState(null); // 'chat' | 'details' | null

    if (subScreen === 'chat') return <Chat onBack={() => setSubScreen(null)} />;
    if (subScreen === 'details') return <RideDetails onBack={() => setSubScreen(null)} userData={userData} />;

    // Dynamic upcoming ride based on user data




    return (
        <div style={{ paddingBottom: '20px' }}>
            <AnimatePresence>
                {subScreen === 'chat' && <Chat onBack={() => setSubScreen(null)} />}
                {subScreen === 'details' && <RideDetails onBack={() => setSubScreen(null)} userData={userData} />}
            </AnimatePresence>

            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '20px' }}>Your Rides</h1>

            {/* Tabs */}
            <div style={{
                display: 'flex', background: 'var(--color-bg-card)',
                padding: '4px', borderRadius: '16px', marginBottom: '24px'
            }}>
                {['upcoming', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            playClickSound('tap');
                            setActiveTab(tab);
                        }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            background: activeTab === tab ? 'var(--color-bg-deep)' : 'transparent',
                            color: activeTab === tab ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                            fontWeight: activeTab === tab ? '600' : '500',
                            border: 'none',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease',
                            boxShadow: activeTab === tab ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'upcoming' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {upcomingRide ? (
                                <motion.div
                                    key={upcomingRide.id}
                                    className="glass-panel"
                                    style={{ padding: '20px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-brand-primary)' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div>
                                            <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>{upcomingRide.time}</p>
                                            <p style={{ color: 'var(--color-text-secondary)' }}>Today</p>
                                        </div>
                                        <div style={{
                                            background: 'rgba(217, 164, 88, 0.1)',
                                            padding: '6px 12px', borderRadius: '12px',
                                            height: 'fit-content'
                                        }}>
                                            <span style={{ color: 'var(--color-brand-primary)', fontWeight: '600', fontSize: '0.85rem' }}>UPCOMING</span>
                                        </div>
                                    </div>

                                    {/* Detailed Info (Driver/Car) */}
                                    <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                                                <User size={20} color="var(--color-text-primary)" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600', fontSize: '1rem' }}>{upcomingRide.driver}</p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{upcomingRide.model}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route */}           <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand-secondary)' }}></div>
                                            <div style={{ width: '1px', height: '25px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)' }}></div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '12px' }}>{upcomingRide.from}</p>
                                            <p style={{ fontSize: '0.95rem', fontWeight: '500' }}>{upcomingRide.to}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Button
                                            variant="secondary"
                                            style={{ flex: 1, fontSize: '0.9rem', padding: '12px' }}
                                            onClick={() => {
                                                playClickSound('tap');
                                                setSubScreen('chat');
                                            }}
                                        >
                                            <MessageCircle size={18} /> Chat
                                        </Button>
                                        <Button
                                            variant="primary"
                                            sound="success"
                                            style={{ flex: 1, fontSize: '0.9rem', padding: '12px' }}
                                            onClick={() => {
                                                playClickSound('tap');
                                                if (onViewRideDetails) onViewRideDetails();
                                            }}
                                        >
                                            Details
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🪐</div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Gravity's stable for now.</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '8px' }}>No upcoming rides scheduled.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pastRides && pastRides.length > 0 ? pastRides.map((ride) => (
                                <motion.div
                                    key={ride.id}
                                    className="glass-panel"
                                    style={{ padding: '20px', borderRadius: '20px', opacity: 0.8 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{ride.date}</p>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            {ride.saved > 0 && <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>Saved ₹{ride.saved}</span>}
                                            <p style={{ fontWeight: '700', color: 'var(--color-brand-primary)' }}>₹{ride.cost}</p>
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#666' }}></div>
                                            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }}></div>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid #666' }}></div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>{ride.from}</p>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{ride.to}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                                    No history yet.
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Rides;
