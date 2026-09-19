import React from 'react';

interface TimelineHUDProps {
  progress: number;
  onJumpToProgress: (target: number) => void;
}

const CHAPTERS = [
  { label: '01 // SKYLINE', target: 0.05 },
  { label: '02 // APPROACH', target: 0.32 },
  { label: '03 // ENTRY', target: 0.52 },
  { label: '04 // DEVELOPER', target: 0.68 },
  { label: '05 // WORKSTATION', target: 0.82 },
  { label: '06 // TERMINAL', target: 0.96 },
];

export const CinematicTimelineHUD: React.FC<TimelineHUDProps> = ({
  progress,
  onJumpToProgress,
}) => {
  // Determine active chapter based on progress
  let activeIndex = 0;
  if (progress > 0.88) activeIndex = 5;
  else if (progress > 0.74) activeIndex = 4;
  else if (progress > 0.58) activeIndex = 3;
  else if (progress > 0.42) activeIndex = 2;
  else if (progress > 0.18) activeIndex = 1;

  const currentChapter = CHAPTERS[activeIndex];

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

      {/* Bottom Scroll Prompt (fades when close to terminal) */}
      {progress < 0.85 && (
        <div className="scroll-indicator-prompt" aria-hidden="true">
          <span className="scroll-arrow">↓</span>
          <span className="scroll-text">SCROLL TO TRAVEL</span>
          <span className="scroll-progress-pct">{Math.round(progress * 100)}%</span>
        </div>
      )}
    </div>
  );
};
