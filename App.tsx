
import React, { useEffect, useState } from 'react';
import { useLabyrinthStore, createTestLabyrinth } from './store/labyrinthStore';
import { LabyrinthView } from './components/LabyrinthView';
import TheaterView from './components/TheaterView';
import DiscoveryModal from './components/DiscoveryModal';

const App: React.FC = () => {
  const { rooms, setRooms, claimRoom } = useLabyrinthStore();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);

  useEffect(() => {
    if (Object.keys(rooms).length === 0) {
      setRooms(createTestLabyrinth());
    }
  }, []);

  const handleBackToMap = () => setCurrentRoomId(null);

  const discoveryQuestions = [
    "Upgrade 1: Composition Key - Rooms now calculate a unique key [warmth-sat-ent-flicker].",
    "Upgrade 2: Edge Memory - The labyrinth tracks 'desire lines' between rooms.",
    "Upgrade 3: Entropy Contagion - High-entropy rooms push neighbors' entropy.",
    "L0: Palette - Dominant colors, warmth bias, saturation, and contrast.",
    "L1: Lighting - personality shift, flicker probability, and shadow softness.",
    "L2: Post Stack - Film grain, bloom, fog density, and chromatic aberration.",
    "L3: Props & Decals - Asset matching and prop density driven by 'Entropy'.",
    "VibeVector: Structured 0..1 metadata used for deterministic game rendering.",
    "The Manager: A sinister AI presence that mocks user input.",
    "Three.js Integration: The labyrinth is now a navigable 3D world."
  ];

  return (
    <div className="w-screen h-screen relative flex flex-col bg-black text-slate-200 overflow-hidden">
      <header className="p-4 bg-black border-b border-white/5 flex justify-between items-center absolute top-0 left-0 w-full z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded flex items-center justify-center">
            <i className="fa-solid fa-microchip text-slate-600 text-sm"></i>
          </div>
          <div>
            <h1 className="theater-font text-xl font-bold tracking-widest text-slate-100 uppercase">LABYRINTH_OS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Render: Three.js // Physics: Active
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowDiscovery(true)}
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-[9px] font-mono font-bold uppercase tracking-widest transition-colors border border-white/5 pointer-events-auto"
        >
          System_Spec
        </button>
      </header>

      <main className="w-full h-full relative">
        {currentRoomId && rooms[currentRoomId] ? (
          <TheaterView 
            room={rooms[currentRoomId]} 
            onBack={handleBackToMap}
            onUpdate={(updates) => claimRoom(currentRoomId, updates)}
            onReset={() => claimRoom(currentRoomId, { owner: undefined, vibeVector: undefined, imageUrl: undefined })}
          />
        ) : (
          <LabyrinthView onEditRoom={setCurrentRoomId} />
        )}
      </main>

      {showDiscovery && (
        <DiscoveryModal 
          questions={discoveryQuestions} 
          onClose={() => setShowDiscovery(false)} 
        />
      )}
    </div>
  );
};

export default App;
