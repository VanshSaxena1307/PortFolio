import React, { useEffect, useRef, useState } from 'react';
import { CityEntryWorld } from './CityEntryWorld';
import './transition.css';

interface PortalTransitionProps {
  onComplete: () => void;
}

const EXACT_MESSAGE = 'YOU ARE ABOUT TO ENTER A WORLD BUILT FROM WHAT I CREATE.';

export const PortalTransition: React.FC<PortalTransitionProps> = ({ onComplete }) => {
  // Transition Phase Progression:
  // 1. 'pause': ~200ms quiet pause
  // 2. 'turbulence': room lights flicker, subtle rumble
  // 3. 'escalation': room shake intensifies, monitor bloom surges
  // 4. 'whiteout-expand': blinding white light floods viewport
  // 5. 'typewriter': message reveals character-by-character
  // 6. 'message-hold': slight pause on complete message
  // 7. 'city-reveal': white lifts to reveal high-altitude city establishing shot
  // 8. 'camera-descent': camera glides forward and descends toward Campus
  // 9. 'settled': locked into fixed 3/4 isometric viewpoint at Campus spawn
  const [phase, setPhase] = useState<
    | 'pause'
    | 'turbulence'
    | 'escalation'
    | 'whiteout-expand'
    | 'typewriter'
    | 'message-hold'
    | 'city-reveal'
    | 'camera-descent'
    | 'settled'
  >('pause');

  const [typedCount, setTypedCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  // Sequence Timeline Driver
  useEffect(() => {
    if (reducedMotion) {
      // Streamlined flow for reduced motion: message -> settled city
      setPhase('typewriter');
      return;
    }

    const t1 = setTimeout(() => setPhase('turbulence'), 200);
    const t2 = setTimeout(() => setPhase('escalation'), 900);
    const t3 = setTimeout(() => setPhase('whiteout-expand'), 1900);
    const t4 = setTimeout(() => setPhase('typewriter'), 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reducedMotion]);

  // Typewriter Driver for the exact message
  useEffect(() => {
    if (phase !== 'typewriter') return;

    setTypedCount(0);
    let index = 0;
    const intervalTime = reducedMotion ? 12 : 30;

    const interval = setInterval(() => {
      index++;
      setTypedCount(index);

      if (index >= EXACT_MESSAGE.length) {
        clearInterval(interval);
        // Completed typing - enter slight pause
        setPhase('message-hold');
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [phase, reducedMotion]);

  // Post-Message Hold -> City Reveal -> Descent -> Settled
  useEffect(() => {
    if (phase !== 'message-hold') return;

    const holdDuration = reducedMotion ? 400 : 900;
    const tHold = setTimeout(() => {
      setPhase('city-reveal');

      const tDescent = setTimeout(() => {
        setPhase('camera-descent');

        const tSettle = setTimeout(() => {
          setPhase('settled');
          onCompleteRef.current();
        }, reducedMotion ? 200 : 3400);

        return () => clearTimeout(tSettle);
      }, reducedMotion ? 100 : 700);

      return () => clearTimeout(tDescent);
    }, holdDuration);

    return () => clearTimeout(tHold);
  }, [phase, reducedMotion]);

  // Check visual state helpers
  const isRoomTurbulent = phase === 'turbulence';
  const isRoomEscalating = phase === 'escalation';
  const isWhiteoutActive =
    phase === 'whiteout-expand' ||
    phase === 'typewriter' ||
    phase === 'message-hold';

  const isCityVisible =
    phase === 'city-reveal' ||
    phase === 'camera-descent' ||
    phase === 'settled';

  const isDescending = phase === 'camera-descent';
  const isSettled = phase === 'settled';

  return (
    <div
      className={`portal-transition-layer ${isRoomTurbulent ? 'state-turbulence' : ''} ${
        isRoomEscalating ? 'state-escalating' : ''
      }`}
      role="region"
      aria-label="V-City Portal Transition"
    >
      {/* Environmental Instability & Room Flicker Overlay */}
      {(isRoomTurbulent || isRoomEscalating) && (
        <div className="environmental-turbulence-overlay">
          <div className="light-flicker-pulse"></div>
          <div className="monitor-bloom-surge"></div>
          <div className="chromatic-interference"></div>
        </div>
      )}

      {/* Pure Whiteout Flood & Expanding Light */}
      <div
        className={`whiteout-screen-cover ${
          isWhiteoutActive ? 'visible' : ''
        } ${isCityVisible ? 'dissolving' : ''}`}
        aria-hidden={!isWhiteoutActive}
      >
        <div className="whiteout-light-expansion"></div>

        {/* Centered Cinematic Typewriter Message */}
        {(phase === 'typewriter' || phase === 'message-hold') && (
          <div className="cinematic-typewriter-container" aria-live="assertive">
            <p className="cinematic-typewriter-text">
              {EXACT_MESSAGE.slice(0, typedCount)}
              <span className="cinematic-cursor" aria-hidden="true">
                |
              </span>
            </p>
          </div>
        )}
      </div>

      {/* V-City Establishing Environment & Camera Flyover */}
      {isCityVisible && (
        <div className="city-entry-container">
          <CityEntryWorld
            isDescending={isDescending}
            isSettled={isSettled}
          />
        </div>
      )}
    </div>
  );
};
