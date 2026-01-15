import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Plus, Search, ArrowRight, User, Car, ShieldCheck, Edit2, Ban, LogOut, Bell, BellOff } from 'lucide-react';
import Button from '../components/Button';
import { playClickSound } from '../utils/sound';
import SOSFeature from '../components/SOSFeature';
import EditRideModal from '../components/EditRideModal';
import { useState, useEffect } from 'react';
import { matchRides } from '../utils/rideMatching';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, updateDoc, doc, increment, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Helper function to calculate ETA
const calculateEta = (rideTime, duration) => {
    // Simple ETA calculation based on ride time and duration
    // For MVP, just return the duration in minutes
    return `${duration} min`;
};


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

    // Sync local joinedRide with global upcomingRide source of truth
    useEffect(() => {
        if (upcomingRide && userData?.role !== 'driver') {
            // Validate that the ride still exists in Firestore
            const rideRef = doc(db, 'rides', upcomingRide.id);
            getDoc(rideRef).then((docSnap) => {
                if (docSnap.exists() && docSnap.data().status === 'active') {
                    setJoinedRide({
                        ...upcomingRide,
                        price: upcomingRide.price || upcomingRide.cost,
                        passengers: upcomingRide.passengers || [
                            { id: 0, name: 'You', pickup: upcomingRide.from }
                        ]
                    });
                } else {
                    // Ride no longer exists or was cancelled, clear it
                    console.log('⚠️ Stored ride no longer active, clearing...');
                    setJoinedRide(null);
                    if (setUpcomingRide) setUpcomingRide(null);
                }
            }).catch((err) => {
                console.error('Error validating ride:', err);
                setJoinedRide(null);
                if (setUpcomingRide) setUpcomingRide(null);
            });
        } else if (!upcomingRide && userData?.role !== 'driver') {
            // Clear joined ride if global state clears
            setJoinedRide(null);
        }
    }, [upcomingRide, userData, setUpcomingRide]);
    const [filledSeatsCount, setFilledSeatsCount] = useState(1); // Track accepted riders
    const [driverViewMode, setDriverViewMode] = useState('requests'); // 'requests' | 'riders'
    const [completionEarnings, setCompletionEarnings] = useState(0); // Store earnings for animation display
    const allPossibleRequests = [
        { id: 1, name: 'Priya Sharma', pickup: 'Aundh' },
        { id: 2, name: 'Arjun Patel', pickup: 'Wakad' },
        { id: 3, name: 'Sneha Desai', pickup: 'Hinjewadi' },
        { id: 4, name: 'Rohan Kulkarni', pickup: 'Baner' },
        { id: 5, name: 'Ananya Joshi', pickup: 'Pashan' },
        { id: 6, name: 'Vikram Rao', pickup: 'Aundh' },
        { id: 7, name: 'Neha Gupta', pickup: 'Wakad' }
    ];
    // Initialize pendingRequests as EMPTY - will be populated when ride is published
    const [pendingRequests, setPendingRequests] = useState([]);
    const [acceptedRiders, setAcceptedRiders] = useState([
        { id: 0, name: 'You', pickup: currentUserData?.from || 'Your Location' }
    ]);

    // Real-Time Ride State
    const [activeRideId, setActiveRideId] = useState(null);
    const [myLiveRide, setMyLiveRide] = useState(null);

    const { role } = currentUserData || {};
    const from = currentUserData?.from || 'Pickup Location';
    const to = currentUserData?.to || 'Dropoff Location';
    const time = currentUserData?.time || '09:00 AM';
    const price = currentUserData?.price || '45';
    const isDriver = role === 'driver';

    // No dynamic logic needed - we start with 2 requests always.



    // Real-Time Rider Logic (Moved up to avoid conditional hook errors)
    const riderRequest = {
        time: '09:00 AM',
        distance: 7.0,
        to: to
    };

    const [realtimeRides, setRealtimeRides] = useState([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [previousRideCount, setPreviousRideCount] = useState(0);

    useEffect(() => {
        if (userData?.uid) {
            console.log('🔍 Setting up real-time ride listener for user:', userData.uid);

            // TEMPORARY: Single-field query to bypass index requirement
            // TODO: Re-enable compound query once indexes are built
            const q = query(
                collection(db, "rides"),
                where("status", "==", "active")
                // where("seatsAvailable", ">", 0) // Temporarily commented out
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                console.log('📡 Snapshot received! Total docs:', snapshot.docs.length);
                const rides = snapshot.docs
                    .map(doc => {
                        const data = doc.data();
                        console.log('📝 Processing ride:', doc.id, data);
                        if (data.driverId === userData.uid) {
                            console.log('⏭️  Skipping own ride:', doc.id);
                            return null;
                        }
                        // Client-side filter for seatsAvailable (temporary)
                        if (data.seatsAvailable <= 0) {
                            console.log('⏭️  Skipping full ride:', doc.id);
                            return null;
                        }
                        return {
                            id: doc.id,
                            driver: data.driverName,
                            vehicle: 'Electric Sedan',
                            time: data.time,
                            from: data.from,
                            to: data.to,
                            distance: 5.0,
                            filledSeats: data.seatsTotal - data.seatsAvailable,
                            seatsAvailable: data.seatsAvailable,
                            totalSeats: data.seatsTotal,
                            price: data.cost,
                            verified: true,
                            duration: 45
                        };
                    })
                    .filter(Boolean);
                console.log('✅ Available rides after filtering:', rides.length, rides);
                setRealtimeRides(rides);
            }, (error) => {
                console.error('❌ Error in ride listener:', error);
            });
            return () => unsubscribe();
        }
    }, [userData]);

    // Detect new rides and trigger notifications
    useEffect(() => {
        if (notificationsEnabled && realtimeRides.length > previousRideCount && previousRideCount > 0) {
            // New ride appeared!
            console.log('🔔 New ride detected! Triggering notification...');

            // Haptic vibration
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]); // Pattern: vibrate-pause-vibrate
            }

            // Success chime sound
            playClickSound('success');
        }

        // Update count for next comparison
        setPreviousRideCount(realtimeRides.length);
    }, [realtimeRides, notificationsEnabled, previousRideCount]);

    const availableRides = realtimeRides;

    // Rider: Track pending requests to prevent duplicates
    const [myPendingRequests, setMyPendingRequests] = useState(new Set());
    const [justJoinedRide, setJustJoinedRide] = useState(null); // Track recently joined ride for animation

    // Rider: 1. Listen for acceptance (Initial Join)
    useEffect(() => {
        if (userData?.uid && !isDriver && realtimeRides.length > 0 && !joinedRide) {
            console.log('🎫 Rider: Listening for acceptance...');
            const listeners = [];

            realtimeRides.forEach(ride => {
                const requestsRef = collection(db, 'rides', ride.id, 'requests');
                const q = query(requestsRef, where('riderId', '==', userData.uid));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    snapshot.docs.forEach(reqDoc => {
                        const reqData = reqDoc.data();
                        // Only react to NEWLY accepted requests
                        if (reqData.status === 'accepted') {
                            console.log('🎉 Request accepted! Joining ride:', ride.id);
                            setIsMatching(true);

                            setTimeout(() => {
                                setIsMatching(false);
                                if (setUpcomingRide) {
                                    setUpcomingRide({
                                        id: ride.id,
                                        driver: ride.driver,
                                        model: ride.vehicle,
                                        role: 'rider',
                                        time: ride.time,
                                        from: ride.from,
                                        to: ride.to,
                                        cost: ride.price,
                                        passengers: [] // Will be populated by the sync listener
                                    });
                                }
                            }, 2000);
                        }
                    });
                });
                listeners.push(unsubscribe);
            });
            return () => listeners.forEach(unsub => unsub());
        }
    }, [userData, isDriver, realtimeRides, joinedRide, setUpcomingRide]);

    // Rider: 2. Sync Fellow Passengers & 3. Monitor Ride Status (Cancellation/Completion)
    useEffect(() => {
        const currentUid = auth.currentUser?.uid || userData?.uid;
        if (joinedRide?.id && currentUid) {
            console.log('🔄 Syncing ride data for:', joinedRide.id);

            // A. Monitor Ride Status (Cancellation/Completion) + Get Seat Info
            const rideRef = doc(db, 'rides', joinedRide.id);
            const unsubRide = onSnapshot(rideRef, (docSnap) => {
                if (!docSnap.exists() || docSnap.data().status === 'cancelled') {
                    console.log('🚫 Ride cancelled or deleted');
                    alert('⚠️ The driver has cancelled this ride.');
                    setJoinedRide(null);
                    if (setUpcomingRide) setUpcomingRide(null);
                    return;
                }

                const rideData = docSnap.data();

                // Check for completion
                if (rideData.status === 'completed') {
                    console.log('✅ Ride completed by driver!');
                    setAnimStage('completed');
                    playClickSound('success');

                    // Auto-navigate after animation
                    setTimeout(() => {
                        setJoinedRide(null);
                        if (setUpcomingRide) setUpcomingRide(null);
                        setAnimStage('idle');
                        if (onRideComplete) onRideComplete();
                    }, 3000);
                    return;
                }

                // Store ride data for seat calculation
                console.log('🪑 Seat info:', {
                    total: rideData.seatsTotal,
                    available: rideData.seatsAvailable,
                    filled: rideData.seatsTotal - rideData.seatsAvailable
                });
            });

            // B. Sync Fellow Passengers (Real + Mock)
            const requestsRef = collection(db, 'rides', joinedRide.id, 'requests');
            const q = query(requestsRef, where('status', '==', 'accepted'));

            const unsubPassengers = onSnapshot(q, async (snapshot) => {
                // Get ride data to calculate total filled seats
                const rideSnap = await getDoc(rideRef);
                if (!rideSnap.exists()) return;

                const rideData = rideSnap.data();
                const totalFilledSeats = rideData.seatsTotal - rideData.seatsAvailable;

                const realPassengers = snapshot.docs
                    .filter(doc => doc.data().riderId !== currentUid) // Use reliable UID
                    .map(doc => ({
                        id: doc.id,
                        name: doc.data().riderName,
                        pickup: doc.data().pickup || from || userData.from || "Nearby", // Fallback for mock empty pickup
                        isReal: true
                    }));

                // Calculate mock passengers needed: total filled - 1 (me) - real count
                const mockNeeded = Math.max(0, totalFilledSeats - 1 - realPassengers.length);
                const mockNames = ['Priya Sharma', 'Arjun Patel', 'Rohan Kulkarni'];
                const mockPassengers = Array(mockNeeded).fill(0).map((_, i) => ({
                    id: `mock-${i}`,
                    name: mockNames[i] || 'Passenger',
                    pickup: from || userData.from || 'Pickup Location', // Use user's from location
                    isReal: false
                }));

                console.log('👥 Syncing passengers:', {
                    total: totalFilledSeats,
                    real: realPassengers.length,
                    mock: mockNeeded
                });

                // Update joinedRide with passengers (UI renders from joinedRide.passengers)
                setJoinedRide(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        passengers: [
                            { id: 0, name: 'You', pickup: from || prev.from },
                            ...realPassengers,
                            ...mockPassengers
                        ]
                    };
                });

                // Also update upcomingRide if it exists
                if (setUpcomingRide) {
                    setUpcomingRide(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            passengers: [
                                { id: 0, name: 'You', pickup: from || prev.from },
                                ...realPassengers,
                                ...mockPassengers
                            ]
                        };
                    });
                }
            });

            return () => {
                unsubRide();
                unsubPassengers();
            };
        }
    }, [joinedRide?.id, userData, setUpcomingRide, from]);

    const handleJoinRide = async (ride) => {
        if (myPendingRequests.has(ride.id)) {
            alert('You already sent a request for this ride!');
            return;
        }

        try {
            // Check if request already exists in Firestore for THIS ride (active requests only)
            const requestsRef = collection(db, "rides", ride.id, "requests");
            const existingQuery = query(
                requestsRef,
                where('riderId', '==', auth.currentUser.uid),
                where('status', 'in', ['pending', 'accepted'])
            );
            const existingDocs = await getDocs(existingQuery);

            if (!existingDocs.empty) {
                const status = existingDocs.docs[0].data().status;
                // Update local state just in case it was missed
                setMyPendingRequests(prev => new Set([...prev, ride.id]));
                return;
            }

            // Create a ride request
            await addDoc(requestsRef, {
                riderId: auth.currentUser.uid,
                riderName: userData.name || "Rider",
                pickup: from || userData.from || "Pickup Location",
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // Track locally
            setMyPendingRequests(prev => new Set([...prev, ride.id]));

            // Show visual feedback
            setJustJoinedRide(ride.id);
            playClickSound('success');
            setTimeout(() => setJustJoinedRide(null), 2000);

            console.log('✅ Ride request sent!');
            // Removed alert, UI updates via button state
        } catch (err) {
            console.error("Error sending ride request:", err);
            // Keep error alert for actual failures
            alert("Failed to send request: " + err.message);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                                DRIVER VIEW                                 */
    /* -------------------------------------------------------------------------- */
    const [buttonState, setButtonState] = useState('idle'); // 'idle' | 'completing'
    const [riderButtonState, setRiderButtonState] = useState('idle');

    // Helper to finish up completion flow
    const finishCompletion = () => {
        setTimeout(() => {
            // Local cleanup
            console.log('🏁 Finishing completion, clearing state...');
            setMyLiveRide(null);
            setPendingRequests([]);
            // Safe check for userData
            setAcceptedRiders([{ id: 0, name: 'You', pickup: (userData?.from) || 'Your Location' }]);
            setJoinedRide(null);
            if (setUpcomingRide) setUpcomingRide(null);

            setAnimStage('idle');
            setRiderButtonState('idle');

            // Navigate to history
            if (onRideComplete) {
                console.log('👉 Navigating to history');
                onRideComplete();
            }
        }, 3000); // Wait for 3s animation
    };

    const handleEndTrip = () => {
        handleCompleteRide();
    };

    const handleEndRiderTrip = async () => {
        if (!joinedRide) return;

        playClickSound('success');
        setRiderButtonState('completing');

        try {
            const uid = auth.currentUser?.uid || userData?.uid;

            // 1. Update request status to 'completed' so driver doesn't create duplicate history
            const requestsRef = collection(db, 'rides', joinedRide.id, 'requests');
            const q = query(requestsRef, where('riderId', '==', uid));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                await updateDoc(snapshot.docs[0].ref, { status: 'completed' });
            }

            // 2. Create history entry for rider
            await addDoc(collection(db, 'history'), {
                userId: uid,
                role: 'rider',
                rideId: joinedRide.id,
                from: joinedRide.from,
                to: joinedRide.to,
                time: joinedRide.time,
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                driverName: joinedRide.driver,
                cost: joinedRide.price || joinedRide.cost || 45,
                completedAt: serverTimestamp()
            });

            console.log('✅ Ride completed as rider!');
            alert(`🎉 Ride completed! Cost: ₹${joinedRide.price || joinedRide.cost || 45}`);

            // Clear local state
            setJoinedRide(null);
            if (setUpcomingRide) setUpcomingRide(null);
            setRiderButtonState('idle');
        } catch (err) {
            console.error('Error completing rider trip:', err);
            alert('Failed to complete trip: ' + err.message);
            setRiderButtonState('idle');
        }
    };

    const handleCancelRide = async () => {
        playClickSound('destructive');

        // DRIVER Cancel Logic
        if (myLiveRide) {
            try {
                const rideRef = doc(db, 'rides', myLiveRide.id);
                await updateDoc(rideRef, { status: 'cancelled' });

                // Mark all accepted requests as cancelled to notify riders
                const requestsRef = collection(db, 'rides', myLiveRide.id, 'requests');
                const acceptedQuery = query(requestsRef, where('status', '==', 'accepted'));
                const acceptedDocs = await getDocs(acceptedQuery);

                const updatePromises = acceptedDocs.docs.map(reqDoc =>
                    updateDoc(doc(db, 'rides', myLiveRide.id, 'requests', reqDoc.id), {
                        status: 'cancelled'
                    })
                );
                await Promise.all(updatePromises);

                console.log('🚫 Ride cancelled, riders notified');

                // Listener will auto-update state
            } catch (err) {
                console.error("Error cancelling ride:", err);
                alert("Failed to cancel ride.");
            }
        }
        // RIDER Cancel Logic (NEW FIX!)
        else if (joinedRide?.id) {
            try {
                // Find and cancel the rider's request
                const requestsRef = collection(db, 'rides', joinedRide.id, 'requests');
                const myRequestQuery = query(requestsRef,
                    where('riderId', '==', auth.currentUser.uid),
                    where('status', 'in', ['pending', 'accepted'])
                );
                const myRequestDocs = await getDocs(myRequestQuery);

                if (!myRequestDocs.empty) {
                    const requestId = myRequestDocs.docs[0].id;
                    await updateDoc(doc(db, 'rides', joinedRide.id, 'requests', requestId), {
                        status: 'cancelled'
                    });
                    console.log('🚫 Rider cancelled request');
                }
            } catch (err) {
                console.error("Error cancelling request:", err);
                alert("Failed to cancel. Please try again.");
            }
        }

        // Local cleanup
        if (setUpcomingRide) setUpcomingRide(null);
        setJoinedRide(null);
        setPendingRequests([]);
        setAcceptedRiders([{ id: 0, name: 'You', pickup: currentUserData?.from || 'Your Location' }]);
    };

    const handleCompleteRide = async () => {
        if (!myLiveRide) return;

        playClickSound('success');

        try {
            // ROBUST EARNINGS CALCULATION:
            // Use seat occupancy (Total - Available) to determine passenger count.
            // This ensures earnings match the UI even if request statuses are out of sync (e.g. old data).
            const occupiedSeats = (myLiveRide.seatsTotal || 4) - (myLiveRide.seatsAvailable !== undefined ? myLiveRide.seatsAvailable : 4);
            const passengerCount = Math.max(0, occupiedSeats);
            const totalEarnings = passengerCount * (myLiveRide.cost || 45);

            // Fetch requests for History creation (Best Effort)
            const requestsRef = collection(db, 'rides', myLiveRide.id, 'requests');
            const q = query(requestsRef, where('status', 'in', ['accepted', 'completed']));
            const querySnapshot = await getDocs(q);

            // Create history entry for driver
            await addDoc(collection(db, 'history'), {
                userId: userData.uid,
                role: 'driver',
                rideId: myLiveRide.id,
                from: myLiveRide.from,
                to: myLiveRide.to,
                time: myLiveRide.time,
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                passengers: passengerCount,
                earnings: totalEarnings,
                completedAt: serverTimestamp()
            });

            // Create history entries ONLY for riders who are still 'accepted' (didn't complete themselves)
            // Note: This relies on the request docs being found. If they aren't (e.g. old data), 
            // driver gets paid, but rider might verify history later.
            const activeRiders = querySnapshot.docs.filter(doc => doc.data().status === 'accepted');

            const riderHistoryPromises = activeRiders.map(reqDoc => {
                const riderData = reqDoc.data();
                return addDoc(collection(db, 'history'), {
                    userId: riderData.riderId,
                    role: 'rider',
                    rideId: myLiveRide.id,
                    from: myLiveRide.from,
                    to: myLiveRide.to,
                    time: myLiveRide.time,
                    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    driverName: myLiveRide.driverName,
                    cost: myLiveRide.cost || 45,
                    completedAt: serverTimestamp()
                });
            });
            await Promise.all(riderHistoryPromises);

            // Mark ride as completed
            const rideRef = doc(db, 'rides', myLiveRide.id);
            await updateDoc(rideRef, { status: 'completed' });

            console.log('✅ Ride completed! Earnings:', totalEarnings);

            // Store earnings for animation display
            setCompletionEarnings(totalEarnings);

            // Trigger animation and navigation
            setAnimStage('completed');
            finishCompletion();

        } catch (err) {
            console.error('Error completing ride:', err);
            alert('Failed to complete ride: ' + err.message);
        }
    };

    // Driver: Listen for my active rides
    useEffect(() => {
        if (role === 'driver' && userData?.uid) {
            console.log('🚗 Driver: Setting up active ride listener');
            const q = query(
                collection(db, 'rides'),
                where("driverId", "==", userData.uid),
                where("status", "==", "active")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const rideDoc = snapshot.docs[0];
                    const rideData = { id: rideDoc.id, ...rideDoc.data() };
                    console.log('🚗 Driver: Active ride updated!', {
                        seatsTotal: rideData.seatsTotal,
                        seatsAvailable: rideData.seatsAvailable,
                        filledSeats: rideData.seatsTotal - rideData.seatsAvailable
                    });
                    setMyLiveRide(rideData);
                    setAnimStage('active'); // Auto-set UI to active
                } else {
                    console.log('🚗 Driver: No active rides');
                    setMyLiveRide(null);
                    setAnimStage('idle');
                }
            });
            return () => unsubscribe();
        }
    }, [role, userData]);

    // Driver: Listen for ride requests (real + mock) AND accepted riders
    useEffect(() => {
        if (role === 'driver' && myLiveRide?.id) {
            console.log('👥 Driver: Setting up requests listener for ride:', myLiveRide.id);
            const requestsRef = collection(db, 'rides', myLiveRide.id, 'requests');
            // Listen for BOTH pending and accepted requests to keep lists in sync
            const q = query(requestsRef, where('status', 'in', ['pending', 'accepted']));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const changes = snapshot.docChanges();

                // 1. Alert for Leaving Riders
                changes.forEach(change => {
                    if (change.type === 'removed') {
                        // If an accepted request is removed (or changed status to 'left'), notify driver
                        const data = change.doc.data();
                        if (data.status === 'accepted') { // It WAS accepted before removal/change
                            console.log('👋 Rider left:', data.riderName);
                            alert(`⚠️ Passenger ${data.riderName} has left the ride.`);
                            playClickSound('destructive');
                        }
                    }
                    if (change.type === 'modified') {
                        const data = change.doc.data();
                        // If status changed to 'left' individually (if we listened to it)
                        // But 'left' falls out of 'in' query, so it triggers 'removed'.
                        // 'removed' block above handles it.
                    }
                });

                const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isReal: true }));
                const realPending = allDocs.filter(d => d.status === 'pending');
                const realAccepted = allDocs.filter(d => d.status === 'accepted');

                console.log('👥 Real requests:', realPending.length, 'Accepted:', realAccepted.length);

                // 2. Sync Pending Requests (Pure Firestore)
                // Normalize riderName to name for UI
                const displayPending = realPending.map(req => ({
                    ...req,
                    name: req.riderName, // Fix: Map riderName to name for UI
                    pickup: req.pickup || 'Pickup Location'
                }));
                setPendingRequests(displayPending);

                // 3. Sync Accepted Riders
                setAcceptedRiders(prev => {
                    // Map real requests to rider format
                    const backendRiders = realAccepted.map(req => ({
                        id: req.id,
                        name: req.riderName,
                        pickup: req.pickup || currentUserData?.from || 'Pickup Location', // Handle empty pickup for mocks
                        isReal: true // All DB requests are 'real' to the UI now
                    }));

                    return [
                        { id: 0, name: 'You', pickup: currentUserData?.from || 'Your Location' },
                        ...backendRiders
                    ];
                });
            });

            return () => unsubscribe();
        } else if (role === 'driver' && !myLiveRide) {
            // No active ride - clear all requests
            setPendingRequests([]);
            setAcceptedRiders([{ id: 0, name: 'You', pickup: currentUserData?.from || 'Your Location' }]);
        }
    }, [role, myLiveRide, currentUserData]);

    // Auto-switch view logic based on activity
    useEffect(() => {
        if (role === 'driver') {
            if (pendingRequests.length > 0) {
                // Priority 1: Show incoming requests immediately
                setDriverViewMode('requests');
            } else if (acceptedRiders.length > 1) {
                // Priority 2: If no requests but have passengers, show list
                setDriverViewMode('riders');
            } else {
                // Priority 3: Idle/Waiting (only driver), show requests tab (empty state)
                setDriverViewMode('requests');
            }
        }
    }, [role, pendingRequests.length, acceptedRiders.length]);

    const handlePublishRide = async () => {
        if (!userData || !userData.uid) return;

        playClickSound('success');

        try {
            // Check if already has active ride (optimistic check, listener handles real truth)
            if (myLiveRide) {
                alert("You already have an active ride.");
                return;
            }

            const passengerSeats = parseInt(userData.seats?.split(' ')[0]) || 3;

            const rideRef = await addDoc(collection(db, "rides"), {
                driverId: userData.uid,
                driverName: userData.name || "Unknown Driver",
                from: userData.from || "Unknown",
                to: userData.to || "Unknown",
                time: userData.time || "Now",
                date: "Today",
                seatsTotal: passengerSeats,
                seatsAvailable: passengerSeats,
                cost: parseInt(userData.price) || 45,
                status: "active",
                createdAt: serverTimestamp()
            });

            // Seed Mock Requests (Server-Side Mocks)
            const mockNames = ['Priya Sharma', 'Arjun Patel'];
            const requestsRef = collection(db, 'rides', rideRef.id, 'requests');

            // Create 2 mock pending requests
            for (const name of mockNames) {
                await addDoc(requestsRef, {
                    riderId: `mock-${Date.now()}-${Math.random()}`, // Fake UID
                    riderName: name,
                    pickup: "", // Empty as requested, will fallback to user location in UI
                    status: 'pending',
                    isMock: true,
                    createdAt: serverTimestamp()
                });
            }

            // Success handled by snapshot listener updating 'myLiveRide'
        } catch (err) {
            console.error("Error publishing ride:", err);
            alert("Failed to publish ride: " + err.message);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                                DRIVER VIEW                                 */
    /* -------------------------------------------------------------------------- */
    if (isDriver) {
        // "Seats" from data means AVAILABLE passenger seats. Total capacity = passenger seats + 1 (driver)
        const passengerSeats = parseInt(currentUserData?.seats?.split(' ')[0]) || 3;
        const totalSeats = passengerSeats + 1;

        // Use real-time data from Firestore if available, otherwise use local state
        const filledSeats = myLiveRide
            ? (myLiveRide.seatsTotal - myLiveRide.seatsAvailable + 1) // +1 for driver
            : filledSeatsCount;
        const emptySeats = totalSeats - filledSeats;

        console.log('🎨 Driver UI render:', {
            hasLiveRide: !!myLiveRide,
            totalSeats,
            filledSeats,
            emptySeats,
            seatsAvailable: myLiveRide?.seatsAvailable
        });
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



        const handleAcceptSpecificRequest = async (request) => {
            const totalSeats = parseInt(userData?.seats?.split(' ')[0]) + 1 || 4;
            // Current filled calculation might need to be more robust, but using seatsAvailable is good
            const currentFilled = myLiveRide ? (myLiveRide.seatsTotal - myLiveRide.seatsAvailable + 1) : filledSeatsCount;

            if (currentFilled >= totalSeats) {
                alert('No more seats available');
                return;
            }

            setAcceptingRequestId(request.id);
            playClickSound('success');

            try {
                // ALWAYS update Firestore, since even mocks are documents now
                const requestRef = doc(db, 'rides', myLiveRide.id, 'requests', request.id);
                await updateDoc(requestRef, { status: 'accepted' });

                const rideRef = doc(db, 'rides', myLiveRide.id);
                await updateDoc(rideRef, { seatsAvailable: increment(-1) });

                console.log('✅ Accepted request:', request.name || request.riderName);

                // Remove from pending list locally (listener will handle accepted list synchronization)
                setPendingRequests(prev => prev.filter(r => r.id !== request.id));

                // Auto-switch to riders view if full
                if (currentFilled + 1 >= totalSeats) {
                    setDriverViewMode('riders');
                }

                setShowSuccess(true);
                setTimeout(() => {
                    setAcceptingRequestId(null);
                    setShowSuccess(false);
                }, 2000);
            } catch (err) {
                console.error('Error accepting request:', err);
                setAcceptingRequestId(null);
                alert('Failed to accept request');
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

                {/* Active Ride Card OR Publish Form */}
                {!myLiveRide ? (
                    <motion.div
                        className="glass-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '24px', borderRadius: '24px', marginBottom: '30px',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Plan your drive</h3>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '6px 14px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Price</span>
                                <span style={{ fontWeight: '700', color: 'var(--color-brand-primary)' }}>₹{currentUserData?.price || '45'}</span>
                            </div>
                        </div>

                        {/* Route Display (Pre-filled from Profile) */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '6px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-brand-primary)' }}></div>
                                <div style={{ width: '2px', background: 'rgba(255,255,255,0.1)', flex: 1, minHeight: '30px', margin: '4px 0' }}></div>
                                <MapPin size={16} color="var(--color-brand-secondary)" style={{ marginBottom: '2px' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>From</p>
                                    <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{from}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>To</p>
                                    <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{to}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'var(--color-bg-deep)', padding: '12px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Leaving at</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <Clock size={16} color="var(--color-text-primary)" />
                                    <span style={{ fontWeight: '600' }}>{time}</span>
                                </div>
                            </div>
                            <div style={{ background: 'var(--color-bg-deep)', padding: '12px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Seats</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <Users size={16} color="var(--color-text-primary)" />
                                    <span style={{ fontWeight: '600' }}>{currentUserData?.seats || '3'}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handlePublishRide}
                            variant="primary"
                            style={{ width: '100%', borderRadius: '16px', height: '50px', fontSize: '1.1rem', marginBottom: '12px' }}
                        >
                            Publish Ride <ArrowRight size={20} />
                        </Button>

                        <Button
                            onClick={() => setIsEditModalOpen(true)}
                            variant="secondary"
                            sound="nav"
                            style={{
                                width: '100%',
                                borderRadius: '16px',
                                background: 'rgba(217, 164, 88, 0.1)',
                                color: 'var(--color-brand-primary)',
                                border: '1px solid rgba(217, 164, 88, 0.2)'
                            }}
                        >
                            <Edit2 size={18} /> Edit Details
                        </Button>
                    </motion.div>
                ) : (
                    <>
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

                            {/* Primary Action - Demoted to Secondary to avoid clashing with Complete Trip */}
                            {/* Primary Action - Complete Trip */}
                            <Button
                                variant="primary"
                                onClick={handleEndTrip}
                                whileTap={{ scale: 0.97 }}
                                style={{ width: '100%', borderRadius: '16px' }}
                            >
                                {buttonState === 'completing' ? (
                                    'Completing...'
                                ) : (
                                    <>Complete trip <ShieldCheck size={20} /></>
                                )}
                            </Button>
                        </motion.div>

                        {/* Secondary Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} sound="nav">
                                <Edit2 size={18} /> Edit Ride
                            </Button>
                            <Button variant="danger" sound="destructive" onClick={handleCancelRide}>
                                <Ban size={18} /> Cancel Ride
                            </Button>
                        </div>

                        {/* End Trip Action */}
                        <div style={{ marginBottom: '24px' }}>
                            {/* Segmented Control for Views */}
                            <div style={{
                                display: 'flex',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '4px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <button
                                    onClick={() => setDriverViewMode('requests')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: driverViewMode === 'requests' ? 'rgba(217, 164, 88, 0.15)' : 'transparent',
                                        color: driverViewMode === 'requests' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                                        border: driverViewMode === 'requests' ? '1px solid rgba(217, 164, 88, 0.3)' : '1px solid transparent',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Clock size={18} />
                                    Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
                                </button>
                                <button
                                    onClick={() => setDriverViewMode('riders')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: driverViewMode === 'riders' ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                                        color: driverViewMode === 'riders' ? 'var(--color-brand-secondary)' : 'var(--color-text-secondary)',
                                        border: driverViewMode === 'riders' ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid transparent',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Users size={18} />
                                    Riders ({acceptedRiders.length})
                                </button>
                            </div>
                        </div>

                        {/* Requests Section */}
                        {
                            driverViewMode === 'requests' ? (
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
                                                    onClick={() => handleAcceptSpecificRequest(request)}
                                                    disabled={filledSeats >= totalSeats || acceptingRequestId !== null}
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
                    </>
                )}

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
                        <p style={{ color: '#fff', marginTop: '20px', fontSize: '1.2rem' }}>Earned ₹{completionEarnings}</p>
                    </motion.div>
                )}
            </div >
        );
    }


    // Rider Hook Logic moved to top of file



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
                        <span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-success)' }}></span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: '600' }}>CONFIRMED</span>
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
                                    <ShieldCheck size={16} color="var(--color-success)" />
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
                    <Button
                        variant="danger"
                        sound="destructive"
                        onClick={async () => {
                            console.log('🚪 Leave button clicked');
                            console.log('Current state:', {
                                joinedRide: joinedRide?.id,
                                userData: userData?.uid,
                                upcomingRide: upcomingRide?.id
                            });

                            playClickSound('destructive');

                            if (!joinedRide?.id) {
                                console.error('❌ No joinedRide.id available');
                                alert('Error: No active ride found');
                                return;
                            }

                            if (!auth.currentUser) {
                                console.error('❌ No Firebase Auth user');
                                alert('Error: Not authenticated');
                                return;
                            }

                            const authUid = auth.currentUser.uid;
                            console.log('Auth UID:', authUid);
                            console.log('UserData UID:', userData?.uid);

                            try {
                                console.log('🔄 Step 1: Returning seat to pool...');
                                // 1. Return seat to pool
                                const rideRef = doc(db, 'rides', joinedRide.id);
                                await updateDoc(rideRef, {
                                    seatsAvailable: increment(1)
                                });
                                console.log('✅ Step 1 complete');

                                console.log('🔄 Step 2: Finding my request...');
                                // 2. Update MY request status to 'left' - IMPORTANT: Use auth.currentUser.uid
                                const requestsRef = collection(db, 'rides', joinedRide.id, 'requests');
                                const myReqQuery = query(
                                    requestsRef,
                                    where('riderId', '==', authUid), // Use Firebase Auth UID!
                                    where('status', '==', 'accepted')
                                );
                                const myReqDocs = await getDocs(myReqQuery);

                                console.log('Query results:', myReqDocs.size, 'documents found');
                                if (myReqDocs.empty) {
                                    console.warn('⚠️ No accepted request found for this user');
                                    console.log('Attempting broader search...');

                                    // Try finding ANY request by this user for debugging
                                    const allMyReqs = await getDocs(
                                        query(requestsRef, where('riderId', '==', authUid))
                                    );
                                    console.log('All requests by this user:', allMyReqs.size);
                                    allMyReqs.forEach(doc => {
                                        console.log('Request:', doc.id, doc.data());
                                    });
                                } else {
                                    console.log('Found request:', myReqDocs.docs[0].id, myReqDocs.docs[0].data());
                                    console.log('🔄 Step 3: Updating request status to left...');
                                    const myReqRef = doc(db, 'rides', joinedRide.id, 'requests', myReqDocs.docs[0].id);
                                    await updateDoc(myReqRef, { status: 'left' });
                                    console.log('✅ Step 3 complete');
                                }

                                console.log('✅ Successfully left ride!');
                                alert('✅ You have left the ride');
                            } catch (err) {
                                console.error('❌ Error leaving ride:', err);
                                console.error('Error details:', {
                                    code: err.code,
                                    message: err.message,
                                    stack: err.stack
                                });
                                alert(`Failed to leave ride: ${err.message}`);
                                return;
                            }

                            // Clear local state
                            // Clear local state
                            setJoinedRide(null);
                            if (setUpcomingRide) setUpcomingRide(null);
                            console.log('✅ State cleared, returned to home');
                        }}
                        style={{
                            flex: 1
                        }}
                    >
                        <LogOut size={18} /> Leave
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleEndRiderTrip}
                        style={{ flex: 2 }}
                    >
                        {riderButtonState === 'completing' ? 'Completing...' : <>Complete trip <ShieldCheck size={18} /></>}
                    </Button>
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
                                            {ride.verified && <ShieldCheck size={14} color="var(--color-success)" />}
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
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '600' }}>ETA {calculateEta(ride.time, ride.duration)}</span>
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
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                {myPendingRequests.has(ride.id) ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                    >
                                        <Button
                                            variant="secondary"
                                            disabled
                                            style={{
                                                width: 'auto',
                                                padding: '12px 32px',
                                                borderRadius: '999px',
                                                opacity: 0.7,
                                                cursor: 'default'
                                            }}
                                        >
                                            Request Sent <Clock size={18} />
                                        </Button>
                                    </motion.div>
                                ) : joinedRide?.id === ride.id ? (
                                    <Button
                                        variant="primary"
                                        disabled
                                        style={{
                                            width: 'auto',
                                            padding: '12px 32px',
                                            borderRadius: '999px',
                                            background: 'var(--color-success)',
                                            color: '#fff',
                                            opacity: 1,
                                            cursor: 'default'
                                        }}
                                    >
                                        Ride Joined <ShieldCheck size={18} />
                                    </Button>
                                ) : (
                                    <motion.div
                                        animate={justJoinedRide === ride.id ? {
                                            scale: [1, 1.05, 1],
                                            boxShadow: ['0 0 0 0 rgba(217, 164, 88, 0)', '0 0 0 10px rgba(217, 164, 88, 0)', '0 0 0 0 rgba(217, 164, 88, 0)']
                                        } : {}}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <Button
                                            variant="primary"
                                            onClick={() => handleJoinRide(ride)}
                                            disabled={isMatching}
                                            style={{
                                                width: 'auto',
                                                padding: '12px 32px',
                                                borderRadius: '999px',
                                                opacity: isMatching ? 0.7 : 1,
                                                cursor: isMatching ? 'not-allowed' : 'pointer',
                                                filter: isMatching ? 'grayscale(0.5)' : 'none'
                                            }}
                                        >
                                            {isMatching ? 'Confirming...' : 'Join Ride'} <ArrowRight size={18} />
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div
                    className="glass-panel"
                    style={{ padding: '40px 20px', borderRadius: '24px', textAlign: 'center', marginBottom: '30px' }}
                >
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No rides yet</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Drivers usually appear closer to departure
                    </p>
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        animate={notificationsEnabled ? {
                            scale: [1, 1.02, 1]
                        } : {}}
                        transition={{ duration: 1.5, repeat: notificationsEnabled ? Infinity : 0 }}
                    >
                        <Button
                            variant="secondary"
                            onClick={() => {
                                const newState = !notificationsEnabled;
                                setNotificationsEnabled(newState);
                                if (navigator.vibrate) navigator.vibrate(50);
                                playClickSound(newState ? 'success' : 'tap');
                            }}
                            style={notificationsEnabled ? {
                                background: 'rgba(74, 222, 128, 0.1)',
                                color: 'var(--color-success)',
                                border: '1px solid rgba(74, 222, 128, 0.2)'
                            } : {
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {notificationsEnabled ? (
                                <>
                                    <Bell size={18} style={{ animation: 'pulse 2s infinite' }} />
                                    Notifications Active
                                </>
                            ) : (
                                <>
                                    <BellOff size={18} />
                                    Notify me when a ride appears
                                </>
                            )}
                        </Button>
                    </motion.div>
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
