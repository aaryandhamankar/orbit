import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Users, Phone, ShieldCheck, Star } from 'lucide-react';
import Button, { playClickSound } from '../components/Button';

const RideDetails = ({ onBack, userData }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'var(--color-bg-deep)',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto'
            }}
        >
            {/* Header / Map Placeholder */}
            <div style={{ height: '300px', background: 'linear-gradient(to bottom, #2a3b55, var(--color-bg-deep))', position: 'relative' }}>
                <div className="glass-panel" style={{ position: 'absolute', top: '60px', left: '20px', padding: '8px', borderRadius: '50%' }}>
                    <button
                        onClick={() => {
                            playClickSound('tap');
                            onBack();
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                {/* Mock Map Route */}
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                    <MapPin size={48} color="var(--color-brand-primary)" />
                </div>
            </div>

            {/* Content Sheet */}
            <div style={{
                flex: 1,
                marginTop: '-40px',
                background: 'var(--color-bg-deep)',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                padding: '24px',
                position: 'relative',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0 auto 20px auto' }}></div>

                {/* Driver Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>Rohan Gupta</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Star size={14} fill="#FBBC05" color="#FBBC05" />
                            <span style={{ fontWeight: '600' }}>4.9</span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>• 124 Rides</span>
                        </div>
                    </div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ccc', overflow: 'hidden', border: '2px solid var(--color-brand-primary)' }}>
                        <img src="/rohan_profile_1768120367542.png" alt="Rohan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>

                {/* Route Info */}
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-brand-secondary)' }}></div>
                            <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)', background: 'transparent' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>09:15 AM</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{userData?.from || 'Koramangala'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>09:50 AM (Est.)</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{userData?.to || 'PES University'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px', color: 'var(--color-brand-primary)' }}><Clock size={24} /></div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Time</p>
                        <p style={{ fontWeight: '700' }}>35 mins</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px', color: '#E6B870' }}><Users size={24} /></div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Passengers</p>
                        <p style={{ fontWeight: '700' }}>3/4</p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="secondary" style={{ flex: 1 }}>
                        <Phone size={20} /> Call
                    </Button>
                    <Button variant="danger" style={{ flex: 1 }}>
                        Cancel Ride
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default RideDetails;
