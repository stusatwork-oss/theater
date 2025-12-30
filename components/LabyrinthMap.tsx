
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

  const layoutSize = 8;
  const layout = useMemo(() => {
    return generateLabyrinthLayout(roomsRecord, edges, layoutSize);
  }, [roomsRecord, edges]);

  const gridCells = [];
  const start = -Math.floor(layoutSize / 2);
  const end = start + layoutSize;
  
  for (let y = start; y < end; y++) {
    for (let x = start; x < end; x++) {
      gridCells.push(layout[`${x}-${y}`]);
    }
  }

  return (
    <div className="w-full h-full overflow-auto flex items-start justify-center bg-[#05070a] relative group">
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.15)_0%,rgba(0,0,0,1)_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
      </div>

      <div 
        className="grid gap-0 relative p-24 z-10"
        style={{ 
            gridTemplateColumns: `repeat(${layoutSize}, minmax(0, 1fr))`,
            perspective: '1000px'
        }}
      >
        {gridCells.map((tile) => {
           if (!tile) return <div key={Math.random()} className="w-32 h-44 md:w-40 md:h-56"></div>;
           const room = roomsRecord[tile.id];

           if (tile.type === TileType.DOOR_FRAME) {
              const isClaimed = !!room?.owner;
              const glowColor = room?.dominantColor || '#ffffff10';
              
              return (
                <div 
                  key={tile.id}
                  onClick={() => onEnter(tile.id)}
                  className="relative w-32 h-44 md:w-40 md:h-56 cursor-pointer transition-all duration-700 group/card hover:z-50 hover:scale-110 p-4"
                >
                   {/* CARD GLOW */}
                   {isClaimed && (
                     <div 
                        className="absolute inset-0 blur-[40px] opacity-20 group-hover/card:opacity-40 transition-opacity animate-pulse"
                        style={{ backgroundColor: glowColor }}
                     ></div>
                   )}

                   <div className={`relative h-full bg-[#0a0f18] border-2 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform-gpu group-hover/card:rotate-y-12 ${isClaimed ? 'border-white/10 group-hover/card:border-white/30' : 'border-white/5 group-hover/card:border-white/20'}`}>
                      {/* ROOM IMAGE PREVIEW */}
                      {isClaimed && room.imageUrl ? (
                        <div className="absolute inset-0 z-0">
                           <img src={room.imageUrl} className="w-full h-full object-cover opacity-40 group-hover/card:opacity-60 transition-opacity saturate-50" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black/80"></div>
                      )}
                      
                      {/* CARD CONTENT */}
                      <div className="absolute inset-0 flex flex-col items-center justify-between text-center p-4 z-10">
                         <div className="text-[8px] text-white/30 font-mono tracking-[0.3em] font-bold">
                           NODE_{tile.id.replace('-', '_')}
                         </div>

                         <div className="flex flex-col items-center">
                            {isClaimed ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_white] mb-3 animate-pulse" style={{ backgroundColor: glowColor }}></div>
                                <span className="theater-font text-white text-xl font-bold tracking-widest leading-none drop-shadow-md">
                                  {room.vibe?.split('-')[0].toUpperCase() || 'LOCKED'}
                                </span>
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-door-open text-slate-700 text-xl mb-3 group-hover/card:text-slate-400 transition-colors"></i>
                                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-[0.2em] group-hover/card:text-slate-300 transition-colors font-bold">VACANT_SECTOR</span>
                              </>
                            )}
                         </div>

                         <div className="w-full flex justify-between items-center text-[7px] text-white/20 font-mono font-bold uppercase tracking-tighter">
                            <span>{isClaimed ? 'AUTH_LEVEL_1' : 'NO_SIGNAL'}</span>
                            <div className="w-8 h-px bg-white/10"></div>
                            <span>0x{Math.floor(Math.random()*255).toString(16).toUpperCase()}</span>
                         </div>
                      </div>
                      
                      {/* OVERLAY ACCENTS */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none border border-white/5 rounded-2xl"></div>
                   </div>
                </div>
              );
           }
           
           if (tile.type !== TileType.VOID) {
             return (
               <div 
                  key={tile.id} 
                  className="relative w-32 h-44 md:w-40 md:h-56 flex items-center justify-center pointer-events-none opacity-40 hover:opacity-100 transition-opacity duration-1000"
               >
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: `rotate(${tile.rotation}deg)` }}
                  >
                     {/* 2D Hallway Graphic (Blueprint Style) */}
                     <div className="relative w-full h-full flex items-center justify-center">
                        {/* Horizontal Path */}
                        {(tile.type === TileType.STRAIGHT || tile.type === TileType.X || tile.type === TileType.T) && (
                           <div className="absolute w-full h-[1px] bg-slate-800"></div>
                        )}
                        {/* Vertical Path Component */}
                        {(tile.type === TileType.X || tile.type === TileType.T || tile.type === TileType.CORNER) && (
                           <div className="absolute w-[1px] h-full bg-slate-800"></div>
                        )}
                        
                        {/* Blueprint Details */}
                        <div className="w-6 h-6 border border-slate-900 rounded-sm flex items-center justify-center">
                           <div className="w-0.5 h-0.5 bg-slate-800 rounded-full"></div>
                        </div>
                     </div>
                  </div>
               </div>
             );
           }

           return (
             <div key={tile.id} className="w-32 h-44 md:w-40 md:h-56 flex items-center justify-center opacity-[0.05]">
               <div className="w-1 h-1 bg-white/20 rounded-full"></div>
             </div>
           );
        })}
      </div>
      
      {/* THE MANAGER WATERMARK */}
      <div className="fixed bottom-10 right-10 pointer-events-none opacity-10">
         <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-white whitespace-nowrap">
           MANAGEMENT_ID: {Math.random().toString(36).substring(7).toUpperCase()} // SECTOR_MAP_v2.1
         </p>
      </div>
    </div>
  );
};

export default LabyrinthMap;
