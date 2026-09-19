import React from 'react';

export const EchoHub: React.FC = () => {
  return (
    <div className="echo-hub">
      <div className="echo-header glass-panel">
        <span className="badge-mono">IDENTITY NEXUS // ECHO-01</span>
        <h1>ECHO HUB: VANSH SAXENA</h1>
        <p className="echo-desc">
          Core principles, design philosophies, technical milestones, and current engineering explorations.
        </p>
      </div>

      <div className="echo-grid">
        <div className="echo-card glass-panel">
          <h3>01 / Engineering Philosophy</h3>
          <p>
            Build systems that are resilient, observable, and delightful to interact with.
            Prioritize low latency, clean separation of concerns, and clean developer ergonomics.
          </p>
        </div>

        <div className="echo-card glass-panel">
          <h3>02 / Technical DNA</h3>
          <p>
            Deep curiosity across both distributed backend infrastructure and kinetic interactive interfaces.
            Bridging complex algorithms with tactile user experiences.
          </p>
        </div>

        <div className="echo-card glass-panel">
          <h3>03 / Current Focus</h3>
          <p>
            Autonomous agent frameworks, interactive spatial 3D environments on the web,
            and high-frequency distributed state coordination.
          </p>
        </div>
      </div>
    </div>
  );
};
