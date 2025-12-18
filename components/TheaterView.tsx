
import React, { useState, useEffect, useMemo } from 'react';
import { TheaterRoom, VibeVector } from '../types';
import { analyzeFlavor, generateRoomImage, generateManagerRemark } from '../geminiService';

interface Props {
  room: TheaterRoom;
  onBack: () => void;
  onUpdate: (updates: Partial<TheaterRoom>) => void;
  onReset: () => void;
}

const TheaterView: React.FC<Props> = ({ room, onBack, onUpdate, onReset }) => {
  const [flavorInput, setFlavorInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [managerQuote, setManagerQuote] = useState("We don't do refunds for spatial drift.");

  const isClaimed = !!room.owner;

  useEffect(() => {
    if (loading) {
      // Slower interval during loading (25s) to avoid Resource Exhausted errors
      const updateQuote = async () => {
        const quote = await generateManagerRemark(status);
        if (quote) setManagerQuote(quote);
      };
      const interval = setInterval(updateQuote, 25000);
      return () => clearInterval(interval);
    }
  }, [loading, status]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processFlavor = async () => {
    if (isClaimed) return;
    setLoading(true);
    setStatus('Compiling Vibe Stack Layer 0-3...');
    try {
      const b64 = selectedImage?.split(',')[1];
      const result = await analyzeFlavor(flavorInput, b64);
      
      setStatus('Synthesizing Labyrinth Sector...');
      const imageUrl = await generateRoomImage(result.vibeVector, result.condition);
      
      onUpdate({
        owner: 'Guest_User',
        vibe: result.vibeVector.moodTag,
        vibeVector: result.vibeVector,
        dominantColor: result.vibeVector.palette[0],
        condition: result.condition,
        assets: result.assets,
        imageUrl: imageUrl || undefined,
        lastContentUpdate: Date.now()
      });
      setStatus('');
    } catch (err) {
      console.error(err);
      setStatus('Sector compilation failed. Try again.');
      setTimeout(() => setLoading(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate CSS filters based on VibeVector
  const viewportStyle = useMemo(() => {
    if (!room.vibeVector) return {};
    const v = room.vibeVector;
    const warmthHue = v.warmth > 0.5 ? (v.warmth - 0.5) * 40 : (v.warmth - 0.5) * 60; // Bias orange vs blue
    return {
      filter: `
        saturate(${0.5 + v.saturation}) 
        contrast(${0.7 + v.contrast * 0.6}) 
        hue-rotate(${warmthHue}deg)
        blur(${v.fog * 2}px)
      `,
      opacity: 0.9 + (1 - v.grain) * 0.1
    };
  }, [room.vibeVector]);

  const flickerAnim = useMemo(() => {
    if (!room.vibeVector?.flicker) return '';
    return room.vibeVector.flicker > 0.4 ? 'flicker-active' : '';
  }, [room.vibeVector]);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* Sidebar - Technical Stack Data */}
      <div className="w-full md:w-96 bg-black border-r border-white/10 p-8 flex flex-col gap-8 overflow-y-auto">
        <button onClick={onBack} className="flex items-center text-slate-300 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">
          <i className="fa-solid fa-arrow-left-long mr-2"></i> Exit Sector
        </button>

        {!isClaimed ? (
          <div className="space-y-6">
            <h2 className="theater-font text-4xl font-bold text-slate-100 uppercase leading-none">VIBE_INTEREST</h2>
            <p className="text-sm text-slate-400 font-mono tracking-tighter leading-relaxed">
              [SYSTEM_MESSAGE]: Feed the architecture with visual or textual essence. This process is destructive and irreversible.
            </p>

            <div className="space-y-4">
              <div className="relative group aspect-square bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-red-900/50">
                {selectedImage ? (
                  <img src={selectedImage} alt="Input" className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="text-center p-6">
                    <i className="fa-solid fa-fingerprint text-3xl text-slate-500 mb-2"></i>
                    <p className="text-xs text-slate-400 font-mono uppercase">Reference_Upload</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <textarea 
                value={flavorInput}
                onChange={(e) => setFlavorInput(e.target.value)}
                placeholder="Atmospheric Descriptor..."
                className="w-full bg-slate-900/30 border border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-200 focus:border-red-900/50 outline-none h-32 resize-none"
              />

              <button 
                onClick={processFlavor}
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-red-950/30 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900/50 rounded-lg font-mono text-xs uppercase tracking-[0.4em] transition-all disabled:opacity-30"
              >
                {loading ? 'Compiling...' : 'Finalize_Stack'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-1000">
             <div className="flex justify-between items-start">
              <div>
                <h2 className="theater-font text-4xl font-bold text-slate-100">{room.id}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">SECTOR_LOCKED</span>
                </div>
              </div>
              <button 
                onClick={onReset}
                title="Reset Room"
                className="p-2 bg-slate-900 hover:bg-red-900/40 border border-slate-700 hover:border-red-800 rounded transition-colors text-slate-400 hover:text-white"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>

            {/* Vibe Stack Layers Visualizer */}
            <div className="space-y-4">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">4-Layer Vibe Stack</h4>
               
               {/* Layer 0: Palette */}
               <div className="p-4 bg-white/[0.04] border border-white/10 rounded-lg shadow-xl">
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-xs text-slate-300 uppercase font-mono font-bold">L0_Palette</span>
                   <span className="text-[10px] text-slate-400 font-mono">W:{room.vibeVector?.warmth.toFixed(2)} S:{room.vibeVector?.saturation.toFixed(2)}</span>
                 </div>
                 <div className="flex gap-1.5">
                   {room.vibeVector?.palette.map((c, i) => (
                     <div key={i} className="h-8 flex-1 rounded shadow-inner border border-white/5" style={{ backgroundColor: c }}></div>
                   ))}
                 </div>
               </div>

               {/* Layer 1: Lighting */}
               <div className="p-4 bg-white/[0.04] border border-white/10 rounded-lg">
                 <span className="text-xs text-slate-300 uppercase font-mono block mb-2 font-bold">L1_Lighting</span>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Flicker</div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-700" style={{ width: `${(room.vibeVector?.flicker || 0) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Shadows</div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400" style={{ width: `${(room.vibeVector?.contrast || 0) * 100}%` }}></div>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Layer 2: Post */}
               <div className="p-4 bg-white/[0.04] border border-white/10 rounded-lg">
                 <span className="text-xs text-slate-300 uppercase font-mono block mb-2 font-bold">L2_PostStack</span>
                 <div className="flex gap-4 text-xs font-mono">
                    <span className={room.vibeVector?.grain && room.vibeVector.grain > 0.5 ? 'text-slate-100 font-bold' : 'text-slate-600'}>GRAIN</span>
                    <span className={room.vibeVector?.bloom && room.vibeVector.bloom > 0.5 ? 'text-slate-100 font-bold' : 'text-slate-600'}>BLOOM</span>
                    <span className={room.vibeVector?.fog && room.vibeVector.fog > 0.5 ? 'text-slate-100 font-bold' : 'text-slate-600'}>FOG</span>
                 </div>
               </div>

               {/* Layer 3: Props/Entropy */}
               <div className="p-4 bg-white/[0.04] border border-white/10 rounded-lg">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-xs text-slate-300 uppercase font-mono font-bold">L3_Entropy</span>
                   <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">{room.condition}</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-600" style={{ width: `${(room.vibeVector?.entropy || 0) * 100}%` }}></div>
                 </div>
               </div>
            </div>

            <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-lg">
               <h4 className="text-xs font-bold text-red-500 uppercase mb-3 font-mono">Manager_Voice</h4>
               <p className="text-base italic text-slate-300 font-serif leading-relaxed">"{managerQuote}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Screen */}
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center p-12 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-center p-12">
            <div className="w-48 h-1 bg-slate-900 mb-8 overflow-hidden rounded-full">
              <div className="w-1/3 h-full bg-red-600 animate-[loading_2s_infinite_linear]"></div>
            </div>
            <p className="text-red-600 font-mono text-xs uppercase tracking-[1em] mb-4 font-bold">{status}</p>
            <div className="max-w-xs animate-pulse">
               <p className="text-xl theater-font italic text-slate-400">"{managerQuote}"</p>
               <p className="text-xs text-slate-600 mt-3 uppercase font-mono">— THE_MANAGER</p>
            </div>
          </div>
        )}

        {/* Viewport with Layers applied */}
        <div className={`relative w-full max-w-6xl aspect-video bg-black shadow-[0_0_150px_rgba(0,0,0,1)] rounded-sm overflow-hidden border border-white/5 ${flickerAnim}`}>
           {room.imageUrl ? (
             <div className="w-full h-full relative overflow-hidden">
                <img 
                  src={room.imageUrl} 
                  className="w-full h-full object-cover transition-all duration-1000" 
                  style={viewportStyle}
                  alt="Sector View" 
                />
                
                {/* Layer 2: Grain Overlay */}
                {room.vibeVector?.grain && room.vibeVector.grain > 0.3 && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                )}
                
                {/* Layer 1: Emissive Bloom Sim */}
                {room.vibeVector?.bloom && room.vibeVector.bloom > 0.6 && (
                   <div className="absolute inset-0 pointer-events-none bg-white/5 blur-3xl opacity-30"></div>
                )}
             </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-32 h-32 border border-slate-900 rounded-full flex items-center justify-center mb-8 opacity-20">
                   <i className="fa-solid fa-cube text-4xl text-slate-600"></i>
                </div>
                <div className="text-center max-w-sm space-y-3">
                  <h3 className="theater-font text-3xl text-slate-700 font-bold">SECTOR_{room.id}</h3>
                  <p className="text-xs text-slate-800 uppercase tracking-widest font-mono font-bold">Unassigned // Vacuum State</p>
                </div>
             </div>
           )}

           {/* Technical Grid Overlay */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
        </div>

        {/* Status Bar */}
        <div className="w-full max-w-6xl mt-8 flex justify-between items-center border-t border-white/10 pt-6 font-mono">
          <div className="flex gap-12">
            <div className="space-y-1">
               <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vector_Mood</div>
               <p className="text-sm text-slate-300 uppercase font-medium">{room.vibe || 'N/A'}</p>
            </div>
            <div className="space-y-1">
               <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Entropy_Lvl</div>
               <p className="text-sm text-slate-300 font-medium">{(room.vibeVector?.entropy || 0).toFixed(4)}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Labyrinth_Node</div>
             <p className="text-xs text-red-900 font-bold">{(Math.random()*1000000).toFixed(0)}_CACHE_LOCKED</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes flicker-jitter {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; filter: brightness(1); }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.8; filter: brightness(1.4); }
        }
        .flicker-active {
          animation: flicker-jitter 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TheaterView;
