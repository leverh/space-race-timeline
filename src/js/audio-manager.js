import { Utils } from './utils.js';

export class AudioManager {
  constructor() {
    this.isInitialized = false;
    this.isMuted = false;
    this.masterVolume = 0.7;
    this.currentAmbient = null;
    this.currentSection = 'hero';
    
    // Audio sources
    this.audioSources = {
      ambient: {
        space: null,
        earth: null,
        moon: null
      },
      effects: {
        rocketLaunch: null,
        satelliteBeep: null,
        spaceStatic: null,
        moonLanding: null,
        countdown: null,
        heartbeat: null
      },
      speech: {
        jfkSpeech: null,
        armstrongWords: null,
        missionControl: null
      }
    };
    
    // Audio contexts and nodes
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    
    this.init();
  }
  
  async init() {
    console.log('🔊 Initializing Audio Manager...');
    
    try {
      await this.initWebAudio();
      
      await this.loadAudioSources();

      this.setupAudioRouting();
      
      this.loadUserPreferences();
      
      this.isInitialized = true;
      console.log('✅ Audio Manager initialized');
      
    } catch (error) {
      console.warn('⚠️ Audio initialization failed:', error);
      this.isInitialized = false;
    }
  }
  
  async initWebAudio() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      throw new Error('Web Audio API not supported');
    }

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.masterVolume;

    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);

    document.addEventListener('click', () => {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }, { once: true });
  }
  
  async loadAudioSources() {
    // placeholder audio objects
    
    const audioFiles = {
      'sounds/space-ambient.mp3': 'ambient.space',
      'sounds/earth-ambient.mp3': 'ambient.earth',
      'sounds/moon-ambient.mp3': 'ambient.moon',
      'sounds/rocket-launch.mp3': 'effects.rocketLaunch',
      'sounds/satellite-beep.mp3': 'effects.satelliteBeep',
      'sounds/space-static.mp3': 'effects.spaceStatic',
      'sounds/moon-landing.mp3': 'effects.moonLanding',
      'sounds/countdown.mp3': 'effects.countdown',
      'sounds/heartbeat.mp3': 'effects.heartbeat',
      'sounds/jfk-speech.mp3': 'speech.jfkSpeech',
      'sounds/armstrong-words.mp3': 'speech.armstrongWords',
      'sounds/mission-control.mp3': 'speech.missionControl'
    };
    
    const loadPromises = Object.entries(audioFiles).map(async ([path, objPath]) => {
      try {
        // laceholder audio with Web Audio API
        const audio = this.createPlaceholderAudio(path);
        this.setNestedProperty(this.audioSources, objPath, audio);
      } catch (error) {
        console.warn(`Failed to load audio: ${path}`, error);
      }
    });
    
    await Promise.all(loadPromises);
  }
  
  createPlaceholderAudio(path) {
    // placeholder audio using Web Audio API oscillators
    const audioData = {
      path,
      gainNode: this.audioContext.createGain(),
      source: null,
      isPlaying: false,
      loop: path.includes('ambient'),
      volume: path.includes('ambient') ? 0.3 : 0.7
    };
    
    audioData.gainNode.connect(this.masterGain);
    audioData.gainNode.gain.value = 0;
    
    return audioData;
  }
  
  setupAudioRouting() {
    Object.values(this.audioSources.ambient).forEach(audio => {
      if (audio) audio.gainNode.gain.value = 0.2;
    });
    
    Object.values(this.audioSources.effects).forEach(audio => {
      if (audio) audio.gainNode.gain.value = 0.5;
    });
    
    Object.values(this.audioSources.speech).forEach(audio => {
      if (audio) audio.gainNode.gain.value = 0.8;
    });
  }
  
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  
  loadUserPreferences() {
    const savedVolume = Utils.storage.get('spacerace_master_volume');
    const savedMuted = Utils.storage.get('spacerace_audio_muted');
    
    if (savedVolume !== null) {
      this.setMasterVolume(savedVolume);
    }
    
    if (savedMuted !== null) {
      this.isMuted = savedMuted;
      if (this.isMuted) {
        this.masterGain.gain.value = 0;
      }
    }
  }
  
  saveUserPreferences() {
    Utils.storage.set('spacerace_master_volume', this.masterVolume);
    Utils.storage.set('spacerace_audio_muted', this.isMuted);
  }
  
  // Public methods
  
  playSegmentAudio(sectionId) {
    if (!this.isInitialized || this.isMuted) return;
    
    console.log(`🔊 Playing audio for section: ${sectionId}`);
    
    switch(sectionId) {
      case 'hero':
        this.playEffect('rocketLaunch', { volume: 0.4, delay: 1 });
        break;
      case 'sputnik':
        this.playEffect('satelliteBeep', { volume: 0.6, repeat: 3, interval: 1 });
        break;
      case 'gagarin':
        this.playEffect('heartbeat', { volume: 0.3, duration: 5 });
        break;
      case 'jfk':
        this.playSegment('jfkSpeech', { volume: 0.7 });
        break;
      case 'spacewalk':
        this.playEffect('spaceStatic', { volume: 0.2, duration: 3 });
        break;
      case 'apollo':
        this.playEffect('countdown', { volume: 0.8 });
        this.playEffect('rocketLaunch', { volume: 0.6, delay: 5 });
        break;
      case 'moon-landing':
        this.playEffect('moonLanding', { volume: 0.8 });
        this.playSegment('armstrongWords', { volume: 0.9, delay: 2 });
        break;
    }
  }
  
  playSegmentTransition(sectionId) {
    if (!this.isInitialized || this.isMuted) return;
    
    this.playEffect('spaceStatic', { volume: 0.1, duration: 0.5 });
  }
  
  updateAmbientAudio(sectionId) {
    if (!this.isInitialized || this.isMuted) return;
    
    this.currentSection = sectionId;

    let targetAmbient = null;
    
    switch(sectionId) {
      case 'hero':
      case 'apollo':
        targetAmbient = 'space';
        break;
      case 'sputnik':
      case 'gagarin':
      case 'spacewalk':
        targetAmbient = 'earth';
        break;
      case 'jfk':
      case 'moon-landing':
        targetAmbient = 'moon';
        break;
      default:
        targetAmbient = 'space';
    }

    this.transitionAmbient(targetAmbient);
  }
  
  transitionAmbient(newAmbientType) {
    if (this.currentAmbient === newAmbientType) return;
    
    const newAmbient = this.audioSources.ambient[newAmbientType];
    if (!newAmbient) return;

    if (this.currentAmbient) {
      const currentAudio = this.audioSources.ambient[this.currentAmbient];
      if (currentAudio && currentAudio.isPlaying) {
        this.fadeOut(currentAudio, 2).then(() => {
          this.stopAudio(currentAudio);
        });
      }
    }

    this.currentAmbient = newAmbientType;
    this.playAmbient(newAmbient);
  }
  
  playAmbient(audioData) {
    if (!audioData || audioData.isPlaying) return;
    
    this.playAudio(audioData, {
      loop: true,
      volume: 0.2,
      fadeIn: 3
    });
  }
  
  playEffect(effectName, options = {}) {
    const audio = this.audioSources.effects[effectName];
    if (!audio) return;
    
    const defaultOptions = {
      volume: 0.5,
      delay: 0,
      repeat: 1,
      interval: 0,
      duration: null
    };
    
    const opts = { ...defaultOptions, ...options };

    setTimeout(() => {
      for (let i = 0; i < opts.repeat; i++) {
        setTimeout(() => {
          this.playAudio(audio, {
            volume: opts.volume,
            duration: opts.duration
          });
        }, i * opts.interval * 1000);
      }
    }, opts.delay * 1000);
  }
  
  playSegment(segmentName, options = {}) {
    const audio = this.audioSources.speech[segmentName];
    if (!audio) return;
    
    const defaultOptions = {
      volume: 0.8,
      delay: 0
    };
    
    const opts = { ...defaultOptions, ...options };
    
    setTimeout(() => {
      this.playAudio(audio, {
        volume: opts.volume
      });
    }, opts.delay * 1000);
  }
  
  playAudio(audioData, options = {}) {
    if (!audioData || !this.audioContext) return;
    
    const defaultOptions = {
      volume: audioData.volume || 0.5,
      loop: audioData.loop || false,
      fadeIn: 0,
      duration: null
    };
    
    const opts = { ...defaultOptions, ...options };

    this.stopAudio(audioData);

    audioData.source = this.createPlaceholderOscillator(audioData.path);

    audioData.gainNode.gain.value = opts.fadeIn > 0 ? 0 : opts.volume;

    audioData.source.connect(audioData.gainNode);
    audioData.source.start();
    audioData.isPlaying = true;

    if (opts.fadeIn > 0) {
      this.fadeIn(audioData, opts.fadeIn, opts.volume);
    }

    audioData.source.loop = opts.loop;

    if (opts.duration) {
      setTimeout(() => {
        this.stopAudio(audioData);
      }, opts.duration * 1000);
    }

    audioData.source.onended = () => {
      audioData.isPlaying = false;
      audioData.source = null;
    };
  }
  
  createPlaceholderOscillator(path) {
    const oscillator = this.audioContext.createOscillator();
    
    if (path.includes('ambient')) {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
    } else if (path.includes('beep')) {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    } else if (path.includes('rocket')) {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime);
    } else if (path.includes('static')) {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    } else {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    }
    
    return oscillator;
  }
  
  stopAudio(audioData) {
    if (audioData && audioData.source && audioData.isPlaying) {
      try {
        audioData.source.stop();
      } catch (error) {
      }
      audioData.isPlaying = false;
      audioData.source = null;
    }
  }
  
  fadeIn(audioData, duration, targetVolume = 0.5) {
    if (!audioData || !this.audioContext) return Promise.resolve();
    
    return new Promise(resolve => {
      const startTime = this.audioContext.currentTime;
      audioData.gainNode.gain.setValueAtTime(0, startTime);
      audioData.gainNode.gain.linearRampToValueAtTime(targetVolume, startTime + duration);
      
      setTimeout(resolve, duration * 1000);
    });
  }
  
  fadeOut(audioData, duration) {
    if (!audioData || !this.audioContext) return Promise.resolve();
    
    return new Promise(resolve => {
      const startTime = this.audioContext.currentTime;
      const currentVolume = audioData.gainNode.gain.value;
      audioData.gainNode.gain.setValueAtTime(currentVolume, startTime);
      audioData.gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      setTimeout(resolve, duration * 1000);
    });
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(
        this.masterVolume,
        this.audioContext.currentTime
      );
    }
    this.saveUserPreferences();
  }
  
  getMasterVolume() {
    return this.masterVolume;
  }
  
  mute() {
    this.isMuted = true;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    }
    this.saveUserPreferences();
    console.log('🔇 Audio muted');
  }
  
  unmute() {
    this.isMuted = false;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.masterVolume,
        this.audioContext.currentTime
      );
    }
    this.saveUserPreferences();
    console.log('🔊 Audio unmuted');
  }
  
  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }
  
  pause() {
    Object.values(this.audioSources.ambient).forEach(audio => {
      if (audio && audio.isPlaying) {
        this.fadeOut(audio, 1).then(() => this.stopAudio(audio));
      }
    });
  }
  
  resume() {
    if (this.currentAmbient && !this.isMuted) {
      const ambient = this.audioSources.ambient[this.currentAmbient];
      if (ambient && !ambient.isPlaying) {
        this.playAmbient(ambient);
      }
    }
  }
  
  stop() {
    Object.values(this.audioSources).forEach(category => {
      Object.values(category).forEach(audio => {
        if (audio) this.stopAudio(audio);
      });
    });
    this.currentAmbient = null;
  }
  
  playCountdown() {
    if (!this.isInitialized || this.isMuted) return;
    
    const numbers = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0'];
    numbers.forEach((number, index) => {
      setTimeout(() => {
        this.playEffect('countdown', { volume: 0.8 });
        console.log(`Countdown: ${number}`);
      }, index * 1000);
    });
  }
  
  playHeartbeat(duration = 10) {
    if (!this.isInitialized || this.isMuted) return;
    
    const interval = setInterval(() => {
      this.playEffect('heartbeat', { volume: 0.3 });
    }, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
    }, duration * 1000);
  }
  
  playRadioStatic(duration = 5) {
    if (!this.isInitialized || this.isMuted) return;
    
    this.playEffect('spaceStatic', { 
      volume: 0.2, 
      duration: duration 
    });
  }
  
  // Audio analysis
  
  createAnalyser() {
    if (!this.audioContext) return null;
    
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    this.masterGain.connect(analyser);
    
    return analyser;
  }
  
  getFrequencyData(analyser) {
    if (!analyser) return null;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
  
  // Cleanup
  
  dispose() {
    console.log('🔊 Disposing Audio Manager...');

    this.stop();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.audioSources = null;
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    
    console.log('✅ Audio Manager disposed');
  }
}