// src/components/TabButton.js (unchanged, memoized)
import React from 'react';

const TabButton = ({ label, isActive, onClick, hasError = false }) => {
  return (
    <button 
      className={`tab-button ${isActive ? 'active' : ''} ${hasError ? 'has-error' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default React.memo(TabButton);