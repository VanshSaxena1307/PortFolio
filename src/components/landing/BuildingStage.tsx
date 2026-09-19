import React from 'react';

interface BuildingStageProps {
  progress: number;
}

export const BuildingStage: React.FC<BuildingStageProps> = ({ progress }) => {
  // Building approach range: 0.10 to 0.60
  // At 0.10: building starts becoming the focal object
  // At 0.40: building is close, detailed facade visible
  // At 0.48 - 0.58: camera moves through the illuminated window frame into the building
  if (progress < 0.08 || progress > 0.62) {
    return null;
  }

  // Calculate normalized local progress for approach & entry
  // 0.10 -> 0.48 = approach (scale from 0.45 to 1.8)
  // 0.48 -> 0.58 = push through window (scale up to 8+, opacity fades out as we pass through)
  let scale = 0.5;
  let opacity = 1;
  let translateZ = -600;

  if (progress <= 0.46) {
    const pNorm = (progress - 0.10) / (0.46 - 0.10);
    scale = 0.4 + pNorm * 1.5;
    translateZ = -600 + pNorm * 500; // -600 to -100
    opacity = Math.min(1, (progress - 0.08) * 8);
  } else {
    // Punching through the window
    const pEntry = (progress - 0.46) / (0.60 - 0.46);
    scale = 1.9 + pEntry * 7.5; // grows from 1.9 to ~9.4
    translateZ = -100 + pEntry * 800; // pushes right past camera
    opacity = Math.max(0, 1 - pEntry * 1.6); // outer facade disappears as we enter
  }

  return (
    <div
      className="stage-layer building-stage"
      style={{
        opacity,
        transform: `translate3d(0, 0, ${translateZ}px) scale(${scale})`,
      }}
      aria-hidden="true"
    >
      <div className="skyscraper-container">
        {/* Skyscraper architectural crown & antenna */}
        <div className="tower-crown">
          <div className="antenna-mast">
            <span className="mast-light"></span>
          </div>
          <div className="rooftop-heliport"></div>
        </div>

        {/* Building Facade Body */}
        <div className="tower-body">
          {/* Vertical Architectural Fin Mullions */}
          <div className="facade-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="facade-column">
                <span className="floor-band"></span>
                <span className="floor-band"></span>
                <span className="floor-band"></span>
                <span className="floor-band"></span>
              </div>
            ))}
          </div>

          {/* Targeted Illuminated Corner Studio Window (Camera Target) */}
          <div className="target-window-aperture">
            <div className="window-glow"></div>
            <div className="window-frame">
              <div className="interior-hint">
                {/* Silhouette hint of workstation from outside */}
                <div className="mini-desk-silhouette"></div>
                <div className="mini-monitor-glow"></div>
              </div>
            </div>
            <div className="window-glass-glare"></div>
          </div>
        </div>

        {/* Structural lower tower foundation */}
        <div className="tower-base">
          <div className="base-lighting"></div>
        </div>
      </div>
    </div>
  );
};
