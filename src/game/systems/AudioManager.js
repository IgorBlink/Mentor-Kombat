import { Howl, Howler } from 'howler';

export default class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.masterVolume = 0.7;
    this.soundVolume = 0.8;
    this.musicVolume = 0.5;
    
    // Initialize Howler settings
    Howler.volume(this.masterVolume);
  }

  async loadSounds() {
    // For now, create placeholder sounds using Web Audio API
    // In a real game, you would load actual audio files
    
    this.createPlaceholderSounds();
    
    return Promise.resolve();
  }

  createPlaceholderSounds() {
    // Create simple synthesized sounds for the MVP
    this.sounds = {
      hit: this.createSynthSound('hit'),
      block: this.createSynthSound('block'),
      attack: this.createSynthSound('attack'),
      jump: this.createSynthSound('jump'),
      victory: this.createSynthSound('victory'),
      menuSelect: this.createSynthSound('menuSelect'),
      menuHover: this.createSynthSound('menuHover')
    };

    // Background music placeholder
    this.music = this.createBackgroundMusic();
  }

  createSynthSound(type) {
    // Create a simple synthesized sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const createSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      let frequency, duration;
      
      switch (type) {
        case 'hit':
          frequency = 200;
          duration = 0.1;
          break;
        case 'block':
          frequency = 400;
          duration = 0.15;
          break;
        case 'attack':
          frequency = 300;
          duration = 0.2;
          break;
        case 'jump':
          frequency = 600;
          duration = 0.3;
          break;
        case 'victory':
          frequency = 800;
          duration = 1.0;
          break;
        case 'menuSelect':
          frequency = 500;
          duration = 0.1;
          break;
        case 'menuHover':
          frequency = 400;
          duration = 0.05;
          break;
        default:
          frequency = 440;
          duration = 0.2;
      }
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3 * this.soundVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    return {
      play: () => {
        if (this.soundEnabled) {
          createSound();
        }
      },
      stop: () => {
        // For simple synth sounds, stopping is handled automatically
      },
      volume: (vol) => {
        // Volume would be handled per sound in a real implementation
      }
    };
  }

  createBackgroundMusic() {
    // Simple background music loop placeholder
    return {
      play: () => {
        if (this.musicEnabled) {
          console.log('Background music started');
        }
      },
      stop: () => {
        console.log('Background music stopped');
      },
      pause: () => {
        console.log('Background music paused');
      },
      resume: () => {
        console.log('Background music resumed');
      },
      volume: (vol) => {
        this.musicVolume = vol;
      }
    };
  }

  playSound(soundName, options = {}) {
    if (!this.soundEnabled) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      sound.play();
      console.log(`Playing sound: ${soundName}`);
    } else {
      console.warn(`Sound not found: ${soundName}`);
    }
  }

  stopSound(soundName) {
    const sound = this.sounds[soundName];
    if (sound && sound.stop) {
      sound.stop();
    }
  }

  playMusic(trackName = 'background') {
    if (!this.musicEnabled) return;
    
    if (this.music) {
      this.music.play();
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
    }
  }

  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  resumeMusic() {
    if (this.music) {
      this.music.resume();
    }
  }

  pauseAll() {
    this.pauseMusic();
    // Pause all currently playing sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound.pause) {
        sound.pause();
      }
    });
  }

  resumeAll() {
    this.resumeMusic();
    // Resume sounds if needed
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
  }

  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music && this.music.volume) {
      this.music.volume(this.musicVolume);
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.playMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  getSoundVolume() {
    return this.soundVolume;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  // Load real audio files (for future implementation)
  async loadAudioFile(name, url, options = {}) {
    return new Promise((resolve, reject) => {
      const sound = new Howl({
        src: [url],
        volume: options.volume || this.soundVolume,
        loop: options.loop || false,
        autoplay: false,
        onload: () => {
          this.sounds[name] = sound;
          console.log(`Loaded audio: ${name}`);
          resolve(sound);
        },
        onloaderror: (id, error) => {
          console.error(`Failed to load audio ${name}:`, error);
          reject(error);
        }
      });
    });
  }

  // Preload multiple audio files
  async preloadAudio(audioList) {
    const promises = audioList.map(({ name, url, options }) => 
      this.loadAudioFile(name, url, options)
    );
    
    try {
      await Promise.all(promises);
      console.log('All audio files loaded successfully');
    } catch (error) {
      console.error('Some audio files failed to load:', error);
    }
  }

  // Play sound with random pitch variation
  playSoundWithVariation(soundName, pitchVariation = 0.1) {
    const sound = this.sounds[soundName];
    if (sound && this.soundEnabled) {
      const pitch = 1 + (Math.random() - 0.5) * pitchVariation * 2;
      if (sound.rate) {
        sound.rate(pitch);
      }
      sound.play();
    }
  }

  // Play positional audio (for stereo effects)
  playSoundPositional(soundName, position, listenerPosition) {
    const sound = this.sounds[soundName];
    if (sound && this.soundEnabled) {
      // Calculate stereo positioning
      const distance = position - listenerPosition;
      const pan = Math.max(-1, Math.min(1, distance / 100));
      
      if (sound.stereo) {
        sound.stereo(pan);
      }
      sound.play();
    }
  }

  destroy() {
    // Stop all sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound.stop) {
        sound.stop();
      }
    });

    // Stop music
    this.stopMusic();

    // Clear references
    this.sounds = {};
    this.music = null;

    console.log('AudioManager destroyed');
  }
} 