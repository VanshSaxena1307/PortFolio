import React from 'react';
import { SkylineStage } from './SkylineStage';
import { BuildingStage } from './BuildingStage';
import { InteriorStage } from './InteriorStage';
import { MonitorStage } from './MonitorStage';
import { CinematicTimelineHUD } from './CinematicTimelineHUD';

interface CinematicViewportProps {
  progress: number;
  onEnterCity: () => void;
  onJumpToProgress: (target: number) => void;
  onSkipIntro?: () => void;
  onOpenRecruiter?: () => void;
}

export const CinematicViewport: React.FC<CinematicViewportProps> = ({
  progress,
  onEnterCity,
  onJumpToProgress,
  onSkipIntro,
  onOpenRecruiter,
}) => {
  // Smooth physical camera travel calculation along Z-axis
  // The camera advances through the space:
  // p: 0.0 -> Skyline far back
  // p: 0.3 -> Approaching building
  // p: 0.5 -> Punching through studio window
  // p: 0.7 -> In room with developer
  // p: 0.85 -> Zooming past developer to desk
  // p: 1.0 -> Monitor screen dominant focus
  const cameraZ = progress * 600;

  return (
    <div className="cinematic-viewport">
      {/* Volumetric Dark Atmospheric Vignette */}
      <div className="cinematic-vignette" aria-hidden="true" />

      {/* 3D Camera Rig */}
      <div
        className="camera-rig"
        style={{
          transform: `translate3d(0, 0, ${cameraZ}px)`,
        }}
      >
        {/* Stage 1: Distant Skyline */}
        <SkylineStage progress={progress} />

        {/* Stage 2 & 3: Approach & Enter Building */}
        <BuildingStage progress={progress} />

        {/* Stage 4 & 5: Developer at Workstation & Approach Monitor */}
        <InteriorStage progress={progress} />

        {/* Stage 6: Dominant Monitor & Interactive ENTER Button */}
        <MonitorStage progress={progress} onEnterCity={onEnterCity} />
      </div>

      {/* Telemetry and Accessible HUD Controls */}
      <CinematicTimelineHUD
        progress={progress}
        onJumpToProgress={onJumpToProgress}
        onSkipIntro={onSkipIntro}
        onOpenRecruiter={onOpenRecruiter}
      />
    </div>
  );
};
