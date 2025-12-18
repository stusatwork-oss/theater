
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TheaterRoom } from '../types';
import { scene } from '../rendering/scene';
import { camera } from '../rendering/camera';
import { generateRoomLayout } from '../rendering/roomRenderer';

interface Props {
  room: TheaterRoom;
  onExit: () => void;
}

export const RoomInterior: React.FC<Props> = ({ room, onExit }) => {
  const containerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    // Transition camera to room center
    const oldPos = camera.position.clone();
    camera.position.set(0, 1.6, 2);
    camera.lookAt(0, 1.6, 0);

    const layout = generateRoomLayout(room);
    containerRef.current = layout.group;
    scene.add(layout.group);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      scene.remove(layout.group);
      layout.dispose();
      camera.position.copy(oldPos);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [room]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-black/80 px-6 py-2 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-4">
        <span className="theater-font text-white uppercase tracking-widest text-sm">{room.id} // {room.vibe}</span>
        <div className="w-px h-4 bg-white/20"></div>
        <span className="text-[10px] text-slate-400 font-mono">ESC TO EXIT_SECTOR</span>
      </div>
    </div>
  );
};
