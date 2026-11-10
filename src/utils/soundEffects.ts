/**
 * Web Audio API synthesizer for sound effects & "Young, Wild & Free" (Wiz Khalifa & Snoop Dogg).
 * 100% lightweight, zero external MP3 downloads, safe for iOS/Android mobile browsers.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;
  private activeOscillators: OscillatorNode[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
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

  /** Wax seal crack sound */
  public playSealBreak() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(320, now);
      snapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      snapGain.gain.setValueAtTime(0.35, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.15);

      const chimeFreqs = [523.25, 659.25, 783.99, 1046.5];
      chimeFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.03);
        gain.gain.setValueAtTime(0.08 / (idx + 1), now + 0.05 + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7 + idx * 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.05 + idx * 0.03);
        osc.stop(now + 0.85);
      });
    } catch {
      // Audio fallback protection
    }
  }

  private unrollBuffer: AudioBuffer | null = null;

  /** Tactile parchment unroll flutter (cached for 0ms lag on scroll) */
  public playUnrollSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (!this.unrollBuffer) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.4);
        this.unrollBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = this.unrollBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          const t = i / ctx.sampleRate;
          const envelope = Math.sin((t / 0.4) * Math.PI) * (0.8 + 0.2 * Math.sin(t * 18));
          data[i] = (Math.random() * 2 - 1) * envelope;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = this.unrollBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(1000, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.38);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.39);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // Silent catch
    }
  }

  /** Celebratory fanfare */
  public playFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const chords = [
        { notes: [523.25, 659.25, 783.99], time: 0, dur: 0.25 },
        { notes: [587.33, 739.99, 880.00], time: 0.2, dur: 0.25 },
        { notes: [659.25, 783.99, 1046.50], time: 0.4, dur: 0.35 },
        { notes: [783.99, 987.77, 1174.66, 1567.98], time: 0.7, dur: 1.1 },
      ];

      const now = ctx.currentTime;

      chords.forEach(({ notes, time, dur }) => {
        notes.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(0.07, now + time);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
      });
    } catch {
      // Silent catch
    }
  }

  /** Toggle background music */
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

  /**
   * Synthesizes "Young, Wild & Free" (Wiz Khalifa & Snoop Dogg ft. Bruno Mars)
   * Iconic upbeat piano riff & chorus hook in G Major (95 BPM)
   */
  public startAmbientMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}

    this.isMusicPlaying = true;

    // Frequencies (G Major)
    // G2=98, B2=123.47, C3=130.81, D3=146.83
    // G3=196, A3=220, B3=246.94, C4=261.63, D4=293.66, E4=329.63, F#4=369.99, G4=392, A4=440, B4=493.88
    const notes = {
      G2: 98.00,
      B2: 123.47,
      C3: 130.81,
      D3: 146.83,
      G3: 196.00,
      A3: 220.00,
      B3: 246.94,
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      Fs4: 369.99,
      G4: 392.00,
      A4: 440.00,
      B4: 493.88,
    };

    // 16-step rhythmic pattern (4 beats per bar, 4 bars = 1 complete chorus loop)
    // G -> Bm -> C -> D
    const songSteps: {
      chord: number[];
      bass: number;
      lead?: number;
      hihat?: boolean;
    }[] = [
      // Bar 1: G Major - "So what we get drunk"
      { chord: [notes.G3, notes.B3, notes.D4, notes.G4], bass: notes.G2, lead: notes.D4, hihat: true },
      { chord: [notes.B3, notes.D4, notes.G4], bass: notes.G2, lead: notes.D4 },
      { chord: [notes.G3, notes.B3, notes.D4], bass: notes.G2, lead: notes.B3, hihat: true },
      { chord: [notes.B3, notes.D4, notes.G4], bass: notes.G2, lead: notes.G3 },

      // Bar 2: B Minor - "So what we smoke weed"
      { chord: [notes.B3, notes.D4, notes.Fs4], bass: notes.B2, lead: notes.D4, hihat: true },
      { chord: [notes.D4, notes.Fs4, notes.B4], bass: notes.B2, lead: notes.D4 },
      { chord: [notes.B3, notes.D4, notes.Fs4], bass: notes.B2, lead: notes.B3, hihat: true },
      { chord: [notes.D4, notes.Fs4, notes.B4], bass: notes.B2, lead: notes.G3 },

      // Bar 3: C Major - "We're just having fun, we don't care who sees"
      { chord: [notes.C4, notes.E4, notes.G4], bass: notes.C3, lead: notes.D4, hihat: true },
      { chord: [notes.E4, notes.G4, notes.C4], bass: notes.C3, lead: notes.E4 },
      { chord: [notes.C4, notes.E4, notes.G4], bass: notes.C3, lead: notes.D4, hihat: true },
      { chord: [notes.E4, notes.G4, notes.C4], bass: notes.C3, lead: notes.B3 },

      // Bar 4: D Major - "Living young and wild and free"
      { chord: [notes.D4, notes.Fs4, notes.A4], bass: notes.D3, lead: notes.G3, hihat: true },
      { chord: [notes.Fs4, notes.A4, notes.D4], bass: notes.D3, lead: notes.A3 },
      { chord: [notes.D4, notes.Fs4, notes.A4], bass: notes.D3, lead: notes.B3, hihat: true },
      { chord: [notes.G3, notes.B3, notes.D4, notes.G4], bass: notes.G2, lead: notes.G3 },
    ];

    let currentStep = 0;

    const playStep = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const step = songSteps[currentStep];

        // 1. Warm Bass Note (smooth sine wave with punch)
        if (step.bass) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(step.bass, now);
          bassGain.gain.setValueAtTime(0.08, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + 0.35);
        }

        // 2. Upbeat Piano Chords (Young, Wild & Free bouncy Rhodes style)
        if (step.chord) {
          step.chord.forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.035, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(now);
            osc.stop(now + 0.3);
          });
        }

        // 3. Lead Vocal Hook Melody ("Young, Wild and Free")
        if (step.lead) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'sine';
          leadOsc.frequency.setValueAtTime(step.lead, now);
          leadGain.gain.setValueAtTime(0.07, now);
          leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
          leadOsc.connect(leadGain);
          leadGain.connect(this.ctx.destination);
          leadOsc.start(now);
          leadOsc.stop(now + 0.36);
        }

        // 4. Subtle rhythmic acoustic hi-hat click
        if (step.hihat) {
          const noiseOsc = this.ctx.createOscillator();
          const noiseGain = this.ctx.createGain();
          noiseOsc.type = 'triangle';
          noiseOsc.frequency.setValueAtTime(8000, now);
          noiseOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
          noiseGain.gain.setValueAtTime(0.015, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
          noiseOsc.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);
          noiseOsc.start(now);
          noiseOsc.stop(now + 0.05);
        }

        currentStep = (currentStep + 1) % songSteps.length;
      } catch {
        // Safe execution
      }
    };

    // ~95 BPM (beat is ~630ms, 8th note step is ~315ms)
    playStep();
    this.musicInterval = window.setInterval(playStep, 315);
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
  }
}

export const sound = new SoundController();
