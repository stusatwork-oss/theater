
import React, { useState, useEffect, useCallback } from 'react';
import { TheaterRoom, LabyrinthState, getCompositionKey, Edge } from './types';
import LabyrinthMap from './components/LabyrinthMap';
import TheaterView from './components/TheaterView';
import DiscoveryModal from './components/DiscoveryModal';

const INITIAL_GRID_SIZE = 6;
const DECAY_INTERVAL = 30000; // 30 seconds

const App: React.FC = () => {
  const [state, setState] = useState<LabyrinthState>({
    currentRoomId: null,
    lastRoomId: null,
    rooms: {},
    edges: {},
    discoveryQuestions: [
      "Upgrade 1: Composition Key - Rooms now calculate a unique key [warmth-sat-ent-flicker] to enable future aesthetic clustering.",
      "Upgrade 2: Edge Memory - The labyrinth tracks 'desire lines' between rooms, recording user traffic patterns for future corridor stability.",
      "Upgrade 3: Entropy Contagion - Claiming a high-entropy room slightly pushes the entropy of neighbors, allowing 'biomes' to naturally emerge.",
      "L0: Palette - Dominant colors, warmth bias, saturation, and contrast drive the core materials.",
      "L1: Lighting - personality shift, flicker probability, and shadow softness based on AI vector.",
      "L2: Post Stack - Film grain, bloom, fog density, and chromatic aberration simulation.",
      "L3: Props & Decals - Asset matching and prop density driven by 'Entropy' (stable vs cursed).",
      "VibeVector: Structured 0..1 metadata used to bridge AI extraction and deterministic game rendering.",
      "The Manager: A sinister AI presence that mocks user input while processing their 'essence'.",
      "Static Territory: User has no build-control; the labyrinth is a fixed social proof-of-concept."
    ]
  });

  const [showDiscovery, setShowDiscovery] = useState(false);

  // Initialize rooms
  useEffect(() => {
    const rooms: Record<string, TheaterRoom> = {};
    for (let x = 0; x < INITIAL_GRID_SIZE; x++) {
      for (let y = 0; y < INITIAL_GRID_SIZE; y++) {
        const id = `${x}-${y}`;
        rooms[id] = { id, coords: { x, y } };
      }
    }
    setState(prev => ({ ...prev, rooms }));
  }, []);

  // Edge Decay Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        const newEdges = { ...prev.edges };
        let changed = false;
        Object.keys(newEdges).forEach(key => {
          if (newEdges[key].traffic > 0) {
            newEdges[key].traffic = Math.max(0, newEdges[key].traffic - 0.1);
            changed = true;
          }
        });
        return changed ? { ...prev, edges: newEdges } : prev;
      });
    }, DECAY_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handleEnterRoom = (roomId: string) => {
    setState(prev => {
      const nextState = { ...prev, currentRoomId: roomId, lastRoomId: prev.currentRoomId };
      
      // Upgrade 2: Track transition if moving between different rooms
      if (prev.currentRoomId && prev.currentRoomId !== roomId) {
        const edgeKey = `${prev.currentRoomId}->${roomId}`;
        const existingEdge = prev.edges[edgeKey] || { from: prev.currentRoomId, to: roomId, traffic: 0 };
        nextState.edges = {
          ...prev.edges,
          [edgeKey]: { ...existingEdge, traffic: existingEdge.traffic + 1 }
        };
      }
      
      return nextState;
    });
  };

  const handleUpdateRoom = (roomId: string, updates: Partial<TheaterRoom>) => {
    setState(prev => {
      let newRooms = {
        ...prev.rooms,
        [roomId]: { ...prev.rooms[roomId], ...updates }
      };

      // Apply Upgrade 1: Composition Key
      if (updates.vibeVector) {
        newRooms[roomId].compositionKey = getCompositionKey(updates.vibeVector);
        
        // Upgrade 3: Entropy Contagion
        // When a room is updated with a vibeVector, nudge neighbors.
        const [x, y] = roomId.split('-').map(Number);
        const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        const currentEntropy = updates.vibeVector.entropy;

        neighbors.forEach(([nx, ny]) => {
          const nid = `${nx}-${ny}`;
          if (newRooms[nid]) {
            const room = newRooms[nid];
            // Influence logic: High entropy pulls up, low pulls down.
            const delta = currentEntropy > 0.5 ? 0.03 : -0.02;
            
            if (room.vibeVector) {
              const v = { ...room.vibeVector };
              v.entropy = Math.min(1, Math.max(0, v.entropy + delta));
              newRooms[nid] = { ...room, vibeVector: v, compositionKey: getCompositionKey(v) };
            }
          }
        });
      }

      return { ...prev, rooms: newRooms };
    });
  };

  const handleResetRoom = (roomId: string) => {
    setState(prev => {
      const resetRoom: TheaterRoom = {
        id: roomId,
        coords: prev.rooms[roomId].coords
      };
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          [roomId]: resetRoom
        }
      };
    });
  };

  const handleBackToMap = () => {
    setState(prev => ({ ...prev, currentRoomId: null }));
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-200">
      <header className="p-4 bg-black border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded flex items-center justify-center">
            <i className="fa-solid fa-microchip text-slate-600 text-sm"></i>
          </div>
          <div>
            <h1 className="theater-font text-xl font-bold tracking-widest text-slate-100 uppercase">LABYRINTH_OS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Biomes: Active // Traffic: {Object.keys(state.edges).length} Edges
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowDiscovery(true)}
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-[9px] font-mono font-bold uppercase tracking-widest transition-colors border border-white/5"
        >
          System_Spec
        </button>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {state.currentRoomId ? (
          <TheaterView 
            room={state.rooms[state.currentRoomId]} 
            onBack={handleBackToMap}
            onUpdate={(updates) => handleUpdateRoom(state.currentRoomId!, updates)}
            onReset={() => handleResetRoom(state.currentRoomId!)}
          />
        ) : (
          <LabyrinthMap 
            rooms={Object.values(state.rooms)} 
            edges={state.edges}
            onEnter={handleEnterRoom} 
          />
        )}
      </main>

      {showDiscovery && (
        <DiscoveryModal 
          questions={state.discoveryQuestions} 
          onClose={() => setShowDiscovery(false)} 
        />
      )}
    </div>
  );
};

export default App;
