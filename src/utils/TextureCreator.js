import * as THREE from 'three';

export const createGrassTextures = () => {
  return [1, 2, 3].map((_, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 128);
    
    // Slightly different grass shapes for each texture
    if (idx === 0) {
      // Tall thin grass
      ctx.fillStyle = '#3a6f20';
      ctx.beginPath();
      ctx.moveTo(20, 128);
      ctx.lineTo(32, 20);
      ctx.lineTo(44, 128);
      ctx.closePath();
      ctx.fill();
    } else if (idx === 1) {
      // Wider shorter grass
      ctx.fillStyle = '#4d8f2a';
      ctx.beginPath();
      ctx.moveTo(8, 128);
      ctx.lineTo(32, 40);
      ctx.lineTo(56, 128);
      ctx.closePath();
      ctx.fill();
    } else {
      // Curved grass
      ctx.fillStyle = '#3d7825';
      ctx.beginPath();
      ctx.moveTo(15, 128);
      ctx.bezierCurveTo(15, 60, 50, 60, 45, 30);
      ctx.bezierCurveTo(42, 60, 55, 90, 50, 128);
      ctx.closePath();
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  });
};