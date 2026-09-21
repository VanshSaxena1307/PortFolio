import React from 'react';
import { BuildingData } from '../../../types';
import { BuildingVolumeMesh } from './BuildingVolumeMesh';
import { ContextualSilhouettes } from './ContextualSilhouettes';

interface BankBuildingProps {
  building: BuildingData;
}

export const BankBuilding: React.FC<BankBuildingProps> = ({ building }) => {
  const { size, color, accentColor, contextualFigures } = building;

  return (
    <div className="bank-building-root">
      {/* Ground Forecourt with polished stone paving & security bollards */}
      <div className="bank-forecourt-platform" aria-hidden="true">
        <div className="bank-plaza-texture" />
        <div className="bank-bollard" style={{ left: '16px', bottom: '8px' }} />
        <div className="bank-bollard" style={{ left: '34px', bottom: '8px' }} />
        <div className="bank-bollard" style={{ right: '34px', bottom: '8px' }} />
        <div className="bank-bollard" style={{ right: '16px', bottom: '8px' }} />
      </div>

      {/* Main Symmetrical Bank Edifice */}
      <BuildingVolumeMesh
        width={size.x}
        depth={size.z}
        height={size.y}
        color={color}
        accentColor={accentColor}
        windowPattern="bank-tall"
        facadeStyle="stone-glass"
        className="bank-main-mass"
        frontChildren={
          <div className="bank-facade-overlay">
            {/* Reinforced Heavy Stone Base Floor / Vault Wall */}
            <div className="bank-vault-foundation" />

            {/* Classical Symmetrical Colonnade across front facade */}
            <div className="bank-colonnade-row">
              <div className="bank-column" />
              <div className="bank-column" />
              <div className="bank-column" />
              <div className="bank-column" />
              <div className="bank-column" />
              <div className="bank-column" />
            </div>

            {/* Symmetrical Tall Glazed Clerestory Windows with Warm Gold Interior Glow */}
            <div className="bank-gold-clerestory" />

            {/* Prominent Classical Entrance Portico with Architrave & Canopy */}
            <div className="bank-entrance-portal">
              <div className="bank-portico-entablature">
                <span className="bank-pediment-crest" />
              </div>
              <div className="bank-bronze-doors">
                <div className="bank-security-scanner-glow" />
              </div>
            </div>

            {/* Exterior ATM Kiosk Pod with Green/Cyan Status Telemetry */}
            <div className="bank-exterior-atm">
              <div className="atm-screen-glow" />
              <div className="atm-keypad-bezel" />
              <div className="atm-status-led" />
            </div>
          </div>
        }
        roofChildren={
          <div className="bank-roof-elements">
            {/* Symmetrical Clerestory Skylight with Warm Financial Gold Glow */}
            <div className="bank-atrium-skylight" />
            {/* Secure Rooftop HVAC Ventilation Units */}
            <div className="roof-mech-unit" style={{ top: '15%', left: '12%' }} />
            <div className="roof-mech-unit" style={{ top: '15%', right: '12%' }} />
          </div>
        }
      />

      {/* Contextual Bank Guard & Client Silhouettes */}
      <ContextualSilhouettes figures={contextualFigures} />
    </div>
  );
};
