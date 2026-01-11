import { Car, User } from 'lucide-react';

const Header = ({ userData, onLogoClick, onToggleMode }) => {
    const isDriver = userData?.role === 'driver';

    return (
        <header className="glass-panel" style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            height: '60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            zIndex: 100,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderRadius: '0 0 20px 20px'
        }}>
            {/* Brand Logo */}
            <div
                onClick={onLogoClick}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
                <img src="/orbit-logo-v2.png" alt="Orbit Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(217, 164, 88, 0.3))' }} />
                <span style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '4px', background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ORBIT</span>
            </div>

            {/* Mode Indicator */}
            <div
                onClick={onToggleMode}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isDriver ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary)',
                    boxShadow: `0 0 10px ${isDriver ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary)'}`
                }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'white' }}>
                    {isDriver ? 'Driver Mode' : 'Rider Mode'}
                </span>
            </div>
        </header>
    );
};

export default Header;
