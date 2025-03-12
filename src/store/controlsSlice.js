export const createControlsSlice = (set, get) => ({
  triggerKillSound: 0,
  gameOver: false,
  controlsEnabled: true,
  waveActive: false,
  waveLevel: 1,
  waveStartTime: null,
  waveEndTime: null,
  gameActive: false,
  setWaveActive: () => set({
    waveActive: true,
    waveStartTime: Date.now(),
    waveEndTime: Date.now() + 38000 // 60 seconds in milliseconds
  }),
  
  setNextLevel: () => set(state => ({
    waveLevel: state.waveLevel + 1,
    waveActive: false,
    waveStartTime: null,
    waveEndTime: null
  })),
  setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
  setTriggerKillSound: () => {
    const shouldPlay = Math.random() > 0.85;
    const randomKill = Math.floor(Math.random() * 3) + 1;
    if(shouldPlay) set(state => ({ triggerKillSound: randomKill }));
  },
  setGameOver: (b = true) => set({ gameOver: b }),
  setGameActive: (active) => set({gameActive: active })
});