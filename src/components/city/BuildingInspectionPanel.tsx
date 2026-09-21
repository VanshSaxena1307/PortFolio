import React, { useEffect, useState, useRef } from 'react';
import { BuildingData } from '../../types';

interface BuildingInspectionPanelProps {
  building: BuildingData;
  targetScreenPosition?: { x: number; y: number } | null;
  onClose: () => void;
  onTypeCharacter?: () => void;
  motionReduced?: boolean;
}

export const BuildingInspectionPanel: React.FC<BuildingInspectionPanelProps> = ({
  building,
  targetScreenPosition,
  onClose,
  onTypeCharacter,
  motionReduced = false,
}) => {
  // Step in typewriter progression:
  // 0: Header badge
  // 1: Title
  // 2: Tagline
  // 3: Description typing
  // 4: Tech stack
  // 5: Finished (actions enabled)
  const [revealStep, setRevealStep] = useState<number>(motionReduced ? 5 : 0);
  const [displayedDesc, setDisplayedDesc] = useState<string>(motionReduced ? building.description : '');
  const [charIndex, setCharIndex] = useState<number>(motionReduced ? building.description.length : 0);

  const panelRef = useRef<HTMLDivElement>(null);
  const [panelRect, setPanelRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Formatted Project / Facility Code
  const getEntityCode = (): string => {
    if (building.id.includes('hajiri')) return 'PROJECT_001 // SEC-TECH';
    if (building.id.includes('expenseiq')) return 'PROJECT_002 // SEC-TECH';
    if (building.id.includes('climora')) return 'PROJECT_003 // SEC-TECH';
    if (building.id.includes('quantumknee')) return 'PROJECT_004 // SEC-RESEARCH';
    if (building.id.includes('campuscore')) return 'PROJECT_005 // SEC-TECH';
    if (building.id.includes('arena-hackathon')) return 'ARENA_001 // SEC-ARENA';
    if (building.id.includes('arena-ncc')) return 'COMMAND_001 // SEC-ARENA';
    if (building.id.includes('campus-edu')) return 'ACADEMIC_001 // SEC-CAMPUS';
    if (building.id.includes('campus-skills')) return 'FORGE_001 // SEC-CAMPUS';
    if (building.id.includes('echo')) return 'IDENTITY_001 // SEC-CORE';
    return `FACILITY_${building.id.slice(-3).toUpperCase()} // SEC-${building.district.toUpperCase()}`;
  };

  // Formatted spaced title (H A J I R I style)
  const getSpacedTitle = (name: string): string => {
    // If reservedProject exists, use it spaced
    if (building.reservedProject) {
      return building.reservedProject.split('').join(' ');
    }
    return name.toUpperCase().split('').join(' ');
  };

  // Skip reveal if clicked
  const handleFastForward = () => {
    setDisplayedDesc(building.description);
    setRevealStep(5);
  };

  // Sequential Typewriter Logic
  useEffect(() => {
    if (motionReduced) {
      setDisplayedDesc(building.description);
      setRevealStep(5);
      return;
    }

    // Progression timer
    if (revealStep === 0) {
      const t = setTimeout(() => setRevealStep(1), 100);
      return () => clearTimeout(t);
    }
    if (revealStep === 1) {
      const t = setTimeout(() => setRevealStep(2), 160);
      return () => clearTimeout(t);
    }
    if (revealStep === 2) {
      const t = setTimeout(() => {
        setRevealStep(3);
        setCharIndex(0);
        setDisplayedDesc('');
      }, 180);
      return () => clearTimeout(t);
    }

    if (revealStep === 3) {
      if (charIndex < building.description.length) {
        const timer = setTimeout(() => {
          setDisplayedDesc((prev) => prev + building.description[charIndex]);
          setCharIndex((i) => i + 1);
          if (charIndex % 3 === 0) {
            onTypeCharacter?.();
          }
        }, 12);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setRevealStep(4), 140);
        return () => clearTimeout(timer);
      }
    }

    if (revealStep === 4) {
      const timer = setTimeout(() => setRevealStep(5), 180);
      return () => clearTimeout(timer);
    }
  }, [revealStep, charIndex, building.description, motionReduced, onTypeCharacter]);

  // Track panel bounding box for connector line
  useEffect(() => {
    const updateRect = () => {
      if (panelRef.current) {
        const r = panelRef.current.getBoundingClientRect();
        setPanelRect({
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
        });
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    const interval = setInterval(updateRect, 100);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearInterval(interval);
    };
  }, []);

  // Adaptive dock positioning:
  // If building target is in left half of screen -> panel docks right.
  // If building target is in right half of screen -> panel docks left.
  const targetX = targetScreenPosition?.x ?? window.innerWidth * 0.5;
  const targetY = targetScreenPosition?.y ?? window.innerHeight * 0.5;
  const isTargetOnLeft = targetX < window.innerWidth * 0.5;
  const isTargetNearTop = targetY < window.innerHeight * 0.45;

  const panelDockClass = isTargetOnLeft ? 'dock-right' : 'dock-left';
  const panelVerticalClass = isTargetNearTop ? 'dock-lower' : 'dock-mid';

  // Calculate connector line start and end points
  let connectorSvg = null;
  if (targetScreenPosition && panelRect) {
    const startX = targetScreenPosition.x;
    const startY = targetScreenPosition.y;
    // Connector anchors to the closer side edge of the panel
    const endX = isTargetOnLeft ? panelRect.x : panelRect.x + panelRect.width;
    const endY = panelRect.y + 60;

    // Mid control point for curved tech trace
    const midX = (startX + endX) / 2;

    connectorSvg = (
      <svg className="inspection-connector-svg" aria-hidden="true">
        <path
          d={`M ${startX} ${startY} Q ${midX} ${startY} ${endX} ${endY}`}
          className="connector-line-glow"
        />
        <path
          d={`M ${startX} ${startY} Q ${midX} ${startY} ${endX} ${endY}`}
          className="connector-line-trace"
        />
        {/* Node point at building anchor */}
        <circle cx={startX} cy={startY} r="4" className="connector-anchor-dot" />
        <circle cx={startX} cy={startY} r="8" className="connector-anchor-ring" />
        {/* Terminating dot on panel boundary */}
        <circle cx={endX} cy={endY} r="3" className="connector-target-dot" />
      </svg>
    );
  }

  const isRevealed = revealStep >= 5;

  return (
    <div className="city-inspection-overlay-layer">
      {/* Visual Connector Trace */}
      {connectorSvg}

      {/* Diegetic Inspection Panel */}
      <aside
        ref={panelRef}
        className={`building-inspection-panel ${panelDockClass} ${panelVerticalClass} archetype-${building.archetype || 'corporate-tech'}`}
        role="dialog"
        aria-labelledby="inspection-title"
        aria-describedby="inspection-desc"
        onClick={handleFastForward}
      >
        {/* Corner Cyber Brackets */}
        <div className="panel-corner corner-tl" aria-hidden="true" />
        <div className="panel-corner corner-tr" aria-hidden="true" />
        <div className="panel-corner corner-bl" aria-hidden="true" />
        <div className="panel-corner corner-br" aria-hidden="true" />

        {/* Header Telemetry */}
        <div className="inspection-header">
          <div className="header-meta">
            <span className="telemetry-badge">{getEntityCode()}</span>
            <span className={`status-dot-pill status-${building.status}`}>
              <span className="dot" />
              {building.status.toUpperCase()}
            </span>
          </div>
          <button
            className="inspection-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close building inspection"
            title="Press ESC to close"
          >
            ✕
          </button>
        </div>

        {/* Spaced Monolithic Title */}
        <h2 id="inspection-title" className={`inspection-entity-title ${revealStep >= 1 ? 'revealed' : ''}`}>
          {getSpacedTitle(building.name)}
        </h2>

        {/* Tagline */}
        <div className={`inspection-tagline ${revealStep >= 2 ? 'revealed' : ''}`}>
          {building.tagline.toUpperCase()}
        </div>

        {/* Narrative Description with Typewriter */}
        <div id="inspection-desc" className="inspection-desc-container">
          <p className="inspection-description">
            {displayedDesc}
            {revealStep >= 3 && revealStep < 5 && <span className="typewriter-cursor" aria-hidden="true">▍</span>}
          </p>
        </div>

        {/* Tech Stack / Specialization Chips */}
        {building.technologies && building.technologies.length > 0 && (
          <div className={`inspection-tech-section ${revealStep >= 4 ? 'revealed' : ''}`}>
            <div className="tech-section-label">SYSTEM CAPABILITIES // TECH STACK</div>
            <div className="tech-chips-cloud">
              {building.technologies.map((tech) => (
                <span key={tech} className="tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className={`inspection-actions-row ${isRevealed ? 'active' : 'dormant'}`}>
          {building.liveDemoUrl && (
            <a
              href={building.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inspection-btn primary-action ${!isRevealed ? 'disabled' : ''}`}
              tabIndex={isRevealed ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="btn-icon">↗</span>
              <span>VIEW LIVE DEMO</span>
            </a>
          )}

          {building.githubUrl && (
            <a
              href={building.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inspection-btn secondary-action ${!isRevealed ? 'disabled' : ''}`}
              tabIndex={isRevealed ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="btn-icon">⌥</span>
              <span>GITHUB</span>
            </a>
          )}

          {/* Placeholder for future case study */}
          {building.relatedCaseStudyId && (
            <button
              className="inspection-btn muted-action"
              disabled
              title="Full Case Study deep-dive unlocks in next phase"
              onClick={(e) => e.stopPropagation()}
            >
              <span>CASE STUDY [PREVIEW]</span>
            </button>
          )}

          <button
            className="inspection-btn close-action"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            tabIndex={isRevealed ? 0 : -1}
          >
            <span>[ CLOSE ]</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
