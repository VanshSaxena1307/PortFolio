import React, { useEffect, useState } from 'react';
import { DialogueNode } from '../../types';

interface TypewriterDialogProps {
  dialogue: DialogueNode | null;
  onOptionSelect: (action?: string) => void;
  onClose: () => void;
}

export const TypewriterDialog: React.FC<TypewriterDialogProps> = ({
  dialogue,
  onOptionSelect,
  onClose,
}) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!dialogue) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    let currentIndex = 0;
    const fullText = dialogue.text;

    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [dialogue]);

  if (!dialogue) return null;

  return (
    <div className="dialogue-box glass-panel">
      <div className="dialogue-header">
        <span className="speaker-tag badge-mono">{dialogue.speaker}</span>
        <button className="dialogue-close" onClick={onClose}>×</button>
      </div>

      <div className="dialogue-content">
        <p className="dialogue-text">
          {displayedText}
          <span className="typing-cursor">█</span>
        </p>
      </div>

      {dialogue.options && dialogue.options.length > 0 && (
        <div className="dialogue-options">
          {dialogue.options.map((opt, idx) => (
            <button
              key={idx}
              className="dialogue-opt-btn"
              onClick={() => onOptionSelect(opt.action)}
            >
              › {opt.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
