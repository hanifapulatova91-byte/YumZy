import React, { useEffect, useState } from 'react';
import AccApp from './account';
import Login from './login';
import Signup from './signup';
import Choice from './choice';
import SymptomChecker from './checker';
import AllergenManager from './allergen_manage';
import Dashboard from './home_screen';
import RecipeGenerator from './recipe';
import Notes from './notes';
import Articles from './article';
import Emergency from './emergency';
import Scan from './scan';
import ScanResult from './scan_result';
import Chat from './chat';
import Profile from './profile';

import { api } from './api';
import { translations } from './i18n';

function App() {
  const [view, setView] = useState('landing');
  const [allergens, setAllergens] = useState([]);
  const [scanData, setScanData] = useState(null);
  const [user, setUser] = useState(null);

  const t = (key) => translations['en'][key] || key;

  // On app load: restore user session and fetch saved allergens
  useEffect(() => {
    const savedUser = localStorage.getItem('yumzy_user');
    const savedToken = localStorage.getItem('yumzy_token');
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        
        // Fetch profile from server to load saved allergens
        api.profile.getProfile().then(profile => {
          if (profile && profile.allergens && profile.allergens.length > 0) {
            // Convert string allergens to objects with severity
            const loaded = profile.allergens.map(a => ({ name: a, severity: 'MODERATE' }));
            setAllergens(loaded);
            setView('dashboard');
          }
        }).catch(() => {
          // Profile fetch failed, user can still proceed manually
        });
      } catch {
        setUser(null);
      }
    } else {
      localStorage.removeItem('yumzy_user');
    }
  }, []);

  const handleAddAllergen = (name) => {
    const exists = allergens.find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );

    if (!exists) {
      const newAllergen = { name, severity: 'MODERATE' };
      setAllergens([...allergens, newAllergen]);
    }

    setView('known');
  };

  const navigateTo = (pageName, data = null) => {
    if (pageName === 'scan_result' && data) {
      setScanData(data);
    }
    setView(pageName);
  };

  const handleGuest = () => {
    setUser(null);
    localStorage.removeItem('yumzy_token');
    localStorage.removeItem('yumzy_user');
    setAllergens([]);
    setView('choice');
  };

  return (
    <div className="app_main_cont">
      {view === 'landing' && (
        <AccApp
          onNext={navigateTo}
          onGuest={handleGuest}
          user={user}
          t={t}
        />
      )}

      {view === 'login' && (
        <Login
          onNext={navigateTo}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            // Load saved allergens from server
            api.profile.getProfile().then(profile => {
              if (profile && profile.allergens && profile.allergens.length > 0) {
                const loaded = profile.allergens.map(a => ({ name: a, severity: 'MODERATE' }));
                setAllergens(loaded);
              }
            }).catch(() => {});
          }}
          t={t}
        />
      )}

      {view === 'signup' && (
        <Signup
          onNext={navigateTo}
          onSignupSuccess={(newUser) => setUser(newUser)}
          t={t}
        />
      )}

      {view === 'choice' && (
        <Choice
          onNext={(destination) => setView(destination)}
          onBack={() => setView('landing')}
          t={t}
        />
      )}

      {view === 'suspect' && (
        <SymptomChecker
          onBack={() => setView('choice')}
          onAddAllergen={handleAddAllergen}
          t={t}
        />
      )}

      {view === 'known' && (
        <AllergenManager
          allergens={allergens}
          setAllergens={setAllergens}
          onBack={() => setView('choice')}
          onFinish={() => setView('dashboard')}
          t={t}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          onNext={navigateTo}
          userName={user?.name || user?.username || 'Guest'}
          t={t}
        />
      )}

      {view === 'scan' && (
        <Scan
          onNext={navigateTo}
          allergens={allergens}
          t={t}
        />
      )}

      {view === 'scan_result' && (
        <ScanResult
          scanData={scanData}
          onNext={navigateTo}
          allergens={allergens}
          t={t}
        />
      )}

      {view === 'chat' && (
        <Chat 
          onNext={navigateTo} 
          allergens={allergens}
          t={t}
        />
      )}

      {view === 'profile' && (
        <Profile
          user={user}
          allergens={allergens}
          onNext={navigateTo}
          t={t}
        />
      )}

      {view === 'recipe' && (
        <RecipeGenerator 
          onBack={() => setView('dashboard')} 
          allergens={allergens}
          t={t} 
        />
      )}

      {view === 'notes' && (
        <Notes onBack={() => setView('dashboard')} t={t} />
      )}

      {view === 'articles' && (
        <Articles onBack={() => setView('dashboard')} t={t} />
      )}

      {view === 'emergency' && (
        <Emergency
          onBack={() => setView('dashboard')}
          userAllergens={allergens}
          t={t}
        />
      )}
    </div>
  );
}

export default App;