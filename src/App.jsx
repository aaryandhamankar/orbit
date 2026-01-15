import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons are used in BottomNav, removed here if not used elsewhere, but kept Home setup logic.
import Onboarding from './screens/Onboarding';

// Import screens
import HomeScreen from './screens/Home';
import RidesScreen from './screens/Rides';
import CommuteScreen from './screens/Commute';
import ImpactScreen from './screens/Impact';
import ProfileScreen from './screens/Profile';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import VoiceAssistant from './components/VoiceAssistant';

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

function App() {
  // Helper for persistence - kept for non-critical fallback or preference
  const getStored = (key, def) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : def;
    } catch { return def; }
  };

  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Auth User
  const [userData, setUserData] = useState(null); // Firestore Data
  const [loadingUser, setLoadingUser] = useState(true);

  const [sessionReady, setSessionReady] = useState(false);

  // userData is fetched from Firestore, but we always require a "session setup"
  // so sessionReady starts false until Onboarding (or Setup) is completed.


  const [currentTab, setCurrentTab] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [upcomingRide, setUpcomingRide] = useState(null);
  const [pastRides, setPastRides] = useState([]);

  // Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // User is signed in, listen to their Firestore doc
        const userDocRef = doc(db, 'users', user.uid);

        // Check if doc exists first (optimistic check)
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          // Create base document if it doesn't exist (First Login)
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'New User',
            photoURL: user.photoURL || '',
            createdAt: new Date(),
            role: 'rider', // Default
            stats: { carbonSaved: 0, rides: 0 },
            onboardingComplete: false
          });
        }

        // Real-time listener for user data
        const unsubDoc = onSnapshot(userDocRef, (doc) => {
          const data = doc.data();
          if (data) {
            setUserData(data);
            // Sync Rides from Cloud
            setUpcomingRide(data.upcomingRide || null);
            setPastRides(data.pastRides || []);
          }
          setLoadingUser(false);
        });
        return () => unsubDoc();
      } else {
        // User is signed out
        setUserData(null);
        setLoadingUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Remove manual localStorage sync for userData/hasOnboarded as we use Firestore now
  // Also removed localStorage for rides as they are now synced via Firestore listener above


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleOnboardingComplete = async (data) => {
    // This is called when user finishes the Onboarding/Setup flow
    setSessionReady(true);
  };

  const handleUserDataUpdate = async (newData) => {
    if (!currentUser) return;
    // Update Firestore
    // We can move this logic to a utility or keep it here
    // For now, assume this is mainly used by Commute/Profile screens
    // Note: This function execution might need to be shifted to the components directly 
    // utilizing Firebase SDK, but for prop compatibility we leave it or wire it.
    // OPTION: We'll implement direct update in components, but if children use this prop 
    // we should wire it to Firestore.

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, newData, { merge: true });
  };

  const toggleRole = async () => {
    if (!currentUser || !userData) return;
    const newRole = userData.role === 'driver' ? 'rider' : 'driver';
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { role: newRole }, { merge: true });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserData(null);
    setUpcomingRide(null);
    setPastRides([]); // Clean slate
    setSessionReady(false); // Require setup on next login
    setCurrentUser(null);
    setCurrentTab('home');
    // window.location.reload(); // Optional: clean slate
  };

  const handleRideCompletion = async (rideDetails) => {
    // 1. Clear active ride in Firestore (redundant if Home handles it, but good safety)
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { upcomingRide: null }, { merge: true });
    }

    // 2. Switch Tab (Local UI state)
    setCurrentTab('rides');
  };

  // Wrapper for setting upcoming ride to sync with Cloud
  const handleSetUpcomingRide = async (ride) => {
    // If we are passing a function (prev => ...), we need to handle that, 
    // but usually it's a direct object in this app context.
    // For simplicity/safety let's assume direct object or null.
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { upcomingRide: ride }, { merge: true });
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mobile-container"
          style={{ height: '100%' }}
        >
          {/* Show loading state if needed, or just render. 
              If loadingUser is true, we might show splash or a loader.
              For now, we let it flow. 
           */}


          {!sessionReady ? (
            // Pass currentUser and userData to Onboarding so it can pre-fill and skip Step 2
            <Onboarding
              currentUser={currentUser}
              userData={userData}
              toggleTheme={toggleTheme}
              currentTheme={theme}
              onComplete={handleOnboardingComplete}
            />
          ) : (
            <>
              <Header
                userData={userData}
                onLogoClick={() => setCurrentTab('home')}
                onToggleMode={toggleRole}
                toggleTheme={toggleTheme}
                currentTheme={theme}
              />

              <main style={{ padding: '20px', paddingTop: '80px', paddingBottom: '110px', height: '100%', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                  >
                    {currentTab === 'home' && <HomeScreen userData={userData} onRideComplete={handleRideCompletion} upcomingRide={upcomingRide} setUpcomingRide={handleSetUpcomingRide} />}
                    {currentTab === 'rides' && <RidesScreen userData={userData} pastRides={pastRides} upcomingRide={upcomingRide} onViewRideDetails={() => setCurrentTab('home')} />}
                    {currentTab === 'commute' && <CommuteScreen userData={userData} onUpdate={handleUserDataUpdate} />}
                    {currentTab === 'impact' && <ImpactScreen />}
                    {currentTab === 'profile' && <ProfileScreen userData={userData} toggleRole={toggleRole} toggleTheme={toggleTheme} currentTheme={theme} onLogout={handleLogout} />}
                  </motion.div>
                </AnimatePresence>
              </main>

              <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
              <VoiceAssistant
                onNavigate={setCurrentTab}
                upcomingRide={upcomingRide}
                onToggleRole={toggleRole}
                userData={userData}
              />
            </>
          )}
        </motion.div>
      )}
    </>
  );
}

export default App;
