import React from 'react';
import { ContextualFigure } from '../../../types';

interface ContextualSilhouettesProps {
  figures?: ContextualFigure[];
}

export const ContextualSilhouettes: React.FC<ContextualSilhouettesProps> = ({ figures }) => {
  if (!figures || figures.length === 0) return null;

  return (
    <div className="contextual-silhouettes-container" aria-hidden="true">
      {figures.map((fig) => (
        <div
          key={fig.id}
          className={`contextual-figure role-${fig.role}`}
          style={{
            left: `${fig.offset.x}px`,
            top: `${fig.offset.y}px`,
          }}
        >
          <div className="figure-shadow" />
          <div className="figure-body">
            {fig.role === 'construction-worker' && <span className="hardhat-cap" />}
            {fig.role === 'bank-guard' && <span className="guard-beret" />}
            {fig.role === 'researcher' && <span className="lab-coat" />}
            {fig.role === 'cadet' && <span className="cadet-sash" />}
          </div>
        </div>
      ))}
    </div>
  );
};
