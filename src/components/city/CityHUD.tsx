import React from 'react';
import { DistrictId } from '../../types';

interface CityHUDProps {
  currentDistrictId: DistrictId;
  currentDistrictName: string;
  currentDistrictSubtitle?: string;
  zoomLevelName?: 'City' | 'District' | 'Building';
  isInspecting?: boolean;
  inspectedBuildingName?: string | null;
}

export const CityHUD: React.FC<CityHUDProps> = ({
  currentDistrictName,
  currentDistrictSubtitle = 'Sector 00 // Active Telemetry',
  zoomLevelName,
  isInspecting = false,
  inspectedBuildingName,
}) => {
  return (
    <div className="city-hud-layer" role="region" aria-label="City Navigation HUD">
      {/* Top Left: Minimal City & District Telemetry */}
      <div className="city-hud-topleft">
        <div className="hud-city-brand">
          <span className="hud-brand-tag">
            {isInspecting ? `INSPECTING // ${inspectedBuildingName?.toUpperCase() || 'TARGET'}` : 'V-CITY'}
          </span>
          {zoomLevelName && (
            <span className="hud-district-sub">ZOOM // {zoomLevelName.toUpperCase()}</span>
          )}
        </div>
        <h2 className="hud-district-indicator">{isInspecting ? (inspectedBuildingName || currentDistrictName) : currentDistrictName}</h2>
        <span className="hud-district-sub">{currentDistrictSubtitle}</span>
      </div>

      {/* Bottom: Minimal Non-Intrusive Control Hint */}
      <div className="city-hud-bottom">
        <div className="city-control-hint-box" aria-live="polite">
          {isInspecting ? (
            <>
              <div className="hint-item">
                <span className="hint-key">[ ESC ]</span>
                <span>CLOSE INSPECTION</span>
              </div>
              <div className="hint-item">
                <span className="hint-key">[ CLICK ]</span>
                <span>FAST-FORWARD TEXT</span>
              </div>
            </>
          ) : (
            <>
              <div className="hint-item">
                <span className="hint-key">[ SCROLL ]</span>
                <span>ZOOM</span>
              </div>
              <div className="hint-item">
                <span className="hint-key">[ MOVE MOUSE ]</span>
                <span>LOOK</span>
              </div>
              <div className="hint-item">
                <span className="hint-key">[ CLICK ]</span>
                <span>INSPECT</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
