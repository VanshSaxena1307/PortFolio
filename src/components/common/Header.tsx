import React from 'react';
import { AppMode } from '../../types';

interface HeaderProps {
  currentMode: AppMode;
  onNavigate: (mode: AppMode) => void;
  onOpenTerminal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onNavigate, onOpenTerminal }) => {
  return (
    <header className="header glass-panel">
      <div className="brand" onClick={() => onNavigate('landing')}>
        <span className="brand-badge">V-CITY</span>
        <div className="brand-info">
          <span className="brand-name">VANSH SAXENA</span>
          <span className="brand-sub">Software Engineer · Builder</span>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${currentMode === 'landing' ? 'active' : ''}`}
          onClick={() => onNavigate('landing')}
        >
          Landing
        </button>
        <button
          className={`nav-btn ${currentMode === 'city' || currentMode === 'city-entry' ? 'active' : ''}`}
          onClick={() => onNavigate('city-entry')}
        >
          V-City Map
        </button>
        <button
          className={`nav-btn ${currentMode === 'recruiter' ? 'active' : ''}`}
          onClick={() => onNavigate('recruiter')}
        >
          Recruiter Dossier
        </button>
        <button
          className={`nav-btn ${currentMode === 'echo' ? 'active' : ''}`}
          onClick={() => onNavigate('echo')}
        >
          ECHO Hub
        </button>
        <button className="cta-terminal-btn" onClick={onOpenTerminal}>
          Hire Me_
        </button>
      </nav>
    </header>
  );
};
