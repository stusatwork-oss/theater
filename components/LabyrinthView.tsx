
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useLabyrinthStore } from '../store/labyrinthStore';
import { scene, setupScene } from '../rendering/scene';
import { camera, setupControls, updateCamera } from '../rendering/camera';
import { createRenderer } from '../rendering/renderer';
import { useRenderLoop } from '../hooks/useRenderLoop';
import { renderLabyrinth } from '../rendering/labyrinthRenderer';
import { generateLabyrinthLayout } from '../hallwayService';
import { ClaimRoomModal } from './ClaimRoomModal';
import { RoomInterior } from './RoomInterior';
import { HUD } from './HUD';
import { TileType } from '../types';
import { trackTraffic } from '../systems/trafficSystem';

interface LabyrinthViewProps {
  onEditRoom?: (id: string) => void;
}

export const LabyrinthView: React.FC<LabyrinthViewProps> = ({ onEditRoom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { rooms, edges, movePlayer } = useLabyrinthStore();
  const [modalState, setModalState] = useState<{ isOpen: boolean; roomId: string }>({ 
    isOpen: false, 
    roomId: '' 
  });
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [hudVisible, setHudVisible] = useState(true);
  const [camRot, setCamRot] = useState(0);

  const layout = useMemo(() => generateLabyrinthLayout(rooms, edges, 32), [rooms, edges]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    rendererRef.current = createRenderer(canvasRef.current);
    setupControls(canvasRef.current);
    setupScene();

    const handleResize = () => {
      if (!rendererRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    const handleClick = () => {
      if (document.pointerLockElement !== canvasRef.current || activeRoomId) return;
      
      // Calculate tile under player
      const tx = Math.floor((camera.position.x + 2) / 4);
      const ty = Math.floor((camera.position.z + 2) / 4);
      const id = `${tx}-${ty}`;
      const tile = layout[id];
      
      if (tile && tile.type === TileType.DOOR_FRAME) {
        if (!rooms[id]?.owner) {
          setModalState({ isOpen: true, roomId: id });
          document.exitPointerLock();
        } else {
          // Open the designer (TheaterView) via App component
          if (onEditRoom) {
            onEditRoom(id);
            document.exitPointerLock();
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setHudVisible(prev => !prev);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [layout, rooms, activeRoomId, onEditRoom]);

  useEffect(() => {
    renderLabyrinth(layout, rooms);
  }, [layout, rooms]);

  useRenderLoop((delta) => {
    if (!activeRoomId && !modalState.isOpen) {
      updateCamera(delta, layout);
      trackTraffic(camera.position);
    }
    
    if (rendererRef.current) {
      rendererRef.current.render(scene, camera);
      movePlayer({ x: camera.position.x, y: camera.position.y, z: camera.position.z });
      setCamRot(camera.rotation.y);
    }
  });

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      <HUD 
        tiles={layout} 
        playerPos={camera.position} 
        playerRot={camRot}
        visible={hudVisible && !activeRoomId} 
      />

      {activeRoomId && rooms[activeRoomId] && (
        <RoomInterior 
          room={rooms[activeRoomId]} 
          onExit={() => setActiveRoomId(null)} 
        />
      )}

      <ClaimRoomModal 
        isOpen={modalState.isOpen}
        targetRoomId={modalState.roomId}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </div>
  );
};
