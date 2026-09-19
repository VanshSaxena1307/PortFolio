import React, { useEffect, useRef, useState } from 'react';
import { ALL_CITY_BUILDINGS, CITY_DISTRICTS } from '../../data/cityData';
import { BuildingData, DistrictId, NPCData } from '../../types';
import { CityHUD } from './CityHUD';
import { CityMinimap } from './CityMinimap';
import './city.css';

interface CityWorldProps {
  isDescending?: boolean;
  isSettled?: boolean;
  onSelectBuilding?: (building: BuildingData) => void;
  onSelectNPC?: (npc: NPCData) => void;
}

export const CityWorld: React.FC<CityWorldProps> = ({
  isDescending = false,
  isSettled = true,
  onSelectBuilding,
}) => {
  const [motionReduced, setMotionReduced] = useState(false);
  const [hasControl, setHasControl] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeFading, setWelcomeFading] = useState(false);

  // Active district telemetry (defaults to Campus spawn)
  const [activeDistrictId, setActiveDistrictId] = useState<DistrictId>('campus');
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingData | null>(null);

  // Camera Zoom factor: bounded between 0.82 (City) and 1.85 (Building)
  const [zoomLevel, setZoomLevel] = useState(1.25);
  // Mouse parallax tilt & shift
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Detect accessibility preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionReduced(mq.matches);
  }, []);

  // When camera settles into fixed isometric view:
  // Show subtle "CAMPUS DISTRICT // SECTOR 00" for ~2 seconds then enable interaction
  useEffect(() => {
    if (!isSettled) return;

    setShowWelcome(true);
    setWelcomeFading(false);

    const fadeTimer = setTimeout(() => {
      setWelcomeFading(true);
      const controlTimer = setTimeout(() => {
        setShowWelcome(false);
        setHasControl(true);
      }, 700);
      return () => clearTimeout(controlTimer);
    }, 1800);

    return () => clearTimeout(fadeTimer);
  }, [isSettled]);

  // Handle subtle edge parallax when moving mouse
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasControl || motionReduced) return;
    const { innerWidth, innerHeight } = window;
    const normX = (e.clientX / innerWidth - 0.5) * 2;
    const normY = (e.clientY / innerHeight - 0.5) * 2;

    setMouseParallax({
      x: normX * 2.8,
      y: normY * 2.2,
    });
  };

  // Smooth bounded zoom via scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!hasControl || motionReduced) return;
    setZoomLevel((prev) => {
      const delta = e.deltaY * -0.00075;
      return Math.min(1.85, Math.max(0.82, prev + delta));
    });
  };

  // Determine current zoom level name
  const getZoomLevelName = (): 'City' | 'District' | 'Building' => {
    if (zoomLevel < 1.05) return 'City';
    if (zoomLevel > 1.45) return 'Building';
    return 'District';
  };

  // Camera animation class state for flyover transition
  let cameraClass = 'camera-flyover-high';
  if (isSettled || motionReduced) {
    cameraClass = 'camera-settled';
  } else if (isDescending) {
    cameraClass = 'camera-flyover-descent';
  }

  // Dynamic 3D transform combining fixed 3/4 isometric perspective, zoom, and parallax
  const dynamicCameraTransform =
    isSettled && !motionReduced
      ? `translate3d(${mouseParallax.x * -8}px, ${60 + mouseParallax.y * -6}px, 0px) rotateX(${
          54.74 + mouseParallax.y
        }deg) rotateZ(${-45 + mouseParallax.x}deg) scale(${zoomLevel})`
      : undefined;

  const currentDistrict =
    CITY_DISTRICTS.find((d) => d.id === activeDistrictId) || CITY_DISTRICTS[0];

  return (
    <div
      ref={containerRef}
      className={`city-viewport-root ${hasControl ? 'control-active' : ''}`}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      role="region"
      aria-label="V-City Explorable Urban Diorama"
      tabIndex={0}
    >
      {/* Night Sky & Deep Atmosphere */}
      <div className="city-atmospheric-sky" aria-hidden="true">
        <div className="city-stars-layer" />
        <div className="city-horizon-haze" />
      </div>

      {/* Layered Distant Skyline Silhouette with micro-windows */}
      <div className="city-distant-skyline" aria-hidden="true">
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className="skyline-silhouette-svg">
          <polygon
            points="0,260 0,165 45,165 45,120 75,120 75,260 115,260 115,90 145,90 145,260 210,260 210,135 250,135 250,260 300,260 300,75 330,55 360,75 360,260 430,260 430,125 470,125 470,260 550,260 550,95 590,95 590,260 660,260 660,65 700,65 700,260 770,260 770,115 810,115 810,260 890,260 890,85 930,85 930,260 1000,260 1000,55 1030,35 1060,55 1060,260 1140,260 1140,125 1180,125 1180,260 1270,260 1270,105 1310,105 1310,260 1380,260 1380,145 1440,145 1440,260"
            fill="#050a14"
          />
        </svg>
      </div>

      {/* 3D Isometric Camera Rig */}
      <div
        className={`city-camera-rig ${cameraClass}`}
        style={dynamicCameraTransform ? { transform: dynamicCameraTransform } : undefined}
      >
        {/* World Diorama Stage */}
        <div className="city-diorama-stage">
          {/* Ground Plane (No harsh square boundary; organic radial fade) */}
          <div className="city-ground-plane">
            <div className="city-ground-grid" />

            {/* CURVED ARTERIAL & SECONDARY ROAD NETWORK */}
            <div className="city-roads-network">
              <svg
                className="roads-svg-layer"
                viewBox="0 0 1300 1300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Major Grand Arterial Road (Sweeps West -> Center -> Campus South -> East) */}
                <path
                  d="M 220,620 C 360,620 480,560 620,580 S 840,780 920,860 C 1000,940 1140,940 1200,940"
                  stroke="#080e1a"
                  strokeWidth="52"
                  strokeLinecap="round"
                />
                <path
                  d="M 220,620 C 360,620 480,560 620,580 S 840,780 920,860 C 1000,940 1140,940 1200,940"
                  stroke="#101828"
                  strokeWidth="44"
                  strokeLinecap="round"
                />
                <path
                  d="M 220,620 C 360,620 480,560 620,580 S 840,780 920,860 C 1000,940 1140,940 1200,940"
                  stroke="rgba(245,158,11,0.5)"
                  strokeWidth="2.5"
                  strokeDasharray="8 12"
                />

                {/* Secondary North-South Connectors (Research North -> Center Echo -> Campus South) */}
                <path
                  d="M 640,240 C 640,380 620,480 620,580 S 650,820 650,1050"
                  stroke="#101828"
                  strokeWidth="36"
                  strokeLinecap="round"
                />
                <path
                  d="M 640,240 C 640,380 620,480 620,580 S 650,820 650,1050"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeDasharray="6 10"
                />

                {/* Campus Loop Road */}
                <path
                  d="M 520,820 C 460,860 460,1020 540,1060 S 760,1060 820,1000 S 780,840 700,820"
                  stroke="#101828"
                  strokeWidth="32"
                  strokeLinecap="round"
                />
                <path
                  d="M 520,820 C 460,860 460,1020 540,1060 S 760,1060 820,1000 S 780,840 700,820"
                  stroke="rgba(245,158,11,0.4)"
                  strokeWidth="2"
                  strokeDasharray="6 10"
                />

                {/* Pedestrian Crosswalks (Zebra markings) */}
                <line
                  x1="625"
                  y1="820"
                  x2="675"
                  y2="820"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="6"
                  strokeDasharray="3 3"
                />
                <line
                  x1="580"
                  y1="640"
                  x2="640"
                  y2="640"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="6"
                  strokeDasharray="3 3"
                />
              </svg>

              {/* Elevated 3D Street Lanterns with ground light pools */}
              <div className="street-lamp-glows">
                <div className="lamp-glow warm" style={{ top: '820px', left: '620px' }} />
                <div className="lamp-glow warm" style={{ top: '960px', left: '560px' }} />
                <div className="lamp-glow warm" style={{ top: '960px', left: '740px' }} />
                <div className="lamp-glow cyan" style={{ top: '580px', left: '600px' }} />
                <div className="lamp-glow cyan" style={{ top: '620px', left: '380px' }} />
                <div className="lamp-glow warm" style={{ top: '880px', left: '920px' }} />
                <div className="lamp-glow cyan" style={{ top: '360px', left: '640px' }} />
                <div className="lamp-glow warm" style={{ top: '480px', left: '960px' }} />

                {/* 3D Lamp posts */}
                {[
                  { x: 620, y: 820, color: 'warm' },
                  { x: 560, y: 960, color: 'warm' },
                  { x: 740, y: 960, color: 'warm' },
                  { x: 600, y: 580, color: 'cyan' },
                  { x: 380, y: 620, color: 'cyan' },
                  { x: 920, y: 880, color: 'warm' },
                  { x: 640, y: 360, color: 'cyan' },
                ].map((lamp, idx) => (
                  <div
                    key={idx}
                    className="lamp-post-model"
                    style={{ left: `${lamp.x}px`, top: `${lamp.y}px` }}
                  >
                    <div className="lamp-post-stem" />
                    <div className={`lamp-post-bulb ${lamp.color}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* VEHICLE FLOW (Modern silhouetted cars with headlights/taillights) */}
            <div className="city-vehicles-layer">
              <div className="vehicle-entity vehicle-stream-1" style={{ top: '650px', left: '650px' }}>
                <div className="canopy" />
                <div className="vehicle-headlights">
                  <span className="headlight-beam" />
                  <span className="headlight-beam" />
                </div>
                <div className="vehicle-taillights">
                  <span className="taillight-glow" />
                  <span className="taillight-glow" />
                </div>
              </div>

              <div className="vehicle-entity vehicle-stream-2" style={{ top: '650px', left: '650px' }}>
                <div className="canopy" />
                <div className="vehicle-headlights">
                  <span className="headlight-beam" />
                  <span className="headlight-beam" />
                </div>
                <div className="vehicle-taillights">
                  <span className="taillight-glow" />
                  <span className="taillight-glow" />
                </div>
              </div>

              <div className="vehicle-entity vehicle-stream-3" style={{ top: '650px', left: '650px' }}>
                <div className="canopy" />
                <div className="vehicle-headlights">
                  <span className="headlight-beam" />
                  <span className="headlight-beam" />
                </div>
                <div className="vehicle-taillights">
                  <span className="taillight-glow" />
                  <span className="taillight-glow" />
                </div>
              </div>

              {/* Parked Modern Vehicles along curbs */}
              <div className="parked-car" style={{ top: '850px', left: '520px', transform: 'rotate(15deg)' }} />
              <div className="parked-car" style={{ top: '870px', left: '535px', transform: 'rotate(15deg)' }} />
              <div className="parked-car" style={{ top: '660px', left: '960px', transform: 'rotate(-40deg)' }} />
            </div>

            {/* CAMPUS DISTRICT QUAD COURTYARD & SPAWN (South / Foreground) */}
            <div className="campus-quad-container">
              <div className="campus-lawn">
                <div className="campus-brick-walkway axis-main" />
                <div className="campus-brick-walkway axis-cross" />

                {/* 3D Quad Trees */}
                <div className="quad-tree" style={{ top: '35px', left: '35px' }}>
                  <div className="tree-trunk" />
                  <div className="tree-crown" />
                </div>
                <div className="quad-tree" style={{ top: '35px', right: '35px' }}>
                  <div className="tree-trunk" />
                  <div className="tree-crown" />
                </div>
                <div className="quad-tree" style={{ bottom: '35px', left: '35px' }}>
                  <div className="tree-trunk" />
                  <div className="tree-crown" />
                </div>
                <div className="quad-tree" style={{ bottom: '35px', right: '35px' }}>
                  <div className="tree-trunk" />
                  <div className="tree-crown" />
                </div>

                {/* Campus Spawn Nexus (Beginning of Journey) */}
                <div className="campus-spawn-nexus" title="Campus Spawn: Sector 00">
                  <div className="spawn-ground-ring" />
                  <div className="spawn-core-pulse" />
                </div>
              </div>
            </div>

            {/* SUBTLE PEDESTRIAN SILHOUETTES (Life placeholders) */}
            <div className="city-pedestrian-entity" style={{ top: '910px', left: '645px' }}>
              <div className="pedestrian-shadow" />
            </div>
            <div className="city-pedestrian-entity" style={{ top: '935px', left: '655px' }}>
              <div className="pedestrian-shadow" />
            </div>
            <div className="city-pedestrian-entity" style={{ top: '840px', left: '620px' }}>
              <div className="pedestrian-shadow" />
            </div>
            <div className="city-pedestrian-entity" style={{ top: '630px', left: '960px' }}>
              <div className="pedestrian-shadow" />
            </div>

            {/* 3D ARCHITECTURAL BUILDINGS (Extruded CSS 3D Models across all 5 Districts) */}
            {ALL_CITY_BUILDINGS.map((bldg) => {
              const width = bldg.size.x;
              const depth = bldg.size.z;
              const height = bldg.size.y;
              // Center origin offset inside 1300x1300 diorama stage
              const posX = 650 + bldg.coordinates.x - width / 2;
              const posY = 650 + bldg.coordinates.z - depth / 2;

              return (
                <div
                  key={bldg.id}
                  className={`bldg-3d-wrapper archetype-${bldg.archetype || 'office-tower'}`}
                  style={{
                    left: `${posX}px`,
                    top: `${posY}px`,
                    width: `${width}px`,
                    height: `${depth}px`,
                  }}
                  onClick={() => onSelectBuilding?.(bldg)}
                  onMouseEnter={() => {
                    setHoveredBuilding(bldg);
                    setActiveDistrictId(bldg.district as DistrictId);
                  }}
                  onMouseLeave={() => setHoveredBuilding(null)}
                >
                  {/* Ground Shadow */}
                  <div className="bldg-ground-shadow" />

                  {/* Front Face (Facing South) */}
                  <div
                    className="bldg-face-front"
                    style={{
                      height: `${height}px`,
                      borderColor: bldg.accentColor ? `${bldg.accentColor}33` : undefined,
                    }}
                  >
                    <div className={`windows-${bldg.windowPattern || 'grid'}`} />
                  </div>

                  {/* East Face (Facing East) */}
                  <div
                    className="bldg-face-east"
                    style={{
                      width: `${height}px`,
                    }}
                  >
                    <div className={`windows-${bldg.windowPattern || 'grid'}`} />
                  </div>

                  {/* West Face (Facing West) */}
                  <div
                    className="bldg-face-west"
                    style={{
                      width: `${height}px`,
                    }}
                  />

                  {/* North Face (Facing North) */}
                  <div
                    className="bldg-face-north"
                    style={{
                      height: `${height}px`,
                    }}
                  />

                  {/* Roof Face (Top Deck) */}
                  <div
                    className="bldg-face-roof"
                    style={{
                      transform: `translate3d(0, 0, ${height}px)`,
                      borderColor: bldg.accentColor ? `${bldg.accentColor}44` : undefined,
                    }}
                  >
                    {/* Architectural Rooftop Details */}
                    {bldg.roofDetail === 'antenna' && (
                      <div className="roof-antenna-mast">
                        <span className="warning-beacon-blip" />
                      </div>
                    )}
                    {bldg.roofDetail === 'helipad' && <div className="roof-helipad">H</div>}
                    {bldg.roofDetail === 'mech-unit' && <div className="roof-mech-unit" />}
                    {bldg.roofDetail === 'dome' && <div className="roof-dome" />}
                    {bldg.roofDetail === 'spire' && <div className="roof-spire" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUBTLE 2-SECOND CAMPUS WELCOME MARKER */}
      {showWelcome && (
        <div className={`campus-welcome-banner ${welcomeFading ? 'fading' : ''}`} aria-live="polite">
          <div className="welcome-badge-pill">
            <span className="welcome-badge-dot" />
            <span className="welcome-badge-text">CAMPUS DISTRICT</span>
            <span className="welcome-badge-sector">SECTOR 00</span>
          </div>
        </div>
      )}

      {/* MINIMAL FOUNDATION CITY HUD */}
      <CityHUD
        currentDistrictId={activeDistrictId}
        currentDistrictName={hoveredBuilding ? hoveredBuilding.name : currentDistrict.name}
        currentDistrictSubtitle={
          hoveredBuilding ? hoveredBuilding.tagline : currentDistrict.subtitle
        }
        zoomLevelName={getZoomLevelName()}
      />

      {/* FOUNDATIONAL MINIMAP */}
      <CityMinimap
        currentDistrictId={activeDistrictId}
        onSelectDistrict={(id) => setActiveDistrictId(id)}
      />
    </div>
  );
};
