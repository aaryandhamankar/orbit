import { useState } from 'react';
import { User, Settings, CreditCard, ShieldCheck, HelpCircle, LogOut, Moon, Sun, ArrowLeft, Command, MapPin, ShieldAlert, Car, RefreshCw, Bell, Navigation } from 'lucide-react';
import Button from '../components/Button';
import { playClickSound } from '../utils/sound';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';

const Profile = ({ userData, toggleRole, toggleTheme, currentTheme, onLogout }) => {
    const isDriver = userData?.role === 'driver';
    const isDark = currentTheme === 'dark';
    const [activeSubScreen, setActiveSubScreen] = useState(null); // 'payment' | 'security' | 'help' | 'voice_help'
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(userData?.name || '');
    const [newEmail, setNewEmail] = useState(userData?.email || '');
    const [editLoading, setEditLoading] = useState(false);

    const handleEditToggle = () => {
        if (isEditing) {
            // Save changes
            setEditLoading(true);
            const userRef = doc(db, 'users', auth.currentUser.uid);
            updateDoc(userRef, {
                name: newName,
                email: newEmail
            }).then(() => {
                setEditLoading(false);
                setIsEditing(false);
            }).catch(err => {
                console.error("Error updating profile:", err);
                setEditLoading(false);
            });
        } else {
            setNewName(userData?.name || '');
            setNewEmail(userData?.email || '');
            setIsEditing(true);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure? This action is permanent and cannot be undone.")) return;

        try {
            const user = auth.currentUser;
            if (!user) return;

            // Delete Firestore Data
            await deleteDoc(doc(db, 'users', user.uid));

            // Delete Auth User
            await deleteUser(user);

            // onLogout handled by App.jsx listener usually, but explicitly calling it doesn't hurt
            if (onLogout) onLogout();

        } catch (err) {
            console.error("Error deleting account:", err);
            alert("Error: Re-login may be required to delete sensitive account data.");
        }
    };

    // Sub-screen: Voice Command Guide
    if (activeSubScreen === 'voice_help') {
        return (
            <div style={{ paddingTop: '20px', paddingBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <button
                        onClick={() => setActiveSubScreen(null)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--color-text-primary)',
                            padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginRight: '10px', borderRadius: '50%'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Voice Commands</h2>
                </div>

                <div style={{ padding: '0 10px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'var(--color-brand-secondary)', margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)'
                        }}>
                            <Command size={40} color="#fff" />
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Control Orbit hands-free. Just tap the mic and speak.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            {
                                category: 'Navigation',
                                icon: <MapPin size={18} color="var(--color-success)" />,
                                commands: [
                                    { phrase: "Go Home", desc: "Open Dashboard" },
                                    { phrase: "Open Rides", desc: "View History/Lists" },
                                    { phrase: "Open Profile", desc: "Go to Settings" }
                                ]
                            },
                            {
                                category: 'Safety',
                                icon: <ShieldAlert size={18} color="#ef4444" />,
                                commands: [
                                    { phrase: "Help / SOS", desc: "Trigger Alarm & Location" },
                                    { phrase: "Emergency", desc: "Same as SOS" }
                                ]
                            },
                            {
                                category: 'Actions',
                                icon: <Car size={18} color="#fbbf24" />,
                                commands: [
                                    { phrase: "Switch to Host", desc: "Toggle Mode" },
                                    { phrase: "Ride Details", desc: "View Active Trip" },
                                    { phrase: "Do I have a ride?", desc: "Check Status" }
                                ]
                            }
                        ].map((section, idx) => (
                            <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    {section.icon}
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{section.category}</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {section.commands.map((cmd, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i !== section.commands.length - 1 ? '1px solid var(--color-border)' : 'none', paddingBottom: i !== section.commands.length - 1 ? '12px' : '0' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--color-brand-secondary)' }}>"{cmd.phrase}"</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{cmd.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Placeholders for other sub-screens if needed later
    if (activeSubScreen === 'payment') return <div style={{ padding: '20px' }}><button onClick={() => setActiveSubScreen(null)}><ArrowLeft /></button> <h2>Payment Methods</h2><p style={{ marginTop: '20px', color: 'gray' }}>Use Voice: "Open Profile"</p></div>;
    if (activeSubScreen === 'security') return <div style={{ padding: '20px' }}><button onClick={() => setActiveSubScreen(null)}><ArrowLeft /></button> <h2>Security</h2><p style={{ marginTop: '20px', color: 'gray' }}>Trusted Contacts & Data</p></div>;
    if (activeSubScreen === 'help') return <div style={{ padding: '20px' }}><button onClick={() => setActiveSubScreen(null)}><ArrowLeft /></button> <h2>Help</h2><p style={{ marginTop: '20px', color: 'gray' }}>Support & FAQs</p></div>;

    return (
        <div style={{ paddingTop: '20px' }}>
            {/* 1. Header: Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'var(--color-bg-deep)',
                    border: '2px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    {/* Fallback to User icon if image load logic is complex, but here we try basic logic */}
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card-hover)' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-text-secondary)' }}>
                            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    {/* If we had real images, we'd render <img> here */}
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isEditing ? (
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                style={{
                                    fontSize: '1.5rem', fontWeight: '800',
                                    background: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
                                    border: '1px solid var(--color-border)', borderRadius: '8px', padding: '4px 8px', width: '200px'
                                }}
                            />
                        ) : (
                            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, lineHeight: 1.2 }}>
                                {userData?.name || 'Guest User'}
                            </h1>
                        )}
                        <button
                            onClick={handleEditToggle}
                            disabled={editLoading}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-primary)', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                            {editLoading ? '...' : (isEditing ? 'Save' : 'Edit')}
                        </button>
                    </div>
                    {/* Email Display / Edit */}
                    <div style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        {isEditing ? (
                            <input
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Email Address"
                                style={{
                                    fontSize: '0.9rem',
                                    background: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
                                    border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', width: '200px'
                                }}
                            />
                        ) : (
                            <span>{userData?.email || 'No email linked'}</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <ShieldCheck size={14} color="var(--color-brand-primary)" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                            {isDriver ? 'Host • 4.9 ★' : 'Rider • 4.8 ★'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Mode & Theme Toggles (Immediately below Profile) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                {/* Mode Switcher */}
                <motion.div
                    className="glass-panel"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        playClickSound('tap');
                        toggleRole();
                    }}
                    style={{
                        padding: '16px', borderRadius: '20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        border: '1px solid var(--color-bg-card-hover)',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: isDriver ? 'rgba(230, 184, 112, 0.2)' : 'rgba(193, 106, 83, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <RefreshCw size={20} color={isDriver ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary)'} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{isDriver ? 'Host' : 'Rider'} Mode</span>
                </motion.div>

                {/* Theme Switcher */}
                <motion.div
                    className="glass-panel"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        playClickSound('tap');
                        toggleTheme();
                    }}
                    style={{
                        padding: '16px', borderRadius: '20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        border: '1px solid var(--color-bg-card-hover)',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 200, 87, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {isDark ? <Moon size={20} color="white" /> : <Sun size={20} color="var(--color-brand-primary)" />}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{isDark ? 'Dark' : 'Light'} Theme</span>
                </motion.div>
            </div>

            {/* 3. Settings Menu */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: '700' }}>Settings</h3>

            <motion.div
                className="glass-panel"
                style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--color-bg-card-hover)', marginBottom: '30px' }}
            >
                <MenuItem
                    icon={Command}
                    iconColor="var(--color-brand-secondary)"
                    label="Voice Commands"
                    subLabel="Learn what to say"
                    onClick={() => setActiveSubScreen('voice_help')}
                />
                <div style={{ height: '1px', background: 'var(--color-bg-card-hover)' }} />
                <MenuItem
                    icon={CreditCard}
                    iconColor="var(--color-brand-primary)"
                    label="Payment Methods"
                    subLabel="UPI, Cards"
                    onClick={() => setActiveSubScreen('payment')}
                />
                <div style={{ height: '1px', background: 'var(--color-bg-card-hover)' }} />
                <MenuItem
                    icon={ShieldCheck}
                    iconColor="var(--color-success)"
                    label="Security & Privacy"
                    onClick={() => setActiveSubScreen('security')}
                />
                <div style={{ height: '1px', background: 'var(--color-bg-card-hover)' }} />
                <MenuItem
                    icon={Bell}
                    label="Notifications"
                    value="On"
                />
                <div style={{ height: '1px', background: 'var(--color-bg-card-hover)' }} />
                <MenuItem
                    icon={HelpCircle}
                    iconColor="#fbbf24"
                    label="Help & Support"
                    onClick={() => setActiveSubScreen('help')}
                />
            </motion.div>

            {/* 4. Preferences (Merged Commute into general or kept separate? User said ALL inconsistent. Let's merge Commute if it fits, or keep separate but consistent style. Commute is a setting too. Let's put Commute in the main list for simplicity, or keep a separate block if strictly needed. Let's add Commute to top of Settings for consistency.) */}
            {/* Actually, let's keep one main 'Settings' block and maybe a 'Account' block. 
                The previous 'Preferences' block had Commute, Notifs, Safety. 
                Safety is duplicated (Security & Privacy vs Safety). 
                I will consolidate everything into ONE clean list for maximum consistency.
            */}

            {/* 4. Delete Account & Sign Out */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <Button
                    variant="secondary"
                    sound="destructive"
                    style={{
                        width: 'auto',
                        color: '#ff4d4d',
                        border: '1px solid rgba(255, 77, 77, 0.3)',
                        background: 'rgba(255, 77, 77, 0.15)',
                        padding: '12px 32px',
                        borderRadius: '30px',
                        fontSize: '0.95rem'
                    }}
                    onClick={onLogout}
                >
                    <LogOut size={18} /> Sign Out
                </Button>

                <button
                    onClick={handleDeleteAccount}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff4d4d',
                        opacity: 0.7,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Delete Account Permanently
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '20px', opacity: 0.6 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>
                    Orbit v1.0 • Built for Hackathon
                </p>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    By Aaryan Dhamankar
                </p>
            </div>
        </div>
    );
};

// Reusable Menu Item (Supports both isolated buttons and list items)
const MenuItem = ({ icon: Icon, label, value, onClick, iconColor, subLabel }) => (
    <button
        onClick={() => {
            if (onClick) {
                playClickSound('tap');
                onClick();
            }
        }}
        className="list-item-hover"
        style={{
            width: '100%',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-text-primary)',
            fontSize: '1rem',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            textAlign: 'left'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {Icon && (
                <div style={{ color: iconColor || 'var(--color-text-secondary)' }}>
                    <Icon size={22} />
                </div>
            )}
            <div>
                <span style={{ display: 'block', fontWeight: '500', lineHeight: '1.2' }}>{label}</span>
                {subLabel && <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: '3px' }}>{subLabel}</span>}
            </div>
        </div>
        {value && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{value}</span>}
    </button>
);

export default Profile;
