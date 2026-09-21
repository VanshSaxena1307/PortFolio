import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';

interface IdentityMonolithProps {
  building: BuildingData;
}

export const IdentityMonolith: React.FC<IdentityMonolithProps> = ({ building }) => {
  const { size, color, accentColor } = building;

  return (
    <div className="identity-monolith-root">
      {/* Ground Substrate / Obsidian Foundation Step */}
      <div className="monolith-ground-pedestal" aria-hidden="true">
        <div className="pedestal-perimeter-groove" />
      </div>

      {/* Main Obsidian Monolith Mass */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="atrium-glow"
        facadeStyle="monolithic-obsidian"
        className="monolith-main-slab"
        frontChildren={
          <div className="monolith-facade-content">
            {/* Architectural Void / Geometric Aperture */}
            <div className="monolith-geometric-void">
              <div className="void-inner-recess">
                <div className="void-cyan-prism-beam" />
              </div>
            </div>

            {/* Restrained Beveled Chamfer Lines */}
            <div className="monolith-chamfer-edge left" />
            <div className="monolith-chamfer-edge right" />

            {/* Recessed Ground Vestibule */}
            <div className="monolith-recessed-portal">
              <div className="portal-subtle-reflection" />
            </div>
          </div>
        }
        roofChildren={
          <div className="monolith-roof-crown">
            {/* Polished Obsidian Upper Deck */}
            <div className="monolith-crown-aperture" />
          </div>
        }
      />
    </div>
  );
};
