
import React, { useMemo } from 'react';
import { TheaterRoom, Edge, HallwayTile, TileType } from '../types';
import { generateLabyrinthLayout } from '../hallwayService';

interface Props {
  rooms: TheaterRoom[];
  edges: Record<string, Edge>;
  onEnter: (id: string) => void;
}

const LabyrinthMap: React.FC<Props> = ({ rooms, edges, onEnter }) => {
  const roomsRecord = useMemo(() => {
    return rooms.reduce((acc, room) => ({ ...acc, [room.id]: room }), {} as Record<string, TheaterRoom>);
  }, [rooms]);

  const layout = useMemo(() => {
    return generateLabyrinthLayout(roomsRecord, edges, 6);
  }, [roomsRecord, edges]);

  const gridCells = [];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      gridCells.push(layout[`${x}-${y}`]);
    }
  }

  // Helper to get styling based on physics variant
  const getVariantStyle = (variant: string) => {
    switch(variant) {
      case 'warm-clean': return 'bg-orange-900/40 border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.1)]';
      case 'warm-decay': return 'bg-amber-950/60 border-amber-700/30 bg-[url("https://grainy-gradients.vercel.app/noise.svg")]';
      case 'cool-clean': return 'bg-slate-800/50 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]';
      case 'cool-decay': return 'bg-slate-900/80 border-indigo-900/40 bg-[url("https://grainy-gradients.vercel.app/noise.svg")]';
      default: return 'bg-slate-900/30 border-white/5';
    }
  };

  return (
    <div className="liminal-tile min-h-full p-12 overflow-auto flex items-center justify-center relative">
      <div className="grid grid-cols-6 gap-0 perspective-1000 relative z-10 p-12 bg-black/80 rounded-3xl shadow-2xl border border-white/5 backdrop-blur-sm">
        {gridCells.map((tile) => {
           if (!tile) return <div key={Math.random()} className="w-32 h-48"></div>;
           const room = roomsRecord[tile.id];

           // Case 1: Active Door Node
           if (tile.type === TileType.DOOR_FRAME) {
              const glowColor = room.dominantColor || '#00000000';
              const composition = room.compositionKey || '0-0-0-0';
              
              return (
                <div 
                  key={tile.id}
                  onClick={() => onEnter(tile.id)}
                  className="relative w-32 h-48 cursor-pointer transition-all duration-700 group hover:z-50 hover:scale-105 p-1"
                >
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
                      
                      <div className="absolute right-2 top-1/2 w-1.5 h-6 bg-slate-700 rounded-full border border-white/5"></div>
                   </div>
                </div>
              );
           }
           
           // Case 2: Hallway Tile
           if (tile.type !== TileType.VOID) {
             const variantStyle = getVariantStyle(tile.variant);
             
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
                      opacity: 0.5 + tile.trafficStrength * 0.5,
                      transform: `rotate(${tile.rotation}deg)` 
                    }}
                  >
                     {/* Base Floor with Variant Flavor */}
                     <div className={`absolute inset-0 transition-all duration-1000 ${variantStyle}`}></div>
                     
                     {/* Wall Geometry */}
                     {!tile.connections.N && <div className="absolute top-0 left-0 right-0 h-4 bg-black/60 border-b border-white/5"></div>}
                     {!tile.connections.S && <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/60 border-t border-white/5"></div>}
                     {!tile.connections.E && <div className="absolute top-0 bottom-0 right-0 w-4 bg-black/60 border-l border-white/5"></div>}
                     {!tile.connections.W && <div className="absolute top-0 bottom-0 left-0 w-4 bg-black/60 border-r border-white/5"></div>}

                     {/* Traffic Overlay */}
                     <div 
                       className="absolute inset-4 bg-white/5 blur-md rounded-full pointer-events-none"
                       style={{ opacity: tile.trafficStrength * 0.5 }}
                     ></div>
                  </div>
                  
                  {/* Debug Info */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-1 flex flex-col items-center pointer-events-none">
                     <span className="text-[8px] text-slate-500 font-mono uppercase bg-black/80 px-1 rounded">{tile.type}</span>
                     <span className="text-[7px] text-slate-600 font-mono uppercase">{tile.variant}</span>
                  </div>
               </div>
             );
           }

           // Case 3: VOID
           return (
             <div 
               key={tile.id} 
               onClick={() => onEnter(tile.id)}
               className="w-32 h-48 flex items-center justify-center opacity-5 hover:opacity-20 transition-opacity cursor-pointer m-1"
             >
               <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default LabyrinthMap;
