import React, { useState, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import './wave.css';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import UISoundManager from '../../utils/UISoundManager';

const WaveTimerUI = () => {
  const { waveActive, waveStartTime, waveEndTime, waveLevel } = useGameEffectsStore(
    useShallow(state => ({
      waveActive: state.waveActive,
      waveStartTime: state.waveStartTime,
      waveEndTime: state.waveEndTime,
      waveLevel: state.waveLevel
    }))
  );

  const [timeRemaining, setTimeRemaining] = useState(60);
  const [prewaveCountdown, setPrewaveCountdown] = useState(8);
  const [waveStarted, setWaveStarted] = useState(false);
  const [uiSoundManager, setUISoundManager] = useState(null);
  const countdownSound = useRef();
  const waveStartSound = useRef();
  const prevCountdownRef = useRef(null);

  // Initialize sound manager
  useEffect(() => {
    const soundMgr = new UISoundManager();
    
    // Preload your sounds
    Promise.all([
      soundMgr.preloadSound('Count', '/soundeffects/count.mp3'),
      soundMgr.preloadSound('WaveStart', '/soundeffects/wave-start.mp3')
    ]).then(() => {
      setUISoundManager(soundMgr);
    });
    
    return () => {
      if (soundMgr) {
        soundMgr.dispose();
      }
    };
  }, []);

  // Create sound references when sound manager is ready
  useEffect(() => {
    if (uiSoundManager) {
      countdownSound.current = uiSoundManager.createSound('Count', {
        volume: 0.6,
        playbackRate: 1.250
      });
      
      waveStartSound.current = uiSoundManager.createSound('WaveStart', {
        volume: 0.3,
        playbackRate: .750
      });
    }
  }, [uiSoundManager]);

  useEffect(() => {
    if (!waveActive || !waveEndTime) {
      setTimeRemaining(60);
      setPrewaveCountdown(8);
      setWaveStarted(false);
      prevCountdownRef.current = null;
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const totalRemaining = Math.max(0, Math.ceil((waveEndTime - now) / 1000));
      
      // First 5 seconds are pre-wave countdown
      if (totalRemaining > 30) {
        const newCountdown = totalRemaining - 30;
        setPrewaveCountdown(newCountdown);
        
        // Play countdown sound when the number changes
        if (prevCountdownRef.current !== null && 
            newCountdown !== prevCountdownRef.current &&
            countdownSound.current) {
          
          // Play wave start sound on the last second (when countdown reaches 1)
          if (newCountdown === 1 && waveStartSound.current) {
            waveStartSound.current.play();
          } else {
            countdownSound.current.play();
          }
        }
        
        prevCountdownRef.current = newCountdown;
        setWaveStarted(false);
      } else {
        setTimeRemaining(totalRemaining);
        setWaveStarted(true);
      }
    };
    
    // Update immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [waveActive, waveEndTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="wave-timer-container">
      <div className="wave-info">
        <div className="wave-level">Wave {waveLevel}</div>
        {waveActive ? (
          <div className="timer-active">
            {!waveStarted ? (
              <>
                <div className="timer-label">Wave starts in:</div>
                <div className="timer-value countdown">{prewaveCountdown}</div>
              </>
            ) : (
              <>
                <div className="timer-label">Time Remaining:</div>
                <div className="timer-value">{formatTime(timeRemaining)}</div>
              </>
            )}
          </div>
        ) : (
          <div className="timer-inactive">
            <div className="ready-message">
              Enter the circle to start wave {waveLevel}
            </div>
            {<div style={{color: 'white'}} className="ready-message">
              (Go inside for upgrades)
            </div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveTimerUI;