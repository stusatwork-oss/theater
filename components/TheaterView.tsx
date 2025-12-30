
import React, { useState, useEffect, useMemo } from 'react';
import { TheaterRoom, VibeVector } from '../types';
import { analyzeFlavor, generateRoomImage, generateManagerRemark } from '../geminiService';

interface Props {
  room: TheaterRoom;
  onBack: () => void;
  onUpdate: (updates: Partial<TheaterRoom>) => void;
  onReset: () => void;
}

type ViewDirection = 'front' | 'left' | 'right' | 'behind';

const TheaterView: React.FC<Props> = ({ room, onBack, onUpdate, onReset }) => {
  const [flavorInput, setFlavorInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [spatialLoading, setSpatialLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [managerQuote, setManagerQuote] = useState("We don't do refunds for spatial drift.");
  const [currentView, setCurrentView] = useState<ViewDirection>('front');

  const isClaimed = !!room.owner;

  useEffect(() => {
    if (loading || spatialLoading) {
      const updateQuote = async () => {
        const quote = await generateManagerRemark(status);
        if (quote) setManagerQuote(quote);
      };
      const interval = setInterval(updateQuote, 15000);
      return () => clearInterval(interval);
    }
  }, [loading, spatialLoading, status]);

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
    setStatus('PROBING_DIMENSIONAL_MEMBRANE...');
    try {
      const b64 = selectedImage?.split(',')[1];
      const result = await analyzeFlavor(flavorInput, b64);
      
      setStatus('SYNTHESIZING_PRIMARY_SPATIAL_ANCHOR...');
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
      setStatus('SECTOR_REJECTION. RETRYING...');
      setTimeout(() => setLoading(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const generateSpatialExpansion = async () => {
    if (!room.vibeVector || spatialLoading) return;
    setSpatialLoading(true);
    setStatus('CALIBRATING_MARBLE_DEPTH_MAPS...');
    
    try {
      const [left, right, behind] = await Promise.all([
        generateRoomImage(room.vibeVector, room.condition!, 'left'),
        generateRoomImage(room.vibeVector, room.condition!, 'right'),
        generateRoomImage(room.vibeVector, room.condition!, 'behind')
      ]);

      onUpdate({
        spatialViews: {
          left: left || undefined,
          right: right || undefined,
          behind: behind || undefined
        }
      });
      setStatus('');
    } catch (err) {
      console.error(err);
      setStatus('EXPANSION_ERROR. SIGNAL LOST.');
    } finally {
      setSpatialLoading(false);
    }
  };

  const viewportStyle = useMemo(() => {
    if (!room.vibeVector) return {};
    const v = room.vibeVector;
    const warmthHue = v.warmth > 0.5 ? (v.warmth - 0.5) * 30 : (v.warmth - 0.5) * 45;
    return {
      filter: `
        saturate(${0.6 + v.saturation * 0.8}) 
        contrast(${0.8 + v.contrast * 0.4}) 
        hue-rotate(${warmthHue}deg)
        blur(${v.fog * 1.5}px)
      `,
      opacity: 0.95 + (1 - v.grain) * 0.05
    };
  }, [room.vibeVector]);

  const activeImage = useMemo(() => {
    if (currentView === 'front') return room.imageUrl;
    return room.spatialViews?.[currentView] || room.imageUrl;
  }, [currentView, room.imageUrl, room.spatialViews]);

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-black">
      {/* SIDEBAR DESIGNER */}
      <div className="w-full lg:w-[420px] bg-[#080a0f] border-r border-white/5 p-8 flex flex-col gap-10 overflow-y-auto z-20 shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-white transition-all text-[10px] uppercase tracking-[0.4em] font-bold group">
          <i className="fa-solid fa-chevron-left mr-3 group-hover:-translate-x-1 transition-transform"></i> Return to Labyrinth
        </button>

        {!isClaimed ? (
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div>
              <h2 className="theater-font text-5xl font-bold text-white uppercase tracking-tighter mb-2">CLAIM_SECTOR</h2>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest leading-relaxed uppercase">
                Feed the machine with aesthetic memory. Visual artifacts increase extraction fidelity for 3D world reconstruction.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative group aspect-video bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-white/20 transition-all shadow-inner">
                {selectedImage ? (
                  <img src={selectedImage} alt="Input" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="text-center p-6 opacity-30 group-hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-camera-retro text-4xl text-white mb-4"></i>
                    <p className="text-[10px] text-white font-mono uppercase tracking-[0.2em]">Upload_Visual_Anchor</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-1">Atmospheric_Prompt</label>
                <textarea 
                  value={flavorInput}
                  onChange={(e) => setFlavorInput(e.target.value)}
                  placeholder="e.g. Empty neon food court, rainy velvet seats..."
                  className="w-full bg-slate-950 border border-white/5 rounded-xl p-5 text-sm font-mono text-slate-200 focus:border-white/20 outline-none h-40 resize-none transition-all placeholder:opacity-20"
                />
              </div>

              <button 
                onClick={processFlavor}
                disabled={loading}
                className="w-full py-5 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-[11px] uppercase tracking-[0.5em] transition-all disabled:opacity-20 active:scale-95 shadow-2xl"
              >
                {loading ? 'Synthesizing...' : 'Finalize_Sector'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-1000">
             <div className="flex justify-between items-start">
              <div>
                <h2 className="theater-font text-5xl font-bold text-white tracking-tighter">NODE_{room.id}</h2>
                <div className="flex items-center gap-2 mt-3 bg-red-950/20 w-fit px-3 py-1 rounded-full border border-red-900/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest font-bold">DIMENSIONAL_LOCK_ACTIVE</span>
                </div>
              </div>
              <button 
                onClick={onReset}
                className="p-3 bg-slate-900/50 hover:bg-red-900/20 border border-white/5 hover:border-red-900/30 rounded-xl transition-all text-slate-600 hover:text-red-500"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>

            {/* SPATIAL EXPANSION BUTTON */}
            {!room.spatialViews && (
              <button 
                onClick={generateSpatialExpansion}
                disabled={spatialLoading}
                className="w-full py-4 border border-cyan-900/50 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-400 rounded-xl font-mono text-[9px] uppercase tracking-[0.3em] transition-all disabled:opacity-20 flex items-center justify-center gap-3 group"
              >
                {spatialLoading ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-cubes group-hover:scale-110 transition-transform"></i>
                )}
                {spatialLoading ? 'Calibrating Depth...' : 'Generate_Marble_Spatial_Set'}
              </button>
            )}

            {/* Vibe Stack Layers Visualizer */}
            <div className="space-y-6">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">VIBE_VECTOR_REPORT</h4>
               
               <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] text-slate-300 uppercase font-mono font-bold tracking-widest">L0_Palette</span>
                   <span className="text-[9px] text-slate-500 font-mono">WARMTH: {(room.vibeVector?.warmth || 0).toFixed(2)}</span>
                 </div>
                 <div className="flex gap-2">
                   {room.vibeVector?.palette.map((c, i) => (
                     <div key={i} className="h-10 flex-1 rounded-lg border border-white/5 shadow-inner" style={{ backgroundColor: c }}></div>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <span className="text-[9px] text-slate-500 uppercase font-mono block mb-3 font-bold">L1_Flicker</span>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-white" style={{ width: `${(room.vibeVector?.flicker || 0) * 100}%` }}></div>
                    </div>
                 </div>
                 <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <span className="text-[9px] text-slate-500 uppercase font-mono block mb-3 font-bold">L3_Entropy</span>
                    <span className="text-xs text-amber-500 font-bold uppercase tracking-widest block mb-1">{room.condition}</span>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600" style={{ width: `${(room.vibeVector?.entropy || 0) * 100}%` }}></div>
                    </div>
                 </div>
               </div>
            </div>

            <div className="p-6 bg-[#0c0e14] border border-white/5 rounded-2xl relative overflow-hidden group/remark">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                 <i className="fa-solid fa-quote-right text-3xl"></i>
               </div>
               <h4 className="text-[9px] font-bold text-slate-600 uppercase mb-3 font-mono tracking-widest">MANAGER_TRANSMISSION</h4>
               <p className="text-lg italic text-slate-200 font-serif leading-relaxed drop-shadow-sm group-hover/remark:text-white transition-colors">"{managerQuote}"</p>
            </div>
          </div>
        )}
      </div>

      {/* VIEWPORT HERO SECTION */}
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
        {(loading || spatialLoading) && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-center p-12 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="w-64 h-1 bg-slate-900 mb-12 overflow-hidden rounded-full">
              <div className="w-1/3 h-full bg-white animate-[loading_1.5s_infinite_ease-in-out]"></div>
            </div>
            <p className="text-white font-mono text-[10px] uppercase tracking-[1em] mb-6 font-bold">{status}</p>
            <div className="max-w-md animate-pulse">
               <p className="text-3xl theater-font italic text-slate-400 leading-tight">"{managerQuote}"</p>
               <p className="text-[10px] text-slate-600 mt-4 uppercase font-mono tracking-[0.5em]">— ARCHITECT_ID_{Math.floor(Math.random()*999)}</p>
            </div>
          </div>
        )}

        {/* HERO IMAGE CONTAINER */}
        <div className="relative w-full max-w-[1400px] aspect-video bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden border border-white/5 ring-1 ring-white/10 group/hero">
           {activeImage ? (
             <div className="w-full h-full relative group">
                <img 
                  src={activeImage} 
                  className="w-full h-full object-cover transition-all duration-[2000ms] group-hover/hero:scale-105" 
                  style={viewportStyle}
                  alt="Sector View" 
                />
                
                {/* Visual FX Overlays */}
                {room.vibeVector?.grain && room.vibeVector.grain > 0.3 && (
                  <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                )}
                
                {room.vibeVector?.bloom && room.vibeVector.bloom > 0.6 && (
                   <div className="absolute inset-0 pointer-events-none bg-white/5 blur-3xl opacity-20"></div>
                )}

                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
                
                {/* VIEW LABEL */}
                <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-mono text-white/60 uppercase tracking-widest font-bold">
                  PERSP: {currentView.toUpperCase()} // MARBLE_CALIBRATED
                </div>
             </div>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,1)_100%)]"></div>
                <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center mb-10 opacity-10 animate-pulse">
                   <i className="fa-solid fa-mountain-sun text-4xl text-white"></i>
                </div>
                <div className="text-center max-w-sm space-y-4 relative z-10">
                  <h3 className="theater-font text-5xl text-slate-800 font-bold tracking-tighter uppercase">VOID_NODE</h3>
                  <p className="text-[10px] text-slate-800 uppercase tracking-[0.6em] font-mono font-bold">Waiting for input...</p>
                </div>
             </div>
           )}

           {/* CRT Scanline Overlay */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
        </div>

        {/* HERO HUD FOOTER */}
        <div className="w-full max-w-[1400px] mt-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-t border-white/5 pt-8 font-mono">
          <div className="flex gap-12 lg:gap-20">
            <div className="space-y-2">
               <div className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.3em]">Sector_Tag</div>
               <p className="text-sm text-slate-300 uppercase font-medium tracking-widest">{room.vibe || 'NULL'}</p>
            </div>
            
            {/* SPATIAL NAVIGATION HUD */}
            {isClaimed && room.imageUrl && (
              <div className="space-y-3">
                 <div className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.3em]">Spatial_Array</div>
                 <div className="flex gap-2">
                    {(['behind', 'left', 'front', 'right'] as ViewDirection[]).map((dir) => {
                      const exists = dir === 'front' || !!room.spatialViews?.[dir];
                      return (
                        <button
                          key={dir}
                          disabled={!exists}
                          onClick={() => setCurrentView(dir)}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                            currentView === dir 
                              ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                              : exists 
                                ? 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/30' 
                                : 'bg-black/40 border-white/5 text-slate-800'
                          }`}
                        >
                          <i className={`fa-solid fa-caret-${dir === 'front' ? 'up' : dir === 'behind' ? 'down' : dir} text-[10px]`}></i>
                        </button>
                      );
                    })}
                 </div>
              </div>
            )}
          </div>

          <div className="text-right flex items-center gap-6">
             <div className="h-8 w-px bg-white/5 hidden lg:block"></div>
             <div>
               <div className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.3em]">Export_Status</div>
               <p className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase flex items-center gap-2 justify-end">
                 <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]"></span>
                 Ready_For_Marble_Genie
               </p>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default TheaterView;
