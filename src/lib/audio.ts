/**
 * Netflix "Ta-Dum" sound synthesizer using the Web Audio API.
 * Synthesizes the iconic dual-chord cello/sub-bass swell and resonant strike
 * with zero external audio files.
 */
export function playNetflixIntroSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Sub-bass hit (deep punch)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.4);

    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.8);

    // Primary Ta-Dum chord swell
    const freqs = [110, 164.81, 220, 277.18]; // A2, E3, A3, C#4 (rich cinematic A major chord)
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, now + 0.05);
      osc.frequency.linearRampToValueAtTime(f * 1.01, now + 1.2);

      // Lowpass filter for warm cinematic tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2500, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(200, now + 1.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25 / freqs.length, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.05);
      osc.stop(now + 1.7);
    });

    // High shimmer / metallic ring at the end
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(1244.5, now + 0.18); // D#6 / high resonant bell tone
    shimmerGain.gain.setValueAtTime(0.08, now + 0.18);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.start(now + 0.18);
    shimmer.stop(now + 1.9);

  } catch (err) {
    console.debug('Audio autoplay blocked or unsupported:', err);
  }
}
