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

function App() {
  // Helper for persistence
  const getStored = (key, def) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : def;
    } catch { return def; }
  };

  const [showSplash, setShowSplash] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(() => getStored('orbit_hasOnboarded', false));
  const [userData, setUserData] = useState(() => getStored('orbit_userData', null));
  const [currentTab, setCurrentTab] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [upcomingRide, setUpcomingRide] = useState(() => getStored('orbit_upcomingRide', null));
  const [pastRides, setPastRides] = useState(() => getStored('orbit_pastRides', [
    {
      id: 2,
      date: 'Yesterday',
      from: 'Indiranagar',
      to: 'PES University',
      cost: 60,
      saved: 40
    },
    {
      id: 3,
      date: 'Mon, 12 Oct',
      from: 'Koramangala',
      to: 'MG Road',
      cost: 55,
      saved: 35
    },
    {
      id: 4,
      date: 'Fri, 9 Oct',
      from: 'HSR Layout',
      to: 'JP Nagar',
      cost: 45,
      saved: 20
    }
  ]));

  // Persistence Effects
  useEffect(() => { localStorage.setItem('orbit_hasOnboarded', JSON.stringify(hasOnboarded)); }, [hasOnboarded]);
  useEffect(() => { localStorage.setItem('orbit_userData', JSON.stringify(userData)); }, [userData]);
  useEffect(() => { localStorage.setItem('orbit_upcomingRide', JSON.stringify(upcomingRide)); }, [upcomingRide]);
  useEffect(() => { localStorage.setItem('orbit_pastRides', JSON.stringify(pastRides)); }, [pastRides]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleOnboardingComplete = (data) => {
    setUserData(data);
    setHasOnboarded(true);
  };

  const handleUserDataUpdate = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const toggleRole = () => {
    setUserData(prev => ({ ...prev, role: prev.role === 'driver' ? 'rider' : 'driver' }));
  };

  const handleLogout = () => {
    setHasOnboarded(false);
    setUserData(null);
    setCurrentTab('home');
  };

  const handleRideCompletion = (rideDetails) => {
    // 1. Add to History
    setPastRides(prev => [rideDetails, ...prev]);
    // 2. Remove from Upcoming (Clear active state)
    setUpcomingRide(null);
    // 3. Switch Tab
    setCurrentTab('rides');
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
          {!hasOnboarded ? (
            <Onboarding onComplete={handleOnboardingComplete} toggleTheme={toggleTheme} currentTheme={theme} />
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
                    {currentTab === 'home' && <HomeScreen userData={userData} onRideComplete={handleRideCompletion} upcomingRide={upcomingRide} setUpcomingRide={setUpcomingRide} />}
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
