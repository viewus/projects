/**
 * Royal Wedding Ambient Soundtrack & Web Audio Synthesizer
 * Plays high-quality audio or synthesizes a peaceful royal Indian sitar/flute ambience seamlessly.
 */

(function () {
  'use strict';

  let isPlaying = false;
  let audioEl = null;
  let musicToggleBtn = null;
  let synthContext = null;
  let synthGain = null;
  let synthInterval = null;

  function initMusic() {
    audioEl = document.getElementById('wedding-audio');
    musicToggleBtn = document.getElementById('floating-music-btn') || document.getElementById('music-toggle');

    if (!musicToggleBtn) return;

    // Read audio path from weddingData
    if (window.weddingData && window.weddingData.audio && window.weddingData.audio.src) {
      if (audioEl) {
        audioEl.src = window.weddingData.audio.src;
        audioEl.loop = true;
        audioEl.volume = 0.45;
      }
    }

    musicToggleBtn.addEventListener('click', toggleMusic);
  }

  function startAutoplay() {
    if (isPlaying) return;
    playMusic();
  }

  function toggleMusic() {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  function playMusic() {
    isPlaying = true;
    if (musicToggleBtn) {
      musicToggleBtn.classList.remove('paused');
      musicToggleBtn.classList.add('playing');
    }

    if (audioEl && audioEl.src && !audioEl.src.endsWith('/')) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If HTML5 audio fails, fall back to Web Audio royal drone
          startRoyalSynthAmbience();
        });
      }
    } else {
      startRoyalSynthAmbience();
    }
  }

  function pauseMusic() {
    isPlaying = false;
    if (musicToggleBtn) {
      musicToggleBtn.classList.remove('playing');
      musicToggleBtn.classList.add('paused');
    }

    if (audioEl) {
      audioEl.pause();
    }
    stopRoyalSynthAmbience();
  }

  function startRoyalSynthAmbience() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!synthContext) {
        synthContext = new AudioCtx();
      }
      if (synthContext.state === 'suspended') {
        synthContext.resume();
      }

      synthGain = synthContext.createGain();
      synthGain.gain.setValueAtTime(0.001, synthContext.currentTime);
      synthGain.gain.exponentialRampToValueAtTime(0.08, synthContext.currentTime + 2.0);
      synthGain.connect(synthContext.destination);

      // Warm Tanpura Drone (Sa - Pa harmonic tuning: C3, G3, C4)
      const droneNotes = [130.81, 196.00, 261.63];
      droneNotes.forEach(freq => {
        const osc = synthContext.createOscillator();
        const noteGain = synthContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, synthContext.currentTime);

        // Low pass filter for warm organic resonance
        const filter = synthContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, synthContext.currentTime);

        noteGain.gain.setValueAtTime(0.03, synthContext.currentTime);
        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(synthGain);
        osc.start();
      });

      // Gentle Sitar Melody Plucking (Raag Yaman scale notes)
      const yamanScale = [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25];
      let step = 0;
      synthInterval = setInterval(() => {
        if (!isPlaying || !synthContext) return;
        
        const noteFreq = yamanScale[step % yamanScale.length];
        step = (step + Math.floor(Math.random() * 3) + 1) % yamanScale.length;

        const sitarOsc = synthContext.createOscillator();
        const sitarGain = synthContext.createGain();
        sitarOsc.type = 'sine';
        sitarOsc.frequency.setValueAtTime(noteFreq, synthContext.currentTime);

        sitarGain.gain.setValueAtTime(0.001, synthContext.currentTime);
        sitarGain.gain.exponentialRampToValueAtTime(0.05, synthContext.currentTime + 0.08);
        sitarGain.gain.exponentialRampToValueAtTime(0.0001, synthContext.currentTime + 1.8);

        sitarOsc.connect(sitarGain);
        sitarGain.connect(synthGain);

        sitarOsc.start(synthContext.currentTime);
        sitarOsc.stop(synthContext.currentTime + 1.9);
      }, 1600);

    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function stopRoyalSynthAmbience() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    if (synthGain && synthContext) {
      try {
        synthGain.gain.exponentialRampToValueAtTime(0.0001, synthContext.currentTime + 0.6);
      } catch (e) {}
    }
  }

  window.WeddingMusic = {
    init: initMusic,
    startAutoplay: startAutoplay,
    toggle: toggleMusic
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusic);
  } else {
    initMusic();
  }
})();
