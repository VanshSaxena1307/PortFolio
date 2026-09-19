import React, { useEffect, useRef, useState } from 'react';
import { CinematicViewport } from './CinematicViewport';
import './cinematic.css';

interface LandingProps {
  onEnterCity: () => void;
}

export const CinematicLanding: React.FC<LandingProps> = ({ onEnterCity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Target and current progress for smooth physics-based lerp
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      // Jump directly to monitor focus if reduced motion is requested
      setScrollProgress(0.98);
      targetProgressRef.current = 0.98;
      currentProgressRef.current = 0.98;
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;

      if (totalScrollable > 0) {
        const scrolled = -rect.top;
        const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
        targetProgressRef.current = rawProgress;
      }
    };

    // Smooth RAF ticker for continuous camera movement
    const updateLoop = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      // Smooth damping interpolation (lerp factor 0.08)
      const next = current + (target - current) * 0.08;
      currentProgressRef.current = next;

      // Update state if delta is perceptible
      if (Math.abs(next - current) > 0.0005 || Math.abs(next - target) > 0.0005) {
        setScrollProgress(next);
      }

      rafIdRef.current = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial read
    rafIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Jump to specific progress node (accessible timeline navigation)
  const handleJumpToProgress = (target: number) => {
    if (!containerRef.current) return;
    const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
    const targetScrollTop = target * totalScrollable;

    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  };

  return (
    <div
      ref={containerRef}
      className="cinematic-experience-container"
      data-testid="cinematic-landing"
    >
      <CinematicViewport
        progress={scrollProgress}
        onEnterCity={onEnterCity}
        onJumpToProgress={handleJumpToProgress}
      />
    </div>
  );
};
