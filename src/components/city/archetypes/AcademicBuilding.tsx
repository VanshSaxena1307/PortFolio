import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface AcademicBuildingProps {
  building: BuildingData;
}

export const AcademicBuilding: React.FC<AcademicBuildingProps> = ({ building }) => {
  const { size, color, accentColor, secondaryVolumes, contextualFigures } = building;

  return (
    <div className="academic-building-root">
      {/* Collegiate Brick Entrance Forecourt with Landscaped Shrubs */}
      <div className="academic-entrance-forecourt" aria-hidden="true">
        <div className="academic-pathway-bricks" />
        <div className="campus-hedge left" />
        <div className="campus-hedge right" />
      </div>

      {/* Central Academic Hall / Administration Core */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="grid"
        facadeStyle="academic-brick-glass"
        className="academic-main-hall"
        frontChildren={
          <div className="academic-facade-content">
            {/* Central Double-Height Entrance Canopy */}
            <div className="academic-canopy-portico">
              <div className="canopy-glass-roof" />
              <div className="canopy-pillars">
                <span className="pillar" />
                <span className="pillar" />
              </div>
              <div className="academic-entrance-doors">
                <div className="library-interior-glow" />
              </div>
            </div>

            {/* Classical Clock / Motive Band above Portal */}
            <div className="academic-clock-band">
              <div className="collegiate-clock-dial" />
            </div>
          </div>
        }
        roofChildren={
          <div className="academic-roof-deck">
            {/* Central Glass Atrium Skylight */}
            <div className="academic-atrium-skylight" />
            {/* Ventilation HVAC units */}
            <div className="roof-mech-unit" style={{ left: '15%', top: '20%' }} />
          </div>
        }
      >
        {/* Connected Lecture Wings & Skybridge */}
        {secondaryVolumes?.map((vol) => (
          <div
            key={vol.id || 'acad-sec'}
            className={`bldg-secondary-volume academic-wing-${vol.style || 'wing'}`}
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
              color="#1a2436"
              accentColor={accentColor}
              windowPattern={vol.windowPattern || 'grid'}
              facadeStyle={vol.style === 'skybridge' ? 'laboratory-clean' : 'academic-brick-glass'}
              frontChildren={
                vol.style === 'skybridge' ? (
                  <div className="skybridge-glass-enclosure">
                    <div className="skybridge-interior-glow" />
                  </div>
                ) : undefined
              }
              roofChildren={
                vol.style === 'skybridge' ? (
                  <div className="skybridge-glass-deck" />
                ) : (
                  <div className="wing-roof-gravel" />
                )
              }
            />
          </div>
        ))}
      </BuildingVolumeMesh>

      {/* Contextual Students Studying / Walking */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
