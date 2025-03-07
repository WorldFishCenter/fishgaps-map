import React, { useState, useCallback } from 'react';
import './App.css';
import WorldMap from './components/WorldMap';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const handleThemeToggle = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const handleInfoToggle = useCallback(() => {
    setShowInfo(prev => !prev);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setShowInfo(false);
  }, []);

  return (
    <div className={`App ${!isDark ? 'light-mode' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <img src="https://upload.wikimedia.org/wikipedia/en/9/9e/WorldFish_logo.svg" alt="WorldFish Logo" />
            </div>
            <h1>FishBase Data Coverage Analysis</h1>
          </div>
          <div className="header-right">
            <button 
              className="header-button"
              onClick={handleInfoToggle}
              title="About this visualization"
            >
              About
            </button>
            <button 
              className="theme-toggle" 
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>
      {showInfo && (
        <div className="info-panel">
          <div className="info-content">
            <h2>About This Tool</h2>
            <p>
              This visualization tool analyzes data gaps across aquatic food systems using the FishBase database.
            </p>
            <h3>Data Categories</h3>
            <ul>
              <li><strong>Species Information:</strong> Basic descriptors, abundance ratings, and fisheries importance</li>
              <li><strong>Stock Data:</strong> Larval development, spawning patterns, and egg characteristics</li>
              <li><strong>Reproduction:</strong> Reproductive modes, fertilization types, and spawning behavior</li>
              <li><strong>Growth Data:</strong> Growth parameters, length-length relationships, and length-weight data</li>
              <li><strong>Distribution:</strong> Geographical presence and habitat preferences</li>
              <li><strong>Human Uses:</strong> Fisheries and aquaculture relevance</li>
            </ul>
            <p className="note">
              The color intensity on the map indicates the percentage of available data for each category, 
              helping identify areas where more research or data collection may be needed.
            </p>
            <button 
              className="close-info" 
              onClick={handleCloseInfo}
              aria-label="Close information panel"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <main>
        <WorldMap isDark={isDark} />
      </main>
    </div>
  );
}

export default React.memo(App);
