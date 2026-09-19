import React from 'react';
import { CASE_STUDIES } from '../../data/caseStudies';

export const RecruiterView: React.FC = () => {
  return (
    <div className="recruiter-view">
      <div className="recruiter-header glass-panel">
        <div className="candidate-badge badge-mono">ENGINEERING DOSSIER</div>
        <h1>VANSH SAXENA</h1>
        <p className="candidate-title">Software Engineer · Systems & Full Stack Builder</p>
        <div className="quick-stats">
          <div className="stat-box">
            <span className="stat-val">3+</span>
            <span className="stat-lbl">Core Architectures</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">Distributed</span>
            <span className="stat-lbl">Systems & APIs</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">Agentic AI</span>
            <span className="stat-lbl">Multi-agent Workflows</span>
          </div>
        </div>
      </div>

      <div className="recruiter-section">
        <h2>Key Projects & Case Studies</h2>
        <div className="case-studies-list">
          {CASE_STUDIES.map((study) => (
            <div key={study.id} className="case-study-card glass-panel">
              <div className="case-top">
                <h3>{study.title}</h3>
                <span className="badge-mono">{study.timeline}</span>
              </div>
              <p className="case-subtitle">{study.subtitle}</p>
              <div className="problem-solution">
                <p><strong>Challenge:</strong> {study.problem}</p>
                <p><strong>Architectural Solution:</strong> {study.solution}</p>
              </div>

              <div className="metrics-row">
                {study.metrics.map((m) => (
                  <div key={m.label} className="metric-pill">
                    <span className="m-val">{m.value}</span>
                    <span className="m-lbl">{m.label}</span>
                  </div>
                ))}
              </div>

              <div className="tech-stack-row">
                {study.technologies.map((tech) => (
                  <span key={tech} className="tech-chip">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
