import React from 'react';
import { BuildingData } from '../../../types';
import { BankBuilding } from './BankBuilding';
import { ResearchLabBuilding } from './ResearchLabBuilding';
import { WeatherStationBuilding } from './WeatherStationBuilding';
import { ArenaBuilding } from './ArenaBuilding';
import { TrainingFacilityBuilding } from './TrainingFacilityBuilding';
import { AcademicBuilding } from './AcademicBuilding';
import { ConstructionBuilding } from './ConstructionBuilding';
import { DeveloperFacilityBuilding } from './DeveloperFacilityBuilding';
import { IdentityMonolith } from './IdentityMonolith';
import { CorporateTechBuilding } from './CorporateTechBuilding';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';

interface BuildingDispatcherProps {
  building: BuildingData;
  isHovered?: boolean;
  isInspected?: boolean;
  isDeemphasized?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const BuildingDispatcher: React.FC<BuildingDispatcherProps> = ({
  building,
  isHovered = false,
  isInspected = false,
  isDeemphasized = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const width = building.size.x;
  const depth = building.size.z;
  const height = building.size.y;
  // Center origin offset inside 1300x1300 diorama stage
  const posX = 650 + building.coordinates.x - width / 2;
  const posY = 650 + building.coordinates.z - depth / 2;

  const renderArchetype = () => {
    switch (building.archetype) {
      case 'bank':
        return <BankBuilding building={building} />;
      case 'research-lab':
        return <ResearchLabBuilding building={building} />;
      case 'weather-station':
        return <WeatherStationBuilding building={building} />;
      case 'arena-structure':
        return <ArenaBuilding building={building} />;
      case 'training-facility':
        return <TrainingFacilityBuilding building={building} />;
      case 'academic-hall':
        return <AcademicBuilding building={building} />;
      case 'construction-site':
        return <ConstructionBuilding building={building} />;
      case 'developer-facility':
        return <DeveloperFacilityBuilding building={building} />;
      case 'identity-monolith':
        return <IdentityMonolith building={building} />;
      case 'corporate-tech':
        return <CorporateTechBuilding building={building} />;
      default:
        // Graceful fallback for any generic midrise / office tower
        return (
          <BuildingVolumeMesh
            width={width}
            depth={depth}
            height={height}
            color={building.color}
            accentColor={building.accentColor}
            windowPattern={building.windowPattern || 'grid'}
            roofChildren={
              building.roofDetail === 'antenna' ? (
                <div className="roof-antenna-mast">
                  <span className="warning-beacon-blip" />
                </div>
              ) : building.roofDetail === 'helipad' ? (
                <div className="roof-helipad">H</div>
              ) : building.roofDetail === 'mech-unit' ? (
                <div className="roof-mech-unit" />
              ) : building.roofDetail === 'dome' ? (
                <div className="roof-dome" />
              ) : building.roofDetail === 'spire' ? (
                <div className="roof-spire" />
              ) : undefined
            }
          />
        );
    }
  };

  const interactionClasses = [
    isHovered ? 'is-hovered' : '',
    isInspected ? 'is-inspected' : '',
    isDeemphasized ? 'is-deemphasized' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={`bldg-node-${building.id}`}
      className={`bldg-3d-wrapper archetype-${building.archetype || 'office-tower'} bldg-${building.id} lighting-${building.lightingProfile || 'warm-office'} ${interactionClasses}`}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${width}px`,
        height: `${depth}px`,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Ground Projection Shadow */}
      <div className="bldg-ground-shadow" />

      {/* Render Specific Architectural Identity */}
      {renderArchetype()}
    </div>
  );
};
