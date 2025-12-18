import React, { useState } from 'react';
import { useClaimRoom } from '../hooks/useClaimRoom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetRoomId: string;
}

export const ClaimRoomModal: React.FC<Props> = ({ isOpen, onClose, targetRoomId }) => {
  const [prompt, setPrompt] = useState('');
  const { claim, isLoading, error } = useClaimRoom();
  const [previewVibe, setPreviewVibe] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await claim(targetRoomId, prompt);
      setPreviewVibe(result);
      // We could wait for a "Confirm" step here as per spec
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-black/40">
          <h2 className="theater-font text-2xl font-bold text-white uppercase tracking-widest">Claim Sector {targetRoomId}</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Input atmospheric essence for extraction...</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs font-mono rounded">
              {error}
            </div>
          )}

          {previewVibe ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-green-900/10 border border-green-500/30 rounded text-center">
                <p className="text-green-400 font-mono text-sm uppercase font-bold">Extraction Successful</p>
                <p className="text-xs text-slate-400 mt-1 italic">"{previewVibe.vibeVector.moodTag}"</p>
              </div>
              <div className="flex gap-1 h-4">
                {previewVibe.vibeVector.palette.map((c: string) => (
                  <div key={c} className="flex-1 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <textarea
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A dusty 90s cinema with flickering neon and velvet rot..."
                className="w-full h-32 bg-black/50 border border-white/10 rounded-lg p-4 text-sm font-mono text-slate-200 outline-none focus:border-white/30 transition-colors resize-none"
                disabled={isLoading}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-mono uppercase text-slate-500 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                {/* Fix: Changed </div> to </button> to correctly pair with the button tag above */}
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="px-6 py-2 bg-white text-black text-xs font-bold uppercase rounded-lg hover:bg-slate-200 transition-all disabled:opacity-30 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      Extracting...
                    </>
                  ) : 'Finalize_Vibe'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};