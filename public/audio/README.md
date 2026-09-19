# V-City Audio Assets Structure

This directory stores audio files for V-City transitions and ambient city soundscapes.

## Supported Audio Files

### 1. Transition Effects
- `transition-low-impact.mp3`: Deep cinematic sub-bass impact played upon clicking or pressing ENTER.
- `transition-electrical-swell.mp3`: Subtle electrical energy swell and power hum during room turbulence.
- `transition-whiteout-impact.mp3`: High-frequency bloom surge / whiteout impact as white light floods the screen.
- `typewriter-key.mp3`: Optional mechanical key tap sound for character-by-character typewriter reveal.
- `transition-final-flash.mp3`: Resonant flash chord as white dissolves into the V-City skyline.

### 2. V-City Ambient Soundscape
- `vcity-ambient-loop.mp3`: Continuous ambient city loop (night breeze, distant urban drones, low room tone).
- `vcity-distant-traffic.mp3`: Faint distant traffic whooshes and elevated expressway hum.

## Fallback Mechanism
The V-City application features a built-in procedural Web Audio API synthesizer. If local audio files are not yet provided in this directory, the audio manager seamlessly generates rich cinematic sound effects and ambient urban drones in real-time.
