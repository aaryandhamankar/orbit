import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import Button from '../components/Button';
import { playClickSound } from '../utils/sound';
import Input from '../components/Input';

const Chat = ({ onBack }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'driver', text: 'Hey! I\'m leaving in 10 mins.', time: '09:05 AM' },
        { id: 2, sender: 'me', text: 'Great, I\'m at the pickup point.', time: '09:07 AM' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (!newMessage.trim()) return;
        setMessages([...messages, { id: Date.now(), sender: 'me', text: newMessage, time: 'Now' }]);
        setNewMessage('');
        playClickSound('tap');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'var(--color-bg-deep)',
                display: 'flex', flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div className="glass-panel" style={{
                padding: '20px', paddingTop: '60px',
                display: 'flex', alignItems: 'center', gap: '16px',
                borderBottom: 'var(--glass-border)'
            }}>
                <button
                    onClick={() => {
                        playClickSound('tap');
                        onBack();
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Rohan Gupta</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Swift Dzire • KA 05 MV 2024</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
                    <img src="/rohan_profile_1768120367542.png" alt="Rohan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            borderBottomRightRadius: msg.sender === 'me' ? '4px' : '16px',
                            borderTopLeftRadius: msg.sender === 'driver' ? '4px' : '16px',
                            background: msg.sender === 'me' ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.05)',
                            color: msg.sender === 'me' ? '#1a1a1a' : 'var(--color-text-primary)',
                            border: msg.sender === 'me' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <p style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{msg.text}</p>
                        <p style={{ fontSize: '0.7rem', opacity: 0.7, textAlign: 'right' }}>{msg.time}</p>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div style={{ padding: '20px', paddingBottom: '40px', background: 'var(--color-bg-card)', borderTop: 'var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{ margin: 0 }}
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSend}
                        style={{ width: 'auto', padding: '12px', borderRadius: '50%', height: '48px', minWidth: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Send size={20} />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default Chat;
