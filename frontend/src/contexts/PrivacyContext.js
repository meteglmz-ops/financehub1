import React, { createContext, useContext, useState, useEffect } from 'react';

const PrivacyContext = createContext();

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within PrivacyProvider');
  }
  return context;
};

export const PrivacyProvider = ({ children }) => {
  const [privacyMode, setPrivacyMode] = useState(() => {
    const saved = localStorage.getItem('privacyMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('privacyMode', privacyMode.toString());
  }, [privacyMode]);

  const togglePrivacy = () => {
    setPrivacyMode(prev => !prev);
  };

  const maskValue = (value) => {
    if (!privacyMode) return value;
    return '****';
  };

  return (
    <PrivacyContext.Provider value={{ privacyMode, togglePrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  );
};