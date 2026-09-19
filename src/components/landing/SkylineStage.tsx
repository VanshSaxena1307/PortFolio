import React from 'react';

interface SkylineStageProps {
  progress: number;
}

export const SkylineStage: React.FC<SkylineStageProps> = ({ progress }) => {
  // Fade and scale skyline stage as camera flies forward into the city airspace
  // Active between 0.0 and 0.48
  const stageOpacity = Math.max(0, 1 - progress * 2.1);
  const stageScale = 1 + progress * 1.5;
  const stageTranslateY = progress * 30;

  if (stageOpacity <= 0.01) return null;

  // Foreground Terrace Parallax: moves down and out rapidly to simulate camera crossing the ledge
  const fgTranslateY = progress * 420;
  const fgScale = 1 + progress * 2.6;
  const fgOpacity = Math.max(0, 1 - progress * 4.6);

  // Midground framing towers parallax
  const midTranslateY = progress * 80;
  const midScale = 1 + progress * 1.1;

  // Background deep horizon parallax
  const bgTranslateY = progress * 20;

  // Natural Vansh Identification Reveal (Edge-positioned as camera approaches target sector)
  // Appears naturally between 0.10 and 0.28, then gracefully dissolves
  let idCardOpacity = 0;
  let idCardTranslateX = 0;
  if (progress >= 0.08 && progress <= 0.30) {
    if (progress < 0.14) {
      idCardOpacity = (progress - 0.08) / (0.14 - 0.08);
      idCardTranslateX = (1 - idCardOpacity) * -16;
    } else if (progress <= 0.22) {
      idCardOpacity = 1;
      idCardTranslateX = 0;
    } else {
      idCardOpacity = Math.max(0, (0.30 - progress) / (0.30 - 0.22));
      idCardTranslateX = (1 - idCardOpacity) * 16;
    }
  }

  return (
    <div
      className="stage-layer skyline-stage"
      style={{
        opacity: stageOpacity,
        transform: `translate3d(0, ${stageTranslateY}px, -1100px) scale(${stageScale})`,
      }}
      aria-hidden="true"
    >
      {/* 1. Atmospheric Deep Celestial Sky & Twilight Haze */}
      <div className="celestial-backdrop">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
        <div className="star star-4"></div>
        <div className="star star-5"></div>
        <div className="star star-6"></div>
        <div className="star star-7"></div>
        <div className="nebula-glow"></div>
        <div className="horizon-ambient-glow"></div>
      </div>

      {/* 2. Background Sprawling Nocturnal Skyline (Dense Depth Horizon) */}
      <div
        className="skyline-layer deep-skyline-layer"
        style={{ transform: `translate3d(0, ${bgTranslateY}px, 0)` }}
      >
        <svg
          className="skyline-svg deep-silhouettes"
          viewBox="0 0 1600 500"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="deepSkylineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a1222" />
              <stop offset="45%" stopColor="#060b14" />
              <stop offset="100%" stopColor="#03050a" />
            </linearGradient>
          </defs>

          {/* Spires and background skyscrapers with varied architectural heights */}
          <polygon points="20,500 20,280 50,250 80,280 80,500" fill="url(#deepSkylineGrad)" />
          <polygon points="100,500 100,220 170,220 170,500" fill="url(#deepSkylineGrad)" />
          <polygon points="190,500 190,170 230,140 260,170 260,500" fill="url(#deepSkylineGrad)" />
          <polygon points="290,500 290,290 350,290 350,500" fill="url(#deepSkylineGrad)" />
          <polygon points="380,500 380,140 395,90 410,140 440,140 440,500" fill="url(#deepSkylineGrad)" />
          <polygon points="470,500 470,230 540,230 540,500" fill="url(#deepSkylineGrad)" />
          <polygon points="570,500 570,180 640,180 640,500" fill="url(#deepSkylineGrad)" />
          <polygon points="670,500 670,120 685,70 700,120 740,120 740,500" fill="url(#deepSkylineGrad)" />
          <polygon points="780,500 780,200 840,200 840,500" fill="url(#deepSkylineGrad)" />
          <polygon points="870,500 870,150 915,150 935,190 935,500" fill="url(#deepSkylineGrad)" />
          <polygon points="970,500 970,240 1030,240 1030,500" fill="url(#deepSkylineGrad)" />
          <polygon points="1060,500 1060,130 1080,80 1100,130 1140,130 1140,500" fill="url(#deepSkylineGrad)" />
          <polygon points="1170,500 1170,210 1240,210 1240,500" fill="url(#deepSkylineGrad)" />
          <polygon points="1270,500 1270,160 1320,130 1370,160 1370,500" fill="url(#deepSkylineGrad)" />
          <polygon points="1400,500 1400,260 1470,260 1470,500" fill="url(#deepSkylineGrad)" />
          <polygon points="1500,500 1500,190 1550,190 1550,500" fill="url(#deepSkylineGrad)" />

          {/* Asynchronous red aviation beacon lights on distant spires */}
          <circle cx="50" cy="248" r="2" fill="#ef4444" className="beacon-blink beacon-delay-1" />
          <circle cx="395" cy="88" r="2.5" fill="#ef4444" className="beacon-blink beacon-delay-2" />
          <circle cx="685" cy="68" r="2.5" fill="#ef4444" className="beacon-blink beacon-delay-3" />
          <circle cx="1080" cy="78" r="2" fill="#ef4444" className="beacon-blink beacon-delay-1" />
          <circle cx="1320" cy="128" r="2" fill="#ef4444" className="beacon-blink beacon-delay-4" />
        </svg>
      </div>

      {/* Atmospheric Interstitial Haze */}
      <div className="skyline-haze-interstitial"></div>

      {/* 3. Midground City & Urban Canyon Framing */}
      <div
        className="skyline-layer mid-skyline-layer"
        style={{ transform: `translate3d(0, ${midTranslateY}px, 0) scale(${midScale})` }}
      >
        <svg
          className="skyline-svg midground-skyline"
          viewBox="0 0 1600 500"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="midTowerA" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#142138" />
              <stop offset="35%" stopColor="#0e1728" />
              <stop offset="100%" stopColor="#060a13" />
            </linearGradient>
            <linearGradient id="midTowerB" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#172640" />
              <stop offset="40%" stopColor="#101b2e" />
              <stop offset="100%" stopColor="#070c17" />
            </linearGradient>
          </defs>

          {/* Left Framing High-Rise Tower */}
          <rect x="0" y="160" width="130" height="340" fill="url(#midTowerB)" />
          <rect x="20" y="140" width="80" height="20" fill="#1b2a45" />
          <line x1="60" y1="105" x2="60" y2="140" stroke="#64748b" strokeWidth="2" />
          <circle cx="60" cy="103" r="2.5" fill="#ef4444" className="beacon-blink beacon-delay-2" />

          {/* Building 2 */}
          <rect x="150" y="230" width="100" height="270" fill="url(#midTowerA)" />

          {/* Building 3 - Sloped setback */}
          <polygon points="275,500 275,190 380,240 380,500" fill="url(#midTowerB)" />

          {/* Building 4 - Office tower */}
          <rect x="410" y="170" width="115" height="330" fill="url(#midTowerA)" />
          <rect x="435" y="150" width="65" height="20" fill="#1b2b46" />

          {/* Building 5 */}
          <rect x="555" y="220" width="105" height="280" fill="url(#midTowerB)" />

          {/* Right Midground Towers */}
          <rect x="980" y="210" width="110" height="290" fill="url(#midTowerA)" />
          <rect x="1120" y="180" width="125" height="320" fill="url(#midTowerB)" />
          <rect x="1150" y="160" width="65" height="20" fill="#1a2944" />
          <line x1="1182" y1="125" x2="1182" y2="160" stroke="#64748b" strokeWidth="2" />
          <circle cx="1182" cy="123" r="2.5" fill="#ef4444" className="beacon-blink beacon-delay-3" />

          <rect x="1275" y="240" width="95" height="260" fill="url(#midTowerA)" />

          {/* Right Framing High-Rise Tower */}
          <rect x="1400" y="150" width="200" height="350" fill="url(#midTowerB)" />
          <rect x="1430" y="130" width="110" height="20" fill="#1b2b46" />

          {/* Realism: Believable Office Window Occupancy */}
          {/* Left Tower Warm/Cool Windows */}
          <g fill="#f59e0b" opacity="0.6">
            <rect x="25" y="200" width="7" height="4" rx="0.5" />
            <rect x="40" y="200" width="7" height="4" rx="0.5" />
            <rect x="25" y="235" width="7" height="4" rx="0.5" />
            <rect x="55" y="235" width="7" height="4" rx="0.5" />
            <rect x="70" y="235" width="7" height="4" rx="0.5" />
            <rect x="40" y="290" width="7" height="4" rx="0.5" />
            <rect x="55" y="290" width="7" height="4" rx="0.5" />
          </g>
          <g fill="#f8fafc" opacity="0.4">
            <rect x="55" y="200" width="7" height="4" rx="0.5" />
            <rect x="25" y="260" width="7" height="4" rx="0.5" />
            <rect x="40" y="260" width="7" height="4" rx="0.5" />
          </g>

          {/* Building 4 Office Clusters */}
          <g fill="#fbbf24" opacity="0.65">
            <rect x="430" y="205" width="8" height="4" rx="0.5" />
            <rect x="445" y="205" width="8" height="4" rx="0.5" />
            <rect x="460" y="205" width="8" height="4" rx="0.5" />
            <rect x="480" y="240" width="8" height="4" rx="0.5" />
            <rect x="495" y="240" width="8" height="4" rx="0.5" />
            <rect x="430" y="275" width="8" height="4" rx="0.5" />
            <rect x="460" y="275" width="8" height="4" rx="0.5" />
          </g>
          <g fill="#93c5fd" opacity="0.35">
            <rect x="475" y="205" width="8" height="4" rx="0.5" />
            <rect x="430" y="240" width="8" height="4" rx="0.5" />
            <rect x="445" y="240" width="8" height="4" rx="0.5" />
          </g>

          {/* Right Tower Office Clusters */}
          <g fill="#fef3c7" opacity="0.55">
            <rect x="1145" y="215" width="8" height="4" rx="0.5" />
            <rect x="1160" y="215" width="8" height="4" rx="0.5" />
            <rect x="1175" y="215" width="8" height="4" rx="0.5" />
            <rect x="1145" y="255" width="8" height="4" rx="0.5" />
            <rect x="1190" y="255" width="8" height="4" rx="0.5" />
            <rect x="1440" y="200" width="8" height="4" rx="0.5" />
            <rect x="1455" y="200" width="8" height="4" rx="0.5" />
            <rect x="1470" y="200" width="8" height="4" rx="0.5" />
            <rect x="1440" y="240" width="8" height="4" rx="0.5" />
            <rect x="1485" y="240" width="8" height="4" rx="0.5" />
          </g>
        </svg>

        {/* Distant Highway Light Streams between Tower Bases */}
        <div className="traffic-highway">
          <div className="traffic-stream headlights-stream"></div>
          <div className="traffic-stream taillights-stream"></div>
        </div>
      </div>

      {/* 4. Natural Vansh Identity Reveal (Locked Text Only) */}
      {idCardOpacity > 0.01 && (
        <div
          className="cinematic-edge-reveal"
          style={{
            opacity: idCardOpacity,
            transform: `translate3d(${idCardTranslateX}px, 0, 0)`,
          }}
        >
          <div className="edge-reveal-rule"></div>
          <div className="edge-reveal-body">
            <h2 className="edge-reveal-name">VANSH SAXENA</h2>
            <p className="edge-reveal-role">SOFTWARE ENGINEER · BUILDER</p>
          </div>
        </div>
      )}

      {/* 5. FOREGROUND OBSERVATION TERRACE & BALUSTRADE (High Parallax Camera Position) */}
      {fgOpacity > 0.01 && (
        <div
          className="foreground-observation-terrace"
          style={{
            opacity: fgOpacity,
            transform: `translate3d(0, ${fgTranslateY}px, 0) scale(${fgScale})`,
          }}
        >
          {/* Concrete Parapet Ledge */}
          <div className="terrace-parapet-ledge">
            <div className="parapet-coping"></div>
            {/* Industrial Safety Railing */}
            <div className="terrace-safety-railing">
              <span className="railing-post post-1"></span>
              <span className="railing-post post-2"></span>
              <span className="railing-post post-3"></span>
              <span className="railing-post post-4"></span>
              <span className="railing-post post-5"></span>
              <div className="railing-top-rail"></div>
              <div className="railing-mid-rail"></div>
            </div>
            {/* Rooftop Utility Hardware (Antenna, vent housing, maintenance light) */}
            <div className="terrace-antenna-rig">
              <span className="rig-mast"></span>
              <span className="rig-beacon"></span>
            </div>
            <div className="terrace-vent-housing">
              <span className="vent-slat"></span>
              <span className="vent-slat"></span>
              <span className="vent-indicator"></span>
            </div>
          </div>
        </div>
      )}

      {/* Low Altitude Atmospheric Gradient */}
      <div className="skyline-atmospheric-haze"></div>
    </div>
  );
};
