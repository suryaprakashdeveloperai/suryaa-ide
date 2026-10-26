import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Eye, 
  PlayCircle,
  Code2, 
  Layout, 
  GitFork,
  Sparkles,
  Columns,
  FolderPlus,
  Maximize2,
  Minimize2,
  MoreVertical,
  Bot,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useEditorStore, EditorMode, DevicePreset } from '../../core/store';
import { AboutModal } from '../modals/AboutModal';

export const Navbar: React.FC = () => {
  const { 
    project, 
    mode, 
    setMode, 
    devicePreset, 
    setDevicePreset, 
    orientation, 
    toggleOrientation,
    undo, 
    redo, 
    undoStack, 
    redoStack,
    isDirty,
    isSaving,
    saveProject,
    triggerBuild,
    buildStatus,
    openTemplateModal,
    openStreamArchitectModal,
    zenMode,
    toggleZenMode,
    isAboutModalOpen,
    openAboutModal,
    closeAboutModal,
    isCopilotOpen,
    toggleCopilot,
    runSecurityAudit,
    billingStatus,
    openUpgradeModal,
    fetchBillingStatus
  } = useEditorStore();

  useEffect(() => {
    fetchBillingStatus();
  }, [fetchBillingStatus]);

  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close overflow menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setIsOverflowOpen(false);
      }
    };
    if (isOverflowOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOverflowOpen]);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Browser permissions fallback
    }
  };

  return (
    <header className="h-14 bg-[#111520] border-b border-[#232A3B] px-3 md:px-4 flex items-center justify-between z-30 select-none text-slate-200">
      {/* ══════════════════════════════════════════════
          LEFT: BRAND & CREATOR ATTRIBUTION (SINGLE-LINE)
          ══════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Brand Badge */}
        <div 
          onClick={openAboutModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/10 border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition-all shadow-sm"
          title="Suryaa IDE v3 by Surya Prakash T (B.Tech AIML) - Click for Info"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
          <span className="font-extrabold text-xs md:text-sm bg-gradient-to-r from-indigo-400 via-purple-300 to-white bg-clip-text text-transparent whitespace-nowrap">
            SURYAA IDE PRO
          </span>
        </div>

        {/* Creator Attribution (Compact single-line) */}
        <button
          onClick={openAboutModal}
          className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#161B26] hover:bg-[#1E2536] text-slate-300 border border-[#2B354C] transition-all whitespace-nowrap"
          title="Creator: Surya Prakash T · B.Tech Artificial Intelligence & Machine Learning"
        >
          <span className="text-slate-400">By</span>
          <span className="text-white font-semibold">Surya Prakash T</span>
          <span className="text-purple-300 text-[10px] font-mono px-1 py-0.2 rounded bg-purple-500/20 border border-purple-500/30">
            B.Tech AIML
          </span>
        </button>

        {/* Templates Button */}
        <button
          onClick={openTemplateModal}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-[#1E2536] hover:bg-[#283248] text-indigo-300 border border-indigo-500/30 transition-all whitespace-nowrap"
          title="New Project & Template Gallery"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Templates</span>
        </button>

        {/* Stream Architect Modal Button */}
        <button
          onClick={openStreamArchitectModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-300 transition-all whitespace-nowrap shadow-sm shadow-cyan-950/40 cursor-pointer"
          title="Stream Architect: Generate full-stack Dockerized FastAPI + PostgreSQL stream application"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden md:inline">Stream Architect</span>
        </button>

        {/* 3-Day Free Trial & Subscription Entitlement Badge */}
        <button
          onClick={openUpgradeModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-300 transition-all whitespace-nowrap shadow-sm"
          title="Manage Account, 3-Day Trial & Subscription"
        >
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400/30" />
          <span className="hidden sm:inline">
            {billingStatus?.plan === 'trial'
              ? `Trial: ${Math.floor((billingStatus.hoursRemaining ?? 72) / 24)}d ${Math.floor((billingStatus.hoursRemaining ?? 72) % 24)}h`
              : (billingStatus?.plan ? `${billingStatus.plan.toUpperCase()} Active` : '3-Day Free Trial')}
          </span>
          <span className="sm:hidden font-mono text-[10px]">Trial</span>
        </button>

        {/* Project Name + Unsaved Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 border-l border-[#232A3B] pl-2.5 text-xs text-slate-300">
          <span className="font-medium truncate max-w-[120px]">{project.metadata.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">v{project.metadata.version}</span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="Unsaved changes" />
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CENTER: 5 MASTER STUDIO MODES
          ══════════════════════════════════════════════ */}
      <div className="flex items-center bg-[#161B26] p-0.5 md:p-1 rounded-lg border border-[#232A3B] shrink-0 mx-2">
        <button
          onClick={() => setMode('design')}
          className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all ${
            mode === 'design' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2536]'
          }`}
          title="Visual Design Mode (Drag, Drop, Align & Inspect)"
        >
          <Layout className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Design</span>
        </button>

        <button
          onClick={() => setMode('preview')}
          className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all ${
            mode === 'preview' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2536]'
          }`}
          title="Preview Mode: Clean photorealistic rendering"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          onClick={() => setMode('runtime')}
          className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all ${
            mode === 'runtime' 
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2536]'
          }`}
          title="Interactive Runtime: Switch tabs, type inputs, click buttons"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Runtime</span>
        </button>

        <button
          onClick={() => setMode('logic')}
          className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all ${
            mode === 'logic' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2536]'
          }`}
          title="Visual Logic & Workflow Graph"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Logic</span>
        </button>

        <button
          onClick={() => setMode('code')}
          className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all ${
            mode === 'code' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2536]'
          }`}
          title="Monaco Code View (Clean Dart MVVM & FastAPI Python)"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Code</span>
        </button>

        <div className="w-px h-4 bg-[#232A3B] mx-0.5" />

        <button
          onClick={toggleCopilot}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
            isCopilotOpen 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-500/30' 
              : 'bg-[#1E2536] text-purple-300 border-purple-500/40 hover:border-purple-300 hover:bg-[#283248]'
          }`}
          title="Toggle Suryaa AI Studio (Gemini, Claude, Arena.ai)"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
          <span>AI Studio</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT: ESSENTIAL ACTIONS & OVERFLOW MENU
          ══════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {/* Device selector (Compact) */}
        {(mode === 'design' || mode === 'preview' || mode === 'runtime') && (
          <div className="hidden sm:flex items-center bg-[#161B26] p-0.5 rounded-lg border border-[#232A3B]">
            <button
              onClick={() => setDevicePreset('iphone16')}
              className={`p-1.5 rounded text-xs transition-colors ${
                devicePreset === 'iphone16' ? 'bg-[#232A3B] text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile (iPhone 16 Pro)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevicePreset('galaxy_tab')}
              className={`p-1.5 rounded text-xs transition-colors ${
                devicePreset === 'galaxy_tab' || devicePreset === 'ipad' ? 'bg-[#232A3B] text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet (Samsung Galaxy Tab / iPad Pro)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevicePreset('desktop')}
              className={`p-1.5 rounded text-xs transition-colors ${
                devicePreset === 'desktop' ? 'bg-[#232A3B] text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop 1080p Window"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center gap-0.5">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1E2536] rounded disabled:opacity-30 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1E2536] rounded disabled:opacity-30 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gemini AI Copilot Toggle */}
        <button
          onClick={toggleCopilot}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isCopilotOpen 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-500/20' 
              : 'bg-[#1E2536] text-purple-300 border-purple-500/30 hover:border-purple-400 hover:bg-[#283248]'
          }`}
          title="Toggle Gemini AI Copilot Assistant"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">AI Copilot</span>
        </button>

        {/* Zen Mode */}
        <button
          onClick={toggleZenMode}
          className={`p-1.5 rounded transition-colors ${
            zenMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title={zenMode ? "Exit Zen Mode" : "Zen Canvas Mode (Hide sidebars)"}
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen (HTML5 API with F11 hint) */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1E2536] rounded transition-colors"
          title="Toggle Fullscreen (or press F11)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Save Project */}
        <button
          onClick={saveProject}
          disabled={isSaving}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1E2536] hover:bg-[#283248] text-slate-200 border border-[#2D374D] transition-all disabled:opacity-50"
          title="Save Project (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
        </button>

        {/* Build APK */}
        <button
          onClick={() => triggerBuild('apk_debug')}
          disabled={buildStatus === 'running'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
          title="Compile & Build Flutter Debug APK"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>{buildStatus === 'running' ? 'Building...' : 'Build APK'}</span>
        </button>

        {/* Overflow Menu for Secondary Actions */}
        <div className="relative" ref={overflowRef}>
          <button
            onClick={() => setIsOverflowOpen(!isOverflowOpen)}
            className={`p-1.5 rounded hover:bg-[#1E2536] transition-colors ${
              isOverflowOpen ? 'text-indigo-400 bg-[#1E2536]' : 'text-slate-400 hover:text-white'
            }`}
            title="More Options & Tools"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isOverflowOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#161B26] border border-[#2B354C] rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Viewport & Test
              </div>
              
              <button
                onClick={() => {
                  setDevicePreset('multi_view');
                  setIsOverflowOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-[#1E2536] hover:text-white transition-colors"
              >
                <Columns className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Viewport 3-Up Test</span>
              </button>

              <button
                onClick={() => {
                  setDevicePreset('foldable');
                  setIsOverflowOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-[#1E2536] hover:text-white transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Foldable Device Viewport</span>
              </button>

              <button
                onClick={() => {
                  toggleOrientation();
                  setIsOverflowOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-[#1E2536] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Orientation</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400 uppercase font-bold">
                  {orientation}
                </span>
              </button>

              <div className="h-[1px] bg-[#232A3B] my-1" />

              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Diagnostics & Info
              </div>

              <button
                onClick={() => {
                  runSecurityAudit();
                  setIsOverflowOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-[#1E2536] hover:text-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Run Security Audit</span>
              </button>

              <button
                onClick={() => {
                  openAboutModal();
                  setIsOverflowOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-[#1E2536] hover:text-white transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>About Suryaa IDE Pro</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About Modal */}
      <AboutModal isOpen={isAboutModalOpen} onClose={closeAboutModal} />
    </header>
  );
};
