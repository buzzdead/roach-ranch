// utils/SoundManager.js
import * as THREE from 'three';

class SoundManager {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    
    this.audioLoader = new THREE.AudioLoader();
    this.sounds = {};
    this.buffers = {};
  }

  createSound(name, options = {}) {
    if (!this.buffers[name]) {
      console.warn(`Sound ${name} not preloaded`);
      return null;
    }
    
    // Create a regular (non-positional) audio
    const sound = new THREE.Audio(this.listener);
    sound.setBuffer(this.buffers[name]);
    sound.setVolume(options.volume || 1);
    sound.setLoop(options.loop || false);
    
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    this.sounds[id] = { sound };
    
    return {
      id,
      play: () => sound.play(),
      stop: () => sound.stop(),
      isPlaying: () => sound.isPlaying,
      setVolume: (vol) => sound.setVolume(vol),
      remove: () => {
        sound.stop();
        delete this.sounds[id];
      }
    };
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
  
  // Create a positional sound source
  createPositionalSound(name, position, options = {}) {
    if (!this.buffers[name]) {
      console.warn(`Sound ${name} not preloaded`);
      return null;
    }
    
    const sound = new THREE.PositionalAudio(this.listener);
    sound.setBuffer(this.buffers[name]);
    sound.setRefDistance(options.refDistance || 5);
    sound.setMaxDistance(options.maxDistance || 50);
    sound.setRolloffFactor(options.rolloffFactor || 1);
    sound.setVolume(options.volume || 1);
    sound.setLoop(options.loop || false);
    
    if (position) {
      sound.position.set(position[0], position[1], position[2]);
    }
    
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    this.sounds[id] = sound;
    
    return {
      id,
      play: () => sound.play(),
      stop: () => sound.stop(),
      isPlaying: () => sound.isPlaying,
      setPosition: (x, y, z) => sound.position.set(x, y, z),
      setVolume: (vol) => sound.setVolume(vol),
      remove: () => {
        sound.stop();
        delete this.sounds[id];
      }
    };
  }
  
  // Clean up all sounds
  dispose() {
    Object.values(this.sounds).forEach(sound => {
      sound.stop();
    });
    this.sounds = {};
  }
}

export default SoundManager;