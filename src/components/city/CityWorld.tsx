import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ALL_CITY_BUILDINGS, CITY_DISTRICTS } from '../../data/cityData';
import { BuildingData, CameraState, DistrictId, InteractionPhase, NPCData } from '../../types';
import { CityHUD } from './CityHUD';
import { CityMinimap } from './CityMinimap';
import { BuildingDispatcher } from './archetypes/BuildingDispatcher';
import { BuildingInspectionPanel } from './BuildingInspectionPanel';
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
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);

  // Phase 6 Interaction State
  const [interactionPhase, setInteractionPhase] = useState<InteractionPhase>('IDLE');

  // Stored Camera State for exact return upon closing inspection
  const [storedCameraState, setStoredCameraState] = useState<CameraState>({
    camX: 0,
    camY: 60,
    zoom: 1.25,
    districtId: 'campus',
  });

  // Dynamic Camera Center Offset (in screen space pixels)
  const [camOffset, setCamOffset] = useState<{ x: number; y: number }>({ x: 0, y: 60 });
  // Subtle focus drift when hovering (~10-15px max)
  const [hoverDrift, setHoverDrift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Target building 2D screen coordinate for adaptive connector line
  const [targetScreenPos, setTargetScreenPos] = useState<{ x: number; y: number } | null>(null);

  // Camera Zoom factor: bounded between 0.82 (City) and 1.95 (Building Inspection)
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

  // Handle subtle edge parallax when moving mouse (frozen during inspection)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasControl || motionReduced) return;
    if (interactionPhase === 'FOCUSING' || interactionPhase === 'INSPECTING') return;

    const { innerWidth, innerHeight } = window;
    const normX = (e.clientX / innerWidth - 0.5) * 2;
    const normY = (e.clientY / innerHeight - 0.5) * 2;

    setMouseParallax({
      x: normX * 2.8,
      y: normY * 2.2,
    });
  };

  // Smooth bounded zoom via scroll wheel (only when idle/hovering)
  const handleWheel = (e: React.WheelEvent) => {
    if (!hasControl || motionReduced) return;
    if (interactionPhase === 'FOCUSING' || interactionPhase === 'INSPECTING') return;

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

  // Helper: Project world (x, z) coordinates into 3D isometric screen space
  const projectBuildingToScreen = useCallback((x: number, z: number, zoom: number) => {
    // Stage rotation: rotateZ(-45deg), rotateX(54.74deg)
    const px = ((x + z) / 1.4142) * zoom;
    const py = ((-x + z) / 2.4495) * zoom;
    return { px, py };
  }, []);

  // Update target building screen position for connector line
  const updateTargetScreenPosition = useCallback((bldg: BuildingData) => {
    const node = document.getElementById(`bldg-node-${bldg.id}`);
    if (node) {
      const rect = node.getBoundingClientRect();
      setTargetScreenPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, []);

  // Building Hover Handler
  const handleBuildingHover = (bldg: BuildingData) => {
    if (interactionPhase === 'FOCUSING' || interactionPhase === 'INSPECTING') return;

    setHoveredBuilding(bldg);
    setInteractionPhase('HOVERING');
    setActiveDistrictId(bldg.district as DistrictId);

    // Subtle focus drift toward hovered building (~10-14px max)
    const { px, py } = projectBuildingToScreen(bldg.coordinates.x, bldg.coordinates.z, zoomLevel);
    setHoverDrift({
      x: -px * 0.045,
      y: -py * 0.045,
    });
  };

  // Building Mouse Leave Handler
  const handleBuildingLeave = () => {
    if (interactionPhase === 'FOCUSING' || interactionPhase === 'INSPECTING') return;

    setHoveredBuilding(null);
    setInteractionPhase('IDLE');
    setHoverDrift({ x: 0, y: 0 });
  };

  // Building Click -> Cinematic Push-In & Inspection
  const handleInspectBuilding = (bldg: BuildingData) => {
    // If already inspecting this building, do nothing
    if (selectedBuilding?.id === bldg.id && (interactionPhase === 'INSPECTING' || interactionPhase === 'FOCUSING')) {
      return;
    }

    // Save previous camera state if not already inspecting
    if (interactionPhase !== 'INSPECTING' && interactionPhase !== 'FOCUSING') {
      setStoredCameraState({
        camX: camOffset.x,
        camY: camOffset.y,
        zoom: zoomLevel,
        districtId: activeDistrictId,
      });
    }

    setInteractionPhase('FOCUSING');
    setSelectedBuilding(bldg);
    setActiveDistrictId(bldg.district as DistrictId);
    setHoveredBuilding(null);
    setHoverDrift({ x: 0, y: 0 });

    // Target zoom framing building at ~30-40% visual composition
    // Large structures get slightly more breathing room
    const targetZoom = bldg.size.x > 100 || bldg.size.y > 120 ? 1.62 : 1.74;
    const { px, py } = projectBuildingToScreen(bldg.coordinates.x, bldg.coordinates.z, targetZoom);

    // Offset camera slightly opposite to where panel will dock to maximize visual balance
    const sideOffset = px < 0 ? -45 : 45;
    setCamOffset({
      x: -px + sideOffset,
      y: -py + 65,
    });
    setZoomLevel(targetZoom);

    onSelectBuilding?.(bldg);

    // After push-in animation finishes, transition to INSPECTING
    const settleDuration = motionReduced ? 0 : 750;
    setTimeout(() => {
      setInteractionPhase('INSPECTING');
      updateTargetScreenPosition(bldg);
    }, settleDuration);
  };

  // Close Inspection -> Restore Previous Camera State
  const handleCloseInspection = useCallback(() => {
    if (interactionPhase !== 'INSPECTING' && interactionPhase !== 'FOCUSING') return;

    setInteractionPhase('CLOSING');
    setTargetScreenPos(null);

    // Reverse camera smoothly back to the exact previous camera state
    setCamOffset({
      x: storedCameraState.camX,
      y: storedCameraState.camY,
    });
    setZoomLevel(storedCameraState.zoom);
    setActiveDistrictId(storedCameraState.districtId);

    const restoreDuration = motionReduced ? 0 : 700;
    setTimeout(() => {
      setSelectedBuilding(null);
      setInteractionPhase('IDLE');
    }, restoreDuration);
  }, [interactionPhase, storedCameraState, motionReduced]);

  // Minimap Building Click: Travel camera without opening inspection panel
  const handleMinimapBuildingClick = (bldg: BuildingData) => {
    // If inspecting, close first
    if (interactionPhase === 'INSPECTING' || interactionPhase === 'FOCUSING') {
      setSelectedBuilding(null);
      setTargetScreenPos(null);
      setInteractionPhase('IDLE');
    }

    const travelZoom = 1.35;
    const { px, py } = projectBuildingToScreen(bldg.coordinates.x, bldg.coordinates.z, travelZoom);
    setCamOffset({
      x: -px,
      y: -py + 60,
    });
    setZoomLevel(travelZoom);
    setActiveDistrictId(bldg.district as DistrictId);
    setHoveredBuilding(bldg);

    setTimeout(() => {
      setHoveredBuilding((cur) => (cur?.id === bldg.id ? null : cur));
    }, 2200);
  };

  // Minimap District Click: Pan camera toward district center
  const handleMinimapDistrictClick = (districtId: DistrictId) => {
    if (interactionPhase === 'INSPECTING' || interactionPhase === 'FOCUSING') {
      setSelectedBuilding(null);
      setTargetScreenPos(null);
      setInteractionPhase('IDLE');
    }

    const dist = CITY_DISTRICTS.find((d) => d.id === districtId);
    if (!dist) return;

    const travelZoom = 1.25;
    const { px, py } = projectBuildingToScreen(dist.position.x, dist.position.z, travelZoom);
    setCamOffset({
      x: -px,
      y: -py + 60,
    });
    setZoomLevel(travelZoom);
    setActiveDistrictId(districtId);
  };

  // Keyboard accessibility: ESC closes active inspection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (interactionPhase === 'INSPECTING' || interactionPhase === 'FOCUSING') {
          handleCloseInspection();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactionPhase, handleCloseInspection]);

  // Camera animation class state for flyover transition
  let cameraClass = 'camera-flyover-high';
  if (isSettled || motionReduced) {
    cameraClass = 'camera-settled';
  } else if (isDescending) {
    cameraClass = 'camera-flyover-descent';
  }

  const isInspectingOrFocusing =
    interactionPhase === 'FOCUSING' || interactionPhase === 'INSPECTING';

  // Dynamic 3D transform combining fixed 3/4 isometric perspective, zoom, and parallax
  const totalCamX = camOffset.x + (isInspectingOrFocusing ? 0 : hoverDrift.x + mouseParallax.x * -8);
  const totalCamY = camOffset.y + (isInspectingOrFocusing ? 0 : hoverDrift.y + mouseParallax.y * -6);
  const tiltX = 54.74 + (isInspectingOrFocusing ? 0 : mouseParallax.y);
  const tiltZ = -45 + (isInspectingOrFocusing ? 0 : mouseParallax.x);

  const dynamicCameraTransform =
    isSettled && !motionReduced
      ? `translate3d(${totalCamX}px, ${totalCamY}px, 0px) rotateX(${tiltX}deg) rotateZ(${tiltZ}deg) scale(${zoomLevel})`
      : motionReduced && isSettled
      ? `translate3d(${camOffset.x}px, ${camOffset.y}px, 0px) rotateX(54.74deg) rotateZ(-45deg) scale(${zoomLevel})`
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
        <div className={`city-diorama-stage ${isInspectingOrFocusing ? 'is-inspecting' : ''}`}>
          {/* Ground Plane (No harsh square boundary; organic radial fade) */}
          <div
            className={`city-ground-plane ${hoveredBuilding && interactionPhase === 'HOVERING' ? 'has-hovered-building' : ''}`}
            onClick={(e) => {
              if (e.target === e.currentTarget && isInspectingOrFocusing) {
                handleCloseInspection();
              }
            }}
          >
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
            {/* 3D ARCHITECTURAL BUILDINGS (Data-Driven Archetypes across all 5 Districts) */}
            {ALL_CITY_BUILDINGS.map((bldg) => {
              const isHovered = hoveredBuilding?.id === bldg.id;
              const isInspected = selectedBuilding?.id === bldg.id;
              const isDeemphasized = isInspectingOrFocusing
                ? !isInspected
                : interactionPhase === 'HOVERING' && hoveredBuilding
                ? !isHovered
                : false;

              return (
                <BuildingDispatcher
                  key={bldg.id}
                  building={bldg}
                  isHovered={isHovered}
                  isInspected={isInspected}
                  isDeemphasized={isDeemphasized}
                  onClick={() => handleInspectBuilding(bldg)}
                  onMouseEnter={() => handleBuildingHover(bldg)}
                  onMouseLeave={handleBuildingLeave}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* DIEGETIC INSPECTION PANEL */}
      {selectedBuilding && (interactionPhase === 'INSPECTING' || interactionPhase === 'CLOSING') && (
        <BuildingInspectionPanel
          building={selectedBuilding}
          targetScreenPosition={targetScreenPos}
          onClose={handleCloseInspection}
          motionReduced={motionReduced}
        />
      )}

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
        currentDistrictName={
          selectedBuilding
            ? selectedBuilding.name
            : hoveredBuilding
            ? hoveredBuilding.name
            : currentDistrict.name
        }
        currentDistrictSubtitle={
          selectedBuilding
            ? selectedBuilding.tagline
            : hoveredBuilding
            ? hoveredBuilding.tagline
            : currentDistrict.subtitle
        }
        zoomLevelName={getZoomLevelName()}
        isInspecting={isInspectingOrFocusing}
        inspectedBuildingName={selectedBuilding?.name}
      />

      {/* FOUNDATIONAL MINIMAP */}
      <CityMinimap
        currentDistrictId={activeDistrictId}
        focusedBuildingId={selectedBuilding?.id || hoveredBuilding?.id}
        onSelectDistrict={handleMinimapDistrictClick}
        onSelectBuildingNode={handleMinimapBuildingClick}
      />
    </div>
  );
};
