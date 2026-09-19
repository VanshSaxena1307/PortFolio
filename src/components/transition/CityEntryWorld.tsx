import React, { useEffect, useState } from 'react';

interface CityEntryWorldProps {
  isDescending: boolean;
  isSettled: boolean;
}

export const CityEntryWorld: React.FC<CityEntryWorldProps> = ({
  isDescending,
  isSettled,
}) => {
  const [motionReduced, setMotionReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionReduced(mq.matches);
  }, []);

  // Determine stage class for camera flyover sequence
  // Starts 'high-above', transitions to 'descending', ends at 'settled' (fixed 3/4 isometric)
  let cameraClass = 'camera-high-above';
  if (isSettled || motionReduced) {
    cameraClass = 'camera-settled-isometric';
  } else if (isDescending) {
    cameraClass = 'camera-descending-campus';
  }

  return (
    <div className="city-entry-viewport">
      {/* Distant atmospheric night sky with subtle stars */}
      <div className="entry-sky-backdrop">
        <div className="sky-star s1"></div>
        <div className="sky-star s2"></div>
        <div className="sky-star s3"></div>
        <div className="sky-star s4"></div>
        <div className="distant-aurora-glow"></div>
      </div>

      {/* Far Distant Skyline Silhouettes */}
      <div className="distant-city-skyline">
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className="skyline-silhouette-svg">
          <polygon
            points="0,260 0,160 40,160 40,120 70,120 70,260 110,260 110,90 140,90 140,260 200,260 200,140 240,140 240,260 290,260 290,80 320,60 350,80 350,260 420,260 420,130 460,130 460,260 540,260 540,100 580,100 580,260 650,260 650,70 690,70 690,260 760,260 760,120 800,120 800,260 880,260 880,90 920,90 920,260 990,260 990,60 1020,40 1050,60 1050,260 1130,260 1130,130 1170,130 1170,260 1260,260 1260,110 1300,110 1300,260 1370,260 1370,150 1440,150 1440,260"
            fill="#060c18"
          />
        </svg>
      </div>

      {/* 3D Isometric Diorama Camera Rig */}
      <div className={`entry-camera-rig ${cameraClass}`}>
        <div className="isometric-world-stage">
          {/* Ground Grid Base / Urban Foundation */}
          <div className="world-ground-plane">
            {/* Ground grid lines */}
            <div className="ground-grid-matrix"></div>

            {/* Elevated Transit Arteries / Distant Headlights & Taillights */}
            <div className="expressway-artery north-south">
              <span className="light-streak headlights"></span>
              <span className="light-streak taillights"></span>
            </div>
            <div className="expressway-artery east-west">
              <span className="light-streak headlights-rev"></span>
              <span className="light-streak taillights-rev"></span>
            </div>

            {/* Street Lantern Grid Nodes */}
            <div className="street-lanterns">
              <span className="lantern l1"></span>
              <span className="lantern l2"></span>
              <span className="lantern l3"></span>
              <span className="lantern l4"></span>
              <span className="lantern l5"></span>
              <span className="lantern l6"></span>
            </div>

            {/* Background High-Rise Tower Clusters */}
            <div className="building-cluster cluster-north">
              <div className="entry-tower t-tall-1">
                <div className="tower-roof"></div>
                <div className="tower-windows cyan-glow"></div>
              </div>
              <div className="entry-tower t-mid-1">
                <div className="tower-roof"></div>
                <div className="tower-windows amber-glow"></div>
              </div>
              <div className="entry-tower t-wide-1">
                <div className="tower-roof"></div>
                <div className="tower-windows"></div>
              </div>
            </div>

            <div className="building-cluster cluster-east">
              <div className="entry-tower t-tall-2">
                <div className="tower-roof"></div>
                <div className="tower-windows amber-glow"></div>
              </div>
              <div className="entry-tower t-mid-2">
                <div className="tower-roof"></div>
                <div className="tower-windows cyan-glow"></div>
              </div>
            </div>

            <div className="building-cluster cluster-west">
              <div className="entry-tower t-wide-2">
                <div className="tower-roof"></div>
                <div className="tower-windows"></div>
              </div>
              <div className="entry-tower t-tall-3">
                <div className="tower-roof"></div>
                <div className="tower-windows cyan-glow"></div>
              </div>
            </div>

            {/* Destination: Central Campus District Spawn Placeholder */}
            <div className="campus-spawn-nexus">
              <div className="spawn-halo-pulse"></div>
              <div className="spawn-ring outer"></div>
              <div className="spawn-ring inner"></div>
              <div className="spawn-pedestal">
                <span className="spawn-core-dot"></span>
              </div>

              {/* Spawn Telemetry Beacon */}
              <div className="spawn-beacon-tag">
                <span className="beacon-coord">CAMPUS // SPAWN NEXUS</span>
                <span className="beacon-status">SECTOR 00 · INITIALIZED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Volumetric Fog Haze */}
      <div className="entry-volumetric-haze" aria-hidden="true"></div>

      {/* Settle Status Indicator when fixed 3/4 isometric position is reached */}
      {isSettled && (
        <div className="entry-settled-hud" aria-live="polite">
          <div className="hud-badge badge-mono">
            <span className="hud-dot"></span>
            V-CITY ESTABLISHED // ISOMETRIC VIEW ACTIVE
          </div>
        </div>
      )}
    </div>
  );
};
