import { ShieldCheck, Settings, LogOut, Bell, Navigation, RefreshCw, User } from 'lucide-react';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const Profile = ({ userData, toggleRole }) => {
    const isDriver = userData?.role === 'driver';

    return (
        <div style={{ paddingTop: '20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Profile</h1>

            {/* User Card */}
            <motion.div
                whileHover={{
                    y: -4,
                    borderColor: 'rgba(217, 164, 88, 0.4)',
                    backdropFilter: 'blur(25px)'
                }}
                className="glass-panel"
                style={{
                    padding: '30px', borderRadius: '24px', textAlign: 'center', marginBottom: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'border-color 0.3s ease'
                }}
            >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-bg-card)', border: '3px solid #fff', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="#fff" />
                </div>
                <h2 style={{ marginBottom: '4px' }}>{userData?.name || 'Guest User'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-brand-primary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    <ShieldCheck size={14} />
                    <span>{userData?.collegeId ? 'Campus Verified' : 'Unverified'}</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    {userData?.collegeId || 'Complete verification to join trusted network'}
                </p>
            </motion.div>

            {/* Mode Switcher */}
            <motion.div
                whileHover={{
                    y: -4,
                    borderColor: 'rgba(217, 164, 88, 0.4)',
                    backdropFilter: 'blur(25px)'
                }}
                className="glass-panel"
                style={{
                    padding: '20px', borderRadius: '20px', marginBottom: '30px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'border-color 0.3s ease'
                }}
            >
                <div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Current Mode</p>
                </div>
                <div style={{ marginLeft: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: isDriver ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary)' }}>
                        {isDriver ? 'Driver Profile' : 'Rider Profile'}
                    </h3>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9, rotate: 180 }}
                    onClick={toggleRole}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <RefreshCw size={20} color="#fff" />
                </motion.button>
            </motion.div>

            {/* Settings Sections */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--color-text-muted)' }}>Preferences</h3>

            <motion.div
                whileHover={{
                    borderColor: 'rgba(217, 164, 88, 0.4)',
                    backdropFilter: 'blur(25px)'
                }}
                className="glass-panel"
                style={{
                    borderRadius: '20px', overflow: 'hidden', marginBottom: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'border-color 0.3s ease'
                }}
            >
                <MenuItem icon={Navigation} label="Commute Settings" />
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                <MenuItem icon={Bell} label="Notifications" value="On" />
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                <MenuItem icon={ShieldCheck} label="Safety & Privacy" />
            </motion.div>

            <Button variant="secondary" style={{ color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                <LogOut size={18} /> Sign Out
            </Button>

            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '30px' }}>
                Version 1.1.0 (Beta)
            </p>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, value }) => (
    <button style={{
        width: '100%',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white',
        fontSize: '1rem',
        cursor: 'pointer'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: 'var(--color-text-secondary)' }}>
                <Icon size={20} />
            </div>
            <span>{label}</span>
        </div>
        {value && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{value}</span>}
    </button>
);

export default Profile;
