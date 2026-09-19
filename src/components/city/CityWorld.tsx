import React, { useState } from 'react';
import { BUILDINGS, NPCS } from '../../data/cityData';
import { BuildingData, NPCData } from '../../types';

interface CityWorldProps {
  onSelectBuilding: (building: BuildingData) => void;
  onSelectNPC: (npc: NPCData) => void;
}

export const CityWorld: React.FC<CityWorldProps> = ({ onSelectBuilding, onSelectNPC }) => {
  const [selectedItem, setSelectedItem] = useState<BuildingData | null>(null);

  const handleBuildingClick = (b: BuildingData) => {
    setSelectedItem(b);
    onSelectBuilding(b);
  };

  return (
    <div className="city-container">
      <div className="city-viewport glass-panel">
        <div className="city-grid-overlay">
          <div className="grid-meta">
            <span className="badge-mono">ISOMETRIC GRID // SECTOR: METROPOLIS</span>
            <span className="live-status">LIVE SIMULATION 60 FPS</span>
          </div>

          {/* Interactive 2.5D Isometric Schematic Grid */}
          <div className="isometric-stage">
            {BUILDINGS.map((bldg) => (
              <div
                key={bldg.id}
                className={`iso-building ${selectedItem?.id === bldg.id ? 'active' : ''}`}
                style={{
                  transform: `translate(${bldg.coordinates.x * 20}px, ${bldg.coordinates.z * 18}px)`,
                  borderColor: bldg.accentColor,
                }}
                onClick={() => handleBuildingClick(bldg)}
              >
                <div className="iso-roof" style={{ backgroundColor: bldg.accentColor + '33' }}>
                  <span className="bldg-label">{bldg.name}</span>
                </div>
                <div className="iso-body">
                  <span className="bldg-district">{bldg.district}</span>
                </div>
              </div>
            ))}

            {NPCS.map((npc) => (
              <div
                key={npc.id}
                className="iso-npc"
                style={{
                  transform: `translate(${npc.coordinates.x * 20}px, ${npc.coordinates.z * 18}px)`,
                }}
                onClick={() => onSelectNPC(npc)}
              >
                <div className="npc-pulse"></div>
                <span className="npc-tag">{npc.name}</span>
              </div>
            ))}
          </div>

          <div className="city-controls-hint">
            <span>Click any building to inspect specs & case study · Click NPC for dialogues</span>
          </div>
        </div>
      </div>
    </div>
  );
};
