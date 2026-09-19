import React, { useEffect, useRef, useState } from 'react';
import { CinematicViewport } from './CinematicViewport';
import './cinematic.css';

interface LandingProps {
  onEnterCity: () => void;
  onSkipIntro?: () => void;
  onOpenRecruiter?: () => void;
}

export const CinematicLanding: React.FC<LandingProps> = ({
  onEnterCity,
  onSkipIntro,
  onOpenRecruiter,
}) => {
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
      setScrollProgress(1.0);
      targetProgressRef.current = 1.0;
      currentProgressRef.current = 1.0;
      return;
    }

    const calculateProgress = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const totalScrollable = container.scrollHeight - window.innerHeight;

      if (totalScrollable > 0) {
        const scrollY = window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
        const containerTop = container.offsetTop;
        const scrolled = Math.max(0, scrollY - containerTop);
        let rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));

        // Snap cleanly at extremities
        if (rawProgress >= 0.985 || scrolled >= totalScrollable - 4) {
          rawProgress = 1.0;
        } else if (rawProgress <= 0.015 || scrolled <= 4) {
          rawProgress = 0.0;
        }

        targetProgressRef.current = rawProgress;
      }
    };

    // Smooth RAF ticker for continuous camera movement
    const updateLoop = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      // Smooth damping interpolation (lerp factor 0.1)
      let next = current + (target - current) * 0.1;

      // Clean snap when within threshold of target (especially at 0 or 1)
      if (Math.abs(target - next) < 0.004) {
        next = target;
      }

      currentProgressRef.current = next;

      // Update state if delta is perceptible
      if (Math.abs(next - current) > 0.0001 || next === target) {
        setScrollProgress(next);
      }

      rafIdRef.current = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    calculateProgress(); // Initial read
    rafIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Jump to specific progress node (accessible timeline navigation)
  const handleJumpToProgress = (target: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const totalScrollable = container.scrollHeight - window.innerHeight;
    const targetScrollTop = container.offsetTop + target * totalScrollable;

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
        onSkipIntro={onSkipIntro}
        onOpenRecruiter={onOpenRecruiter}
      />
    </div>
  );
};
