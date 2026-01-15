# ORBIT — Student Ride Pooling Application

ORBIT is a student-centric, hyper-local ride pooling web application designed to make daily campus commutes safer, cheaper, and smarter.
It connects verified students from the same university traveling on similar routes, enabling seamless ride sharing via autos, cabs, bikes, or personal vehicles.

Built with a mobile-first mindset, ORBIT delivers a native-app-like experience on the web, powered by modern frontend technologies, real-time data, voice commands, and safety-first design.

## 🚨 Problem Statement

Students commuting daily to urban campuses face persistent issues:

*   **💸 High Costs** — Solo auto/cab rides are expensive.
*   **😬 Poor Coordination** — WhatsApp groups are chaotic and unreliable.
*   **🛡️ Safety Concerns** — Traveling alone or with unverified strangers.
*   **🌍 Environmental Impact** — Redundant rides increase emissions.

## 💡 Solution

ORBIT creates a closed, campus-verified ecosystem where students can:

*   Offer or join rides on similar routes
*   Split costs transparently
*   Access SOS safety features instantly
*   Coordinate rides without awkward conversations

**No strangers. No spam. No chaos.**

## 🎯 Target Users

*   **Riders** — Students without vehicles looking for affordable, safe transport
*   **Ride Hosts** — Students with bikes/cars or those booking cabs who want to split costs

## ✨ Key Features

### 🚀 Core Features

*   **🔐 Campus-Verified Users** (Firebase Auth – MVP)
*   **🚗 Ride Hosting & Joining**
*   **🔄 Real-Time Ride History** (Firestore listeners)
*   **🧭 Driver–Rider Matching** (Hybrid MVP)

### 🛡️ Safety

*   **🆘 SOS System**
    *   Floating shield button
    *   Voice-triggered activation
    *   Full-screen emergency overlay
    *   Mock dispatch to campus security & trusted contacts
    *   Haptic feedback + cancellation window

### 🎙️ Voice Assistant

*   Hands-free navigation using **Web Speech API**
*   Commands like:
    *   “Navigate Home”
    *   “Switch to Driver”
    *   “Where is my ride?”
    *   “SOS”

### 🌱 Impact Dashboard

*   CO₂ savings tracker
*   Animated stats
*   Green badges (gamification-ready)

### 🧠 UX / UI Philosophy

*   **Design Theme:** Space & Orbit
*   **🌌 Glassmorphism UI** (iOS/macOS-inspired)
*   **🪐 Physics-Based Animations** (orbiting riders, floating elements)
*   **📱 Mobile-First Layout** with bottom navigation
*   **🌗 Dark & Light Mode** (CSS variables)
*   **📳 Haptic Feedback** for critical actions
*   **Typography:** Outfit (Google Fonts)
*   **Color Accents:** Golden Orbit & Terracotta on deep navy backgrounds

## 🛠️ Tech Stack

### Frontend

*   **React 19** (SPA)
*   **Vite** — Fast dev server & optimized builds
*   **JavaScript** (ES6+) / JSX
*   **Framer Motion** — Animations & transitions
*   **Lucide React** — SVG icons
*   **CSS Variables + Glassmorphism**

### Backend (Hybrid MVP)

*   **Firebase Authentication** — Student verification (mocked)
*   **Cloud Firestore** — Ride history & real-time listeners
*   **Client-Side Mock Logic** — Ride matching (to be migrated)

### Google Technologies Used

*   **Web Speech API** (Google / Chromium) — Voice assistant & SOS
*   **Firebase Auth**
*   **Cloud Firestore**
*   **Google Chrome DevTools & Lighthouse**

### Tooling & Deployment

*   **Git & GitHub**
*   **Vercel** — Deployment-ready

## 🧱 Architecture Overview

*   **Single Page Application (SPA)**
*   **Component-based React architecture**
*   **State-driven navigation** (no react-router-dom)
*   **Firebase listeners** scoped at screen level

### Folder Structure

```
src/
├── components/      # Reusable UI components
├── screens/         # Page-level logic (Home, Rides, Profile, Impact)
├── App.jsx          # App shell & global state
├── index.css        # Global styles & design tokens
└── main.jsx         # Entry point
```

## 🔄 User Flow Summary

### Onboarding

1.  Interactive orbit animation
2.  Name + College ID verification (mock)
3.  Commute setup
4.  Role selection (Rider / Ride Host)

### Ride Host Flow

1.  Create ride → Publish → Accept requests
2.  Riders appear as orbiting icons
3.  End ride → Earnings & history updated

### Rider Flow

1.  Auto-matching based on route & time
2.  Join verified ride
3.  Live ride status
4.  Ride history tracking

## 📊 Current Project Status

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Frontend UI** | ✅ Completed | High-fidelity, responsive |
| **Onboarding** | ✅ Completed | Physics-based |
| **Ride Matching** | ⚠️ Hybrid | Mock + Firestore |
| **Voice Assistant** | ✅ Implemented | Web Speech API |
| **SOS System** | ✅ Implemented | UI + Voice + Haptics |
| **Impact Dashboard** | ✅ Implemented | Animated stats |
| **Backend APIs** | 🔄 In Progress | Full real-time planned |

## 🚀 Future Enhancements

*   🔁 Full Firestore-based real-time ride matching
*   🗺️ Live maps (Google Maps / Mapbox)
*   🏆 Leaderboards & expanded green badges
*   💳 UPI payments (Razorpay / Stripe)
*   🛂 Campus Admin & Security Dashboard

## 🏁 Conclusion

**ORBIT is not just a ride-sharing app — it’s a campus safety & sustainability platform.**

**Why ORBIT stands out:**

*   **Technically advanced** (React 19, Voice AI, animations)
*   **Socially impactful** (safety + affordability)
*   **Designed for real student behavior**
*   **Built with scalability in mind**
