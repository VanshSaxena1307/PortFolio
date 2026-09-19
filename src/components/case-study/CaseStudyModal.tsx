import React from 'react';
import { CaseStudy } from '../../types';

interface CaseStudyModalProps {
  study: CaseStudy | null;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ study, onClose }) => {
  if (!study) return null;

  return (
    <div className="case-modal-overlay">
      <div className="case-modal-window glass-panel">
        <div className="case-modal-header">
          <div>
            <span className="badge-mono">SECTOR: {study.districtId}</span>
            <h2>{study.title}</h2>
            <p className="modal-subtitle">{study.subtitle}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="case-modal-body">
          <div className="meta-bar">
            <span><strong>Role:</strong> {study.role}</span>
            <span><strong>Timeline:</strong> {study.timeline}</span>
          </div>

          <div className="problem-solution-block">
            <h3>Problem Statement</h3>
            <p>{study.problem}</p>

            <h3>Architectural Solution</h3>
            <p>{study.solution}</p>
          </div>

          <div className="architecture-notes">
            <h3>Key System Decisions</h3>
            <ul>
              {study.architectureNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="modal-metrics">
            <h3>Impact Metrics</h3>
            <div className="metrics-grid">
              {study.metrics.map((m) => (
                <div key={m.label} className="metric-box">
                  <span className="metric-num">{m.value}</span>
                  <span className="metric-name">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-tech">
            <h3>Technologies Deployed</h3>
            <div className="tech-tags">
              {study.technologies.map((t) => (
                <span key={t} className="tech-chip">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
