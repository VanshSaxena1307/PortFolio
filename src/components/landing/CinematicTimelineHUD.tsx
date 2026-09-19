import React from 'react';

interface TimelineHUDProps {
  progress: number;
  onJumpToProgress: (target: number) => void;
  onSkipIntro?: () => void;
  onOpenRecruiter?: () => void;
}

const CHAPTERS = [
  { index: '01', title: 'SKYLINE', target: 0.0 },
  { index: '02', title: 'APPROACH', target: 0.22 },
  { index: '03', title: 'ENTRY', target: 0.48 },
  { index: '04', title: 'STUDIO', target: 0.64 },
  { index: '05', title: 'WORKSTATION', target: 0.82 },
  { index: '06', title: 'TERMINAL', target: 1.0 },
];

export const CinematicTimelineHUD: React.FC<TimelineHUDProps> = ({
  progress,
  onJumpToProgress,
  onSkipIntro,
  onOpenRecruiter,
}) => {
  // Determine active cinematic chapter
  let activeIndex = 0;
  if (progress >= 0.88) activeIndex = 5;
  else if (progress >= 0.70) activeIndex = 4;
  else if (progress >= 0.50) activeIndex = 3;
  else if (progress >= 0.28) activeIndex = 2;
  else if (progress >= 0.10) activeIndex = 1;

  const currentChapter = CHAPTERS[activeIndex];
  const progressPct = Math.round(progress * 100);

  return (
    <div className="cinematic-hud-overlay" aria-label="Cinematic prologue controls">
      {/* Top Left: Discreet Game Prologue Marker */}
      <div className="cinematic-prologue-brand">
        <span className="prologue-pulse-pip" aria-hidden="true"></span>
        <span className="prologue-text">V-CITY // PROLOGUE</span>
      </div>

      {/* Top Right: Minimal Cinematic Utility Layer & Recruiter Access */}
      <div className="cinematic-utility-actions">
        {onOpenRecruiter && (
          <button
            type="button"
            className="cinematic-util-link"
            onClick={onOpenRecruiter}
            aria-label="Open Recruiter Dossier"
          >
            RESUME
          </button>
        )}
        <a
          href="https://linkedin.com/in/vanshsaxena13"
          target="_blank"
          rel="noopener noreferrer"
          className="cinematic-util-link"
          aria-label="Vansh Saxena LinkedIn profile"
        >
          LINKEDIN
        </a>
        {onSkipIntro && (
          <button
            type="button"
            className="cinematic-skip-button"
            onClick={onSkipIntro}
            aria-label="Skip cinematic intro to V-City"
          >
            <span className="skip-label">SKIP INTRO</span>
            <span className="skip-arrow" aria-hidden="true">↗</span>
          </button>
        )}
      </div>

      {/* Right Edge: Discrete Chapter Pips */}
      <nav className="cinematic-rail-pips" aria-label="Timeline chapters">
        {CHAPTERS.map((chap, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <button
              key={chap.index}
              type="button"
              className={`pip-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
              onClick={() => onJumpToProgress(chap.target)}
              aria-label={`Jump to chapter ${chap.index} ${chap.title}`}
            >
              <span className="pip-dot"></span>
              <span className="pip-label">{chap.index} {chap.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Center: Minimalist Cinematic Progress Line */}
      <div className="cinematic-minimal-scroll-nav" aria-hidden="true">
        <div className="minimal-chapter-label">
          <span className="chapter-num">{currentChapter.index}</span>
          <span className="chapter-sep">—</span>
          <span className="chapter-name">{currentChapter.title}</span>
        </div>

        <div className="minimal-progress-track">
          <div
            className="minimal-progress-fill"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          ></div>
        </div>

        <div className="minimal-scroll-meta">
          <span className="minimal-scroll-hint">
            {progress >= 0.95 ? 'TERMINAL READY ↵' : 'SCROLL TO TRAVEL'}
          </span>
          <span className="minimal-scroll-pct">{progressPct}%</span>
        </div>
      </div>
    </div>
  );
};
