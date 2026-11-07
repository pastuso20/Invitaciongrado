/**
 * Web Audio API synthesizer for sound effects & classical background ambient melody.
 * Works seamlessly in all modern browsers with zero external audio assets.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /** Wax seal crack and ribbon snap */
  public playSealBreak() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Wax click/snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(320, now);
    snapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    snapGain.gain.setValueAtTime(0.4, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.16);

    // Subtle golden chime resonance
    const chimeFreqs = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
    chimeFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.04);
      gain.gain.setValueAtTime(0.12 / (idx + 1), now + 0.05 + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.05 + idx * 0.04);
      osc.stop(now + 1.0);
    });
  }

  /** Parchment scroll unroll flutter (rich tactile paper rustle accompanying the visible unroll) */
  public playUnrollSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 2.2);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Multi-layered paper texture noise
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Envelope that rises, sustains with paper flutter, and tapers
      const envelope = Math.sin((t / 2.2) * Math.PI) * (0.85 + 0.15 * Math.sin(t * 18));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(600, now + 2.1);
    filter.Q.setValueAtTime(1.6, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.14, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  /** Celebratory classical fanfare chime for RSVP and diploma opening */
  public playFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      { notes: [523.25, 659.25, 783.99], time: 0, dur: 0.3 },        // C major
      { notes: [587.33, 739.99, 880.00], time: 0.25, dur: 0.3 },     // D major
      { notes: [659.25, 783.99, 1046.50], time: 0.5, dur: 0.4 },     // E minor / high
      { notes: [783.99, 987.77, 1174.66, 1567.98], time: 0.85, dur: 1.4 }, // G/C grand climax
    ];

    const now = ctx.currentTime;

    chords.forEach(({ notes, time, dur }) => {
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.08, now + time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    });
  }

  /** Ambient royal/classical gentle harp arpeggio loop */
  public toggleAmbientMusic(onStateChange?: (playing: boolean) => void) {
    if (this.isMusicPlaying) {
      this.stopAmbientMusic();
      if (onStateChange) onStateChange(false);
      return false;
    } else {
      this.startAmbientMusic();
      if (onStateChange) onStateChange(true);
      return true;
    }
  }

  public startAmbientMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMusicPlaying = true;

    // Peaceful classical chord progressions (Pachelbel / Graduation celebration tone)
    const progressions = [
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 392.00], // G
      [220.00, 261.63, 329.63, 440.00], // Am
      [174.61, 220.00, 261.63, 349.23], // F
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 392.00], // G
      [174.61, 220.00, 261.63, 349.23], // F
      [196.00, 246.94, 293.66, 392.00], // G
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    const playNextHarpNote = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const currentChord = progressions[chordIdx];
      const noteFreq = currentChord[noteIdx];

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);

      noteIdx++;
      if (noteIdx >= currentChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % progressions.length;
      }
    };

    playNextHarpNote();
    this.musicInterval = window.setInterval(playNextHarpNote, 420);
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundController();
