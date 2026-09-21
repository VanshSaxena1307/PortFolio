import React from 'react';
import { ALL_CITY_BUILDINGS, CITY_DISTRICTS } from '../../data/cityData';
import { BuildingData, DistrictId } from '../../types';

interface CityMinimapProps {
  currentDistrictId: DistrictId;
  onSelectDistrict?: (districtId: DistrictId) => void;
  focusedBuildingId?: string | null;
  onSelectBuildingNode?: (building: BuildingData) => void;
}

export const CityMinimap: React.FC<CityMinimapProps> = ({
  currentDistrictId,
  onSelectDistrict,
  focusedBuildingId,
  onSelectBuildingNode,
}) => {
  // Map world coordinates (-400 to +400) to SVG viewport (20 to 120, center 70)
  const mapCoord = (x: number, z: number) => {
    const scale = 50 / 380;
    return {
      cx: 70 + x * scale,
      cy: 70 + z * scale,
    };
  };

  return (
    <aside
      className="city-minimap-root"
      role="complementary"
      aria-label="V-City Foundational Minimap"
    >
      <div className="minimap-radar-sweep" aria-hidden="true" />

      <svg
        className="minimap-compass-svg"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Grids & Rings */}
        <circle cx="70" cy="70" r="64" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
        <circle cx="70" cy="70" r="42" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
        <circle cx="70" cy="70" r="20" stroke="rgba(255, 255, 255, 0.06)" />

        {/* Crosshair Cardinal Axes */}
        <line x1="70" y1="6" x2="70" y2="134" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1" />
        <line x1="6" y1="70" x2="134" y2="70" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1" />

        {/* Cardinal Direction Ticks */}
        <text x="70" y="16" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
          N
        </text>
        <text x="70" y="132" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
          S
        </text>
        <text x="12" y="72" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
          W
        </text>
        <text x="128" y="72" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
          E
        </text>

        {/* Organic District Outlines & Connectors */}
        <path
          d="M 70,28 Q 40,55 30,70 T 70,108 T 110,70 Z"
          stroke="rgba(56, 189, 248, 0.18)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Render District Nodes */}
        {CITY_DISTRICTS.map((district) => {
          const { cx, cy } = mapCoord(district.position.x, district.position.z);
          const isCurrent = district.id === currentDistrictId;
          const nodeColor = district.colorTheme.accent;

          return (
            <g
              key={district.id}
              className="minimap-district-node"
              onClick={() => onSelectDistrict?.(district.id)}
            >
              <title>{district.name}</title>
              {/* Outer District Glow */}
              <circle
                cx={cx}
                cy={cy}
                r={isCurrent ? 7 : 4.5}
                fill={nodeColor}
                fillOpacity={isCurrent ? 0.35 : 0.15}
                stroke={nodeColor}
                strokeWidth={isCurrent ? 1.5 : 1}
              />
              {/* Node Center */}
              <circle cx={cx} cy={cy} r={isCurrent ? 3 : 2} fill={nodeColor} />
            </g>
          );
        })}

        {/* Render Building Nodes */}
        {ALL_CITY_BUILDINGS.map((bldg) => {
          const { cx, cy } = mapCoord(bldg.coordinates.x, bldg.coordinates.z);
          const isSelected = bldg.id === focusedBuildingId;
          return (
            <g
              key={bldg.id}
              className={`minimap-building-node ${isSelected ? 'focused' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBuildingNode?.(bldg);
              }}
              style={{ cursor: 'pointer' }}
            >
              <title>{bldg.name}</title>
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 3.5 : 1.8}
                fill={isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.45)'}
                stroke={isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.5)'}
                strokeWidth={isSelected ? 1 : 0.5}
              />
            </g>
          );
        })}

        {/* Player / Camera Current Spawn Position Ping */}
        {(() => {
          const campusCoord = mapCoord(0, 280);
          return (
            <g>
              <circle
                cx={campusCoord.cx}
                cy={campusCoord.cy}
                r="4.5"
                fill="#38bdf8"
                className="minimap-player-blip"
              />
              <circle
                cx={campusCoord.cx}
                cy={campusCoord.cy}
                r="8"
                stroke="#38bdf8"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
            </g>
          );
        })()}
      </svg>
    </aside>
  );
};
