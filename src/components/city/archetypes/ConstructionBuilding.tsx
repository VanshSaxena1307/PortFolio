import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface ConstructionBuildingProps {
  building: BuildingData;
}

export const ConstructionBuilding: React.FC<ConstructionBuildingProps> = ({ building }) => {
  const { size, color, accentColor, secondaryVolumes, contextualFigures } = building;

  return (
    <div className="construction-building-root">
      {/* Ground Construction Staging Yard */}
      <div className="construction-staging-yard" aria-hidden="true">
        {/* Perimeter Safety Hazard Striping */}
        <div className="construction-hazard-border" />
        {/* Staged Pallets & Rebar Steel Materials */}
        <div className="construction-pallet-stack" style={{ left: '12px', bottom: '10px' }}>
          <div className="pallet-wood" />
          <div className="rebar-bundle" />
        </div>
        <div className="construction-skip-container" style={{ right: '14px', bottom: '12px' }} />
      </div>

      {/* Main Structural Frame (Partially Finished + Exposed Slabs) */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="ribbon"
        facadeStyle="exposed-frame"
        className="construction-main-frame"
        frontChildren={
          <div className="construction-facade-overlay">
            {/* Exposed Concrete Floor Slabs & Vertical Columns */}
            <div className="exposed-concrete-grid">
              <div className="slab-floor floor-1" />
              <div className="slab-floor floor-2" />
              <div className="slab-floor floor-3" />
              <div className="structural-column col-1" />
              <div className="structural-column col-2" />
              <div className="structural-column col-3" />
            </div>

            {/* Perimeter Safety Scaffolding Mesh (Green/Orange Netting) */}
            <div className="scaffolding-netting-wrap">
              <div className="scaffold-mesh-texture" />
              <div className="scaffold-steel-tubes" />
            </div>

            {/* Temporary High-Intensity Amber Sodium Work Floodlights */}
            <div className="temporary-work-light light-tier-1">
              <div className="work-light-fixture" />
              <div className="work-light-beam" />
            </div>
            <div className="temporary-work-light light-tier-2">
              <div className="work-light-fixture" />
              <div className="work-light-beam" />
            </div>
          </div>
        }
        roofChildren={
          <div className="construction-roof-deck">
            {/* Exposed Upright Rebar Rods */}
            <div className="roof-rebar-spires">
              <span className="rebar-rod" />
              <span className="rebar-rod" />
              <span className="rebar-rod" />
              <span className="rebar-rod" />
            </div>

            {/* High-Rise 3D Yellow Tower Crane */}
            <div className="tower-crane-3d-assembly">
              {/* Vertical Lattice Mast */}
              <div className="crane-lattice-mast">
                <div className="mast-strut" />
              </div>
              {/* Operator Cab & Slewing Ring */}
              <div className="crane-operator-cab" />
              {/* Horizontal Jib / Boom */}
              <div className="crane-horizontal-jib">
                <div className="jib-trolley">
                  <div className="hoist-cable-line" />
                  <div className="hoist-hook-load" />
                </div>
              </div>
              {/* Counter-Jib & Concrete Counterweight Block */}
              <div className="crane-counter-jib">
                <div className="counterweight-block" />
              </div>
              {/* Crane Top Warning Beacon */}
              <span className="crane-beacon-red" />
            </div>
          </div>
        }
      >
        {/* Unfinished Upper Structural Tier Frame */}
        {secondaryVolumes?.map((vol) => (
          <div
            key={vol.id || 'const-sec'}
            className="bldg-secondary-volume unfinished-tier-volume"
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
              color="#0e1726"
              accentColor="#f59e0b"
              windowPattern="ribbon"
              facadeStyle="exposed-frame"
              frontChildren={
                <div className="tier-exposed-rebar">
                  <div className="scaffold-cross-braces" />
                </div>
              }
            />
          </div>
        ))}
      </BuildingVolumeMesh>

      {/* Construction Workers with Hardhats */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
