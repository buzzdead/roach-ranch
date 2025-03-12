import { SkeletonUtils } from "three/examples/jsm/Addons.js";

const cloneCache = new Map();

export const getOrCreateClone = (originalScene) => {
  // Use a WeakMap or similar to cache clones
  if (!cloneCache.has(originalScene)) {
    cloneCache.set(originalScene, SkeletonUtils.clone(originalScene));
  }
  return SkeletonUtils.clone(cloneCache.get(originalScene));
};
