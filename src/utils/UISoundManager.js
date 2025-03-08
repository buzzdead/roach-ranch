// Create a simple UI sound manager using the Web Audio API
// utils/UISoundManager.js

class UISoundManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.buffers = {};
    this.sounds = {};
  }

  async preloadSound(name, path) {
    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers[name] = audioBuffer;
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${name}:`, error);
      return null;
    }
  }

  createSound(name, options = {}) {
    if (!this.buffers[name]) {
      console.warn(`Sound ${name} not preloaded`);
      return null;
    }

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

    return {
      id,
      play: () => {
        // Create a new source for each play - needed for Web Audio API
        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers[name];

        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.volume || 1;

        // Connect source to gain, gain to destination
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Set playback rate (affects pitch and speed)
        source.playbackRate.value = options.playbackRate || 1;

        // Start playback
        source.start(0);

        // Store reference to stop it later if needed
        this.sounds[id] = { source, gainNode };

        // Clean up once it's done playing
        source.onended = () => {
          delete this.sounds[id];
        };

        return source;
      },
      stop: () => {
        if (this.sounds[id]) {
          this.sounds[id].source.stop();
          delete this.sounds[id];
        }
      },
      remove: () => {
        if (this.sounds[id]) {
          this.sounds[id].source.stop();
          delete this.sounds[id];
        }
      }
    };
  }

  dispose() {
    Object.values(this.sounds).forEach(sound => {
      if (sound && sound.source) {
        sound.source.stop();
      }
    });
    this.sounds = {};
    this.audioContext.close();
  }
}

export default UISoundManager;