import React, { createContext, useState, useContext, useEffect } from 'react';

const UserProfileContext = createContext();

export const useUserProfile = () => useContext(UserProfileContext);

export const UserProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userAllergenProfile');
    if (stored) {
      setProfile(JSON.parse(stored));
      setIsComplete(true);
    }
  }, []);

  const saveProfile = (newProfile) => {
    localStorage.setItem('userAllergenProfile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setIsComplete(true);
  };

  return (
    <UserProfileContext.Provider value={{ profile, isComplete, saveProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};