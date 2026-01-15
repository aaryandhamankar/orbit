import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Clock, MapPin, User } from 'lucide-react';
import Button from '../components/Button';
import { playClickSound } from '../utils/sound';
import Chat from './Chat';
import RideDetails from './RideDetails';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const Rides = ({ userData, upcomingRide, onViewRideDetails }) => {
    const [activeTab, setActiveTab] = useState(upcomingRide ? 'upcoming' : 'history');
    const [historyRides, setHistoryRides] = useState([]);
    const [subScreen, setSubScreen] = useState(null); // 'chat' | 'details' | null

    // Listen for history updates
    useEffect(() => {
        const uid = auth.currentUser?.uid || userData?.uid;
        if (!uid) return;

        console.log('📜 Fetching history for:', uid);

        const historyRef = collection(db, 'history');
        // Remove orderBy to avoid index issues. Sort client-side.
        const q = query(
            historyRef,
            where('userId', '==', uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rides = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort: desc order by completedAt. Treat null (pending) as NOW.
            rides.sort((a, b) => {
                const ta = a.completedAt?.toMillis ? a.completedAt.toMillis() : Date.now();
                const tb = b.completedAt?.toMillis ? b.completedAt.toMillis() : Date.now();
                return tb - ta;
            });

            console.log('📜 History rides:', rides.length);
            setHistoryRides(rides);
        }, (error) => {
            console.error('Error fetching history:', error);
        });

        return () => unsubscribe();
    }, [userData]);

    if (subScreen === 'chat') return <Chat onBack={() => setSubScreen(null)} />;
    if (subScreen === 'details') return <RideDetails onBack={() => setSubScreen(null)} ride={upcomingRide} userData={userData} />;

    return (
        <div style={{ paddingBottom: '20px' }}>
            <AnimatePresence>
                {subScreen === 'chat' && <Chat onBack={() => setSubScreen(null)} />}
                {subScreen === 'details' && <RideDetails onBack={() => setSubScreen(null)} ride={upcomingRide} userData={userData} />}
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
                                            background: 'var(--color-bg-card-hover)',
                                            padding: '6px 12px', borderRadius: '12px',
                                            height: 'fit-content'
                                        }}>
                                            <span style={{ color: 'var(--color-brand-primary)', fontWeight: '600', fontSize: '0.85rem' }}>UPCOMING</span>
                                        </div>
                                    </div>

                                    {/* Detailed Info (Driver/Car) */}
                                    <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
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
                                            <div style={{ width: '1px', height: '25px', background: 'var(--color-border)', margin: '4px 0' }}></div>
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
                            {historyRides.length > 0 ? historyRides.map((ride) => (
                                <motion.div
                                    key={ride.id}
                                    className="glass-panel"
                                    style={{ padding: '20px', borderRadius: '20px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{ride.date} • {ride.time}</p>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                background: ride.role === 'driver' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(217, 164, 88, 0.2)',
                                                color: ride.role === 'driver' ? 'var(--color-success)' : 'var(--color-brand-primary)',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                fontWeight: '600'
                                            }}>
                                                {ride.role === 'driver' ? 'Driver' : 'Passenger'}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                {ride.role === 'driver' ? 'You Earned' : 'You Spent'}
                                            </p>
                                            <p style={{ fontWeight: '700', fontSize: '1.1rem', color: ride.role === 'driver' ? 'var(--color-success)' : 'var(--color-brand-primary)' }}>
                                                ₹{ride.role === 'driver' ? ride.earnings : ride.cost}
                                            </p>
                                        </div>
                                    </div>

                                    {ride.role === 'driver' && (
                                        <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                            <span style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>{ride.passengers}</span> passengers carried
                                        </div>
                                    )}

                                    {/* Route */}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-secondary)' }}></div>
                                            <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '4px 0' }}></div>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid var(--color-text-secondary)' }}></div>
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
