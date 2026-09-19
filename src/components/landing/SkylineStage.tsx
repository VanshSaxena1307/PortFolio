import React from 'react';

interface SkylineStageProps {
  progress: number;
}

export const SkylineStage: React.FC<SkylineStageProps> = ({ progress }) => {
  // Fade and scale skyline as camera pushes forward into the city
  // Active mostly between 0.0 and 0.45
  const opacity = Math.max(0, 1 - progress * 2.2);
  const scale = 1 + progress * 1.8;
  const translateY = progress * 40;

  if (opacity <= 0.01) return null;

  return (
    <div
      className="stage-layer skyline-stage"
      style={{
        opacity,
        transform: `translate3d(0, ${translateY}px, -1200px) scale(${scale})`,
      }}
      aria-hidden="true"
    >
      {/* Distant stars & atmospheric celestial gradient */}
      <div className="celestial-backdrop">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
        <div className="star star-4"></div>
        <div className="nebula-glow"></div>
      </div>

      {/* Layer 1: Deep Distant Silhouettes */}
      <svg className="skyline-svg deep-silhouettes" viewBox="0 0 1200 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="deepTowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c1626" />
            <stop offset="100%" stopColor="#05080f" />
          </linearGradient>
        </defs>
        <polygon points="50,400 50,220 90,200 130,220 130,400" fill="url(#deepTowerGrad)" />
        <polygon points="160,400 160,180 220,180 220,400" fill="url(#deepTowerGrad)" />
        <polygon points="250,400 250,140 290,120 330,140 330,400" fill="url(#deepTowerGrad)" />
        <polygon points="360,400 360,250 420,250 420,400" fill="url(#deepTowerGrad)" />
        <polygon points="460,400 460,110 475,70 490,110 520,110 520,400" fill="url(#deepTowerGrad)" />
        <polygon points="560,400 560,190 620,190 620,400" fill="url(#deepTowerGrad)" />
        <polygon points="660,400 660,130 730,130 730,400" fill="url(#deepTowerGrad)" />
        <polygon points="770,400 770,220 830,220 830,400" fill="url(#deepTowerGrad)" />
        <polygon points="860,400 860,160 920,160 920,400" fill="url(#deepTowerGrad)" />
        <polygon points="950,400 950,100 980,60 1010,100 1010,400" fill="url(#deepTowerGrad)" />
        <polygon points="1040,400 1040,210 1100,210 1100,400" fill="url(#deepTowerGrad)" />
      </svg>

      {/* Layer 2: Midground Skyline with glowing window grids */}
      <svg className="skyline-svg midground-skyline" viewBox="0 0 1200 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="midTowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#121f35" />
            <stop offset="100%" stopColor="#070c16" />
          </linearGradient>
        </defs>
        {/* Antenna / Beacon tower */}
        <line x1="600" y1="50" x2="600" y2="120" stroke="#00f2fe" strokeWidth="2" strokeOpacity="0.7" />
        <circle cx="600" cy="50" r="3" fill="#f43f5e" className="beacon-blink" />

        <rect x="80" y="240" width="70" height="160" fill="url(#midTowerGrad)" />
        <rect x="180" y="190" width="90" height="210" fill="url(#midTowerGrad)" />
        <rect x="300" y="220" width="80" height="180" fill="url(#midTowerGrad)" />
        <rect x="420" y="160" width="100" height="240" fill="url(#midTowerGrad)" />
        <rect x="550" y="120" width="100" height="280" fill="url(#midTowerGrad)" />
        <rect x="680" y="170" width="90" height="230" fill="url(#midTowerGrad)" />
        <rect x="800" y="200" width="85" height="200" fill="url(#midTowerGrad)" />
        <rect x="910" y="150" width="95" height="250" fill="url(#midTowerGrad)" />
        <rect x="1030" y="230" width="80" height="170" fill="url(#midTowerGrad)" />

        {/* Window grid patterns */}
        <g fill="#00f2fe" opacity="0.35">
          <circle cx="210" cy="220" r="1.5" />
          <circle cx="230" cy="220" r="1.5" />
          <circle cx="210" cy="240" r="1.5" />
          <circle cx="450" cy="190" r="1.5" />
          <circle cx="470" cy="190" r="1.5" />
          <circle cx="490" cy="190" r="1.5" />
          <circle cx="450" cy="210" r="1.5" />
          <circle cx="470" cy="210" r="1.5" />
          <circle cx="710" cy="200" r="1.5" />
          <circle cx="730" cy="200" r="1.5" />
          <circle cx="710" cy="220" r="1.5" />
          <circle cx="940" cy="180" r="1.5" />
          <circle cx="960" cy="180" r="1.5" />
          <circle cx="940" cy="200" r="1.5" />
          <circle cx="960" cy="200" r="1.5" />
        </g>
      </svg>

      {/* Atmospheric Haze Layer */}
      <div className="skyline-atmospheric-haze"></div>
    </div>
  );
};
