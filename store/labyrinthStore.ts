
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TheaterRoom, Edge, VibeVector } from '../types';

interface LabyrinthState {
  rooms: Record<string, TheaterRoom>;
  edges: Record<string, Edge>;
  playerRoomId: string | null;
  currentPosition: { x: number; y: number; z: number };
  currentRotation: { x: number; y: number };
  
  setRooms: (rooms: Record<string, TheaterRoom>) => void;
  setEdges: (edges: Record<string, Edge>) => void;
  claimRoom: (id: string, updates: Partial<TheaterRoom>) => void;
  updateTraffic: (from: string, to: string, delta: number) => void;
  movePlayer: (pos: { x: number; y: number; z: number }) => void;
  setRotation: (rot: { x: number; y: number }) => void;
}

export const useLabyrinthStore = create<LabyrinthState>()(
  persist(
    (set) => ({
      rooms: {},
      edges: {},
      playerRoomId: null,
      currentPosition: { x: 0, y: 1.6, z: 0 },
      currentRotation: { x: 0, y: 0 },
      
      setRooms: (rooms) => set({ rooms }),
      setEdges: (edges) => set({ edges }),
      
      claimRoom: (id, updates) => set((state) => {
        const existingRoom = state.rooms[id] || { id, coords: { x: 0, y: 0 } };
        return {
          rooms: {
            ...state.rooms,
            [id]: { ...existingRoom, ...updates }
          }
        };
      }),
      
      updateTraffic: (from, to, delta) => set((state) => {
        const key = `${from}->${to}`;
        const existing = state.edges[key] || { from, to, traffic: 0 };
        return {
          edges: {
            ...state.edges,
            [key]: { ...existing, traffic: Math.min(1.0, existing.traffic + delta) }
          }
        };
      }),
      
      movePlayer: (currentPosition) => set({ currentPosition }),
      setRotation: (currentRotation) => set({ currentRotation }),
    }),
    {
      name: 'labyrinth-storage-v5', // New version to ensure clean layout state
      partialize: (state) => ({ 
        rooms: state.rooms, 
        edges: state.edges,
        playerRoomId: state.playerRoomId 
      }),
    }
  )
);

export function createTestLabyrinth(): { rooms: Record<string, TheaterRoom>, edges: Record<string, Edge> } {
  const rooms: Record<string, TheaterRoom> = {};
  const edges: Record<string, Edge> = {};
  
  // A small cross-grid of available sectors
  const roomCoords = [
    [0, 0], [0, 2], [0, -2], [2, 0], [-2, 0]
  ];
  
  roomCoords.forEach(([rx, ry]) => {
    const id = `${rx}-${ry}`;
    rooms[id] = { id, coords: { x: rx, y: ry } };
    
    // Connect all to center if not center
    if (rx !== 0 || ry !== 0) {
      edges[`0-0->${id}`] = { from: '0-0', to: id, traffic: 0.1 };
    }
  });

  return { rooms, edges };
}
