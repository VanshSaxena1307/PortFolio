import React from 'react';

interface InteriorStageProps {
  progress: number;
}

export const InteriorStage: React.FC<InteriorStageProps> = ({ progress }) => {
  // Interior stage is active from progress 0.48 to 0.84
  // Hand-off cleanly: unmounts by 0.84 so MonitorStage is 100% unobstructed
  if (progress < 0.48 || progress > 0.84) {
    return null;
  }

  // Camera progression through interior:
  // 0.48 -> 0.62: Cross window envelope into room; establish workspace & seated developer
  // 0.62 -> 0.84: Travel over developer's shoulder towards desk, keyboard, and monitor
  let stageOpacity = 1;
  let scale = 1;
  let translateY = 0;
  let translateZ = -220;

  let devFigureOpacity = 1;
  let devFigureTranslateY = 0;

  if (progress < 0.60) {
    const pEnter = (progress - 0.48) / (0.60 - 0.48);
    stageOpacity = Math.min(1, pEnter * 1.5);
    scale = 0.84 + pEnter * 0.30; // 0.84 -> 1.14
    translateZ = -300 + pEnter * 180;
    translateY = (1 - pEnter) * -18;
    devFigureOpacity = Math.min(1, pEnter * 1.8);
  } else {
    const pZoom = (progress - 0.60) / (0.80 - 0.60);
    // Camera travels over desk toward monitor
    scale = 1.14 + pZoom * 1.35; // 1.14 -> 2.49
    translateZ = -120 + pZoom * 340;
    translateY = pZoom * 48; // Aligns to monitor eye level

    // Developer silhouette glides smoothly below camera and dissolves completely by 0.75
    if (progress >= 0.66) {
      const pDevFade = Math.min(1, (progress - 0.66) / (0.75 - 0.66));
      devFigureOpacity = Math.max(0, 1 - pDevFade);
      devFigureTranslateY = pDevFade * 90; // Moves down past bottom of frame
    }

    // Entire interior stage smoothly dissolves as dominant monitor stage takes over (0.76 to 0.84)
    if (progress > 0.76) {
      stageOpacity = Math.max(0, 1 - (progress - 0.76) / (0.84 - 0.76));
    }
  }

  // Subtle ambient typing oscillation
  const typingOffset = Math.sin(progress * 110) * 1.2;

  return (
    <div
      className="stage-layer interior-stage"
      style={{
        opacity: stageOpacity,
        transform: `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale})`,
      }}
      aria-hidden="true"
    >
      <div className="room-environment">
        {/* Background Panoramic Window showing Nocturnal City (Spatial Continuity) */}
        <div className="studio-city-window">
          <div className="studio-window-frame">
            <div className="city-skyline-backdrop">
              <div className="window-distant-towers"></div>
              <div className="window-city-lights">
                <span className="w-light amber"></span>
                <span className="w-light white"></span>
                <span className="w-light amber"></span>
                <span className="w-light white"></span>
              </div>
            </div>
            <div className="window-glass-tint"></div>
          </div>
        </div>

        {/* Studio Architectural Loft Details */}
        <div className="studio-loft-ceiling">
          <div className="ceiling-beam"></div>
          <div className="ceiling-recessed-light"></div>
        </div>
        <div className="studio-accent-wall"></div>

        {/* Warm Studio Desk Lamp (2700K incandescent lighting source) */}
        <div className="warm-desk-lamp">
          <div className="lamp-shade"></div>
          <div className="lamp-cone-light"></div>
          <div className="lamp-arm"></div>
          <div className="lamp-base"></div>
        </div>

        {/* Workstation Desk & Realistic Physical Gear */}
        <div className="workstation-desk">
          {/* Main Desktop Surface (Dark Wood / Matte Finish) */}
          <div className="desk-surface">
            <div className="desk-mat">
              {/* Mechanical Keyboard with Subtle Backlighting */}
              <div
                className="mechanical-keyboard"
                style={{ transform: `translateY(${typingOffset}px)` }}
              >
                <div className="keyboard-case">
                  <div className="key-row">
                    <span className="keycap"></span>
                    <span className="keycap key-mod"></span>
                    <span className="keycap"></span>
                    <span className="keycap"></span>
                    <span className="keycap key-accent"></span>
                  </div>
                  <div className="key-row">
                    <span className="keycap"></span>
                    <span className="keycap key-accent"></span>
                    <span className="keycap"></span>
                    <span className="keycap"></span>
                    <span className="keycap"></span>
                  </div>
                  <div className="key-row">
                    <span className="keycap key-space"></span>
                  </div>
                </div>
              </div>

              {/* Ergonomic Precision Mouse */}
              <div className="desk-mouse">
                <span className="mouse-wheel"></span>
              </div>

              {/* Secondary Tablet / Vertical Diagnostics Screen */}
              <div className="secondary-device">
                <div className="secondary-screen">
                  <span className="diag-bar bar-1"></span>
                  <span className="diag-bar bar-2"></span>
                  <span className="diag-bar bar-3"></span>
                </div>
              </div>

              {/* Ceramic Coffee Mug with Vapor */}
              <div className="coffee-mug">
                <div className="coffee-rim"></div>
                <div className="steam-vapor"></div>
              </div>

              {/* Designer / Architect Notebook with Sketches */}
              <div className="design-notebook">
                <div className="notebook-sketch-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="notebook-pen"></div>
              </div>

              {/* Clean Desk Cable Routing */}
              <div className="routed-cables"></div>
            </div>
          </div>

          {/* Seated Developer Silhouette & Ergonomic Chair */}
          {devFigureOpacity > 0.01 && (
            <div
              className="developer-figure"
              style={{
                opacity: devFigureOpacity,
                transform: `translate3d(0, ${devFigureTranslateY}px, 0)`,
              }}
            >
              {/* Ergonomic Mesh Chair */}
              <div className="chair-headrest"></div>
              <div className="chair-lumbar-frame">
                <div className="chair-mesh-back"></div>
              </div>

              {/* Natural Developer Pose: Torso, Shoulders, Arms Poised */}
              <div className="developer-torso">
                <div className="developer-head">
                  <div className="headphone-frame">
                    <span className="earcup left"></span>
                    <span className="earcup right"></span>
                  </div>
                </div>
                <div className="developer-shoulders">
                  <div
                    className="developer-arm left"
                    style={{ transform: `rotate(${typingOffset * 0.7}deg)` }}
                  ></div>
                  <div
                    className="developer-arm right"
                    style={{ transform: `rotate(${-typingOffset * 0.7}deg)` }}
                  ></div>
                </div>
              </div>

              {/* Screen Light Bounce on Developer Silhouette */}
              <div className="developer-screen-bounce"></div>
            </div>
          )}

          {/* Perspective Studio Monitor Chassis (Pre-Stage 6 view) */}
          <div className="monitor-mount">
            <div className="monitor-articulated-arm"></div>
            <div className="monitor-chassis-ambient">
              <div className="screen-ide-preview">
                <div className="code-line-mock w-85"></div>
                <div className="code-line-mock w-65 hl-cyan"></div>
                <div className="code-line-mock w-90"></div>
                <div className="code-line-mock w-45 hl-amber"></div>
                <div className="code-line-mock w-70"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
