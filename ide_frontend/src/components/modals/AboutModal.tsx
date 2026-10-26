import React from 'react';
import { Sparkles, X, Award, Cpu, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111520] border border-[#232A3B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header with vibrant banner */}
        <div className="relative bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 p-6 border-b border-[#232A3B]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-200 to-white bg-clip-text text-transparent">
                  Suryaa IDE
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  v2.5 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-300">Visual Flutter Full-Stack Development Studio</p>
            </div>
          </div>
        </div>

        {/* Creator / Owner Credential Card */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#161C2C] to-[#121622] border border-indigo-500/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Created & Architected By
              </div>
              <div className="text-base font-bold text-white">Surya Prakash T</div>
              <div className="text-xs text-purple-300 font-medium flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>B.Tech AIML (Artificial Intelligence & Machine Learning)</span>
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Studio Architecture & Capabilities
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Flutter 3 + Dart 3 MVVM</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>FastAPI Python Engine</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live API Data Streaming</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Keyframe Animation Suite</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Viewport & Tablets</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>16 KPI Designs & Charts</span>
              </div>
            </div>
          </div>

          {/* Footer close */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
