
import React, { useEffect, useState } from 'react';
import { useLabyrinthStore, createTestLabyrinth } from './store/labyrinthStore';
import LabyrinthMap from './components/LabyrinthMap';
import TheaterView from './components/TheaterView';
import DiscoveryModal from './components/DiscoveryModal';

const App: React.FC = () => {
  const { rooms, edges, setRooms, setEdges, claimRoom } = useLabyrinthStore();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);

  useEffect(() => {
    // Initializing with the test labyrinth if empty
    if (Object.keys(rooms).length === 0) {
      const testData = createTestLabyrinth();
      setRooms(testData.rooms);
      setEdges(testData.edges);
    }
  }, []);

  const handleBackToMap = () => setCurrentRoomId(null);

  const discoveryQuestions = [
    "Upgrade 1: 2D Grid Navigation - The original 'Perfect' card system restored.",
    "Upgrade 2: Theater Designer - High-fidelity flavor extraction with image support.",
    "Upgrade 3: Labyrinth Paths - Hallways now visually connect your theater sectors.",
    "L0: Palette - Dominant colors and mood bias.",
    "L1: Lighting - Personality shifts and flicker probability.",
    "L2: Post Stack - Grain, bloom, and fog simulation.",
    "L3: Props & Entropy - Condition-based asset matching.",
    "VibeVector: Structured metadata for deterministic room rendering.",
    "The Manager: A sinister AI presence that oversees the labyrinth.",
    "Persistence: Your labyrinth layout is saved across sessions."
  ];

  // Convert rooms record to array for the map component
  const roomsArray = Object.values(rooms);

  return (
    <div className="w-screen h-screen relative flex flex-col bg-black text-slate-200 overflow-hidden">
      {/* HUD Header */}
      <header className="p-4 bg-black/80 border-b border-white/10 flex justify-between items-center absolute top-0 left-0 w-full z-50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded flex items-center justify-center">
            <i className="fa-solid fa-theater-masks text-red-600 text-sm"></i>
          </div>
          <div>
            <h1 className="theater-font text-xl font-bold tracking-widest text-slate-100 uppercase">THEATER_LABYRINTH</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Sector Status: {Object.keys(rooms).filter(id => rooms[id].owner).length} Claimed
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowDiscovery(true)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-[9px] font-mono font-bold uppercase tracking-widest transition-colors border border-white/5"
          >
            System_Spec
          </button>
        </div>
      </header>

      <main className="w-full h-full pt-16 relative overflow-hidden">
        {currentRoomId && rooms[currentRoomId] ? (
          <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500">
            <TheaterView 
              room={rooms[currentRoomId]} 
              onBack={handleBackToMap}
              onUpdate={(updates) => claimRoom(currentRoomId, updates)}
              onReset={() => claimRoom(currentRoomId, { owner: undefined, vibeVector: undefined, imageUrl: undefined, vibe: undefined })}
            />
          </div>
        ) : (
          <div className="w-full h-full animate-in fade-in duration-700">
            <LabyrinthMap 
              rooms={roomsArray} 
              edges={edges} 
              onEnter={(id) => setCurrentRoomId(id)} 
            />
          </div>
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
