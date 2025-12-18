
import React, { useEffect, useRef } from 'react';
import { HallwayTile, TileType } from '../types';

interface Props {
  tiles: Record<string, HallwayTile>;
  playerPos: { x: number; z: number };
  playerRot: number;
}

export const Minimap: React.FC<Props> = ({ tiles, playerPos, playerRot }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 150;
    const scale = 5;
    const half = size / 2;

    ctx.clearRect(0, 0, size, size);
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, size, size);

    // Draw tiles
    ctx.save();
    ctx.translate(half, half);
    
    Object.values(tiles).forEach(tile => {
      if (tile.type === TileType.VOID) return;

      const tx = tile.x * 4;
      const ty = tile.y * 4;
      
      const dx = (tx - playerPos.x) * scale;
      const dy = (ty - playerPos.z) * scale;

      if (Math.abs(dx) > half || Math.abs(dy) > half) return;

      ctx.fillStyle = tile.type === TileType.DOOR_FRAME ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(dx - 1.5 * scale, dy - 1.5 * scale, 3 * scale, 3 * scale);
    });

    // Player indicator
    ctx.restore();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(half, half, 3, 0, Math.PI * 2);
    ctx.fill();

    // Direction cone
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.moveTo(half, half);
    ctx.lineTo(half + Math.sin(-playerRot) * 15, half + Math.cos(-playerRot) * 15);
    ctx.stroke();

  }, [tiles, playerPos, playerRot]);

  return (
    <canvas 
      ref={canvasRef} 
      width={150} 
      height={150} 
      className="rounded-lg border border-white/10 shadow-2xl"
    />
  );
};
