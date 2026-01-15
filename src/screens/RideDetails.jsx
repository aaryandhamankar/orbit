import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Users, Phone, ShieldCheck, Star } from 'lucide-react';
import Button, { playClickSound } from '../components/Button';

const RideDetails = ({ onBack, ride, userData }) => {
    // Fallback to userData if ride not provided, or mock defaults
    const driverName = ride?.driver || 'Rohan Gupta';
    const driverImage = ride?.driverImage || "/rohan_profile_1768120367542.png"; // Fallback image
    const rating = ride?.rating || 4.9;
    const ridesCount = ride?.ridesCount || 124;
    const time = ride?.time || '09:00 AM';
    const fromLoc = ride?.from || userData?.from || 'Koramangala';
    const toLoc = ride?.to || userData?.to || 'PES University';
    const price = ride?.price || ride?.cost || 45; // Handle price/cost mismatch

    // Calculate or use duration
    const duration = ride?.duration || 35;

    const passengerCount = ride?.passengers?.length || 1;
    const totalSeats = ride?.totalSeats || 4;

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
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>{driverName}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Star size={14} fill="#FBBC05" color="#FBBC05" />
                            <span style={{ fontWeight: '600' }}>{rating}</span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>• {ridesCount} Rides</span>
                        </div>
                    </div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ccc', overflow: 'hidden', border: '2px solid var(--color-brand-primary)' }}>
                        <img src={driverImage} alt={driverName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>{time}</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{fromLoc}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Dropoff</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{toLoc}</p>
                            </div>
                        </div>
                        {/* Price Display within Route Card */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-brand-primary)' }}>₹{price}</p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px', color: 'var(--color-brand-primary)' }}><Clock size={24} /></div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Time</p>
                        <p style={{ fontWeight: '700' }}>{duration} mins</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px', color: '#E6B870' }}><Users size={24} /></div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Passengers</p>
                        <p style={{ fontWeight: '700' }}>{passengerCount}/{totalSeats}</p>
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
