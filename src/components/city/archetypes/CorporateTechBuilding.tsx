import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface CorporateTechBuildingProps {
  building: BuildingData;
}

export const CorporateTechBuilding: React.FC<CorporateTechBuildingProps> = ({ building }) => {
  const { size, color, accentColor, secondaryVolumes, contextualFigures } = building;

  return (
    <div className="corporate-tech-root">
      {/* Modern Granite & Glass Plaza Approach */}
      <div className="corporate-plaza-plinth" aria-hidden="true">
        <div className="plaza-pavers-texture" />
      </div>

      {/* Main Administrative Headquarters Tower */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="ribbon"
        facadeStyle="ribbon-office"
        className="corporate-main-tower"
        frontChildren={
          <div className="corporate-facade-content">
            {/* Grand Double-Height Glass Atrium Entrance */}
            <div className="corporate-atrium-portal">
              <div className="portal-glass-curtain" />
              <div className="reception-interior-glow" />
              <div className="revolving-doors-geometry" />
            </div>

            {/* Vertical Mullions / Architectural Solar Louvers */}
            <div className="corporate-solar-louvers">
              <span className="louver-blade" />
              <span className="louver-blade" />
              <span className="louver-blade" />
            </div>
          </div>
        }
        roofChildren={
          <div className="corporate-roof-deck">
            {/* Rooftop HVAC Mechanical Cooling Towers */}
            <div className="roof-mech-unit" style={{ left: '15%', top: '20%' }} />
            <div className="roof-mech-unit" style={{ right: '20%', top: '20%' }} />

            {/* Communications Tower Antenna with Blinking Warning Light */}
            <div className="roof-antenna-mast" style={{ left: '50%', top: '50%' }}>
              <span className="warning-beacon-blip" />
            </div>
          </div>
        }
      >
        {/* Connected Stepped Volumes & Low-Rise Glass Wing */}
        {secondaryVolumes?.map((vol) => (
          <div
            key={vol.id || 'corp-sec'}
            className={`bldg-secondary-volume corporate-sec-${vol.style || 'wing'}`}
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
              color="#0d1e34"
              accentColor={accentColor}
              windowPattern={vol.windowPattern || 'ribbon'}
              facadeStyle="ribbon-office"
              frontChildren={
                vol.style === 'glass-curtain' ? (
                  <div className="wing-curtain-glazing">
                    <div className="curtain-glow-interior" />
                  </div>
                ) : undefined
              }
            />
          </div>
        ))}
      </BuildingVolumeMesh>

      {/* Office Workers */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
