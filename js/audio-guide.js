/**
 * Outscape - Hands-Free Audio Engine
 * Provides speech synthesis, ambient nature audio synthesis, and sound chimes.
 */

export class OutscapeAudioGuide {
  constructor() {
    this.synth = window.speechSynthesis;
    this.audioCtx = null;
    this.isSpeaking = false;
    this.isMuted = false;
    this.currentUtterance = null;
    this.playbackRate = 0.95; // Slightly slower, relaxing pace
    this.pitch = 1.0;
    this.voice = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
    this.listeners = new Set();

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const updateVoices = () => {
      const voices = this.synth.getVoices();
      // Prefer calm English natural voice
      this.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Google'))) 
                   || voices.find(v => v.lang.startsWith('en')) 
                   || voices[0];
    };

    updateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices;
    }
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Synthesize a gentle outdoor chime using Web Audio API (zero external assets needed)
   */
  playChime() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx || this.isMuted) return;

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      // Pentatonic warm chime: E5 (659Hz) and B5 (987Hz)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.6);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, now + 0.08);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (err) {
      console.warn('Audio chime note error:', err);
    }
  }

  /**
   * Speak narration text through Web Speech API
   */
  speak(text, onComplete = null) {
    if (!this.synth || this.isMuted || !text) {
      if (onComplete) onComplete();
      return;
    }

    this.stop();
    this.playChime();

    // Small delay so chime completes before speech
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) utterance.voice = this.voice;
        utterance.rate = this.playbackRate;
        utterance.pitch = this.pitch;

        utterance.onstart = () => {
          this.isSpeaking = true;
          this.currentUtterance = utterance;
          this.notify({ type: 'speech-start', text });
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          this.notify({ type: 'speech-end' });
          if (onComplete) onComplete();
        };

        utterance.onerror = (e) => {
          console.warn('Speech error:', e);
          this.isSpeaking = false;
          this.currentUtterance = null;
          this.notify({ type: 'speech-end' });
          if (onComplete) onComplete();
        };

        this.synth.speak(utterance);
      } catch (err) {
        console.error('Speech synthesis failure:', err);
        this.isSpeaking = false;
        if (onComplete) onComplete();
      }
    }, 450);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.notify({ type: 'speech-end' });
  }

  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  setRate(rate) {
    this.playbackRate = Math.max(0.7, Math.min(1.5, rate));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stop();
    this.notify({ type: 'mute-toggled', isMuted: this.isMuted });
    return this.isMuted;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('AudioGuide listener error:', err);
      }
    }
  }
}
