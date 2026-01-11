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

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');

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
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : (
            <>
              <Header userData={userData} onLogoClick={() => setCurrentTab('home')} onToggleMode={toggleRole} />

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
                    {currentTab === 'home' && <HomeScreen userData={userData} />}
                    {currentTab === 'rides' && <RidesScreen userData={userData} />}
                    {currentTab === 'commute' && <CommuteScreen userData={userData} onUpdate={handleUserDataUpdate} />}
                    {currentTab === 'impact' && <ImpactScreen />}
                    {currentTab === 'profile' && <ProfileScreen userData={userData} toggleRole={toggleRole} />}
                  </motion.div>
                </AnimatePresence>
              </main>

              <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
            </>
          )}
        </motion.div>
      )}
    </>
  );
}

export default App;
