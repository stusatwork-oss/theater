
import React from 'react';

interface Props {
  questions: string[];
  onClose: () => void;
}

const DiscoveryModal: React.FC<Props> = ({ questions, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="theater-font text-3xl font-bold text-white">Project Discovery</h2>
            <p className="text-slate-400 text-sm mt-1">Research phase: 10 Core Concept Questions</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-slate-300 leading-relaxed bg-red-950/20 p-4 border-l-4 border-red-700 rounded-r-lg">
            These questions explore the mechanics and aesthetic depth of the <strong>Theater-Mall Backroom Labyrinth</strong>. Answering these will help refine the generation logic and territory competition systems.
          </p>
          
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-red-900 group-hover:text-red-100 transition-colors">
                  {i + 1}
                </div>
                <div className="flex-1 text-slate-200 py-1 border-b border-slate-800/50 pb-4">
                  {q}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
          >
            Acknowledge & Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryModal;
