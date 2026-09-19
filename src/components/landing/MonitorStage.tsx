import React, { useRef } from 'react';

interface MonitorStageProps {
  progress: number;
  onEnterCity: () => void;
}

export const MonitorStage: React.FC<MonitorStageProps> = ({ progress, onEnterCity }) => {
  const enterBtnRef = useRef<HTMLButtonElement>(null);

  // Active from progress 0.74 to 1.0
  if (progress < 0.74) {
    return null;
  }

  // Smooth camera zoom towards monitor screen
  // 0.74 -> 0.90: approaches monitor, scale increases smoothly from 0.70 to 1.0
  // 0.90 -> 1.0: locked in authoritative, unobstructed full focus
  const pNorm = Math.min(1, (progress - 0.74) / (0.90 - 0.74));
  const scale = 0.70 + pNorm * 0.30;
  const opacity = Math.min(1, (progress - 0.74) * 6.5);

  const isFullyFocused = progress >= 0.88;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEnterCity();
    }
  };

  return (
    <div
      className={`stage-layer monitor-stage ${isFullyFocused ? 'focused' : ''}`}
      style={{
        opacity,
        transform: `translate3d(0, 0, 0) scale(${scale})`,
        zIndex: 50, // Higher than any other stage layer to guarantee no geometry cuts through
      }}
    >
      <div className="terminal-monitor-chassis">
        {/* Precision Monitor Top Bezel & Integrated Sensor Dot */}
        <div className="monitor-bezel-top">
          <div className="bezel-sensor-housing">
            <span className="webcam-dot"></span>
            <span className="status-pinhole"></span>
          </div>
        </div>

        {/* Display Screen Active Surface */}
        <div className="monitor-display">
          {/* Top Status Bar: Realistic IDE / Workstation Header */}
          <div className="display-status-bar">
            <div className="file-tab">
              <span className="file-dot active"></span>
              <span className="file-name">identity.ts</span>
            </div>
            <div className="ide-meta">
              <span className="meta-pill">UTF-8</span>
              <span className="meta-pill">TypeScript</span>
              <span className="meta-pill status-ready">CONNECTED</span>
            </div>
          </div>

          {/* IDE Background Code Gutter & Faint Architecture Code */}
          <div className="display-ide-gutter" aria-hidden="true">
            <div className="line-numbers">
              <span>01</span>
              <span>02</span>
              <span>03</span>
              <span>04</span>
              <span>05</span>
              <span>06</span>
              <span>07</span>
            </div>
            <div className="ghost-code">
              <span className="code-kw">import</span> &#123; Builder, SystemsArchitect &#125; <span className="code-kw">from</span> <span className="code-str">'@vansh/core'</span>;
              <br />
              <span className="code-kw">const</span> developer = <span className="code-fn">initEngineer</span>(&#123; domain: <span className="code-str">'V-CITY'</span>, status: <span className="code-str">'ONLINE'</span> &#125;);
            </div>
          </div>

          {/* Central Dominant Focus (Clear Visual Hierarchy: Zero Obstruction) */}
          <div className="monitor-central-terminal">
            <div className="terminal-hero">
              <span className="terminal-badge badge-mono">TERMINAL INITIALIZED</span>
              <h1 className="terminal-author-name">VANSH SAXENA</h1>
              <p className="terminal-author-role">SOFTWARE ENGINEER · BUILDER</p>
            </div>

            <div className="terminal-prompt-zone">
              <p className="terminal-query">
                <span className="prompt-symbol">&gt;</span> ENTER V-CITY?
              </p>

              {/* Exact required interactive ENTER button */}
              <button
                ref={enterBtnRef}
                type="button"
                className="enter-vcity-button"
                onClick={onEnterCity}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                aria-label="Enter V-City"
              >
                <span className="btn-bracket">[ </span>
                <span className="btn-text">ENTER ↵</span>
                <span className="btn-bracket"> ]</span>
              </button>
            </div>
          </div>

          {/* Monitor Bottom Status / System Telemetry */}
          <div className="display-footer">
            <span className="display-brand">V-SYS // SPATIAL ARCHITECTURE PROTOCOL</span>
            <span className="display-clock">60 FPS · LATENCY: 4ms · SECURE</span>
          </div>
        </div>

        {/* Realistic Desk Surface Reflection / Underglow */}
        <div className="monitor-underglow"></div>
      </div>
    </div>
  );
};
