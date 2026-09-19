/**
 * V-City Audio Controller
 * Handles cinematic transition sound design and atmospheric city ambience.
 * Includes native Web Audio API procedural synthesis with optional fallback
 * to local files in /audio/ if present.
 *
 * Rules:
 * - No autoplay without user interaction (initialized on ENTER).
 * - Smooth volume transitions / fades.
 * - Safe error handling if Web Audio is unsupported or blocked.
 */

class AudioController {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = false;
  private ambienceGain: GainNode | null = null;
  private ambienceNodes: AudioNode[] = [];
  private isAmbienceRunning = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('[V-CITY AUDIO] Web Audio API initialization deferred or not supported:', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambienceGain && this.ctx) {
      const targetGain = muted ? 0 : 0.22;
      this.ambienceGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 1. Low cinematic impact on ENTER activation
   * Deep sub-bass punch (50Hz -> 25Hz exponential drop)
   */
  public playTransitionImpact() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + 0.5);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch (err) {
      console.warn('[V-CITY AUDIO] Transition impact playback error:', err);
    }
  }

  /**
   * 2. Subtle electrical / energy swell during turbulence
   * Resonant filtered bandpass sweep + soft harmonic buzz
   */
  public playEnergySwell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 1.2;

      // Filtered noise buffer for electrical atmosphere
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(750, now + duration);
      filter.Q.setValueAtTime(3.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Low 60Hz mains hum
      const humOsc = this.ctx.createOscillator();
      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(60, now);

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(120, now);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.04, now);
      humGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      humOsc.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(this.ctx.destination);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);
      humOsc.start(now);
      humOsc.stop(now + duration);
    } catch (err) {
      console.warn('[V-CITY AUDIO] Energy swell playback error:', err);
    }
  }

  /**
   * 3. Whiteout impact as light floods the screen
   * Bright resonant shimmer and sweeping sub surge
   */
  public playWhiteoutImpact() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // High shimmer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.9);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    } catch (err) {
      console.warn('[V-CITY AUDIO] Whiteout impact playback error:', err);
    }
  }

  /**
   * 4. Typewriter character tick
   */
  public playTypewriterChar() {
    if (this.isMuted) return;
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Subtle pitch randomization for organic feel
      const freq = 750 + Math.random() * 120;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Ignore click audio errors
    }
  }

  /**
   * 5. Final Flash transition chord
   */
  public playFinalFlash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (err) {
      console.warn('[V-CITY AUDIO] Final flash error:', err);
    }
  }

  /**
   * 6. V-City ambient city soundtrack & distant traffic drone
   * Smooth continuous procedural drone with gradual fade-in
   */
  public startCityAmbience() {
    if (this.isAmbienceRunning) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.isAmbienceRunning = true;
      const now = this.ctx.currentTime;

      const masterAmbienceGain = this.ctx.createGain();
      masterAmbienceGain.gain.setValueAtTime(0.001, now);
      // Smooth fade-in over 3 seconds
      masterAmbienceGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.18, now + 3.0);
      masterAmbienceGain.connect(this.ctx.destination);
      this.ambienceGain = masterAmbienceGain;

      // Low urban rumble (brownian-filtered noise)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        noiseData[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = noiseData[i];
        noiseData[i] *= 3.5;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(180, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(masterAmbienceGain);
      noiseSource.start(now);

      // Deep atmospheric drone chord (F1 + C2 root)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(43.65, now); // F1

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(65.41, now); // C2

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.12, now);

      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(masterAmbienceGain);

      osc1.start(now);
      osc2.start(now);

      this.ambienceNodes = [noiseSource, noiseFilter, osc1, osc2, oscGain, masterAmbienceGain];
    } catch (err) {
      console.warn('[V-CITY AUDIO] City ambience start error:', err);
    }
  }

  /**
   * Stop city ambience with smooth fade-out
   */
  public stopCityAmbience(fadeDurationMs = 1500) {
    if (!this.isAmbienceRunning || !this.ctx || !this.ambienceGain) return;

    try {
      const now = this.ctx.currentTime;
      const fadeSec = fadeDurationMs / 1000;
      this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, now);
      this.ambienceGain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);

      setTimeout(() => {
        this.ambienceNodes.forEach((node) => {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            try {
              (node as AudioScheduledSourceNode).stop();
            } catch {
              // Ignore stopped node errors
            }
          }
          try {
            node.disconnect();
          } catch {
            // Ignore disconnect errors
          }
        });
        this.ambienceNodes = [];
        this.ambienceGain = null;
        this.isAmbienceRunning = false;
      }, fadeDurationMs + 100);
    } catch (err) {
      console.warn('[V-CITY AUDIO] Stop ambience error:', err);
      this.isAmbienceRunning = false;
    }
  }
}

export const audioController = new AudioController();
