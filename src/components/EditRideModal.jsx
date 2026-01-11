import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Select from './Select';

const EditRideModal = ({ isOpen, onClose, userData, onSave }) => {
    const [formData, setFormData] = React.useState({
        from: userData?.from || '',
        to: userData?.to || '',
        time: userData?.time || '',
        seats: userData?.seats || '',
        price: userData?.price || '45'
    });

    React.useEffect(() => {
        if (isOpen && userData) {
            setFormData({
                from: userData.from || '',
                to: userData.to || '',
                time: userData.time || '',
                seats: userData.seats || '',
                price: userData.price || '45'
            });
        }
    }, [isOpen, userData]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 1000,
                            backdropFilter: 'blur(5px)'
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed',
                            top: '5vh',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: '400px',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            padding: '24px',
                            borderRadius: '24px',
                            zIndex: 1001
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Edit Ride</h2>
                            <button onClick={onClose} style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
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
                            icon={DollarSign}
                            value={formData.price}
                            onChange={(e) => updateField('price', e.target.value)}
                        />

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditRideModal;
