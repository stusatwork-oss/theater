
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

  // Use a slightly larger grid for the scrollable labyrinth feel
  const layoutSize = 8;
  const layout = useMemo(() => {
    return generateLabyrinthLayout(roomsRecord, edges, layoutSize);
  }, [roomsRecord, edges]);

  const gridCells = [];
  // Use centered range to match generated layout
  const start = -Math.floor(layoutSize / 2);
  const end = start + layoutSize;
  
  for (let y = start; y < end; y++) {
    for (let x = start; x < end; x++) {
      gridCells.push(layout[`${x}-${y}`]);
    }
  }

  const getVariantStyle = (variant: string) => {
    if (variant.includes('warm')) return 'bg-orange-950/20 border-orange-900/20';
    if (variant.includes('cool')) return 'bg-cyan-950/20 border-cyan-900/20';
    return 'bg-slate-900/30 border-white/5';
  };

  return (
    <div className="w-full h-full p-8 md:p-20 overflow-auto flex items-start justify-center bg-[radial-gradient(circle_at_center,rgba(15,23,42,1)_0%,rgba(0,0,0,1)_100%)]">
      <div 
        className="grid gap-0 relative p-12 bg-black/40 rounded-[3rem] border border-white/5 backdrop-blur-sm"
        style={{ gridTemplateColumns: `repeat(${layoutSize}, minmax(0, 1fr))` }}
      >
        {gridCells.map((tile) => {
           if (!tile) return <div key={Math.random()} className="w-24 h-36 md:w-32 md:h-48"></div>;
           const room = roomsRecord[tile.id];

           // Case 1: Active Door Node (The "Cards")
           if (tile.type === TileType.DOOR_FRAME) {
              const isClaimed = !!room?.owner;
              const glowColor = room?.dominantColor || '#ffffff10';
              
              return (
                <div 
                  key={tile.id}
                  onClick={() => onEnter(tile.id)}
                  className="relative w-24 h-36 md:w-32 md:h-48 cursor-pointer transition-all duration-500 group hover:z-50 hover:scale-110 p-2"
                >
                   {isClaimed && (
                     <div 
                        className="absolute inset-4 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity animate-pulse"
                        style={{ backgroundColor: glowColor }}
                     ></div>
                   )}

                   <div className={`relative h-full bg-slate-900/80 border-2 rounded-xl shadow-2xl overflow-hidden transition-colors ${isClaimed ? 'border-white/20' : 'border-white/5 hover:border-white/20'}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 z-10">
                         {isClaimed ? (
                           <>
                             <div className="w-2 h-2 rounded-full shadow-[0_0_10px_white] mb-3" style={{ backgroundColor: glowColor }}></div>
                             <span className="theater-font text-white text-lg font-bold tracking-tighter leading-tight">{tile.id}</span>
                             <span className="text-[8px] text-white/40 uppercase tracking-[0.2em] mt-1 font-mono">SECTOR_LOCK</span>
                           </>
                         ) : (
                           <>
                             <i className="fa-solid fa-door-closed text-slate-700 mb-2 group-hover:text-slate-400 transition-colors"></i>
                             <span className="text-[10px] text-slate-600 uppercase font-mono tracking-widest group-hover:text-slate-400 transition-colors">{tile.id}</span>
                             <span className="text-[7px] text-slate-800 uppercase mt-1 font-bold group-hover:text-slate-600 transition-colors">AVAILABLE</span>
                           </>
                         )}
                      </div>
                      
                      {/* Technical accents */}
                      <div className="absolute top-1 left-1 w-1 h-1 bg-white/5 rounded-full"></div>
                      <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/5 rounded-full"></div>
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
                  className="relative w-24 h-36 md:w-32 md:h-48 flex items-center justify-center pointer-events-none"
               >
                  <div 
                    className="absolute inset-0"
                    style={{ transform: `rotate(${tile.rotation}deg)` }}
                  >
                     {/* Floor Base */}
                     <div className={`absolute inset-0 ${variantStyle}`}></div>
                     
                     {/* Wall Lines for 2D Roaming aesthetic */}
                     {!tile.connections.N && <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10"></div>}
                     {!tile.connections.S && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10"></div>}
                     {!tile.connections.E && <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-white/10"></div>}
                     {!tile.connections.W && <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-white/10"></div>}
                  </div>
               </div>
             );
           }

           // Case 3: VOID
           return (
             <div key={tile.id} className="w-24 h-36 md:w-32 md:h-48 flex items-center justify-center opacity-[0.03]">
               <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
             </div>
           );
        })}
      </div>
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
};

export default LabyrinthMap;
