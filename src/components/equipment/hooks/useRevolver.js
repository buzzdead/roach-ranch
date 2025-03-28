import { useCallback, useState } from 'react';

export const useRevolverBullets = () => {
  const [bullets, setBullets] = useState([]);

  const createBullet = useCallback((muzzlePos, direction) => {
    const newBulletId = Date.now();
    setBullets((prevBullets) => [
      ...prevBullets.slice(-5),
      {
        id: newBulletId,
        position: muzzlePos.clone(),
        direction: direction.clone(),
      },
    ]);
    return newBulletId;
  }, []);

  const removeBullet = useCallback((id) => {
    setBullets((prevBullets) => prevBullets.filter((pb) => pb.id !== id));
  }, []);

  return { bullets, createBullet, removeBullet };
};

export const useMuzzleEffect = () => {
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [muzzlePosition, setMuzzlePosition] = useState([0, 0, 0]);

  const triggerMuzzleFlash = useCallback((position) => {
    setMuzzlePosition(position);
    setMuzzleFlash(true);

    setTimeout(() => {
      setMuzzleFlash(false);
    }, 100);
  }, []);

  return { muzzleFlash, muzzlePosition, triggerMuzzleFlash };
};