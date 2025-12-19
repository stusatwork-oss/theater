
import React from 'react';
import LabyrinthMap from './LabyrinthMap';
import { useLabyrinthStore } from '../store/labyrinthStore';

interface LabyrinthViewProps {
  onEditRoom: (id: string) => void;
}

/**
 * @deprecated Switching back to direct 2D LabyrinthMap in App.tsx as requested.
 * Keeping this as a placeholder or to be deleted in favor of LabyrinthMap.
 */
export const LabyrinthView: React.FC<LabyrinthViewProps> = ({ onEditRoom }) => {
  const { rooms, edges } = useLabyrinthStore();
  const roomsArray = Object.values(rooms);

  return (
    <div className="w-full h-full">
       <LabyrinthMap 
          rooms={roomsArray} 
          edges={edges} 
          onEnter={onEditRoom} 
       />
    </div>
  );
};
