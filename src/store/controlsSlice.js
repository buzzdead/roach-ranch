export const createControlsSlice = (set) => ({
    controlsEnabled: true,
    
    setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
  });