import { useEffect, useRef } from "react";
import { useSoundManager } from "../../context/SoundContext";
import { useGameEffectsStore } from "../../store/gameEffectsStore";
import { useShallow } from "zustand/shallow";
import { Vector3 } from "three";

const SoundEffects = () => {
    const soundsRef = useRef({
        kill1: null,
        kill2: null,
        kill3: null,
        chickenKill1: null,
        chickenKill2: null,
        chickenKill3: null,
    });
      
    const soundManager = useSoundManager();
    const triggerKillSound = useGameEffectsStore(useShallow((state) => state.triggerKillSound));

    useEffect(() => {
        const pos = new Vector3(0,0,0);
        if (soundManager) {
            // Create multiple sound objects for this roach
            soundsRef.current = {
                kill1: soundManager.createPositionalSound('Kill1', pos, {
                    refDistance: 5,
                    maxDistance: 50,
                    volume: 0.65,
                }),
                kill2: soundManager.createPositionalSound('Kill2', pos, {
                    refDistance: 5,
                    maxDistance: 50,
                    volume: 0.65,
                }),
                kill3: soundManager.createPositionalSound('Kill3', pos, {
                    refDistance: 5,
                    maxDistance: 50,
                    volume: 0.65,
                }),
                chickenKill1: soundManager.createPositionalSound('Chicken-Kill1', pos, {
                    refDistance: 5,
                    maxDistance: 50,
                    volume: 0.65,
                }),
                chickenKill2: soundManager.createPositionalSound('Chicken-Kill2', pos, {
                    refDistance: 5,
                    maxDistance: 50,
                    volume: 0.65,
                }),
                chickenKill3: soundManager.createPositionalSound('Chicken-Kill3', pos, {
                    refDistance: 5,
                    maxDistance: 50,
                    volume: 0.65,
                }),
            };
    
            return () => {
                // Clean up sounds when component unmounts
                Object.values(soundsRef.current).forEach((sound) => {
                    if (sound) sound.remove();
                });
            };
        }
    }, [soundManager]);

    useEffect(() => {
        const { type, value } = triggerKillSound;
        if(value === 0) return;
        
        console.log("Trying to play kill sound:", value);
        console.log("Available sounds:", Object.keys(soundsRef.current));
        
        const soundKey = type === "roach" ? `kill${value}` : `chickenKill${value}`;
        const killSound = soundsRef.current[soundKey];
      
        if (killSound) {
            console.log("Playing sound:", soundKey);
            killSound.play();
        } else {
            console.log("Sound not found:", soundKey);
        }
    }, [triggerKillSound]);

    return null;
};

export default SoundEffects;