import React, { useRef } from 'react';

interface MonitorStageProps {
  progress: number;
  onEnterCity: () => void;
}

export const MonitorStage: React.FC<MonitorStageProps> = ({ progress, onEnterCity }) => {
  const enterBtnRef = useRef<HTMLButtonElement>(null);

  // Active from progress 0.76 to 1.0
  if (progress < 0.76) {
    return null;
  }

  // Smooth camera zoom towards monitor screen
  // 0.76 -> 0.92: approaches monitor, scale increases from 0.6 to 1.0
  // 0.92 -> 1.0: locked in full focus
  const pNorm = Math.min(1, (progress - 0.76) / (0.94 - 0.76));
  const scale = 0.65 + pNorm * 0.35;
  const opacity = Math.min(1, (progress - 0.76) * 7);

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
      }}
    >
      <div className="terminal-monitor-chassis glass-panel">
        {/* Monitor Bezel & Webcam/Sensor */}
        <div className="monitor-bezel-top">
          <span className="webcam-dot"></span>
        </div>

        {/* Display Screen Active Area */}
        <div className="monitor-display">
          {/* Subtle IDE header */}
          <div className="display-status-bar">
            <div className="file-tab">
              <span className="file-dot active"></span>
              <span className="file-name">identity.ts</span>
            </div>
            <div className="ide-meta">
              <span className="meta-pill">UTF-8</span>
              <span className="meta-pill">TypeScript</span>
              <span className="meta-pill status-ready">ONLINE</span>
            </div>
          </div>

          {/* IDE Background Code Gutter & Ghost Code */}
          <div className="display-ide-gutter">
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
              <span className="code-kw">const</span> developer = <span className="code-fn">initEngineer</span>(&#123; domain: <span className="code-str">'V-CITY'</span> &#125;);
            </div>
          </div>

          {/* Central Dominant Focus */}
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

              {/* Highly interactive and accessible ENTER button */}
              <button
                ref={enterBtnRef}
                type="button"
                className="enter-vcity-button"
                onClick={onEnterCity}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                aria-label="Enter V-City"
              >
                <span className="btn-bracket">[</span>
                <span className="btn-text">ENTER ↵</span>
                <span className="btn-bracket">]</span>
              </button>
            </div>
          </div>

          {/* Monitor bottom bezel branding */}
          <div className="display-footer">
            <span className="display-brand">V-SYS // SPATIAL INTERFACE PROTOCOL</span>
            <span className="display-clock">60 FPS · LATENCY: 8ms</span>
          </div>
        </div>

        {/* Ambient Underglow from Monitor */}
        <div className="monitor-underglow"></div>
      </div>
    </div>
  );
};
