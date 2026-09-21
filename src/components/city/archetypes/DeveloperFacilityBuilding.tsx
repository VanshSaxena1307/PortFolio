import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface DeveloperFacilityBuildingProps {
  building: BuildingData;
}

export const DeveloperFacilityBuilding: React.FC<DeveloperFacilityBuildingProps> = ({ building }) => {
  const { size, color, accentColor, secondaryVolumes, contextualFigures, reservedProject } = building;
  const isGitHub = reservedProject === 'GITHUB';

  return (
    <div className={`dev-facility-root ${isGitHub ? 'facility-github' : 'facility-leetcode'}`}>
      {/* Ground Construction Pad with Cable Spools */}
      <div className="dev-construction-pad" aria-hidden="true">
        <div className="pad-wire-texture" />
        <div className="cable-spool-model" style={{ left: '10px', bottom: '8px' }} />
      </div>

      {/* Main Structural Developer Facility Volume */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern={isGitHub ? 'commit-matrix' : 'terminal-slots'}
        facadeStyle="exposed-frame"
        className="dev-facility-mass"
        frontChildren={
          <div className="dev-facade-content">
            {/* Exposed Steel Grid Frame */}
            <div className="dev-steel-grid-cage">
              <span className="cage-beam horiz-1" />
              <span className="cage-beam horiz-2" />
              <span className="cage-beam vert-1" />
              <span className="cage-beam vert-2" />
            </div>

            {/* If GitHub: Contribution Matrix Facade Window Mosaic */}
            {isGitHub ? (
              <div className="github-commit-matrix-facade">
                <div className="commit-cell l4" />
                <div className="commit-cell l2" />
                <div className="commit-cell l3" />
                <div className="commit-cell l1" />
                <div className="commit-cell l3" />
                <div className="commit-cell l4" />
                <div className="commit-cell l2" />
                <div className="commit-cell l0" />
                <div className="commit-cell l3" />
                <div className="commit-cell l4" />
                <div className="commit-cell l1" />
                <div className="commit-cell l2" />
              </div>
            ) : (
              /* If LeetCode: Algorithmic Logic / Problem-solving Terminal Chambers */
              <div className="leetcode-terminal-facade">
                <div className="terminal-chamber tc-1">
                  <div className="code-syntax-lines" />
                </div>
                <div className="terminal-chamber tc-2">
                  <div className="code-syntax-lines" />
                </div>
              </div>
            )}

            {/* Temporary Sodium Construction Work Light */}
            <div className="temporary-work-light dev-work-light">
              <div className="work-light-fixture" />
              <div className="work-light-beam" />
            </div>
          </div>
        }
        roofChildren={
          <div className="dev-roof-deck">
            {/* Structural Hoist Rig / Small Derrick */}
            <div className="material-hoist-rig">
              <div className="hoist-mast" />
              <div className="hoist-arm" />
              <div className="hoist-cable" />
            </div>

            {/* Communication Data Dish */}
            <div className="dev-comms-dish" />
          </div>
        }
      >
        {/* Attached Annex Volume */}
        {secondaryVolumes?.map((vol) => (
          <div
            key={vol.id || 'dev-sec'}
            className="bldg-secondary-volume dev-annex-volume"
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
              color="#0c1424"
              accentColor={accentColor}
              windowPattern={vol.windowPattern || 'terminal-slots'}
              facadeStyle="exposed-frame"
              frontChildren={
                <div className="annex-rebar-cage">
                  <div className="scaffold-mesh-texture" />
                </div>
              }
            />
          </div>
        ))}
      </BuildingVolumeMesh>

      {/* Construction Workers */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
