import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, IndianRupee, Save } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const Commute = ({ userData, onUpdate }) => {
    const [formData, setFormData] = useState({
        from: userData?.from || '',
        to: userData?.to || '',
        time: userData?.time || '',
        seats: userData?.seats || '',
        price: userData?.price || '45'
    });

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (userData) {
            requestAnimationFrame(() => {
                setFormData(prev => {
                    if (
                        prev.from === (userData.from || '') &&
                        prev.to === (userData.to || '') &&
                        prev.time === (userData.time || '') &&
                        prev.seats === (userData.seats || '') &&
                        prev.price === (userData.price || '45')
                    ) {
                        return prev;
                    }
                    return {
                        from: userData.from || '',
                        to: userData.to || '',
                        time: userData.time || '',
                        seats: userData.seats || '',
                        price: userData.price || '45'
                    };
                });
            });
        }
    }, [userData]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsSaved(false);
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div style={{ paddingTop: '20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Daily Commute</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>
                Update your regular pickup, drop-off, and schedule.
            </p>

            <motion.div
                className="glass-panel"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ padding: '24px', borderRadius: '24px' }}
            >
                <div style={{ display: 'grid', gap: '8px' }}>
                    <Input
                        label="From"
                        placeholder="Starting location"
                        icon={MapPin}
                        value={formData.from}
                        onChange={(e) => updateField('from', e.target.value)}
                    />
                    <Input
                        label="To"
                        placeholder="Destination"
                        icon={MapPin}
                        value={formData.to}
                        onChange={(e) => updateField('to', e.target.value)}
                    />
                    <Select
                        label="Departure Time"
                        placeholder="Select Time"
                        icon={Clock}
                        value={formData.time}
                        onChange={(e) => updateField('time', e.target.value)}
                        options={[
                            "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
                            "10:00 AM", "10:30 AM", "11:00 AM"
                        ]}
                    />
                    <Select
                        label="Seats Available"
                        placeholder="Select Seats"
                        icon={Users}
                        value={formData.seats}
                        onChange={(e) => updateField('seats', e.target.value)}
                        options={["1 Seat", "2 Seats", "3 Seats", "4 Seats", "5 Seats", "6 Seats", "7 Seats"]}
                    />
                    <Input
                        label="Price per Seat (₹)"
                        placeholder="45"
                        type="number"
                        icon={IndianRupee}
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                    />

                    <div style={{ marginTop: '20px' }}>
                        <Button variant="primary" onClick={handleSave}>
                            {isSaved ? 'Saved Successfully!' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Commute;
