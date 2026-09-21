import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface ResearchLabBuildingProps {
  building: BuildingData;
}

export const ResearchLabBuilding: React.FC<ResearchLabBuildingProps> = ({ building }) => {
  const { size, color, accentColor, secondaryVolumes, contextualFigures } = building;

  return (
    <div className="research-lab-root">
      {/* Sterile Foundation Plinth */}
      <div className="lab-foundation-plinth" />

      {/* Primary Clean Geometric Research Block */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="atrium-glow"
        facadeStyle="laboratory-clean"
        className="research-primary-volume"
        frontChildren={
          <div className="lab-facade-clean">
            {/* Controlled-access Airlock Entrance with Scanner Strip */}
            <div className="lab-airlock-entrance">
              <div className="airlock-scanner-beam" />
              <div className="airlock-glass-frame" />
            </div>

            {/* Diagnostic Chamber Visible through Clean Glazing */}
            <div className="lab-diagnostic-viewchamber">
              <div className="diagnostic-core-glow" />
              <div className="diagnostic-grid-lines" />
            </div>
          </div>
        }
        roofChildren={
          <div className="lab-roof-deck">
            {/* Helical / Scientific Diagnostic Pod */}
            <div className="lab-spectral-scanner" />
            {/* High-purity Filter / Chiller Arrays */}
            <div className="roof-mech-unit" style={{ left: '15%', top: '20%' }} />
            <div className="lab-sensor-mast">
              <span className="sensor-blip-violet" />
            </div>
          </div>
        }
      >
        {/* Cantilevered Diagnostic Wing / Secondary Laboratory Volume */}
        {secondaryVolumes?.map((vol) => (
          <div
            key={vol.id || 'sec-vol'}
            className="bldg-secondary-volume lab-cantilever-wing"
            style={{
              position: 'absolute',
              left: `${vol.relativeOffset.x}px`,
              top: `${vol.relativeOffset.z}px`,
              transform: `translate3d(0, 0, ${vol.relativeOffset.y}px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <BuildingVolumeMesh
              width={vol.size.x}
              depth={vol.size.z}
              height={vol.size.y}
              color="#1e103c"
              accentColor="#c084fc"
              windowPattern="atrium-glow"
              facadeStyle="laboratory-clean"
              frontChildren={
                <div className="cantilever-glass-chamber">
                  <div className="specimen-analysis-illumination" />
                </div>
              }
            />
          </div>
        ))}
      </BuildingVolumeMesh>

      {/* Contextual Researchers in Clean Coats */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
