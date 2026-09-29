/**
 * Floating Luxury Music Controller — background soundtrack with an EQ bar
 * visualizer. Autoplay is only ever triggered from a real user gesture
 * (the door-tap), never on mount, so browser autoplay restrictions are
 * respected. Falls back to a synthesized Web Audio ambience if the HTML5
 * audio source is unavailable/blocked.
 */

const MusicButton = React.forwardRef(function MusicButton({ music }, ref) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const synthRef = React.useRef({ ctx: null, gain: null, interval: null });

  function startRoyalSynthAmbience() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const s = synthRef.current;
      if (!s.ctx) s.ctx = new AudioCtx();
      if (s.ctx.state === 'suspended') s.ctx.resume();

      s.gain = s.ctx.createGain();
      s.gain.gain.setValueAtTime(0.001, s.ctx.currentTime);
      s.gain.gain.exponentialRampToValueAtTime(0.08, s.ctx.currentTime + 2.0);
      s.gain.connect(s.ctx.destination);

      const droneNotes = [130.81, 196.0, 261.63];
      droneNotes.forEach((freq) => {
        const osc = s.ctx.createOscillator();
        const noteGain = s.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, s.ctx.currentTime);
        const filter = s.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, s.ctx.currentTime);
        noteGain.gain.setValueAtTime(0.03, s.ctx.currentTime);
        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(s.gain);
        osc.start();
      });

      const yamanScale = [261.63, 293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 523.25];
      let step = 0;
      s.interval = setInterval(() => {
        if (!s.ctx) return;
        const noteFreq = yamanScale[step % yamanScale.length];
        step = (step + Math.floor(Math.random() * 3) + 1) % yamanScale.length;

        const sitarOsc = s.ctx.createOscillator();
        const sitarGain = s.ctx.createGain();
        sitarOsc.type = 'sine';
        sitarOsc.frequency.setValueAtTime(noteFreq, s.ctx.currentTime);
        sitarGain.gain.setValueAtTime(0.001, s.ctx.currentTime);
        sitarGain.gain.exponentialRampToValueAtTime(0.05, s.ctx.currentTime + 0.08);
        sitarGain.gain.exponentialRampToValueAtTime(0.0001, s.ctx.currentTime + 1.8);
        sitarOsc.connect(sitarGain);
        sitarGain.connect(s.gain);
        sitarOsc.start(s.ctx.currentTime);
        sitarOsc.stop(s.ctx.currentTime + 1.9);
      }, 1600);
    } catch (e) {
      /* Audio autoplay policy fallback — silently ignore. */
    }
  }

  function stopRoyalSynthAmbience() {
    const s = synthRef.current;
    if (s.interval) {
      clearInterval(s.interval);
      s.interval = null;
    }
    if (s.gain && s.ctx) {
      try {
        s.gain.gain.exponentialRampToValueAtTime(0.0001, s.ctx.currentTime + 0.6);
      } catch (e) {
        /* noop */
      }
    }
  }

  function playMusic() {
    setPlaying(true);
    const audioEl = audioRef.current;
    const hasRealSrc = audioEl && !!audioEl.getAttribute('src');
    if (hasRealSrc) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => startRoyalSynthAmbience());
      }
    } else {
      startRoyalSynthAmbience();
    }
  }

  function pauseMusic() {
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    stopRoyalSynthAmbience();
  }

  function toggleMusic() {
    if (playing) pauseMusic();
    else playMusic();
  }

  React.useImperativeHandle(ref, () => ({
    startAutoplay() {
      if (!playing) playMusic();
    }
  }));

  React.useEffect(() => () => stopRoyalSynthAmbience(), []);

  if (!music || music.enabled === false) return null;

  return (
    <React.Fragment>
      <button
        id="floating-music-btn"
        className={`floating-music-btn${playing ? ' music-playing' : ''}`}
        type="button"
        aria-label="Toggle Background Music"
        onClick={toggleMusic}
      >
        <span className="music-status-dot" aria-hidden="true"></span>
        <span id="music-btn-text">{playing ? 'Playing' : 'Music'}</span>
      </button>
      {/*
        NOTE: `music.source` in data.js points at an audio file that is not
        bundled with this project (no ./assets/audio directory exists), so —
        exactly like the original vanilla implementation — we intentionally
        leave the <audio> element without a `src`. `playMusic()` detects the
        missing/empty source and gracefully falls back to the synthesized
        Web Audio ambience instead of triggering a failed network request.
      */}
      <audio ref={audioRef} id="wedding-audio" preload="none" loop={music.loop} />
    </React.Fragment>
  );
});
