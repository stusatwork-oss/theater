
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
      
      claimRoom: (id, updates) => set((state) => ({
        rooms: {
          ...state.rooms,
          [id]: { ...state.rooms[id], ...updates, owner: 'Guest_User' }
        }
      })),
      
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
      name: 'labyrinth-storage-v2',
      partialize: (state) => ({ 
        rooms: state.rooms, 
        edges: state.edges,
        playerRoomId: state.playerRoomId 
      }),
    }
  )
);

export function createTestLabyrinth() {
  const rooms: Record<string, TheaterRoom> = {};
  const size = 12;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const id = `${x}-${y}`;
      rooms[id] = { id, coords: { x, y } };
    }
  }
  return rooms;
}
