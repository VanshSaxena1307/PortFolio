import React from 'react';

interface InteriorStageProps {
  progress: number;
}

export const InteriorStage: React.FC<InteriorStageProps> = ({ progress }) => {
  // Interior stage is active from progress 0.44 to 0.95
  if (progress < 0.44 || progress > 0.95) {
    return null;
  }

  // Calculate local progress for entering room -> zooming to monitor
  // 0.44 -> 0.62: Room reveals, camera travels from window to behind developer
  // 0.62 -> 0.90: Camera pushes over desk towards monitor screen
  let opacity = 1;
  let scale = 1;
  let translateY = 0;
  let translateZ = -200;

  if (progress < 0.60) {
    const pEnter = (progress - 0.44) / (0.60 - 0.44);
    opacity = Math.min(1, pEnter * 1.5);
    scale = 0.8 + pEnter * 0.35; // 0.8 -> 1.15
    translateZ = -300 + pEnter * 200;
  } else {
    const pZoom = (progress - 0.60) / (0.92 - 0.60);
    // Camera travels over the desk towards the monitor
    scale = 1.15 + pZoom * 1.4; // 1.15 -> 2.55
    translateZ = -100 + pZoom * 350;
    translateY = pZoom * 60; // Camera lowers slightly to monitor eye level
    // Developer silhouette fades out as camera moves past developer's shoulder
    opacity = progress > 0.88 ? Math.max(0, 1 - (progress - 0.88) * 12) : 1;
  }

  // Dynamic typing animation indicator on keyboard and developer
  const typingOffset = Math.sin(progress * 100) * 1.5;

  return (
    <div
      className="stage-layer interior-stage"
      style={{
        opacity,
        transform: `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale})`,
      }}
      aria-hidden="true"
    >
      <div className="room-environment">
        {/* Subtle Room Lighting & Architectural Loft Elements */}
        <div className="room-ceiling-beam"></div>
        <div className="room-wall-left"></div>
        <div className="room-ambient-lamp">
          <div className="lamp-glow"></div>
        </div>

        {/* The Workstation Desk & Surroundings */}
        <div className="workstation-desk">
          <div className="desk-surface">
            <div className="desk-mat">
              {/* Mechanical Keyboard with backlight */}
              <div
                className="mechanical-keyboard"
                style={{ transform: `translateY(${typingOffset}px)` }}
              >
                <div className="key-row">
                  <span className="keycap glow-cyan"></span>
                  <span className="keycap"></span>
                  <span className="keycap glow-amber"></span>
                  <span className="keycap"></span>
                  <span className="keycap"></span>
                </div>
                <div className="key-row">
                  <span className="keycap"></span>
                  <span className="keycap glow-cyan"></span>
                  <span className="keycap"></span>
                  <span className="keycap"></span>
                </div>
              </div>

              {/* Minimalist mouse / trackpad */}
              <div className="desk-mouse"></div>

              {/* Developer coffee mug with subtle thermal vapor */}
              <div className="coffee-mug">
                <div className="steam-line"></div>
              </div>
            </div>
          </div>

          {/* Over-the-Shoulder Developer Silhouette & Posture */}
          <div className="developer-figure">
            {/* Ergonomic mesh chair back */}
            <div className="chair-headrest"></div>
            <div className="chair-backrest"></div>

            {/* Developer Head & Shoulders Silhouette */}
            <div className="developer-torso">
              <div className="developer-head">
                {/* Headphones */}
                <div className="headphone-band"></div>
              </div>
              <div className="developer-shoulders">
                {/* Hands poised over keyboard */}
                <div
                  className="developer-arm left"
                  style={{ transform: `rotate(${typingOffset * 0.8}deg)` }}
                ></div>
                <div
                  className="developer-arm right"
                  style={{ transform: `rotate(${-typingOffset * 0.8}deg)` }}
                ></div>
              </div>
            </div>

            {/* Monitor glow casting back on developer */}
            <div className="developer-monitor-reflection"></div>
          </div>

          {/* Perspective Monitor Stand & Chassis (Pre-Monitor Focus) */}
          <div className="monitor-mount">
            <div className="monitor-stand-arm"></div>
            <div className="monitor-chassis-ambient">
              {/* Code streaming preview on screen */}
              <div className="screen-code-preview">
                <div className="code-line w-80"></div>
                <div className="code-line w-60 cyan"></div>
                <div className="code-line w-90"></div>
                <div className="code-line w-40 amber"></div>
                <div className="code-line w-75"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
