import React from 'react';
import { useEditorStore } from '../../core/store';
import { Sparkles, Sliders, Sun, Moon } from 'lucide-react';

const PRESETS = [
  { id: 'glassmorphism', name: 'Glassmorphism', color: 'from-indigo-500 to-purple-600', desc: 'Frosted blur, translucent layers' },
  { id: 'material3', name: 'Material 3', color: 'from-purple-600 to-indigo-700', desc: 'Google M3 elevation & tonal palettes' },
  { id: 'neumorphism', name: 'Neumorphism', color: 'from-blue-400 to-slate-400', desc: 'Soft extruded shadows & curves' },
  { id: 'fluent', name: 'Fluent UI', color: 'from-blue-600 to-cyan-500', desc: 'Windows modern desktop acrylic' },
  { id: 'bento', name: 'Bento Grid', color: 'from-zinc-800 to-zinc-950', desc: 'Apple-inspired modular dark cards' },
  { id: 'minimalism', name: 'Minimalism', color: 'from-neutral-700 to-neutral-900', desc: 'Clean typography, maximum whitespace' },
  { id: 'neobrutalism', name: 'Neobrutalism', color: 'from-yellow-400 to-rose-500', desc: 'High contrast, thick borders, pop colors' },
  { id: 'neon', name: 'Neon Cyber', color: 'from-cyan-400 to-pink-500', desc: 'High-glow dark cyberpunk aesthetics' },
  { id: 'claymorphism', name: 'Claymorphism', color: 'from-rose-400 to-teal-400', desc: '3D inflated pillowy clay look' },
  { id: 'skeuomorphism', name: 'Skeuomorphism', color: 'from-amber-700 to-stone-600', desc: 'Rich realistic textures and bevels' },
  { id: 'editorial', name: 'Editorial', color: 'from-stone-700 to-stone-900', desc: 'Serif editorial magazine layouts' },
  { id: 'gradient', name: 'Vibrant Gradient', color: 'from-fuchsia-600 to-orange-500', desc: 'Multi-stop vibrant mesh gradients' },
  { id: 'enterprise', name: 'Enterprise Pro', color: 'from-sky-700 to-blue-900', desc: 'SaaS dense dashboard metrics' },
  { id: 'flat', name: 'Flat Design', color: 'from-emerald-500 to-teal-600', desc: 'Solid crisp 2D vector colors' },
];

export const ThemeStudio: React.FC = () => {
  const { project, setThemePreset, updateThemeToken, setThemeMode, generateProject } = useEditorStore();
  const activePreset = project.theme.activePreset;
  const tokens = project.theme.tokens;

  const handlePresetSelect = (presetId: string) => {
    setThemePreset(presetId);
    setTimeout(() => generateProject(), 100);
  };

  const handleModeSelect = (m: 'dark' | 'light') => {
    setThemeMode(m);
    setTimeout(() => generateProject(), 100);
  };

  return (
    <div className="space-y-4">
      {/* Emulator Theme Mode Toggle */}
      <div className="p-1 rounded-xl bg-[#161B26] border border-[#232A3B] flex items-center gap-1 shadow-inner">
        <button
          onClick={() => handleModeSelect('dark')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            project.theme.mode !== 'light'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Set Emulator to Dark Theme"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark Theme</span>
        </button>

        <button
          onClick={() => handleModeSelect('light')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            project.theme.mode === 'light'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Set Emulator to Light Theme"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light Theme</span>
        </button>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">14+ Style Engine</h2>
        <p className="text-[11px] text-slate-500">Instant design conversion compiling into Flutter ThemeData</p>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 gap-2">
        {PRESETS.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                isActive 
                  ? 'bg-[#1E2536] border-indigo-500 shadow-md ring-1 ring-indigo-500/50' 
                  : 'bg-[#161B26] border-[#232A3B] hover:border-slate-600 hover:bg-[#1A2030]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${p.color}`} />
                <span className={`text-xs font-semibold ${isActive ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {p.name}
                </span>
                {isActive && (
                  <span className="ml-auto text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Live Token Controls */}
      <div className="pt-3 border-t border-[#232A3B] space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Global Design Tokens</span>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Border Radius</span>
            <span className="font-mono text-indigo-400">{tokens.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={tokens.borderRadius}
            onChange={(e) => updateThemeToken('borderRadius', Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Elevation / Shadows</span>
            <span className="font-mono text-indigo-400">{tokens.elevation}dp</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            value={tokens.elevation}
            onChange={(e) => updateThemeToken('elevation', Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Backdrop Blur</span>
            <span className="font-mono text-indigo-400">{tokens.blur || 0}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={tokens.blur || 0}
            onChange={(e) => updateThemeToken('blur', Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
