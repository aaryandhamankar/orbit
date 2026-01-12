import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, Leaf, User, Calendar, Plus } from 'lucide-react';
import { playClickSound } from './Button';

const CalendarPlus = ({ size, color, strokeWidth }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Calendar size={size} color={color} strokeWidth={strokeWidth} />
        <div style={{
            position: 'absolute',
            bottom: -4,
            right: -6,
            background: 'var(--color-bg-deep)',
            borderRadius: '50%',
            padding: '1px'
        }}>
            <Plus size={12} color={color} strokeWidth={3} />
        </div>
    </div>
);

const BottomNav = ({ currentTab, setCurrentTab }) => {
    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '400px',
            height: '70px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
            borderRadius: '40px',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            backdropFilter: 'blur(20px)',
            background: 'var(--color-bg-card)'
        }}>
            <NavItem
                icon={Home}
                label="Home"
                id="home"
                active={currentTab === 'home'}
                onClick={() => setCurrentTab('home')}
            />
            <NavItem
                icon={Users}
                label="Rides"
                id="rides"
                active={currentTab === 'rides'}
                onClick={() => setCurrentTab('rides')}
            />
            <NavItem
                icon={CalendarPlus}
                label="Commute"
                id="commute"
                active={currentTab === 'commute'}
                onClick={() => setCurrentTab('commute')}
            />
            <NavItem
                icon={Leaf}
                label="Impact"
                id="impact"
                active={currentTab === 'impact'}
                onClick={() => setCurrentTab('impact')}
            />
            <NavItem
                icon={User}
                label="Profile"
                id="profile"
                active={currentTab === 'profile'}
                onClick={() => setCurrentTab('profile')}
            />
        </nav>
    );
};

const NavItem = ({ icon: Icon, label, id, active, onClick }) => (
    <button
        onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            playClickSound('nav');
            onClick();
        }}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            position: 'relative',
            cursor: 'pointer'
        }}
    >
        <div style={{ position: 'relative', height: '24px', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Active State: Orbital Ring - Professional 360 Circuit */}
            <AnimatePresence>
                {active && (
                    <motion.div
                        key={`${id}-ring`}
                        initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
                        animate={{ rotate: 360, scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                            duration: 0.45,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            inset: '-6px',
                            borderRadius: '50%',
                            border: '2px solid var(--color-brand-primary)',
                            boxShadow: '0 0 15px var(--color-brand-primary), inset 0 0 10px var(--color-brand-primary)',
                            background: 'rgba(217, 164, 88, 0.05)',
                            zIndex: 0
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Icon */}
            <Icon
                size={22}
                color={active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}
                strokeWidth={active ? 2.5 : 2}
            />
        </div>

        {/* Label and Indicator - Local fade/scale */}
        <AnimatePresence>
            {active && (
                <motion.div
                    key={`${id}-indicator`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'absolute',
                        bottom: '6px',
                        width: '32px',
                        height: '6px',
                        background: 'transparent',
                        borderBottom: '2.5px solid var(--color-brand-primary)',
                        borderRadius: '50%',
                        boxShadow: '0 4px 8px -2px var(--color-brand-primary)',
                        zIndex: 2
                    }}
                />
            )}
        </AnimatePresence>
    </button>
);

export default BottomNav;
