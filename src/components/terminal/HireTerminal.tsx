import React, { useState } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HireTerminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
  };

  return (
    <div className="terminal-overlay">
      <div className="terminal-window glass-panel">
        <div className="terminal-topbar">
          <div className="terminal-controls">
            <span className="ctrl-dot close" onClick={onClose}></span>
            <span className="ctrl-dot min"></span>
            <span className="ctrl-dot max"></span>
          </div>
          <span className="terminal-title">vansh@v-city: ~/hire-me-terminal</span>
          <button className="terminal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="terminal-body">
          <p className="terminal-prompt">$ initiate_contact --target=VanshSaxena</p>
          <p className="terminal-text">Direct transmission terminal open. Leave details below:</p>

          {submitted ? (
            <div className="terminal-success">
              <span className="badge-mono">[TRANSMISSION ACKNOWLEDGED]</span>
              <p>Thank you for reaching out, {name}. Your transmission has been queued for Vansh.</p>
              <button className="btn-secondary" onClick={onClose}>Close Terminal</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="terminal-form">
              <div className="form-group">
                <label className="terminal-label">NAME / ORGANIZATION:</label>
                <input
                  type="text"
                  className="terminal-input"
                  placeholder="e.g. Elena Rostova / Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="terminal-label">CONTACT EMAIL:</label>
                <input
                  type="email"
                  className="terminal-input"
                  placeholder="e.g. elena@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="terminal-label">MESSAGE / OPPORTUNITY SPECS:</label>
                <textarea
                  className="terminal-input"
                  rows={3}
                  placeholder="Project scope, role requirements, timeline, or greetings..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Transmit Message ↵
                </button>
                <button type="button" className="btn-outline" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
