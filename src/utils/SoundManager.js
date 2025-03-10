// utils/SoundManager.js
import * as THREE from 'three';

class SoundManager {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    this.audioLoader = new THREE.AudioLoader();
    this.sounds = {};
    this.buffers = {};
    this.soundPools = {}; // For sound pooling
    this.lastPlayedTimes = {}; // For rate limiting
  }

  // Preload sounds
  preloadSound(name, path) {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(path, (buffer) => {
        this.buffers[name] = buffer;
        resolve(buffer);
      }, undefined, reject);
    });
  }

  // Create a regular (non-positional) audio
  createSound(name, options = {}) {
    if (!this.buffers[name]) {
      console.warn(`Sound ${name} not preloaded`);
      return null;
    }

    // Initialize pool for this sound if it doesn't exist
    if (!this.soundPools[name]) this.soundPools[name] = [];
    
    // Try to find an inactive sound in the pool
    let soundWrapper = this.soundPools[name].find(sw => !sw.isPlaying());
    
    // If no inactive sound found and we haven't hit the pool limit, create a new one
    if (!soundWrapper && this.soundPools[name].length < (options.poolSize || 3)) {
      const sound = new THREE.Audio(this.listener);
      sound.setBuffer(this.buffers[name]);
      sound.setVolume(options.volume || 1);
      sound.setLoop(options.loop || false);
      
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      this.sounds[id] = { sound };
      
      soundWrapper = {
        id,
        sound,
        play: (playOptions = {}) => {
          if (playOptions.playbackRate !== undefined) {
            sound.setPlaybackRate(playOptions.playbackRate);
          }
          return sound.play();
        },
        stop: () => sound.stop(),
        isPlaying: () => sound.isPlaying,
        setVolume: (vol) => sound.setVolume(vol),
        setPlaybackRate: (rate) => sound.setPlaybackRate(rate),
        remove: () => {
          sound.stop();
          delete this.sounds[id];
        }
      };
      
      this.soundPools[name].push(soundWrapper);
    }
    
    return soundWrapper;
  }

  // Play a sound with rate limiting and optional pitch randomization
  playSound(name, options = {}) {
    const now = Date.now();
    const minInterval = options.minInterval || 0;
    
    // Skip if played too recently
    if (this.lastPlayedTimes[name] && (now - this.lastPlayedTimes[name]) < minInterval) {
      return null;
    }
    
    const sound = this.createSound(name, options);
    if (sound) {
      // Apply randomized pitch if requested
      if (options.randomizePitch) {
        const pitchRange = options.pitchRange || 0.1; // Default ±10%
        const randomPitch = 1.0 + (Math.random() * pitchRange * 2) - pitchRange;
        sound.setPlaybackRate(randomPitch);
      }
      
      sound.play(options);
      this.lastPlayedTimes[name] = now;
    }
    
    return sound;
  }

  // Create a positional sound source
  createPositionalSound(name, position, options = {}) {
    if (!this.buffers[name]) {
      console.warn(`Sound ${name} not preloaded`);
      return null;
    }

    // Initialize pool for this positional sound if it doesn't exist
    const poolKey = `pos_${name}`;
    if (!this.soundPools[poolKey]) this.soundPools[poolKey] = [];
    
    // Try to find an inactive sound in the pool
    let soundWrapper = this.soundPools[poolKey].find(sw => !sw.isPlaying());
    
    // If no inactive sound found and we haven't hit the pool limit, create a new one
    if (!soundWrapper && this.soundPools[poolKey].length < (options.poolSize || 3)) {
      const sound = new THREE.PositionalAudio(this.listener);
      sound.setBuffer(this.buffers[name]);
      sound.setRefDistance(options.refDistance || 5);
      sound.setMaxDistance(options.maxDistance || 50);
      sound.setRolloffFactor(options.rolloffFactor || 1);
      sound.setVolume(options.volume || 1);
      sound.setLoop(options.loop || false);
      if(options.rate) sound.setPlaybackRate(options.rate)
      
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      this.sounds[id] = sound;
      
      soundWrapper = {
        id,
        sound,
        play: (playOptions = {}) => {
          if (playOptions && playOptions.playbackRate !== undefined) {
            sound.setPlaybackRate(playOptions.playbackRate);
          }
          return sound.play();
        },
        stop: () => sound.stop(),
        isPlaying: () => sound.isPlaying,
        setPosition: (x, y, z) => sound.position.set(x, y, z),
        setVolume: (vol) => sound.setVolume(vol),
        setPlaybackRate: (rate) => sound.setPlaybackRate(rate),
        remove: () => {
          sound.stop();
          delete this.sounds[id];
        }
      };
      
      this.soundPools[poolKey].push(soundWrapper);
    }
    
    // Update position for the sound we'll use
    if (soundWrapper && position) {
      soundWrapper.setPosition(position[0], position[1], position[2]);
    }
    
    return soundWrapper;
  }

  // Play a positional sound with rate limiting and optional pitch randomization
  playPositionalSound(name, position, options = {}) {
    const now = Date.now();
    const minInterval = options.minInterval || 0;
    
    // Skip if played too recently
    if (this.lastPlayedTimes[name] && (now - this.lastPlayedTimes[name]) < minInterval) {
      return null;
    }
    
    const sound = this.createPositionalSound(name, position, options);
    if (sound) {
      // Apply randomized pitch if requested
      if (options.randomizePitch) {
        const pitchRange = options.pitchRange || 0.1; // Default ±10%
        const randomPitch = 1.0 + (Math.random() * pitchRange * 2) - pitchRange;
        sound.setPlaybackRate(randomPitch);
      }
      
      sound.play(options);
      this.lastPlayedTimes[name] = now;
    }
    
    return sound;
  }

  // Clean up all sounds
  dispose() {
    // Flatten all pools and regular sounds
    const allSounds = [
      ...Object.values(this.sounds),
      ...Object.values(this.soundPools).flat().map(wrapper => wrapper.sound)
    ];
    
    allSounds.forEach(sound => {
      if (!sound) return;
      
      // Handle both direct THREE.Audio objects and our wrapper objects
      const audioObj = sound.sound || sound;
      
      if (typeof audioObj.stop === 'function') {
        audioObj.stop();
      } else if (typeof audioObj.isPlaying === 'function' && audioObj.isPlaying()) {
        if (typeof audioObj.pause === 'function') {
          audioObj.pause();
        }
      }
    });
    
    this.sounds = {};
    this.soundPools = {};
    this.lastPlayedTimes = {};
  }
}

export default SoundManager;