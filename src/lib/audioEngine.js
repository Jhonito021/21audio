export class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';

    this.audioCtx = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.eqFilters = [];
    this.gainNode = null;

    this.isPlaying = false;
    this.isLoading = false;
    this.currentTrack = null;
    this.listeners = null;

    this.equalizerGains = [0, 0, 0, 0, 0]; // 5 frequencies: 60Hz, 230Hz, 910Hz, 4kHz, 14kHz
    this.isAudioCtxConnected = false;

    this.setupAudioEvents();
  }

  setListeners(listeners) {
    this.listeners = listeners;
  }

  setupAudioEvents() {
    this.audio.addEventListener('timeupdate', () => {
      if (this.listeners) {
        this.listeners.onTimeUpdate(
          this.audio.currentTime || 0,
          this.audio.duration || 0
        );
      }
    });

    this.audio.addEventListener('loadstart', () => {
      this.isLoading = true;
      this.notifyState();
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading = false;
      this.notifyState();
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyState();
      this.updateMediaSessionState('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyState();
      this.updateMediaSessionState('paused');
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyState();
      if (this.listeners) {
        this.listeners.onEnded();
      }
    });

    this.audio.addEventListener('error', (e) => {
      this.isLoading = false;
      this.isPlaying = false;
      this.notifyState();
      console.warn('Audio playback error:', e, this.audio.error);
      if (this.listeners) {
        this.listeners.onError(
          "Impossible de lire cette piste. Vérifiez l'URL ou la connexion du flux."
        );
      }
    });
  }

  notifyState() {
    if (this.listeners) {
      this.listeners.onStateChange(this.isPlaying, this.isLoading);
    }
  }

  /**
   * Initializes Web Audio API nodes for EQ and Visualizer
   */
  initWebAudio() {
    if (this.isAudioCtxConnected) return;

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();

      // 5 Band EQ frequencies
      const frequencies = [60, 230, 910, 4000, 14000];
      this.eqFilters = frequencies.map((freq, index) => {
        const filter = this.audioCtx.createBiquadFilter();
        if (index === 0) filter.type = 'lowshelf';
        else if (index === frequencies.length - 1) filter.type = 'highshelf';
        else filter.type = 'peaking';

        filter.frequency.value = freq;
        filter.gain.value = this.equalizerGains[index] || 0;
        return filter;
      });

      // Connect source -> EQ1 -> EQ2 -> EQ3 -> EQ4 -> EQ5 -> Analyser -> Gain -> Destination
      let currentNode = this.sourceNode;
      for (const filter of this.eqFilters) {
        currentNode.connect(filter);
        currentNode = filter;
      }

      currentNode.connect(this.analyserNode);
      this.analyserNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.isAudioCtxConnected = true;
    } catch (err) {
      console.warn('Web Audio API init warning (CORS or audio unlock required):', err);
    }
  }

  async loadAndPlay(track) {
    this.currentTrack = track;
    this.audio.src = track.src;
    this.audio.load();

    this.updateMediaSessionMetadata(track);

    try {
      this.initWebAudio();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      await this.audio.play();
    } catch (err) {
      console.warn('Auto-play play() promise rejected:', err);
    }
  }

  play() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.audio.play().catch(console.warn);
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seek(seconds) {
    if (this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration));
    }
  }

  seekBy(deltaSeconds) {
    this.seek(this.audio.currentTime + deltaSeconds);
  }

  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  setPlaybackRate(rate) {
    this.audio.playbackRate = rate;
  }

  setEqualizer(gains) {
    this.equalizerGains = gains;
    if (this.eqFilters.length === gains.length) {
      this.eqFilters.forEach((filter, i) => {
        filter.gain.setTargetAtTime(gains[i], this.audioCtx?.currentTime || 0, 0.05);
      });
    }
  }

  getAnalyserData() {
    if (!this.analyserNode) return null;
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getCurrentTime() {
    return this.audio.currentTime || 0;
  }

  getDuration() {
    return this.audio.duration || 0;
  }

  // MediaSession API setup for background controls, lockscreen & system notifications
  updateMediaSessionMetadata(track) {
    if (!('mediaSession' in navigator)) return;

    const artwork = track.coverUrl
      ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/png' }]
      : [
          {
            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || '21audio',
      artwork,
    });
  }

  setMediaSessionActionHandlers(actions) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', actions.onPlay);
      navigator.mediaSession.setActionHandler('pause', actions.onPause);
      navigator.mediaSession.setActionHandler('previoustrack', actions.onPrev);
      navigator.mediaSession.setActionHandler('nexttrack', actions.onNext);
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        this.seekBy(-10);
        actions.onSeekBackward();
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        this.seekBy(10);
        actions.onSeekForward();
      });
    } catch (e) {
      console.warn('MediaSession handler setup issue:', e);
    }
  }

  updateMediaSessionState(state) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }
}
