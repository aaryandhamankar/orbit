import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Plus, Search, ArrowRight, User, Car, ShieldCheck } from 'lucide-react';
import Button, { playClickSound } from '../components/Button';
import SOSFeature from '../components/SOSFeature';
import EditRideModal from '../components/EditRideModal';
import { useState, useEffect, useMemo } from 'react';
import { matchRides } from '../utils/rideMatching';

const Home = ({ userData, onRideComplete, upcomingRide, setUpcomingRide }) => {
    // We can use upcomingRide to pre-populate or just rely on local simulation for now.
    // Ideally Home checks upcomingRide to decide if we are in 'active' mode.
    // For this simulation, we'll keep the local 'joinedRide' state but sync it.

    // Initialize joinedRide from upcomingRide ONLY if it's a ride we joined (rider mode check implicit or based on data structure)
    // For simplicity, if upcomingRide exists and we are in rider mode (or check a flag), we set it.
    const [joinedRide, setJoinedRide] = useState(() => {
        if (upcomingRide && userData?.role !== 'driver') {
            return {
                ...upcomingRide,
                price: upcomingRide.price || upcomingRide.cost, // Ensure price is present from stored cost
                // Ensure passengers or other specific 'joined' props are present if needed
                passengers: upcomingRide.passengers || [
                    { id: 0, name: 'You', pickup: upcomingRide.from }
                ]
            };
        }
        return null;
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(userData);
    const [isMatching, setIsMatching] = useState(false);
    const [isAnimatingSeat, setIsAnimatingSeat] = useState(false);
    // Driver Animation Stage: If upcomingRide exists and we are driver, we should be in 'active' or 'completed' stage?
    // Let's assume 'active' if we have an upcoming ride.
    const [animStage, setAnimStage] = useState(() => {
        if (upcomingRide && userData?.role === 'driver') return 'active';
        return 'idle';
    });
    const [acceptingRequestId, setAcceptingRequestId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setCurrentUserData(userData);
    }, [userData]);
    const [filledSeatsCount, setFilledSeatsCount] = useState(1); // Track accepted riders
    const [showAcceptedRiders, setShowAcceptedRiders] = useState(false);
    const allPossibleRequests = [
        { id: 1, name: 'Priya Sharma', pickup: 'Aundh' },
        { id: 2, name: 'Arjun Patel', pickup: 'Wakad' },
        { id: 3, name: 'Sneha Desai', pickup: 'Hinjewadi' },
        { id: 4, name: 'Rohan Kulkarni', pickup: 'Baner' },
        { id: 5, name: 'Ananya Joshi', pickup: 'Pashan' },
        { id: 6, name: 'Vikram Rao', pickup: 'Aundh' },
        { id: 7, name: 'Neha Gupta', pickup: 'Wakad' }
    ];
    // Initialize pendingRequests with exactly 2 random requests
    const [pendingRequests, setPendingRequests] = useState(allPossibleRequests.slice(0, 2));
    const [acceptedRiders, setAcceptedRiders] = useState([
        { id: 0, name: 'You', pickup: currentUserData?.from || 'Your Location' }
    ]);
    const { role } = currentUserData || {};
    const from = currentUserData?.from || 'Pickup Location';
    const to = currentUserData?.to || 'Dropoff Location';
    const time = currentUserData?.time || '09:00 AM';
    const price = currentUserData?.price || '45';
    const isDriver = role === 'driver';

    // No dynamic logic needed - we start with 2 requests always.

    const puneSpots = [
        { from: 'FC Road', to: 'Deccan Gymkhana', time: '10:00 AM', price: 25 },
        { from: 'Koregaon Park', to: 'Viman Nagar', time: '06:00 PM', price: 40 },
        { from: 'Aundh', to: 'SB Road', time: '08:30 AM', price: 35 },
        { from: 'Magarpatta', to: 'Hadapsar', time: '09:15 AM', price: 20 },
    ];

    /* -------------------------------------------------------------------------- */
    /*                                DRIVER VIEW                                 */
    /* -------------------------------------------------------------------------- */
    const [buttonState, setButtonState] = useState('idle'); // 'idle' | 'completing'
    const [riderButtonState, setRiderButtonState] = useState('idle');

    const handleEndTrip = () => {
        playClickSound('success');
        setButtonState('completing');

        // Show Trip Completed Animation after delay
        setTimeout(() => {
            setAnimStage('completed');

            // Navigate after another delay
            setTimeout(() => {
                onRideComplete({
                    id: Date.now(),
                    date: 'Today',
                    from: from,
                    to: to,
                    cost: parseInt(price) * (filledSeatsCount - 1), // Driver earns total (excluding self)
                    saved: 0 // Driver implementation
                });
                if (setUpcomingRide) {
                    setUpcomingRide(null);
                }
            }, 2500);
        }, 600);
    };

    const handlePublishRide = () => {
        if (from && to && price && time) {
            setAnimStage('searching');
            // Simulate finding riders
            setTimeout(() => {
                setAnimStage('active');
                // Sync to Upcoming Tab
                if (setUpcomingRide) {
                    setUpcomingRide({
                        id: Date.now(),
                        driver: 'You (Driver)',
                        model: 'Your Car',
                        role: 'driver',
                        time: time,
                        from: from,
                        to: to,
                        cost: parseInt(price) * (filledSeatsCount - 1),
                        seatsLeft: 0,
                        filledSeats: filledSeatsCount,
                        price: price
                    });
                }
            }, 2500);
        } else {
            alert('Please fill in all details');
        }
    };

    const handleEndRiderTrip = () => {
        playClickSound('success');
        setRiderButtonState('completing');

        setTimeout(() => {
            setAnimStage('completed');

            setTimeout(() => {
                if (joinedRide) { // Safe check
                    onRideComplete({
                        id: Date.now(),
                        date: 'Today',
                        from: joinedRide.from,
                        to: joinedRide.to,
                        cost: parseInt(joinedRide.price || joinedRide.cost || 0),
                        saved: 45 // Mock saved logic or calc
                    });
                }
            }, 2500);
        }, 600);
    };

    /* -------------------------------------------------------------------------- */
    /*                                DRIVER VIEW                                 */
    /* -------------------------------------------------------------------------- */
    if (isDriver) {
        // "Seats" from data means AVAILABLE passenger seats. Total capacity = passenger seats + 1 (driver)
        const passengerSeats = parseInt(currentUserData?.seats?.split(' ')[0]) || 3;
        const totalSeats = passengerSeats + 1;
        const filledSeats = filledSeatsCount;
        const emptySeats = totalSeats - filledSeats;
        const cardArcEntry = {
            initial: { opacity: 0, x: -16, y: 24 },
            animate: { opacity: 1, x: 0, y: 0 },
            transition: { ease: "easeOut", duration: 0.45 }
        };

        const OrbitingEmptyState = ({ text }) => (
            <div className="glass-panel" style={{ padding: '40px 20px', borderRadius: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="animate-orbit" style={{ width: '60px', height: '60px', margin: '0 auto 20px', position: 'relative', animationDuration: '7s' }}>
                    {[0, 120, 240].map((deg, i) => (
                        <div key={i} style={{
                            position: 'absolute', top: '50%', left: '50%', width: '8px', height: '8px',
                            background: i === 0 ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.2)',
                            borderRadius: '50%', transform: `rotate(${deg}deg) translate(25px) rotate(-${deg}deg)`,
                            boxShadow: i === 0 ? '0 0 10px var(--color-brand-primary)' : 'none'
                        }} />
                    ))}
                </div>
                <motion.p
                    animate={{ opacity: [0.4, 0.65, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}
                >
                    {text}
                </motion.p>
            </div>
        );

        const handleAcceptRequest = () => {
            if (filledSeats < totalSeats) {
                setFilledSeatsCount(prev => prev + 1);
            }
        };

        const handleAcceptSpecificRequest = (requestId) => {
            if (filledSeats < totalSeats) {
                setAcceptingRequestId(requestId);
                playClickSound('success'); // Celebratory sound
                // Direct success state, no complex animation stages
                setTimeout(() => {
                    const request = pendingRequests.find(r => r.id === requestId);
                    if (request) {
                        setAcceptedRiders(prev => [...prev, request]);
                        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
                        setFilledSeatsCount(prev => prev + 1);

                        const remainingRequests = pendingRequests.length - 1;
                        const newFilledSeats = filledSeats + 1;

                        if (remainingRequests === 0 || newFilledSeats >= totalSeats) {
                            setShowAcceptedRiders(true);
                        }
                    }
                    setShowSuccess(true);

                    // Cleanup
                    setTimeout(() => {
                        setAcceptingRequestId(null);
                        setShowSuccess(false);
                    }, 2000);
                }, 600); // Small delay for "processing" feel
            }
        };


        return (
            <div style={{ paddingTop: '20px', position: 'relative' }}>
                <AnimatePresence>
                    {showSuccess && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'fixed', inset: 0,
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    backdropFilter: 'blur(5px)',
                                    zIndex: 190, pointerEvents: 'auto'
                                }}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                style={{
                                    position: 'fixed', bottom: '100px', left: '50%', x: '-50%',
                                    zIndex: 200, textAlign: 'center', pointerEvents: 'none',
                                    width: '80%'
                                }}
                            >
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-brand-primary)', textShadow: '0 0 20px rgba(217, 164, 88, 0.5)' }}>
                                    Rider added to your orbit.
                                </h2>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
                                    {totalSeats - filledSeats} seats remaining.
                                </p>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* SOS is active for Driver because this is their dashboard for today's ride */}
                <SOSFeature isActive={true} />

                {/* Driver Header */}
                <div style={{ paddingBottom: '20px', position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
                        Good morning, <span className="text-gradient">{currentUserData?.name || 'Traveler'}</span>
                    </h1>
                </div>

                {/* Driver Orbit Background: Expanding Rings */}
                <div style={{ position: 'fixed', top: '25%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }}>
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
                            style={{
                                position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%',
                                width: '300px', height: '300px',
                                borderRadius: '50%',
                                border: '1px solid rgba(217, 164, 88, 0.1)',
                            }}
                        />
                    ))}
                </div>

                {/* Active Ride Card */}
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Today's Ride</h3>
                <motion.div
                    className="glass-panel"
                    {...cardArcEntry}
                    whileHover={{
                        y: -4,
                        borderColor: 'rgba(217, 164, 88, 0.4)',
                        backdropFilter: 'blur(25px)'
                    }}
                    style={{
                        padding: '20px', borderRadius: '24px', marginBottom: '30px',
                        position: 'relative', overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'border-color 0.3s ease'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gradient-orbit)' }}></div>

                    {/* Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{
                            background: 'rgba(255, 77, 77, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 77, 77, 0.2)'
                        }}>
                            <span style={{ fontSize: '0.8rem', color: '#FF4D4D', fontWeight: '700', letterSpacing: '0.5px' }}>● LIVE</span>
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{time}</span>
                    </div>

                    {/* Route */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {/* Timeline Graphic */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)', background: 'var(--color-bg-card)' }}></div>
                            <div style={{ width: '2px', background: 'rgba(255,255,255,0.1)', flex: 1, minHeight: '30px', margin: '4px 0' }}></div>
                            <MapPin size={16} color="var(--color-brand-secondary)" style={{ marginBottom: '2px' }} />
                        </div>

                        {/* Locations */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                            <div>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>From</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{from}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>To</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{to}</p>
                            </div>
                        </div>
                    </div>



                    {/* Seats Visualization */}
                    <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Seats</p>
                            <motion.div
                                animate={{ opacity: [1, 0.7, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(217, 164, 88, 0.1)', padding: '4px 10px', borderRadius: '20px',
                                    border: '1px solid rgba(217, 164, 88, 0.4)'
                                }}
                            >
                                <span style={{ width: '6px', height: '6px', background: 'var(--color-brand-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-brand-primary)' }}></span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: '600' }}>{emptySeats} can join</span>
                            </motion.div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Filled Seats */}
                            {Array.from({ length: filledSeats }).map((_, i) => (
                                <div key={`filled-${i}`} style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--gradient-orbit)',
                                    border: '2px solid #000',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 10px rgba(217,164, 88, 0.4)'
                                }}>
                                    <User size={16} color="#000" />
                                </div>
                            ))}
                            {/* Empty Seats - Simple, static */}
                            {Array.from({ length: emptySeats }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        border: '2px solid rgba(217, 164, 88, 0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        zIndex: 5
                                    }}
                                >
                                    <User size={16} color='rgba(217, 164, 88, 0.5)' />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cost */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Cost per passenger</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-brand-primary)' }}>₹{price}</span>
                    </div>

                    {/* Primary Action */}
                    <Button variant="primary" onClick={() => setShowAcceptedRiders(!showAcceptedRiders)}>
                        {showAcceptedRiders ? 'View Requests' : `View Riders (${acceptedRiders.length})`} <ArrowRight size={18} />
                    </Button>
                </motion.div>

                {/* Secondary Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                    <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                        Edit Ride
                    </Button>
                    <Button variant="danger">
                        Cancel Ride
                    </Button>
                </div>

                {/* End Trip Action */}
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleEndTrip}
                        style={{
                            background: 'var(--color-brand-primary)', // Standard Brand Color
                            color: '#1A2433', // Dark text
                            border: 'none',
                            borderRadius: '9999px', // Pill shape
                            padding: '16px 32px',
                            fontSize: '1rem',
                            fontWeight: '600', // Semibold
                            boxShadow: '0 4px 15px rgba(217, 164, 88, 0.4)', // Slightly brighter shadow match
                            display: 'flex', alignItems: 'center', gap: '10px',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: '200px',
                            justifyContent: 'center'
                        }}
                    >
                        {buttonState === 'completing' ? (
                            'Completing...'
                        ) : (
                            <>Complete trip <ShieldCheck size={20} /></>
                        )}
                    </motion.button>
                </div>

                {/* Requests Section */}
                {
                    !showAcceptedRiders ? (
                        <>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Pending Requests ({pendingRequests.length})</h3>
                            {pendingRequests.length > 0 ? (
                                pendingRequests.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        layout
                                        animate={{
                                            scale: acceptingRequestId === request.id ? 1.05 : 1,
                                            boxShadow: acceptingRequestId === request.id ? '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(217, 164, 88, 0.3)' : 'none',
                                            y: acceptingRequestId === request.id ? -10 : 0,
                                            zIndex: acceptingRequestId === request.id ? 100 : 1,
                                            opacity: (acceptingRequestId && acceptingRequestId !== request.id) ? 0.4 : 1,
                                            borderColor: acceptingRequestId === request.id ? 'rgba(217, 164, 88, 0.6)' : 'rgba(255, 255, 255, 0.05)'
                                        }}
                                        whileHover={!acceptingRequestId ? {
                                            y: -4,
                                            borderColor: 'rgba(217, 164, 88, 0.4)',
                                            backdropFilter: 'blur(25px)'
                                        } : {}}
                                        className="glass-panel"
                                        style={{
                                            padding: '20px', borderRadius: '20px', display: 'flex',
                                            alignItems: 'center', gap: '16px', marginBottom: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg-deep)', border: '2px solid var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                            <div className="animate-pulse-ring" style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid var(--color-brand-primary)' }}></div>
                                            <User size={20} color="var(--color-text-primary)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600' }}>{request.name}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Pickup: {request.pickup}</p>
                                        </div>
                                        <Button
                                            variant="primary"
                                            whileTap={{ scale: 0.85 }}
                                            style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto' }}
                                            onClick={() => handleAcceptSpecificRequest(request.id)}
                                            disabled={filledSeats >= totalSeats || acceptingRequestId === request.id}
                                        >
                                            {acceptingRequestId === request.id ? <ShieldCheck size={16} /> : (filledSeats >= totalSeats ? 'Full' : 'Accept')}
                                        </Button>
                                    </motion.div>
                                ))
                            ) : (
                                <OrbitingEmptyState text="Waiting for new requests..." />
                            )}
                        </>
                    ) : (
                        <>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Accepted Riders ({acceptedRiders.length})</h3>
                            {acceptedRiders.map((rider) => (
                                <div
                                    key={rider.id}
                                    className="glass-panel"
                                    style={{ padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: rider.id === 0 ? 'var(--gradient-orbit)' : 'var(--color-bg-deep)',
                                        border: '2px solid var(--color-text-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <User size={20} color={rider.id === 0 ? '#000' : 'var(--color-text-primary)'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '600' }}>{rider.name}</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Pickup: {rider.pickup}</p>
                                    </div>
                                    {rider.id === 0 && (
                                        <div style={{
                                            background: 'rgba(230, 184, 112, 0.2)',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(230, 184, 112, 0.3)'
                                        }}>
                                            <span style={{ fontSize: '0.75rem', color: '#E6B870', fontWeight: '600' }}>DRIVER</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {animStage === 'active' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        padding: '30px 20px',
                                        background: 'var(--color-bg-card)',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        textAlign: 'center',
                                        marginBottom: '30px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Glowing Pulse Effect for Active Status */}
                                    <div className="animate-pulse-ring" style={{
                                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                        width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(217,164,88,0.2) 0%, transparent 70%)',
                                        borderRadius: '50%', zIndex: 0, pointerEvents: 'none'
                                    }}></div>

                                    <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', position: 'relative', zIndex: 1 }}>Riders Found!</h2>
                                    {/* Use handlePublishRide logic here essentially, but we are already in 'active' stage so this is post-publish view */}
                                    <p style={{ color: 'var(--color-text-secondary)', position: 'relative', zIndex: 1 }}>
                                        <span style={{ color: 'var(--color-brand-primary)', fontWeight: '700' }}>{filledSeats} people</span> joining you
                                    </p>
                                </motion.div>
                            )}
                        </>
                    )
                }

                {/* Edit Ride Modal */}
                <EditRideModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    userData={currentUserData}
                    onSave={(updatedData) => setCurrentUserData({ ...currentUserData, ...updatedData })}
                />

                {animStage === 'completed' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(13, 17, 23, 0.95)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <h1 style={{
                            fontSize: '3rem', fontWeight: '900',
                            background: 'linear-gradient(to right, #4ade80, #22c55e)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            letterSpacing: '2px', textShadow: '0 0 30px rgba(74, 222, 128, 0.5)',
                            textAlign: 'center'
                        }}>
                            TRIP<br />COMPLETED
                        </h1>
                        <p style={{ color: '#fff', marginTop: '20px', fontSize: '1.2rem' }}>Earned ₹{parseInt(price) * (filledSeats - 1)}</p>
                    </motion.div>
                )}
            </div >
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                                 RIDER VIEW                                 */
    /* -------------------------------------------------------------------------- */
    /* -------------------------------------------------------------------------- */
    /*                                 RIDER VIEW                                 */
    /* -------------------------------------------------------------------------- */

    // Mock Rider Request (Dynamic based on user's current "to" location)
    const riderRequest = {
        time: '09:00 AM', // In a real app, this would also be dynamic
        distance: 7.0, // approx km marker for Aundh
        to: to // Match the user's requested dropoff
    };

    const rawAvailableRides = [
        {
            id: 1,
            driver: 'Rahul Mehta',
            vehicle: 'Swift Dzire',
            time: '09:05 AM', // 5 min diff -> Score 30
            from: from, // Dynamic pickup
            to: to, // Dynamic destination
            distance: 7.2, // 0.2km diff -> Score ~10
            filledSeats: 2,
            totalSeats: 4,
            price: 45,
            verified: true,
            duration: 45 // minutes
        },
        {
            id: 2,
            driver: 'Ananya Singh',
            vehicle: 'Honda Activa',
            time: '09:15 AM', // 15 min diff -> Score 20
            from: from, // Dynamic pickup
            to: to, // Dynamic destination
            distance: 9.0, // 2km diff -> Score ~8
            filledSeats: 0,
            totalSeats: 1,
            price: 25,
            verified: true,
            duration: 35 // minutes
        },
        {
            id: 3,
            driver: 'Vikram Patel',
            vehicle: 'Hyundai Creta',
            time: '09:40 AM', // 40 min diff -> Score 0
            from: from, // Dynamic pickup
            to: to, // Dynamic destination
            distance: 0.0, // 7km diff -> Score ~3
            filledSeats: 1,
            totalSeats: 4,
            price: 60,
            verified: true,
            duration: 55 // minutes
        },
        {
            id: 4,
            driver: 'Sneha Kapoor',
            vehicle: 'Tata Nexon',
            time: '08:50 AM', // 10 min diff -> Score 30
            from: from, // Dynamic pickup
            to: to, // Dynamic destination
            distance: 5.5, // 1.5km diff -> Score ~8.5
            filledSeats: 2,
            totalSeats: 4,
            price: 35,
            verified: true,
            duration: 50 // minutes
        },
    ];

    // Helper to calculate ETA
    const calculateEta = (startTime, durationMinutes) => {
        // Parse "HH:MM AM/PM"
        const [timePart, modifier] = startTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (hours === 12) hours = 0;
        if (modifier === 'PM') hours += 12;

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        // Add duration
        date.setMinutes(date.getMinutes() + durationMinutes);

        // Format back
        let newHours = date.getHours();
        const newModifier = newHours >= 12 ? 'PM' : 'AM';
        newHours = newHours % 12 || 12;
        const newMinutes = date.getMinutes().toString().padStart(2, '0');

        return `${newHours}:${newMinutes} ${newModifier}`;
    };

    const availableRides = useMemo(() => {
        return matchRides(riderRequest, rawAvailableRides);
    }, []);

    const handleJoinRide = (ride) => {
        playClickSound('success'); // Celebratory sound
        setIsMatching(true);

        // Match Animation Delay
        setTimeout(() => {
            setIsMatching(false);
            setJoinedRide({
                ...ride,
                passengers: [
                    { id: 0, name: 'You', pickup: from },
                    { id: 1, name: 'Priya Sharma', pickup: 'Aundh' },
                    { id: 2, name: 'Arjun Patel', pickup: 'Wakad' }
                ].slice(0, ride.filledSeats + 1) // Include existing + you
            });
            // Sync to Upcoming Tab
            if (setUpcomingRide) {
                setUpcomingRide({
                    id: ride.id,
                    driver: ride.driver,
                    model: ride.vehicle,
                    role: 'rider', // Tag as rider ride
                    time: ride.time,
                    from: ride.from,
                    to: ride.to,
                    cost: ride.price,
                    // Store passengers so we can restore joined state
                    passengers: [
                        { id: 0, name: 'You', pickup: from || ride.from }, // Ensure 'from' fallback
                        ...[
                            { id: 1, name: 'Priya Sharma', pickup: 'Aundh' },
                            { id: 2, name: 'Arjun Patel', pickup: 'Wakad' }
                        ].slice(0, ride.filledSeats)
                    ]
                });
            }
        }, 3200); // 3.2s for full animation sequence
    };

    // If rider has joined a ride, show joined ride view
    if (joinedRide) {
        return (
            <div style={{ paddingTop: '20px' }}>
                <SOSFeature isActive={true} />
                {/* Header */}
                <div style={{ paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
                        Your Ride
                    </h1>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(76, 175, 80, 0.2)',
                        padding: '6px 12px', borderRadius: '20px',
                        border: '1px solid rgba(76, 175, 80, 0.3)'
                    }}>
                        <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }}></span>
                        <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: '600' }}>CONFIRMED</span>
                    </div>
                </div>

                {/* Ride Details Card */}
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Trip Details</h3>
                <motion.div
                    className="glass-panel"
                    style={{ padding: '20px', borderRadius: '24px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gradient-orbit)' }}></div>

                    {/* Driver Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-bg-deep)', border: '2px solid var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={28} color="var(--color-text-primary)" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{joinedRide.driver}</p>
                                    <ShieldCheck size={16} color="#4ade80" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    <Car size={14} color="#aaa" />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{joinedRide.vehicle}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255, 183, 3, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 183, 3, 0.3)'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#FFB703', fontWeight: '600' }}>DRIVER</span>
                        </div>
                    </div>

                    {/* Route */}
                    {/* Route */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {/* Timeline Graphic */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)', background: 'var(--color-bg-card)' }}></div>
                            <div style={{ width: '2px', background: 'rgba(255,255,255,0.1)', flex: 1, minHeight: '30px', margin: '4px 0' }}></div>
                            <MapPin size={16} color="var(--color-brand-secondary)" style={{ marginBottom: '2px' }} />
                        </div>

                        {/* Locations */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                            <div>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>From</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{joinedRide.from}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>To</p>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{joinedRide.to}</p>
                            </div>
                        </div>
                    </div>

                    {/* Time & Cost */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px' }}>
                            <Clock size={16} color="#aaa" />
                            <span style={{ fontSize: '1rem', fontWeight: '600' }}>{joinedRide.time}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Your cost</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-brand-primary)' }}>₹{joinedRide.price}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Passengers */}
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Fellow Passengers ({joinedRide.passengers.length})</h3>
                {joinedRide.passengers.map((passenger) => (
                    <div
                        key={passenger.id}
                        className="glass-panel"
                        style={{ padding: '16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: passenger.id === 0 ? 'var(--gradient-orbit)' : 'var(--color-bg-deep)',
                            border: '2px solid var(--color-text-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <User size={20} color={passenger.id === 0 ? '#000' : 'var(--color-text-primary)'} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '600' }}>{passenger.name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Pickup: {passenger.pickup}</p>
                        </div>
                        {passenger.id === 0 && (
                            <div style={{
                                background: 'rgba(251, 86, 7, 0.2)',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                border: '1px solid rgba(251, 86, 7, 0.3)'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: '#FB5607', fontWeight: '600' }}>YOU</span>
                            </div>
                        )}
                    </div>
                ))}

                {/* Actions */}
                <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
                    <Button variant="danger" onClick={() => setJoinedRide(null)} style={{ flex: 1 }}>
                        Leave
                    </Button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleEndRiderTrip}
                        style={{
                            flex: 2,
                            background: 'var(--gradient-orbit)', // Changed to use gradient
                            color: '#1A2433',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '16px 32px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(217, 164, 88, 0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        {riderButtonState === 'completing' ? 'Completing...' : <>Complete trip <ShieldCheck size={18} /></>}
                    </motion.button>
                </div>

                {animStage === 'completed' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(13, 17, 23, 0.95)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <h1 style={{
                            fontSize: '3rem', fontWeight: '900',
                            background: 'linear-gradient(to right, #4ade80, #22c55e)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            letterSpacing: '2px', textShadow: '0 0 30px rgba(74, 222, 128, 0.5)',
                            textAlign: 'center'
                        }}>
                            ARRIVED
                        </h1>
                        <p style={{ color: '#fff', marginTop: '20px', fontSize: '1.2rem' }}>You saved ₹45 on this trip.</p>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '20px' }}>
            {/* Rider Header */}
            <div style={{ paddingBottom: '20px', position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
                    Good morning, <span className="text-gradient">{userData?.name || 'Traveler'}</span>
                </h1>
            </div>

            {/* Rider Orbit Background: Contracting Rings (Inward Pull) */}
            <div style={{ position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }}>
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 0.8, opacity: 0.3 }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeIn" }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%',
                            width: '400px', height: '400px',
                            borderRadius: '50%',
                            border: '1px solid rgba(193, 106, 83, 0.15)', // Terracotta for rider/destination feel
                        }}
                    />
                ))}
            </div>

            {/* Available Rides */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Rides near you</h3>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(217, 164, 88, 0.1)', padding: '4px 10px', borderRadius: '20px',
                    border: '1px solid rgba(217, 164, 88, 0.2)'
                }}>
                    <span style={{ width: '6px', height: '6px', background: 'var(--color-brand-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-brand-primary)' }}></span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: '500' }}>
                        {availableRides.length} verified ride{availableRides.length !== 1 ? 's' : ''} found
                    </span>
                </div>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Based on your route and time</p>

            {availableRides.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
                    {availableRides.map((ride) => (
                        <motion.div
                            key={ride.id}
                            className="glass-panel"
                            whileHover={{
                                y: -4,
                                borderColor: 'rgba(217, 164, 88, 0.4)',
                                backdropFilter: 'blur(25px)'
                            }}
                            style={{
                                padding: '20px', borderRadius: '24px', position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                transition: 'border-color 0.3s ease'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gradient-orbit)' }}></div>

                            {/* Driver Info */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg-deep)', border: '2px solid var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={24} color="var(--color-text-primary)" />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <p style={{ fontWeight: '600' }}>{ride.driver}</p>
                                            {ride.verified && <ShieldCheck size={14} color="#4ade80" />}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            <Car size={12} color="#aaa" />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{ride.vehicle}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-brand-primary)' }}>₹{ride.price}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>per seat</p>
                                </div>
                            </div>

                            {/* Route */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(217, 164, 88, 0.1)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)' }}></div>
                                    <div style={{ width: '1px', height: '20px', background: 'rgba(217, 164, 88, 0.3)' }}></div>
                                    <MapPin size={12} color="var(--color-brand-secondary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{ride.from}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '4px 0' }}>to</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{ride.to}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'rgba(255,255,255,0.08)',
                                        padding: '6px 12px', borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <Clock size={14} color="var(--color-text-secondary)" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px' }}>{ride.time}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'rgba(74, 222, 128, 0.1)',
                                        padding: '4px 8px', borderRadius: '8px',
                                        border: '1px solid rgba(74, 222, 128, 0.2)'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '600' }}>ETA {calculateEta(ride.time, ride.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seats Visualization (Matched to Driver Mode) */}
                            <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Seats</p>
                                    <motion.div
                                        animate={{ opacity: [1, 0.7, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: 'rgba(217, 164, 88, 0.1)', padding: '4px 10px', borderRadius: '20px',
                                            border: '1px solid rgba(217, 164, 88, 0.4)'
                                        }}
                                    >
                                        <span style={{ width: '6px', height: '6px', background: 'var(--color-brand-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-brand-primary)' }}></span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: '600' }}>
                                            {ride.totalSeats - ride.filledSeats} left
                                        </span>
                                    </motion.div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {/* Filled Seats */}
                                    {Array.from({ length: ride.filledSeats }).map((_, i) => (
                                        <div key={`filled-${i}`} style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: 'var(--gradient-orbit)',
                                            border: '2px solid #000',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={16} color="#000" />
                                        </div>
                                    ))}
                                    {/* Empty Seats with Pulse */}
                                    {Array.from({ length: ride.totalSeats - ride.filledSeats }).map((_, i) => (
                                        <motion.div
                                            key={`empty-${i}`}
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                border: '2px dashed rgba(217, 164, 88, 0.5)',
                                                background: 'rgba(217, 164, 88, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <User size={16} color="rgba(217, 164, 88, 0.5)" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Join Button */}
                            <Button variant="primary" onClick={() => handleJoinRide(ride)}>
                                Join Ride <ArrowRight size={18} />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '40px 20px', borderRadius: '24px', textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No rides yet</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Drivers usually appear closer to departure
                    </p>
                    <Button variant="secondary">
                        Notify me when a ride appears
                    </Button>
                </div>
            )}

            {/* Match Animation Overlay */}
            <AnimatePresence>
                {isMatching && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100,
                            background: 'rgba(13, 17, 23, 0.9)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                        }}
                    >
                        {/* Orbit Ripples */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ width: '100px', height: '100px', opacity: 0.8, border: '2px solid rgba(255, 183, 3, 0.5)' }}
                                    animate={{
                                        width: ['100px', '600px'],
                                        height: ['100px', '600px'],
                                        opacity: [0.8, 0],
                                        borderWidth: ['2px', '0px']
                                    }}
                                    transition={{ duration: 2, delay: i * 0.4, ease: "easeOut", repeat: Infinity }}
                                    style={{ position: 'absolute', borderRadius: '50%' }}
                                />
                            ))}
                        </div>

                        {/* Matched Text */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                            style={{ zIndex: 10, marginBottom: '60px' }}
                        >
                            <h1 style={{
                                fontSize: '3rem', fontWeight: '900',
                                background: 'linear-gradient(to right, #FFB703, #FB5607)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                letterSpacing: '2px', textShadow: '0 0 30px rgba(255, 183, 3, 0.5)'
                            }}>
                                MATCHED!
                            </h1>
                        </motion.div>

                        {/* Avatars Snapping Animation */}
                        <div style={{ position: 'relative', width: '200px', height: '100px', zIndex: 10 }}>
                            {/* Connector Line */}
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '100px', opacity: 1 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    height: '2px', background: 'linear-gradient(90deg, #FFB703, #FB5607)'
                                }}
                            />

                            {/* Driver Avatar (Left) */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.8, type: 'spring' }}
                                style={{
                                    position: 'absolute', top: '50%', left: '25%', transform: 'translate(-50%, -50%)',
                                    width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #FFB703',
                                    background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(255, 183, 3, 0.4)'
                                }}
                            >
                                <User size={30} color="#fff" />
                            </motion.div>

                            {/* Rider Avatar (Right) - Snapping in */}
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.2, type: 'spring', stiffness: 150 }}
                                style={{
                                    position: 'absolute', top: '50%', right: '25%', transform: 'translate(50%, -50%)',
                                    width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #FB5607',
                                    background: 'var(--gradient-orbit)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(251, 86, 7, 0.4)'
                                }}
                            >
                                <User size={30} color="#000" />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Home;
