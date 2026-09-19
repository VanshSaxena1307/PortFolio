import React from 'react';

interface TimelineHUDProps {
  progress: number;
  onJumpToProgress: (target: number) => void;
}

const CHAPTERS = [
  { label: '01 // SKYLINE', target: 0.0 },
  { label: '02 // APPROACH', target: 0.20 },
  { label: '03 // ENTRY', target: 0.40 },
  { label: '04 // DEVELOPER', target: 0.60 },
  { label: '05 // WORKSTATION', target: 0.80 },
  { label: '06 // TERMINAL', target: 1.0 },
];

export const CinematicTimelineHUD: React.FC<TimelineHUDProps> = ({
  progress,
  onJumpToProgress,
}) => {
  // Determine active chapter based on progress
  let activeIndex = 0;
  if (progress >= 0.88) activeIndex = 5;
  else if (progress >= 0.70) activeIndex = 4;
  else if (progress >= 0.50) activeIndex = 3;
  else if (progress >= 0.30) activeIndex = 2;
  else if (progress >= 0.10) activeIndex = 1;

  const currentChapter = CHAPTERS[activeIndex];
  const progressPct = Math.round(progress * 100);

  return (
    <div className="cinematic-hud-overlay" aria-label="Cinematic timeline navigation">
      {/* Top Left Current Sector/Chapter telemetry */}
      <div className="telemetry-box">
        <span className="telemetry-pulse"></span>
        <div className="telemetry-info">
          <span className="telemetry-title">CINEMATIC SEQUENCE</span>
          <span className="telemetry-step">{currentChapter.label}</span>
        </div>
      </div>

      {/* Right Side Subtle Chapter Rail */}
      <div className="chapter-rail">
        {CHAPTERS.map((chap, idx) => (
          <button
            key={chap.label}
            className={`chapter-node ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => onJumpToProgress(chap.target)}
            aria-label={`Jump to ${chap.label}`}
            title={chap.label}
          >
            <span className="node-pip"></span>
            <span className="node-tooltip">{chap.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Scroll Prompt (continuously updates 0% to 100%) */}
      <div className="scroll-indicator-prompt" aria-hidden="true">
        <span className="scroll-arrow">{progress >= 0.96 ? '↵' : '↓'}</span>
        <span className="scroll-text">
          {progress >= 0.96 ? 'TERMINAL REACHED' : 'SCROLL TO TRAVEL'}
        </span>
        <span className="scroll-progress-pct">{progressPct}%</span>
      </div>
    </div>
  );
};
