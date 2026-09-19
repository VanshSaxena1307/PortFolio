import React from 'react';
import { CityWorld } from '../city/CityWorld';

interface CityEntryWorldProps {
  isDescending: boolean;
  isSettled: boolean;
}

/**
 * CityEntryWorld serves as the bridge between PortalTransition and V-City.
 * It renders the unified CityWorld component with the active descent/settled phase.
 */
export const CityEntryWorld: React.FC<CityEntryWorldProps> = ({
  isDescending,
  isSettled,
}) => {
  return <CityWorld isDescending={isDescending} isSettled={isSettled} />;
};
