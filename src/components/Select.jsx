import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ label, value, onChange, options, icon: Icon, placeholder, ...props }) => {
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
                <select
                    value={value}
                    onChange={onChange}
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
                        appearance: 'none',
                        cursor: 'pointer'
                    }}
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map(opt => {
                        const label = typeof opt === 'object' ? opt.label : opt;
                        const value = typeof opt === 'object' ? opt.value : opt;
                        return (
                            <option key={value} value={value} style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-primary)' }}>{label}</option>
                        );
                    })}
                </select>

                {Icon && (
                    <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: isFocused ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        pointerEvents: 'none',
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Icon size={18} />
                    </div>
                )}

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '12px',
                    border: `1px solid ${isFocused ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                    pointerEvents: 'none',
                    transition: 'var(--transition-fast)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--color-text-secondary)'
                }}>
                    <ChevronDown size={20} />
                </div>
            </div>
        </div>
    );
};

export default Select;
