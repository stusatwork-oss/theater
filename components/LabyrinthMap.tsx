
import React, { useMemo } from 'react';
import { TheaterRoom, Edge, HallwayTile, TileType } from '../types';
import { generateLabyrinthLayout } from '../hallwayService';

interface Props {
  rooms: TheaterRoom[];
  edges: Record<string, Edge>;
  onEnter: (id: string) => void;
}

const LabyrinthMap: React.FC<Props> = ({ rooms, edges, onEnter }) => {
  // Convert array to record for generator
  const roomsRecord = useMemo(() => {
    return rooms.reduce((acc, room) => ({ ...acc, [room.id]: room }), {} as Record<string, TheaterRoom>);
  }, [rooms]);

  // Deterministic layout generation (memoized)
  const layout = useMemo(() => {
    return generateLabyrinthLayout(roomsRecord, edges, 6);
  }, [roomsRecord, edges]);

  // Layout grid is 6x6
  const gridCells = [];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      gridCells.push(layout[`${x}-${y}`]);
    }
  }

  return (
    <div className="liminal-tile min-h-full p-12 overflow-auto flex items-center justify-center relative">
      <div className="grid grid-cols-6 gap-0 perspective-1000 relative z-10 p-12 bg-black/40 rounded-3xl shadow-2xl border border-white/5">
        {gridCells.map((tile) => {
           if (!tile) return <div key={Math.random()} className="w-32 h-48"></div>;
           
           const room = roomsRecord[tile.id];

           // Case 1: Active Door Node (The TheaterRoom)
           if (tile.type === TileType.DOOR_FRAME) {
              const glowColor = room.dominantColor || '#00000000';
              const composition = room.compositionKey || '0-0-0-0';
              
              return (
                <div 
                  key={tile.id}
                  onClick={() => onEnter(tile.id)}
                  className="relative w-32 h-48 cursor-pointer transition-all duration-700 group hover:z-50 hover:scale-105 p-1"
                >
                   {/* Glow */}
                   <div 
                      className="absolute inset-2 blur-xl opacity-40 group-hover:opacity-80 transition-opacity animate-pulse"
                      style={{ backgroundColor: glowColor }}
                   ></div>

                   <div className={`relative h-full bg-slate-900 border-x-4 border-t-8 border-slate-800 rounded-t-xl shadow-2xl overflow-hidden`}
                        style={{ borderColor: `${glowColor}66` }}>
                      
                      <div className="absolute inset-1 bg-slate-950 rounded-t-lg border border-white/5 flex flex-col items-center justify-center text-center p-2">
                         <div className="w-1.5 h-1.5 rounded-full shadow-lg mb-4" style={{ backgroundColor: glowColor }}></div>
                         <span className="theater-font text-slate-200 text-lg font-bold opacity-90">{tile.id}</span>
                         <span className="text-[9px] text-white/50 uppercase tracking-widest mt-1">Occupied</span>
                         <div className="mt-1 text-[8px] text-amber-500 font-mono italic">{room.condition}</div>
                      </div>
                      
                      {/* Handle */}
                      <div className="absolute right-2 top-1/2 w-1.5 h-6 bg-slate-700 rounded-full border border-white/5"></div>
                   </div>
                </div>
              );
           }
           
           // Case 2: Hallway Tile
           if (tile.type !== TileType.VOID) {
             return (
               <div 
                  key={tile.id} 
                  onClick={() => onEnter(tile.id)}
                  className="relative w-32 h-48 flex items-center justify-center cursor-pointer group"
                >
                  {/* Hallway Visualization */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-1000"
                    style={{ 
                      opacity: 0.3 + tile.trafficStrength * 0.7,
                      transform: `rotate(${tile.rotation}deg)` 
                    }}
                  >
                     {/* Floor */}
                     <div className="absolute inset-2 bg-slate-900/80 border border-white/5"></div>
                     
                     {/* Wall Graphics based on TileType */}
                     {/* Using simplified CSS geometry for walls */}
                     {/* N Wall */}
                     {!tile.connections.N && <div className="absolute top-2 left-2 right-2 h-1 bg-slate-700"></div>}
                     {/* S Wall */}
                     {!tile.connections.S && <div className="absolute bottom-2 left-2 right-2 h-1 bg-slate-700"></div>}
                     {/* E Wall */}
                     {!tile.connections.E && <div className="absolute top-2 bottom-2 right-2 w-1 bg-slate-700"></div>}
                     {/* W Wall */}
                     {!tile.connections.W && <div className="absolute top-2 bottom-2 left-2 w-1 bg-slate-700"></div>}

                     {/* Traffic Glow */}
                     <div className="absolute inset-0 bg-blue-500/5 blur-md"></div>
                     
                     {/* Center Marker */}
                     <div className="w-2 h-2 bg-slate-800 rounded-full opacity-50"></div>
                  </div>
                  
                  {/* Hover info */}
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 font-mono absolute bottom-2">{tile.type}</span>
               </div>
             );
           }

           // Case 3: VOID (Unclaimed, No Traffic)
           return (
             <div 
               key={tile.id} 
               onClick={() => onEnter(tile.id)}
               className="w-32 h-48 flex items-center justify-center opacity-10 hover:opacity-30 transition-opacity cursor-pointer border border-white/5 m-1"
             >
               <i className="fa-solid fa-plus text-slate-700 text-xs"></i>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default LabyrinthMap;
