import React from 'react';

interface BuildingStageProps {
  progress: number;
}

export const BuildingStage: React.FC<BuildingStageProps> = ({ progress }) => {
  // Target building approach & entry range: 0.10 to 0.60
  // 0.10 -> 0.48: Spatial 3D camera travel toward target tower, resolving architectural depth & side facade
  // 0.48 -> 0.58: Camera crosses the physical studio glass plane into the room
  // > 0.60: Completely unmounts to guarantee ZERO overlap with subsequent interior stages
  if (progress < 0.10 || progress > 0.60) {
    return null;
  }

  let scale = 0.44;
  let opacity = 1;
  let translateX = 35;
  let translateY = 12;
  let translateZ = -720;
  let rotateY = -16;
  let rotateX = 2.5;
  let opticalBloomOpacity = 0;

  if (progress <= 0.48) {
    const pNorm = (progress - 0.10) / (0.48 - 0.10);
    // Multi-axis 3D camera approach: glides forward, laterally centers on studio window, and aligns angle
    scale = 0.44 + pNorm * 1.71; // 0.44 -> 2.15
    translateZ = -720 + pNorm * 660; // -720 -> -60
    translateX = 35 - pNorm * 65; // 35 -> -30 (smoothly centers 8th-floor corner studio in view)
    translateY = 12 + pNorm * 32; // 12 -> 44 (aligns with studio window height)
    rotateY = -16 + pNorm * 14; // -16 -> -2 deg (approaches almost front-facing with subtle depth)
    rotateX = 2.5 - pNorm * 2.5; // 2.5 -> 0 deg
    opacity = Math.min(1, (progress - 0.10) * 8);
  } else {
    // Physical glass envelope crossing (0.48 -> 0.58)
    const pEntry = (progress - 0.48) / (0.58 - 0.48);
    scale = 2.15 + pEntry * 7.65; // Studio window expands to encompass entire viewport
    translateZ = -60 + pEntry * 940; // Surges through the glass pane
    translateX = -30 - pEntry * 36;
    translateY = 44 + pEntry * 20;
    rotateY = -2 + pEntry * 2;
    rotateX = 0;
    opacity = Math.max(0, 1 - pEntry * 1.4); // Dissolves as we cross into studio
    // Optical light bloom as camera crosses the glass plane
    opticalBloomOpacity = Math.sin(pEntry * Math.PI) * 0.88;
  }

  // 15 continuous office floors (floors 2 to 16)
  const floors = Array.from({ length: 15 }, (_, i) => i + 2);

  return (
    <div
      className="stage-layer building-stage"
      style={{
        opacity,
        transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transformStyle: 'preserve-3d',
      }}
      aria-hidden="true"
    >
      {/* Optical Glass Envelope Crossing Bloom Layer */}
      {opticalBloomOpacity > 0.01 && (
        <div
          className="glass-envelope-bloom"
          style={{ opacity: opticalBloomOpacity }}
        />
      )}

      <div className="building-3d-rig">
        {/* Architectural Crown: Stepped Mechanical Penthouse & Slender Antenna Mast */}
        <div className="tower-crown-3d">
          <div className="antenna-mast">
            <span className="mast-light"></span>
          </div>
          <div className="mechanical-penthouse">
            <div className="hvac-louvers">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="chiller-units">
              <span></span>
              <span></span>
            </div>
            <div className="maintenance-gantry"></div>
          </div>
          <div className="roof-perimeter-parapet"></div>
        </div>

        {/* 3D Volumetric Tower Body: Front Facade + Visible Angled Side Facade */}
        <div className="tower-volume-3d">
          {/* FRONT FACADE: Glass Curtain Wall with Vertical Mullions & Floor Slabs */}
          <div className="tower-facade facade-front">
            {/* Upper architectural setback on floors 13-16 (Asymmetric silhouette) */}
            <div className="facade-setback-strip"></div>

            {/* Vertical Structural Shear Cores / Mullion Fins */}
            <div className="structural-column column-shear-spine"></div>
            <div className="structural-column column-left"></div>
            <div className="structural-column column-mid-left"></div>
            <div className="structural-column column-mid-right"></div>
            <div className="structural-column column-right"></div>

            {/* Continuous Floor-by-Floor Structural Grid */}
            <div className="facade-floors-grid">
              {floors.map((floorNum) => {
                // Floors 8 & 9 are reserved for the recessed double-height creative studio
                const isStudioFloor = floorNum === 8 || floorNum === 9;
                // Upper setback floors (13-16) have stepped right edge
                const isSetbackFloor = floorNum >= 13;

                return (
                  <div
                    key={floorNum}
                    className={`facade-floor-row ${isStudioFloor ? 'studio-floor-gap' : ''} ${
                      isSetbackFloor ? 'floor-setback' : ''
                    }`}
                  >
                    <div className="floor-spandrel-slab">
                      <span className="slab-edge-line"></span>
                    </div>

                    {!isStudioFloor && (
                      <div className="floor-windows-bay">
                        {Array.from({ length: isSetbackFloor ? 6 : 8 }).map((_, bayIdx) => {
                          // Organic architectural lighting distribution:
                          // ~80% dark reflective glass, ~15% warm occupied office, ~5% cool accent
                          const isWarm =
                            (floorNum === 3 && bayIdx === 2) ||
                            (floorNum === 4 && (bayIdx === 4 || bayIdx === 5)) ||
                            (floorNum === 6 && bayIdx === 1) ||
                            (floorNum === 7 && bayIdx === 3) ||
                            (floorNum === 11 && bayIdx === 2) ||
                            (floorNum === 12 && bayIdx === 5) ||
                            (floorNum === 14 && bayIdx === 2) ||
                            (floorNum === 15 && bayIdx === 3);

                          // Warm intensity variations
                          const isWarmDim = floorNum === 3 || floorNum === 14;

                          const isCool =
                            (floorNum === 5 && bayIdx === 3) ||
                            (floorNum === 10 && bayIdx === 4) ||
                            (floorNum === 13 && bayIdx === 1);

                          return (
                            <div
                              key={bayIdx}
                              className={`window-bay-cell ${
                                isWarm
                                  ? isWarmDim
                                    ? 'bay-warm-lit bay-warm-dim'
                                    : 'bay-warm-lit'
                                  : isCool
                                  ? 'bay-cool-lit'
                                  : 'bay-dark-glass'
                              }`}
                            >
                              <div className="bay-mullion-divider"></div>
                              {isWarm && <div className="internal-blinds-pattern"></div>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Architectural Destination: Integrated Double-Height Recessed Studio Bay */}
            <div className="architectural-studio-bay">
              {/* Recessed Interior Room Volume */}
              <div className="studio-recessed-box">
                <div className="studio-ambient-warmth"></div>
                <div className="studio-backwall-acoustic"></div>
                <div className="studio-ceiling-slab">
                  <div className="studio-pinhole-downlight"></div>
                </div>

                {/* Interior Structural Concrete Pillar */}
                <div className="studio-concrete-pillar"></div>

                {/* Interior Workstation & Seated Developer Silhouette */}
                <div className="studio-workstation-group">
                  <div className="studio-warm-lamp-source">
                    <div className="studio-lamp-glow-cone"></div>
                  </div>
                  <div className="studio-desk-silhouette"></div>
                  <div className="studio-dev-silhouette"></div>
                  <div className="studio-monitors-glow"></div>
                </div>

                <div className="studio-floor-slab"></div>
              </div>

              {/* Recessed Floor-to-Ceiling Panoramic Glass Glazing */}
              <div className="studio-glass-curtain">
                <div className="studio-glass-corner-mullion"></div>
                <div className="studio-glass-glare-stripe"></div>
                <div className="studio-window-sill"></div>
              </div>
            </div>
          </div>

          {/* SIDE FACADE: Angled 3D Plane showing true architectural depth */}
          <div className="tower-facade facade-side">
            <div className="side-facade-surface">
              <div className="side-shear-texture"></div>
              <div className="side-vertical-ribbons">
                {Array.from({ length: 14 }).map((_, idx) => (
                  <div key={idx} className="side-floor-stripe">
                    <span className="side-spandrel"></span>
                    <span
                      className={`side-slot-window ${
                        idx === 3 || idx === 8 || idx === 11 ? 'side-slot-lit' : ''
                      }`}
                    ></span>
                  </div>
                ))}
              </div>
              <div className="side-rim-reflection"></div>
            </div>
          </div>

          {/* Crisp Corner Seam Joint between Front and Side Facades */}
          <div className="tower-corner-seam"></div>
        </div>

        {/* Ground-Level Podium / Glazed Entrance Lobby */}
        <div className="tower-podium-3d">
          <div className="podium-colonnade">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="podium-lobby-glazing"></div>
          <div className="podium-lobby-wash"></div>
        </div>
      </div>
    </div>
  );
};
