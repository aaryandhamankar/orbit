import { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label style={{
                display: 'block',
                marginBottom: '8px',
                color: isFocused ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'var(--transition-fast)'
            }}>
                {label}
            </label>

            <div style={{ position: 'relative' }}>
                <input
                    value={value}
                    onChange={onChange}
                    type={type}
                    placeholder={placeholder}
                    {...props}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        width: '100%',
                        background: 'var(--color-bg-card-hover)',
                        border: 'none',
                        padding: '12px 12px 12px 40px',
                        borderRadius: '12px',
                        color: 'var(--color-text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'text'
                    }}
                />
                {Icon && (
                    <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: isFocused ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 2
                    }}>
                        <Icon size={18} />
                    </div>
                )}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'var(--color-border)',
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isFocused ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'var(--gradient-orbit)',
                            transformOrigin: 'left',
                            boxShadow: '0 0 10px var(--color-brand-primary)'
                        }}
                    />
                </div>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '12px',
                    border: `1px solid ${isFocused ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                    boxShadow: isFocused ? '0 0 15px rgba(217, 164, 88, 0.2)' : 'none',
                    pointerEvents: 'none',
                    transition: 'var(--transition-fast)'
                }}></div>
            </div>
        </div>
    );
};

export default Input;
