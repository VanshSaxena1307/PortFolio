import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';

interface WeatherStationBuildingProps {
  building: BuildingData;
}

export const WeatherStationBuilding: React.FC<WeatherStationBuildingProps> = ({ building }) => {
  const { size, color, accentColor, secondaryVolumes } = building;

  return (
    <div className="weather-station-root">
      {/* Weather Observation Ground Instrument Pad */}
      <div className="weather-pad-platform" aria-hidden="true">
        <div className="telemetry-ground-lines" />
        <div className="ground-sensor-needle" style={{ left: '8px', top: '10px' }} />
        <div className="ground-sensor-needle" style={{ right: '8px', top: '12px' }} />
      </div>

      {/* Main Meteorological Station Base */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="scattered"
        facadeStyle="laboratory-clean"
        className="weather-main-mass"
        frontChildren={
          <div className="weather-station-facade">
            {/* Sealed Observation Bunker Entryway */}
            <div className="weather-bunker-door" />
            {/* Meteorological Barometric Sensor Strip */}
            <div className="weather-telemetry-bar" />
          </div>
        }
        roofChildren={
          <div className="weather-roof-deck">
            {/* 3D Rotating Doppler Radar Dome & Dish Assembly */}
            <div className="weather-radar-pedestal">
              <div className="weather-radar-dome">
                <div className="weather-radar-dish-rotor">
                  <div className="radar-dish-face" />
                  <div className="radar-dish-spindle" />
                </div>
              </div>
            </div>

            {/* Weather Anemometer Mast with Spinning Wind Cups */}
            <div className="weather-anemometer-mast">
              <div className="anemometer-cups-rotor">
                <span className="wind-cup cup-1" />
                <span className="wind-cup cup-2" />
                <span className="wind-cup cup-3" />
              </div>
            </div>

            {/* High-gain Communications Lattice Antenna */}
            <div className="weather-comms-lattice">
              <div className="lattice-mast" />
              <div className="lattice-crossarm" />
              <span className="comms-beacon-cyan" />
            </div>

            {/* Rooftop Solar / Radiometer Array */}
            <div className="weather-radiometer-array" />
          </div>
        }
      >
        {/* Secondary Sensor Bunker Wing */}
        {secondaryVolumes?.map((vol) => (
          <div
            key={vol.id || 'weather-sec'}
            className="bldg-secondary-volume weather-annex-volume"
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
              color="#0c2d48"
              accentColor="#00f2fe"
              windowPattern="scattered"
              facadeStyle="laboratory-clean"
              roofChildren={
                <div className="annex-sensor-mast">
                  <span className="sensor-blip-cyan" />
                </div>
              }
            />
          </div>
        ))}
      </BuildingVolumeMesh>
    </div>
  );
};
