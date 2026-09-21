import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface ArenaBuildingProps {
  building: BuildingData;
}

export const ArenaBuilding: React.FC<ArenaBuildingProps> = ({ building }) => {
  const { size, color, accentColor, contextualFigures } = building;

  return (
    <div className="arena-building-root">
      {/* Broad Public Entrance Plaza with Event Approach */}
      <div className="arena-public-plaza" aria-hidden="true">
        <div className="arena-plaza-paving" />
        {/* Entrance Queue Stanchions */}
        <div className="queue-stanchion-line" style={{ left: '25px', top: '15px' }} />
        <div className="queue-stanchion-line" style={{ right: '25px', top: '15px' }} />
      </div>

      {/* Grand Coliseum Arena Main Volume */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="atrium-glow"
        facadeStyle="ribbon-office"
        className="arena-coliseum-mass"
        frontChildren={
          <div className="arena-facade-content">
            {/* Grand Cantilevered Event Canopy Portico */}
            <div className="arena-grand-canopy">
              <div className="canopy-roof-slab" />
              {/* Dynamic Event LED Display Ribbon */}
              <div className="arena-display-ribbon">
                <div className="ribbon-pulse-bar" />
              </div>
              <div className="arena-atrium-doors">
                <div className="event-warm-threshold" />
              </div>
            </div>

            {/* Facade Recesses & Vertical Architectural Bracing */}
            <div className="arena-structural-ribs">
              <span className="structural-rib" />
              <span className="structural-rib" />
              <span className="structural-rib" />
              <span className="structural-rib" />
            </div>
          </div>
        }
        roofChildren={
          <div className="arena-roof-amphitheater">
            {/* Grand Curved Amphitheater Dome / Roof Truss */}
            <div className="arena-crown-dome">
              <div className="dome-truss-lattice" />
              <div className="dome-center-oculus" />
            </div>

            {/* Event Stage Lighting Floodlight Masts */}
            <div className="stage-light-mast left">
              <span className="stage-beam-glow" />
            </div>
            <div className="stage-light-mast right">
              <span className="stage-beam-glow" />
            </div>
          </div>
        }
      />

      {/* Small Crowd & Spectator Groups */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
