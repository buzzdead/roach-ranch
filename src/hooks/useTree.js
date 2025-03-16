export const useTreeBranches = (height, trunkRadius) => {
    return useMemo(() => {
      const branchConfigs = [];
      const branchCount = 12;
  
      for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2;
        const branchHeight = height * (0.6 + (i / branchCount) * 0.3);
        const branchLength = trunkRadius * (4 + Math.random() * 2);
        const branchAngle = Math.PI / 6 + Math.random() * 0.2;
  
        branchConfigs.push({
          position: [0, branchHeight, 0],
          rotation: [0, angle, branchAngle],
          length: branchLength,
          baseRadius: trunkRadius * 0.2,
          tipRadius: trunkRadius * 0.05,
          children: [
            {
              position: [branchLength * 0.7, 0, 0],
              rotation: [0, Math.random() * Math.PI, Math.random() * 0.3 - 0.15],
              length: branchLength * 0.5,
              baseRadius: trunkRadius * 0.1,
              tipRadius: trunkRadius * 0.03,
            },
          ],
        });
      }
  
      return branchConfigs;
    }, [height, trunkRadius]);
  };
  
  export const useTreeFoliage = (height, foliageSize, type) => {
    return useMemo(() => {
      const clusters = [];
      const layerCount = 10;
      const baseHeight = height * 0.65;
  
      for (let layer = 0; layer < layerCount; layer++) {
        const layerHeight = baseHeight + (layer * (height * 0.35)) / (layerCount - 1);
        const layerRadius = foliageSize * (1 - layer / layerCount);
        const branchCount = Math.floor(6 + (1 - layer / layerCount) * 10);
  
        for (let i = 0; i < branchCount; i++) {
          const angle = (i / branchCount) * Math.PI * 2;
          const radius = layerRadius * (0.8 + Math.random() * 0.2);
  
          clusters.push({
            position: [
              Math.sin(angle) * radius,
              layerHeight + 1,
              Math.cos(angle) * radius,
            ],
            rotation: [
              -Math.PI / 6 - (layer / layerCount) * (Math.PI / 12),
              angle,
              0,
            ],
            scale: [
              1.5 + (1 - layer / layerCount) * 0.5,
              1.5 + (1 - layer / layerCount) * 0.5,
              1,
            ],
          });
        }
      }
  
      return clusters;
    }, [height, foliageSize, type]);
  };