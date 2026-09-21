import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface TrainingFacilityBuildingProps {
  building: BuildingData;
}

export const TrainingFacilityBuilding: React.FC<TrainingFacilityBuildingProps> = ({ building }) => {
  const { size, color, accentColor, secondaryVolumes, contextualFigures } = building;

  return (
    <div className="training-facility-root">
      {/* Adjacent Open Parade & Drill Training Grounds (Open outdoor marching space) */}
      <div className="ncc-parade-ground-attachment" aria-hidden="true">
        {/* Dark Asphalt Ground Texture */}
        <div className="parade-tarmac-base" />

        {/* Crisp Painted White Drill Lines & Marching Lane Markers */}
        <svg className="drill-lines-svg" viewBox="0 0 110 90">
          {/* Outer Boundary Box */}
          <rect x="5" y="5" width="100" height="80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          {/* Central Marching Alignment Axis */}
          <line x1="55" y1="5" x2="55" y2="85" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Inspection Squad Markers */}
          <line x1="15" y1="30" x2="95" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="15" y1="60" x2="95" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>

        {/* 4 Functional High-Mast Tactical Floodlight Towers Casting Ground Light Cones */}
        <div className="parade-floodlight fl-top-left">
          <div className="floodlight-pole" />
          <div className="floodlight-head" />
          <div className="floodlight-ground-wash" />
        </div>
        <div className="parade-floodlight fl-top-right">
          <div className="floodlight-pole" />
          <div className="floodlight-head" />
          <div className="floodlight-ground-wash" />
        </div>
        <div className="parade-floodlight fl-bot-left">
          <div className="floodlight-pole" />
          <div className="floodlight-head" />
          <div className="floodlight-ground-wash" />
        </div>
        <div className="parade-floodlight fl-bot-right">
          <div className="floodlight-pole" />
          <div className="floodlight-head" />
          <div className="floodlight-ground-wash" />
        </div>

        {/* Inspection Ceremonial Dais / Podium */}
        <div className="inspection-dais">
          <span className="dais-flagstaff" />
        </div>
      </div>

      {/* Main Utilitarian Institutional Command Block */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="grid"
        facadeStyle="industrial-ribbed"
        className="ncc-command-mass"
        frontChildren={
          <div className="ncc-facade-content">
            {/* Functional Guardpost Gate & Reinforced Access Doors */}
            <div className="ncc-security-portal">
              <div className="portal-lintel" />
              <div className="portal-heavy-doors" />
            </div>
            {/* Equipment Bay Rolling Shutter */}
            <div className="ncc-equipment-bay-door">
              <div className="bay-shutter-slats" />
            </div>
          </div>
        }
        roofChildren={
          <div className="ncc-roof-terrace">
            {/* Functional Equipment Observation Terrace with Parapet */}
            <div className="ncc-roof-parapet" />
            {/* Tactical Communications Array */}
            <div className="roof-antenna-mast" style={{ left: '20%', top: '25%' }}>
              <span className="warning-beacon-blip" />
            </div>
            {/* Heavy-duty HVAC Chiller */}
            <div className="roof-mech-unit" style={{ right: '18%', top: '25%' }} />
          </div>
        }
      >
        {/* Attached Equipment Storage Bunker */}
        {secondaryVolumes?.map((vol) => (
          <div
            key={vol.id || 'ncc-sec'}
            className="bldg-secondary-volume ncc-bunker-volume"
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
              color="#141210"
              accentColor="#fbbf24"
              windowPattern="grid"
              facadeStyle="industrial-ribbed"
              roofChildren={<div className="bunker-heavy-slab" />}
            />
          </div>
        ))}
      </BuildingVolumeMesh>

      {/* Cadets in Formation on Parade Ground */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
