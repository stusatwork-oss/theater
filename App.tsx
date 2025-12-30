
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
    "Upgrade 1: 2D Liminal Map - The visual clarity of the 'Perfect Card System' is back.",
    "Upgrade 2: Theater Designer - High-fidelity flavor extraction with hero-image support.",
    "Upgrade 3: Visual Hallways - Hallways now procedural connect your theater sectors in 2D.",
    "L0: Palette - Dominant colors and mood bias.",
    "L1: Lighting - Personality shifts and flicker probability.",
    "L2: Post Stack - Grain, bloom, and fog simulation.",
    "L3: Props & Entropy - Condition-based asset matching.",
    "VibeVector: Structured metadata for deterministic room rendering.",
    "The Manager: A sinister AI presence that oversees the labyrinth.",
    "Persistence: Your labyrinth layout is saved across sessions."
  ];

  const roomsArray = Object.values(rooms);

  return (
    <div className="w-screen h-screen relative flex flex-col bg-[#05070a] text-slate-200 overflow-hidden font-sans">
      {/* SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* HUD Header */}
      <header className="p-5 bg-black/60 border-b border-white/5 flex justify-between items-center absolute top-0 left-0 w-full z-50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.2)]">
            <i className="fa-solid fa-masks-theater text-red-600 text-lg"></i>
          </div>
          <div>
            <h1 className="theater-font text-2xl font-bold tracking-[0.2em] text-white uppercase">MALL_BACKROOMS</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-mono font-bold flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Labyrinth_Node: {Object.keys(rooms).filter(id => rooms[id].owner).length} / {Object.keys(rooms).length} ACTIVE
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowDiscovery(true)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 active:scale-95 shadow-xl"
          >
            Terminal_Log
          </button>
        </div>
      </header>

      <main className="w-full h-full pt-20 relative overflow-hidden">
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
          <div className="w-full h-full animate-in fade-in duration-1000">
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
