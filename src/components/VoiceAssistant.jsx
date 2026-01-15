import { useState } from 'react';
import { Mic, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceAssistant = ({ onNavigate, upcomingRide, onToggleRole, userData }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [intentLabel, setIntentLabel] = useState('');

    const [isAlarmActive, setIsAlarmActive] = useState(false);

    const toggleListening = () => {
        if (isAlarmActive) return; // Block input during alarm
        if (isListening) {
            stopListening();
            return;
        }

        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice control is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setFeedback('Listening...');
            setIntentLabel('');
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript.toLowerCase();
            setTranscript(text);
            processCommand(text);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-clear feedback after a delay
            setTimeout(() => {
                if (!isListening) {
                    setFeedback('');
                    setTranscript('');
                    setIntentLabel('');
                }
            }, 3000);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
            setFeedback('Error: ' + event.error);
        };

        recognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
        setFeedback('');
    };

    const processCommand = (text) => {
        const t = text.toLowerCase().trim();
        let matched = false;

        // 1. Safety (Critical Priority)
        if (t.includes('help') || t.includes('sos') || t.includes('emergency')) {
            // Trigger SOS Alarm Flow
            setIsAlarmActive(true);
            setFeedback('⚠️ SOS ACTIVATED');
            setIntentLabel('SAFETY_ALERT');

            // Haptic Feedback for SOS
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500, 100, 500]);

            // 3 Second Alarm -> Navigate to Profile
            setTimeout(() => {
                setIsAlarmActive(false);
                onNavigate('profile');
            }, 3000);

            matched = true;
        }

        // 2. Navigation
        else if (t.includes('home') || t.includes('dashboard')) {
            onNavigate('home');
            setFeedback('Navigating Home...');
            setIntentLabel('NAV_HOME');
            matched = true;
        }
        else if (t.includes('history') || t.includes('past rides')) {
            onNavigate('rides'); // Rides component handles logic to switch tab if implemented, else just open Rides
            setFeedback('Opening History...');
            setIntentLabel('NAV_HISTORY');
            matched = true;
        }
        else if (t.includes('ride') && (t.includes('my') || t.includes('go') || t.includes('open') || t.includes('list'))) {
            onNavigate('rides');
            setFeedback('Opening Rides...');
            setIntentLabel('NAV_RIDES');
            matched = true;
        }
        else if (t.includes('commute')) {
            onNavigate('commute');
            setFeedback('Opening Commute...');
            setIntentLabel('NAV_COMMUTE');
            matched = true;
        }
        else if (t.includes('profile') || t.includes('account') || t.includes('settings')) {
            onNavigate('profile');
            setFeedback('Opening Profile...');
            setIntentLabel('NAV_PROFILE');
            matched = true;
        }
        else if (t.includes('impact') || t.includes('stat') || t.includes('green')) {
            onNavigate('impact');
            setFeedback('Showing Impact...');
            setIntentLabel('NAV_IMPACT');
            matched = true;
        }

        // 3. Role Switching (Priority over generic "driver" keyword)
        else if (t.includes('driver') && (t.includes('mode') || t.includes('switch'))) {
            if (userData?.role !== 'driver') {
                onToggleRole();
                setFeedback('Switching to Driver...');
            } else {
                setFeedback('Already in Driver Mode');
            }
            setIntentLabel('SWITCH_DRIVER');
            matched = true;
        }
        else if (t.includes('rider') && (t.includes('mode') || t.includes('switch'))) {
            if (userData?.role === 'driver') {
                onToggleRole();
                setFeedback('Switching to Rider...');
            } else {
                setFeedback('Already in Rider Mode');
            }
            setIntentLabel('SWITCH_RIDER');
            matched = true;
        }

        // 4. Status Queries & Details
        else if (t.includes('details') || t.includes('info') || t.includes('driver')) {
            if (upcomingRide) {
                onNavigate('home'); // Home usually shows the active card
                setFeedback('Showing Ride Details');
                setIntentLabel('VIEW_DETAILS');
            } else {
                setFeedback('No active ride found.');
                setIntentLabel('QUERY_EMPTY');
            }
            matched = true;
        }
        else if (t.includes('do i have') || t.includes('status') || t.includes('update')) {
            if (upcomingRide) {
                setFeedback(`Ride at ${upcomingRide.time}`);
                setIntentLabel('STATUS_ACTIVE');
            } else {
                setFeedback('No upcoming rides.');
                setIntentLabel('STATUS_CLEAR');
            }
            matched = true;
        }



        if (!matched) {
            setFeedback('Command not recognized.');
            setIntentLabel('UNKNOWN');
        }
    };

    return (
        <>
            {/* SOS Alarm Overlay */}
            <AnimatePresence>
                {isAlarmActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(220, 38, 38, 0.9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column'
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            style={{
                                width: '150px', height: '150px', borderRadius: '50%',
                                background: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 100px rgba(255,255,255,0.5)'
                            }}
                        >
                            <span style={{ fontSize: '4rem' }}>🚨</span>
                        </motion.div>
                        <motion.h1
                            animate={{ opacity: [1, 0.2, 1] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                            style={{ color: '#fff', marginTop: '40px', fontSize: '3rem', fontWeight: '900', textAlign: 'center' }}
                        >
                            SOS ACTIVE
                        </motion.h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '10px' }}>Sending location...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mic Trigger */}
            {!isAlarmActive && (
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleListening}
                    style={{
                        position: 'fixed',
                        bottom: '100px', // Above bottom nav
                        left: '20px', // Moved to LEFT to avoid SOS overlap
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: isListening ? 'var(--color-brand-secondary)' : 'var(--color-bg-card)',
                        border: isListening ? '2px solid rgba(255,255,255,0.8)' : '1px solid var(--color-border)',
                        boxShadow: isListening
                            ? '0 0 30px rgba(56, 189, 248, 0.6)'
                            : '0 4px 20px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 100,
                        color: isListening ? '#fff' : 'var(--color-text-primary)'
                    }}
                >
                    {isListening ? <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        <Command size={24} />
                    </motion.div> : <Mic size={24} />}
                </motion.button>
            )}

            {/* Feedback Toast */}
            <AnimatePresence>
                {(feedback || transcript) && !isAlarmActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: -20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 20, x: -20 }}
                        style={{
                            position: 'fixed',
                            bottom: '170px',
                            left: '20px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '16px',
                            borderRadius: '16px',
                            zIndex: 100,
                            maxWidth: '260px',
                            minWidth: '200px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Intent Label Badge */}
                        {intentLabel && (
                            <div style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.1)',
                                fontSize: '0.65rem',
                                marginBottom: '8px',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}>
                                {intentLabel}
                            </div>
                        )}

                        <p style={{ fontWeight: '600', color: 'var(--color-brand-secondary)', fontSize: '1rem', marginBottom: '4px' }}>
                            {feedback || 'Listening...'}
                        </p>

                        {transcript && (
                            <p style={{ fontSize: '0.85rem', opacity: 0.7, fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                                "{transcript}"
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VoiceAssistant;
