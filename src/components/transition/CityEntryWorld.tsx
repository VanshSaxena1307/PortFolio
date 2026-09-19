import React, { useEffect, useRef, useState } from 'react';

interface CityEntryWorldProps {
  isDescending: boolean;
  isSettled: boolean;
}

export const CityEntryWorld: React.FC<CityEntryWorldProps> = ({
  isDescending,
  isSettled,
}) => {
  const [motionReduced, setMotionReduced] = useState(false);
  const [showWelcomeIndicator, setShowWelcomeIndicator] = useState(false);
  const [welcomeFading, setWelcomeFading] = useState(false);
  const [hasControl, setHasControl] = useState(false);

  // Mouse parallax tilt state for settled player control
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  // Click indicator state
  const [clickBeacons, setClickBeacons] = useState<Array<{ id: number; x: number; y: number }>>([]);
  // Camera zoom factor via scroll
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const beaconIdRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionReduced(mq.matches);
  }, []);

  // When camera settles into fixed 3/4 isometric viewpoint:
  // Display subtle SECTOR 00 // CAMPUS badge for ~1.8s then fade out into player control
  useEffect(() => {
    if (!isSettled) return;

    setShowWelcomeIndicator(true);
    setWelcomeFading(false);

    const fadeTimer = setTimeout(() => {
      setWelcomeFading(true);
      const controlTimer = setTimeout(() => {
        setShowWelcomeIndicator(false);
        setHasControl(true);
      }, 700);
      return () => clearTimeout(controlTimer);
    }, 1800);

    return () => clearTimeout(fadeTimer);
  }, [isSettled]);

  // Handle interactive mouse parallax once settled
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasControl || motionReduced) return;
    const { innerWidth, innerHeight } = window;
    const normX = (e.clientX / innerWidth - 0.5) * 2;
    const normY = (e.clientY / innerHeight - 0.5) * 2;

    setMouseParallax({
      x: normX * 3.2,
      y: normY * 2.4,
    });
  };

  // Handle click on ground in settled state
  const handleClick = (e: React.MouseEvent) => {
    if (!hasControl) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newId = ++beaconIdRef.current;

    setClickBeacons((prev) => [...prev.slice(-3), { id: newId, x, y }]);
    setTimeout(() => {
      setClickBeacons((prev) => prev.filter((b) => b.id !== newId));
    }, 1200);
  };

  // Handle subtle scroll zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!hasControl || motionReduced) return;
    setZoomLevel((prev) => {
      const delta = e.deltaY * -0.0006;
      return Math.min(1.25, Math.max(0.85, prev + delta));
    });
  };

  // Determine stage class for camera flyover sequence:
  // 1. 'camera-high-above': establishing overview of the entire compact city
  // 2. 'camera-descending-campus': gliding forward, altitude drop, tilt to Campus District
  // 3. 'camera-settled-isometric': locked fixed 3/4 isometric perspective at Campus Spawn
  let cameraClass = 'camera-high-above';
  if (isSettled || motionReduced) {
    cameraClass = 'camera-settled-isometric';
  } else if (isDescending) {
    cameraClass = 'camera-descending-campus';
  }

  // Combine fixed isometric camera angle with subtle user interactive parallax
  const baseScale = 1.35;
  const currentScale = isSettled ? baseScale * zoomLevel : undefined;
  const dynamicCameraTransform =
    isSettled && !motionReduced
      ? `translate3d(0, 40px, 0px) rotateX(${54.74 + mouseParallax.y}deg) rotateZ(${
          -45 + mouseParallax.x
        }deg) scale(${currentScale})`
      : undefined;

  return (
    <div
      ref={containerRef}
      className={`city-entry-viewport ${hasControl ? 'visitor-control-active' : ''}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onWheel={handleWheel}
      role="region"
      aria-label="V-City Isometric Campus View"
      tabIndex={0}
    >
      {/* Deep evening/night sky backdrop */}
      <div className="entry-sky-backdrop" aria-hidden="true">
        <div className="sky-star s1"></div>
        <div className="sky-star s2"></div>
        <div className="sky-star s3"></div>
        <div className="sky-star s4"></div>
        <div className="sky-star s5"></div>
        <div className="distant-aurora-glow"></div>
        <div className="evening-horizon-gradient"></div>
      </div>

      {/* Layered Distant Skyline Silhouette with warm window micro-dots */}
      <div className="distant-city-skyline" aria-hidden="true">
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className="skyline-silhouette-svg">
          <polygon
            points="0,260 0,160 40,160 40,120 70,120 70,260 110,260 110,90 140,90 140,260 200,260 200,140 240,140 240,260 290,260 290,80 320,60 350,80 350,260 420,260 420,130 460,130 460,260 540,260 540,100 580,100 580,260 650,260 650,70 690,70 690,260 760,260 760,120 800,120 800,260 880,260 880,90 920,90 920,260 990,260 990,60 1020,40 1050,60 1050,260 1130,260 1130,130 1170,130 1170,260 1260,260 1260,110 1300,110 1300,260 1370,260 1370,150 1440,150 1440,260"
            fill="#050a14"
          />
        </svg>
      </div>

      {/* 3D Isometric Diorama Camera Rig */}
      <div
        className={`entry-camera-rig ${cameraClass}`}
        style={dynamicCameraTransform ? { transform: dynamicCameraTransform } : undefined}
      >
        <div className="isometric-world-stage">
          {/* Ground Grid Base / Urban Foundation */}
          <div className="world-ground-plane">
            {/* Ground grid matrix */}
            <div className="ground-grid-matrix"></div>

            {/* DISTRICT 1: CAMPUS DISTRICT (Foreground / South-East) */}
            <div className="campus-district-zone">
              {/* Campus Academic Quad Courtyard */}
              <div className="campus-quad-lawn">
                <div className="campus-walkway main-path"></div>
                <div className="campus-walkway cross-path"></div>
                {/* Elevated 3D Quad Trees with trunks and crowns */}
                <div className="quad-tree-3d t1">
                  <div className="tree-trunk"></div>
                  <div className="tree-crown"></div>
                </div>
                <div className="quad-tree-3d t2">
                  <div className="tree-trunk"></div>
                  <div className="tree-crown"></div>
                </div>
                <div className="quad-tree-3d t3">
                  <div className="tree-trunk"></div>
                  <div className="tree-crown"></div>
                </div>
                <div className="quad-tree-3d t4">
                  <div className="tree-trunk"></div>
                  <div className="tree-crown"></div>
                </div>
              </div>

              {/* CAMPUS 3D BUILDINGS */}
              {/* Building A: Engineering Lab (Stepped Modernist Structure) */}
              <div className="bldg-3d campus-bldg eng-lab">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front amber-lab-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof eng-roof">
                  <div className="roof-mechanical-unit"></div>
                </div>
              </div>

              {/* Building B: Library & Student Commons (Glass Atrium) */}
              <div className="bldg-3d campus-bldg library-commons">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front warm-study-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof glass-atrium-roof">
                  <div className="atrium-light-core"></div>
                </div>
              </div>

              {/* Building C: Tech Foundry / Architecture Hall */}
              <div className="bldg-3d campus-bldg tech-foundry">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front cyan-studio-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof slate-roof"></div>
              </div>

              {/* CAMPUS SPAWN POINT (Courtyard / Roadside Spawn Nexus) */}
              <div className="campus-spawn-nexus" title="Spawn Point: Sector 00 // Campus">
                <div className="spawn-halo-pulse"></div>
                <div className="spawn-ring outer"></div>
                <div className="spawn-ring inner"></div>
                <div className="spawn-pedestal-3d">
                  <div className="pedestal-column"></div>
                  <div className="pedestal-gem"></div>
                </div>

                {/* Spawn Telemetry Tag */}
                <div className="spawn-beacon-tag">
                  <span className="beacon-coord">CAMPUS SPAWN</span>
                  <span className="beacon-status">SECTOR 00</span>
                </div>
              </div>
            </div>

            {/* DISTRICT 2: INNOVATION & TECH CORE (Center & North 3D Towers) */}
            <div className="building-cluster cluster-north">
              {/* Tall Tower 1 (Stepped Glass Skyscraper) */}
              <div className="bldg-3d tower-3d t-north-tall">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front cyan-glow-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof tower-roof-deck">
                  <div className="rooftop-antenna-mast">
                    <span className="warning-beacon-light"></span>
                  </div>
                </div>
              </div>

              {/* Mid Tower 1 */}
              <div className="bldg-3d tower-3d t-north-mid">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front amber-glow-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof tower-roof-deck"></div>
              </div>

              {/* Wide Tower 1 */}
              <div className="bldg-3d tower-3d t-north-wide">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front mixed-glow-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof tower-roof-deck"></div>
              </div>
            </div>

            <div className="building-cluster cluster-east">
              {/* Tall Tower 2 */}
              <div className="bldg-3d tower-3d t-east-tall">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front amber-glow-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof tower-roof-deck">
                  <div className="rooftop-antenna-mast">
                    <span className="warning-beacon-light"></span>
                  </div>
                </div>
              </div>

              {/* Mid Tower 2 */}
              <div className="bldg-3d tower-3d t-east-mid">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front cyan-glow-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof tower-roof-deck"></div>
              </div>
            </div>

            {/* DISTRICT 3: WATERFRONT & CREATIVE ARTS DISTRICT (West) */}
            <div className="building-cluster cluster-west">
              <div className="waterfront-promenade"></div>
              <div className="bldg-3d tower-3d t-west-wide">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front mixed-glow-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof tower-roof-deck"></div>
              </div>
              <div className="bldg-3d tower-3d t-west-tall">
                <div className="bldg-shadow"></div>
                <div className="bldg-face-front cyan-glow-windows"></div>
                <div className="bldg-face-side dark-side-windows"></div>
                <div className="bldg-face-roof tower-roof-deck"></div>
              </div>
            </div>

            {/* CURVED ARTERIAL ROAD NETWORK & TRANSIT STREAMS */}
            <div className="curved-avenue-container">
              <svg className="curved-avenue-svg" viewBox="0 0 680 680" fill="none">
                <path
                  d="M 50,340 C 180,340 240,420 380,430 S 580,320 640,220"
                  stroke="#101724"
                  strokeWidth="32"
                  strokeLinecap="round"
                />
                <path
                  d="M 50,340 C 180,340 240,420 380,430 S 580,320 640,220"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
                <path
                  d="M 50,340 C 180,340 240,420 380,430 S 580,320 640,220"
                  stroke="rgba(245,158,11,0.5)"
                  strokeWidth="2.5"
                  strokeDasharray="8 12"
                />
              </svg>

              {/* Curved Vehicle Headlights & Taillights animation */}
              <div className="curved-traffic-stream forward"></div>
              <div className="curved-traffic-stream reverse"></div>
            </div>

            {/* Secondary Cross Arteries */}
            <div className="expressway-artery north-south">
              <span className="light-streak headlights"></span>
              <span className="light-streak taillights"></span>
            </div>

            {/* Elevated 3D Street Lanterns */}
            <div className="street-lanterns-3d">
              <div className="lamp-post l1"><span className="lamp-head warm"></span></div>
              <div className="lamp-post l2"><span className="lamp-head cyan"></span></div>
              <div className="lamp-post l3"><span className="lamp-head warm"></span></div>
              <div className="lamp-post l4"><span className="lamp-head cyan"></span></div>
              <div className="lamp-post l5"><span className="lamp-head warm"></span></div>
              <div className="lamp-post l6"><span className="lamp-head warm"></span></div>
              <div className="lamp-post l7"><span className="lamp-head cyan"></span></div>
              <div className="lamp-post l8"><span className="lamp-head warm"></span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Volumetric Fog Haze */}
      <div className="entry-volumetric-haze" aria-hidden="true"></div>

      {/* Interactive Click Ripple Beacons */}
      {clickBeacons.map((b) => (
        <div
          key={b.id}
          className="visitor-click-beacon"
          style={{ left: `${b.x}px`, top: `${b.y}px` }}
          aria-hidden="true"
        >
          <span className="beacon-ring"></span>
          <span className="beacon-point"></span>
        </div>
      ))}

      {/* SUBTLE WELCOME INDICATOR: SECTOR 00 // CAMPUS (Fades after 1.8s) */}
      {showWelcomeIndicator && (
        <div
          className={`campus-welcome-banner ${welcomeFading ? 'fading' : ''}`}
          aria-live="polite"
        >
          <div className="welcome-pill">
            <span className="welcome-dot"></span>
            <span className="welcome-text">SECTOR 00 // CAMPUS</span>
          </div>
        </div>
      )}

      {/* Subtle Persistent Control Hint when visitor has control */}
      {hasControl && (
        <div className="visitor-control-hud" aria-live="polite">
          <span className="control-telemetry">V-CITY // CAMPUS DISTRICT</span>
          <span className="control-guide">MOUSE TILT · CLICK GROUND · SCROLL ZOOM</span>
        </div>
      )}
    </div>
  );
};
