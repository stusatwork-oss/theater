
import React, { useState, useEffect } from 'react';
import { Minimap } from './Minimap';
import { HallwayTile } from '../types';
import { generateManagerRemark } from '../geminiService';

interface Props {
  tiles: Record<string, HallwayTile>;
  playerPos: { x: number; z: number };
  playerRot: number;
  visible: boolean;
}

export const HUD: React.FC<Props> = ({ tiles, playerPos, playerRot, visible }) => {
  const [remark, setRemark] = useState("KEEP MOVING. BROWSING IS FOR CUSTOMERS.");
  
  useEffect(() => {
    // Increased interval to 45 seconds to stay within quota
    const interval = setInterval(async () => {
      if (visible) {
        const text = await generateManagerRemark("Wandering the corridors");
        if (text) setRemark(text);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-40">
      <div className="flex justify-between items-start">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-1 max-w-[200px]">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em]">System_Pulse</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-white font-mono uppercase">Status: Nominal</span>
          </div>
          <div className="mt-4 border-t border-white/5 pt-2">
            <p className="text-[9px] text-red-500 font-bold uppercase mb-1">Manager_Msg:</p>
            <p className="text-[10px] text-slate-300 italic leading-tight">"{remark}"</p>
          </div>
        </div>
        
        <Minimap tiles={tiles} playerPos={playerPos} playerRot={playerRot} />
      </div>

      <div className="flex justify-between items-end">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <p className="text-[10px] text-slate-500 font-mono uppercase mb-2">Orientation_Matrix</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[10px]">
            <span className="text-slate-400">X_COORD:</span> <span className="text-white text-right">{playerPos.x.toFixed(2)}</span>
            <span className="text-slate-400">Z_COORD:</span> <span className="text-white text-right">{playerPos.z.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
           <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest italic">Liminal Theater Labyrinth // v0.9.0-alpha</p>
           <p className="text-[10px] text-white/40 font-mono">TAB TO TOGGLE HUD // WASD TO NAVIGATE</p>
        </div>
      </div>
    </div>
  );
};
