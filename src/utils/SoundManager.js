// utils/SoundManager.js - Refactored
import * as THREE from 'three';

// Sound configuration constants
const DEFAULT_CONFIG = {
  // Global defaults
  POOL_SIZE: 3,
  MIN_INTERVAL: 0,
  PITCH_RANGE: 0.1,
  
  // Positional sound defaults
  REF_DISTANCE: 5,
  MAX_DISTANCE: 50,
  ROLLOFF_FACTOR: 1,
  
  // Standard sound defaults
  VOLUME: 1.0,
};

/**
 * Enhanced Sound Manager with optimized pooling and resource management
 */
class SoundManager {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    
    this.audioLoader = new THREE.AudioLoader();
    this.buffers = new Map();
    this.soundPools = new Map();
    this.lastPlayedTimes = new Map();
    
    // Performance tracking (optional - remove in production)
    this._stats = {
      totalSoundsCreated: 0,
      totalSoundsPlayed: 0,
      poolHits: 0,
      poolMisses: 0,
    };
  }

  /**
   * Preload a sound file into the buffer cache
   * @param {string} name - Identifier for the sound
   * @param {string} path - Path to the audio file
   * @returns {Promise<AudioBuffer>} - Promise resolving to the loaded buffer
   */
  async preloadSound(name, path) {
    try {
      // Check for existing buffer to avoid duplicate loads
      if (this.buffers.has(name)) {
        return this.buffers.get(name);
      }
      
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.buffers.set(name, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${name}:`, error);
      return null;
    }
  }

  /**
   * Preload multiple sounds at once
   * @param {Object<string, string>} soundMap - Map of sound names to paths
   * @returns {Promise<Map<string, AudioBuffer>>} - Promise resolving when all sounds are loaded
   */
  async preloadSounds(soundMap) {
    const promises = Object.entries(soundMap).map(
      ([name, path]) => this.preloadSound(name, path)
    );
    
    await Promise.all(promises);
    return this.buffers;
  }

  /**
   * Get or create the audio context on first use (needed for browsers that require user interaction)
   */
  get audioContext() {
    if (!this._audioContext) {
      this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._audioContext;
  }

  /**
   * Create a reusable sound with configurable parameters
   * @param {string} name - Sound identifier (must be preloaded)
   * @param {Object} options - Sound configuration options
   * @returns {Object|null} - Sound controller object
   */
  createSound(name, options = {}) {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.warn(`Sound '${name}' not preloaded`);
      return null;
    }

    // Get or create pool for this sound
    const poolKey = name;
    if (!this.soundPools.has(poolKey)) {
      this.soundPools.set(poolKey, []);
    }
    
    // Find available sound in pool
    const pool = this.soundPools.get(poolKey);
    let soundWrapper = pool.find(sw => !sw.isPlaying());
    
    // Create new sound if needed and pool not at capacity
    if (!soundWrapper && pool.length < (options.poolSize || DEFAULT_CONFIG.POOL_SIZE)) {
      const sound = new THREE.Audio(this.listener);
      sound.setBuffer(buffer);
      sound.setVolume(options.volume ?? DEFAULT_CONFIG.VOLUME);
      sound.setLoop(options.loop || false);
      
      const id = `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      soundWrapper = this._createSoundWrapper(id, sound);
      pool.push(soundWrapper);
      
      this._stats.totalSoundsCreated++;
      this._stats.poolMisses++;
    } else if (soundWrapper) {
      this._stats.poolHits++;
    }
    
    return soundWrapper;
  }

  /**
   * Create a positional sound that exists in 3D space
   * @param {string} name - Sound identifier (must be preloaded)
   * @param {Array|Vector3} position - 3D position for the sound
   * @param {Object} options - Sound configuration options
   * @returns {Object|null} - Sound controller object
   */
  createPositionalSound(name, position, options = {}) {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.warn(`Sound '${name}' not preloaded`);
      return null;
    }

    // Create a unique pool key for positional sounds
    const poolKey = `pos_${name}`;
    if (!this.soundPools.has(poolKey)) {
      this.soundPools.set(poolKey, []);
    }
    
    // Find available sound in pool
    const pool = this.soundPools.get(poolKey);
    let soundWrapper = pool.find(sw => !sw.isPlaying());
    
    // Create new positional sound if needed
    if (!soundWrapper && pool.length < (options.poolSize || DEFAULT_CONFIG.POOL_SIZE)) {
      const sound = new THREE.PositionalAudio(this.listener);
      sound.setBuffer(buffer);
      sound.setRefDistance(options.refDistance || DEFAULT_CONFIG.REF_DISTANCE);
      sound.setMaxDistance(options.maxDistance || DEFAULT_CONFIG.MAX_DISTANCE);
      sound.setRolloffFactor(options.rolloffFactor || DEFAULT_CONFIG.ROLLOFF_FACTOR);
      sound.setVolume(options.volume || DEFAULT_CONFIG.VOLUME);
      sound.setLoop(options.loop || false);
      
      if (options.rate) sound.setPlaybackRate(options.rate);
      
      const id = `pos_sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      soundWrapper = this._createSoundWrapper(id, sound, true);
      pool.push(soundWrapper);
      
      this._stats.totalSoundsCreated++;
      this._stats.poolMisses++;
    } else if (soundWrapper) {
      this._stats.poolHits++;
      
      // Reset properties for reuse
      soundWrapper.sound.setVolume(options.volume || DEFAULT_CONFIG.VOLUME);
      if (options.rate) soundWrapper.sound.setPlaybackRate(options.rate);
    }
    
    // Set position regardless of whether sound is new or from pool
    if (soundWrapper && position) {
      this._setPosition(soundWrapper, position);
    }
    
    return soundWrapper;
  }

  /**
   * Play a sound with rate limiting and randomization
   * @param {string} name - Sound identifier
   * @param {Object} options - Playback options
   * @returns {Object|null} - Sound controller or null if rate limited
   */
  playSound(name, options = {}) {
    const now = Date.now();
    const minInterval = options.minInterval || DEFAULT_CONFIG.MIN_INTERVAL;
    
    // Check rate limiting
    if (this.lastPlayedTimes.has(name) && 
        (now - this.lastPlayedTimes.get(name)) < minInterval) {
      return null;
    }
    
    const sound = this.createSound(name, options);
    if (sound) {
      // Apply randomized pitch if requested
      if (options.randomizePitch) {
        const pitchRange = options.pitchRange || DEFAULT_CONFIG.PITCH_RANGE;
        const randomPitch = 1.0 + (Math.random() * pitchRange * 2) - pitchRange;
        sound.setPlaybackRate(randomPitch);
      }
      
      sound.play(options);
      this.lastPlayedTimes.set(name, now);
      this._stats.totalSoundsPlayed++;
    }
    
    return sound;
  }

  /**
   * Play a positional sound with rate limiting
   * @param {string} name - Sound identifier
   * @param {Array|Vector3} position - 3D position
   * @param {Object} options - Playback options
   * @returns {Object|null} - Sound controller or null if rate limited
   */
  playPositionalSound(name, position, options = {}) {
    const now = Date.now();
    const minInterval = options.minInterval || DEFAULT_CONFIG.MIN_INTERVAL;
    
    // Check rate limiting
    if (this.lastPlayedTimes.has(name) && 
        (now - this.lastPlayedTimes.get(name)) < minInterval) {
      return null;
    }
    
    const sound = this.createPositionalSound(name, position, options);
    if (sound) {
      // Apply randomized pitch if requested
      if (options.randomizePitch) {
        const pitchRange = options.pitchRange || DEFAULT_CONFIG.PITCH_RANGE;
        const randomPitch = 1.0 + (Math.random() * pitchRange * 2) - pitchRange;
        sound.setPlaybackRate(randomPitch);
      }
      
      sound.play(options);
      this.lastPlayedTimes.set(name, now);
      this._stats.totalSoundsPlayed++;
    }
    
    return sound;
  }

  /**
   * Create standard sound wrapper object
   * @private
   */
  _createSoundWrapper(id, sound, isPositional = false) {
    const wrapper = {
      id,
      sound,
      isPlaying: () => sound.isPlaying,
      play: (playOptions = {}) => {
        if (playOptions && playOptions.playbackRate !== undefined) {
          sound.setPlaybackRate(playOptions.playbackRate);
        }
        return sound.play();
      },
      stop: () => sound.stop(),
      setVolume: (vol) => sound.setVolume(vol),
      setPlaybackRate: (rate) => sound.setPlaybackRate(rate),
      remove: () => {
        sound.stop();
        // We don't actually remove from pool, just mark as inactive
      }
    };
    
    // Add positional-specific methods
    if (isPositional) {
      wrapper.setPosition = (x, y, z) => {
        if (Array.isArray(x)) {
          sound.position.set(x[0], x[1], x[2]);
        } else {
          sound.position.set(x, y, z);
        }
      };
    }
    
    return wrapper;
  }

  /**
   * Helper to set position on a sound wrapper
   * @private
   */
  _setPosition(wrapper, position) {
    if (Array.isArray(position)) {
      wrapper.setPosition(position[0], position[1], position[2]);
    } else if (position.isVector3) {
      wrapper.setPosition(position.x, position.y, position.z);
    } else {
      wrapper.setPosition(position.x || 0, position.y || 0, position.z || 0);
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} - Sound usage statistics
   */
  getStats() {
    const poolSizes = {};
    this.soundPools.forEach((pool, key) => {
      poolSizes[key] = pool.length;
    });
    
    return {
      ...this._stats,
      poolSizes,
      bufferCount: this.buffers.size,
      poolEfficiency: this._stats.poolHits / (this._stats.poolHits + this._stats.poolMisses || 1),
    };
  }

  /**
   * Clean up and dispose of all audio resources
   */
  dispose() {
    // Stop all sounds
    this.soundPools.forEach(pool => {
      pool.forEach(wrapper => {
        if (wrapper.sound) {
          wrapper.sound.stop();
        }
      });
    });
    
    // Clear all collections
    this.soundPools.clear();
    this.lastPlayedTimes.clear();
    
    // Close audio context
    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }
  }
}

export default SoundManager;