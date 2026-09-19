import React from 'react';
import { DistrictId } from '../../types';

interface CityHUDProps {
  currentDistrictId: DistrictId;
  currentDistrictName: string;
  currentDistrictSubtitle?: string;
  zoomLevelName?: 'City' | 'District' | 'Building';
}

export const CityHUD: React.FC<CityHUDProps> = ({
  currentDistrictName,
  currentDistrictSubtitle = 'Sector 00 // Active Telemetry',
  zoomLevelName,
}) => {
  return (
    <div className="city-hud-layer" role="region" aria-label="City Navigation HUD">
      {/* Top Left: Minimal City & District Telemetry */}
      <div className="city-hud-topleft">
        <div className="hud-city-brand">
          <span className="hud-brand-tag">V-CITY</span>
          {zoomLevelName && (
            <span className="hud-district-sub">ZOOM // {zoomLevelName.toUpperCase()}</span>
          )}
        </div>
        <h2 className="hud-district-indicator">{currentDistrictName}</h2>
        <span className="hud-district-sub">{currentDistrictSubtitle}</span>
      </div>

      {/* Bottom: Minimal Non-Intrusive Control Hint */}
      <div className="city-hud-bottom">
        <div className="city-control-hint-box" aria-live="polite">
          <div className="hint-item">
            <span className="hint-key">[ SCROLL ]</span>
            <span>ZOOM</span>
          </div>
          <div className="hint-item">
            <span className="hint-key">[ MOVE MOUSE ]</span>
            <span>LOOK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
