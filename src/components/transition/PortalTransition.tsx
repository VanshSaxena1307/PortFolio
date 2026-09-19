import React, { useEffect, useRef, useState } from 'react';
import { CityEntryWorld } from './CityEntryWorld';
import { audioController } from '../../utils/audio';
import './transition.css';

interface PortalTransitionProps {
  onComplete: () => void;
}

const EXACT_MESSAGE = 'YOU ARE ABOUT TO ENTER A WORLD BUILT FROM WHAT I CREATE.';

export const PortalTransition: React.FC<PortalTransitionProps> = ({ onComplete }) => {
  /**
   * Phase Sequence:
   * 1. 'pause': 300ms micro-pause immediately after ENTER.
   * 2. 'turbulence': lights flicker, subtle room rumble, surrounding room darkens.
   * 3. 'escalation': monitor glow surges, cool/white light dominates, stronger shake.
   * 4. 'whiteout-expand': bright radial white light expands from monitor center.
   * 5. 'typewriter': locked typewriter sentence typed character-by-character.
   * 6. 'message-hold': brief hold on completed sentence.
   * 7. 'final-flash': short, quick white flash.
   * 8. 'city-reveal': high-altitude V-City establishing shot.
   * 9. 'camera-descent': camera glides forward and descends toward Campus District.
   * 10. 'settled': fixed 3/4 isometric view at Campus spawn.
   */
  const [phase, setPhase] = useState<
    | 'pause'
    | 'turbulence'
    | 'escalation'
    | 'whiteout-expand'
    | 'typewriter'
    | 'message-hold'
    | 'final-flash'
    | 'city-reveal'
    | 'camera-descent'
    | 'settled'
  >('pause');

  const [typedCount, setTypedCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Detect accessibility prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  // Sequence Timeline Driver
  useEffect(() => {
    // 1. Initial micro-pause: 300ms
    audioController.playTransitionImpact();

    if (reducedMotion) {
      // Streamlined flow for reduced motion: skip aggressive shakes
      const tReduced = setTimeout(() => {
        setPhase('typewriter');
      }, 350);
      return () => clearTimeout(tReduced);
    }

    const tTurbulence = setTimeout(() => {
      setPhase('turbulence');
      audioController.playEnergySwell();
    }, 320);

    const tEscalation = setTimeout(() => {
      setPhase('escalation');
    }, 980);

    const tWhiteout = setTimeout(() => {
      setPhase('whiteout-expand');
      audioController.playWhiteoutImpact();
    }, 1750);

    const tTypewriter = setTimeout(() => {
      setPhase('typewriter');
    }, 2450);

    return () => {
      clearTimeout(tTurbulence);
      clearTimeout(tEscalation);
      clearTimeout(tWhiteout);
      clearTimeout(tTypewriter);
    };
  }, [reducedMotion]);

  // Typewriter Driver for the locked exact message
  useEffect(() => {
    if (phase !== 'typewriter') return;

    setTypedCount(0);
    let index = 0;
    const intervalTime = reducedMotion ? 12 : 32;

    const interval = setInterval(() => {
      index++;
      setTypedCount(index);
      if (index % 2 === 0) {
        audioController.playTypewriterChar();
      }

      if (index >= EXACT_MESSAGE.length) {
        clearInterval(interval);
        setPhase('message-hold');
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [phase, reducedMotion]);

  // Post-Message Hold -> Final Flash -> City Reveal -> Descent -> Settled
  useEffect(() => {
    if (phase !== 'message-hold') return;

    const holdDuration = reducedMotion ? 350 : 700;
    const tHold = setTimeout(() => {
      // Final Flash
      setPhase('final-flash');
      audioController.playFinalFlash();

      const tFlash = setTimeout(() => {
        // City Reveal (High-Altitude establishing shot)
        setPhase('city-reveal');
        audioController.startCityAmbience();

        const tDescent = setTimeout(() => {
          // Camera Descent toward Campus District
          setPhase('camera-descent');

          const tSettle = setTimeout(() => {
            // Camera Settled in fixed 3/4 isometric gameplay view
            setPhase('settled');
            onCompleteRef.current();
          }, reducedMotion ? 200 : 3200);

          return () => clearTimeout(tSettle);
        }, reducedMotion ? 100 : 1200);

        return () => clearTimeout(tDescent);
      }, reducedMotion ? 50 : 250);

      return () => clearTimeout(tFlash);
    }, holdDuration);

    return () => clearTimeout(tHold);
  }, [phase, reducedMotion]);

  // State flags for visual rendering
  const isMicroPause = phase === 'pause';
  const isRoomTurbulent = phase === 'turbulence';
  const isRoomEscalating = phase === 'escalation';
  const isWhiteoutActive =
    phase === 'whiteout-expand' ||
    phase === 'typewriter' ||
    phase === 'message-hold' ||
    phase === 'final-flash';

  const isFinalFlash = phase === 'final-flash';

  const isCityVisible =
    phase === 'city-reveal' ||
    phase === 'camera-descent' ||
    phase === 'settled';

  const isDescending = phase === 'camera-descent';
  const isSettled = phase === 'settled';

  return (
    <div
      className={`portal-transition-layer ${
        isMicroPause ? 'state-micro-pause' : ''
      } ${isRoomTurbulent ? 'state-turbulence' : ''} ${
        isRoomEscalating ? 'state-escalating' : ''
      }`}
      role="region"
      aria-label="V-City Portal Transition"
    >
      {/* Surrounding Room Darkening Mask (surrounding room darkens while monitor stays bright) */}
      {(isRoomTurbulent || isRoomEscalating) && (
        <div className="room-darken-mask" aria-hidden="true"></div>
      )}

      {/* Environmental Instability & Room Flicker Overlay */}
      {(isRoomTurbulent || isRoomEscalating) && (
        <div className="environmental-turbulence-overlay" aria-hidden="true">
          <div className="light-flicker-pulse"></div>
          <div className="monitor-bloom-surge"></div>
          <div className="center-radiation-beam"></div>
        </div>
      )}

      {/* Pure Whiteout Flood & Expanding Light */}
      <div
        className={`whiteout-screen-cover ${
          isWhiteoutActive ? 'visible' : ''
        } ${isFinalFlash ? 'flash-pulse' : ''} ${
          isCityVisible ? 'dissolving' : ''
        }`}
        aria-hidden={!isWhiteoutActive}
      >
        <div className="whiteout-light-expansion"></div>

        {/* Centered Locked Cinematic Typewriter Message */}
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

      {/* Final White Flash burst overlay */}
      {isFinalFlash && (
        <div className="final-flash-overlay" aria-hidden="true"></div>
      )}

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
