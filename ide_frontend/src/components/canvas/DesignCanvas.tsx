import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../core/store';
import { ComponentNode } from '../../types/schema';
import { WidgetRenderer } from './WidgetRenderer';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronRight, 
  ChevronDown,
  Copy, 
  Trash2, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Move,
  RotateCcw,
  Focus,
  Sun,
  Moon,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Layers,
  RotateCw,
  Plus,
  Hand,
  MousePointer
} from 'lucide-react';

const DEVICE_DIMENSIONS: Record<string, { portrait: { w: number; h: number }; landscape: { w: number; h: number }; name: string; type: string }> = {
  pixel9: { portrait: { w: 412, h: 915 }, landscape: { w: 915, h: 412 }, name: "Google Pixel 9 (Android)", type: "android" },
  galaxy_s24: { portrait: { w: 360, h: 780 }, landscape: { w: 780, h: 360 }, name: "Samsung Galaxy S24 (Android)", type: "android" },
  iphone16: { portrait: { w: 393, h: 852 }, landscape: { w: 852, h: 393 }, name: "iPhone 16 Pro (Mobile)", type: "iphone" },
  galaxy_tab: { portrait: { w: 800, h: 1200 }, landscape: { w: 1200, h: 800 }, name: "Samsung Galaxy Tab 11'' (Android Tablet)", type: "tablet" },
  ipad: { portrait: { w: 820, h: 1180 }, landscape: { w: 1180, h: 820 }, name: "iPad Pro (Tablet)", type: "tablet" },
  desktop: { portrait: { w: 1200, h: 780 }, landscape: { w: 1366, h: 768 }, name: "Desktop 1080p / Web", type: "desktop" },
  foldable: { portrait: { w: 375, h: 904 }, landscape: { w: 768, h: 888 }, name: "Foldable Layout", type: "foldable" },
  multi_view: { portrait: { w: 1280, h: 800 }, landscape: { w: 1280, h: 800 }, name: "Multi-Viewport Comparison", type: "multi" }
};

export const DesignCanvas: React.FC = () => {
  const { 
    project, 
    activeScreenId, 
    setActiveScreen,
    addScreen,
    deleteScreen,
    devicePreset, 
    setDevicePreset,
    orientation, 
    toggleOrientation,
    orientationPolicy,
    setOrientationPolicy,
    zoom, 
    setZoom,
    canvasPan,
    setCanvasPan,
    resetCanvasView,
    toggleThemeMode,
    selectComponent,
    selectedComponentId,
    removeComponent,
    duplicateComponent,
    moveComponentOrder,
    replaceComponentType,
    mode,
    setMode,
    overflowIssues,
    canvasTool,
    setCanvasTool,
    addComponent,
    openFullStackModal
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  const currentScreen = project.screens.find((s) => s.id === activeScreenId) || project.screens[0];
  const dims = DEVICE_DIMENSIONS[devicePreset]?.[orientation] || { w: 393, h: 852, name: "Viewport" };

  // Track Spacebar press & V/H shortcuts for canvas pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      } else if (e.code === 'KeyH') {
        setCanvasTool('hand');
      } else if (e.code === 'KeyV') {
        setCanvasTool('select');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setCanvasTool]);

  // Handle Pan Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    const targetEl = e.target as HTMLElement;
    const isCanvasBg = targetEl === containerRef.current || targetEl.getAttribute('data-canvas-bg') === 'true' || targetEl.classList.contains('canvas-stage');

    // Pan when Hand tool active, Spacebar pressed, middle click (button 1), or clicking empty canvas background!
    if (canvasTool === 'hand' || isSpacePressed || e.button === 1 || (e.button === 0 && isCanvasBg)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: canvasPan.x,
        startPanY: canvasPan.y
      };
    }
  };

  // Handle Wheel: Ctrl/Cmd+Wheel zooms, background wheel scrolls/pans
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      setZoom(Math.max(30, Math.min(200, zoom + delta)));
    } else {
      const targetEl = e.target as HTMLElement;
      const isCanvasBg = targetEl === containerRef.current || targetEl.getAttribute('data-canvas-bg') === 'true' || targetEl.classList.contains('canvas-stage');
      if (isCanvasBg) {
        setCanvasPan({
          x: canvasPan.x - e.deltaX,
          y: canvasPan.y - e.deltaY
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setCanvasPan({
      x: panStartRef.current.startPanX + dx,
      y: panStartRef.current.startPanY + dy
    });
  }, [isPanning, setCanvasPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Fit Canvas to Screen
  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight - 80;
    const containerWidth = containerRef.current.clientWidth - 80;
    const scaleY = containerHeight / dims.h;
    const scaleX = containerWidth / dims.w;
    const fitScale = Math.max(30, Math.min(120, Math.floor(Math.min(scaleX, scaleY) * 95)));
    setZoom(fitScale);
    setCanvasPan({ x: 0, y: 0 });
  };

  // Calculate breadcrumb trail from selected component to root
  const getBreadcrumbs = () => {
    if (!selectedComponentId || !project.components[selectedComponentId]) return [];
    const trail: Array<{ id: string; type: string }> = [];
    let curr: string | null = selectedComponentId;
    while (curr && project.components[curr]) {
      const compNode: ComponentNode = project.components[curr];
      trail.unshift({ id: compNode.id, type: compNode.type });
      curr = compNode.parentId;
    }
    return trail;
  };

  const breadcrumbs = getBreadcrumbs();
  const selectedComp = selectedComponentId ? project.components[selectedComponentId] : null;

  return (
    <div 
      className="flex-1 h-full bg-[#0A0D14] flex flex-col relative overflow-hidden select-none"
      onClick={() => {
        if (mode === 'design' && !isSpacePressed && !isPanning) {
          selectComponent(null);
        }
      }}
    >
      {/* 1. Mode Status Banner (in Preview or Runtime) */}
      {mode === 'preview' && (
        <div className="h-7 bg-indigo-600/90 text-white text-[11px] px-4 flex items-center justify-between font-medium z-20">
          <span>👁️ Preview Mode: Clean photorealistic rendering without editor borders or badges</span>
          <button 
            onClick={() => setMode('design')}
            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[10px]"
          >
            Exit to Design
          </button>
        </div>
      )}

      {mode === 'runtime' && (
        <div className="h-7 bg-emerald-600/90 text-white text-[11px] px-4 flex items-center justify-between font-medium z-20">
          <span>⚡ Runtime Mode: Active application logic (switch tabs, type inputs, click buttons)</span>
          <button 
            onClick={() => setMode('design')}
            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[10px]"
          >
            Exit to Design
          </button>
        </div>
      )}

      {/* 2. Top Canvas Sub-Bar: Breadcrumbs & Zoom & Pan */}
      <div className="h-9 border-b border-[#232A3B] px-4 flex items-center justify-between text-xs text-slate-400 bg-[#0E121C] shrink-0 z-10">
        {/* Breadcrumb Navigation Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.id}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectComponent(b.id);
                  }}
                  className={`text-[11px] font-mono hover:text-indigo-400 transition-colors whitespace-nowrap ${
                    idx === breadcrumbs.length - 1 ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {b.type}
                </button>
              </React.Fragment>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">Root Canvas</span>
          )}
        </div>

        {/* Project Screen / Page Switcher & Manager */}
        <div className="flex items-center gap-1 bg-[#161B26] p-0.5 rounded-lg border border-[#232A3B] shadow-sm">
          <span className="text-[10px] text-slate-400 pl-2 font-mono flex items-center gap-1 font-semibold">
            <Smartphone className="w-3 h-3 text-indigo-400" /> Page:
          </span>
          <select
            value={activeScreenId}
            onChange={(e) => setActiveScreen(e.target.value)}
            className="bg-transparent text-white text-[11px] font-semibold px-1.5 py-0.5 cursor-pointer focus:outline-none"
            title="Switch Active Screen / Page"
          >
            {project.screens.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#111520] text-white">
                {s.name} ({s.route})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const name = prompt("Enter New Page Name (e.g. ProfileScreen, CartScreen, SettingsScreen):", `Screen ${project.screens.length + 1}`);
              if (!name) return;
              const defaultRoute = `/${name.toLowerCase().replace(/screen/i, '').trim() || 'page'}`;
              const route = prompt("Enter Flutter Route (e.g. /profile, /cart, /settings):", defaultRoute);
              if (route !== null) {
                addScreen(name, route);
              }
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-medium transition-all shadow-sm"
            title="Add New Screen / Page"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">New Page</span>
          </button>

          {project.screens.length > 1 && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete '${currentScreen?.name}'?`)) {
                  deleteScreen(activeScreenId);
                }
              }}
              className="p-1 hover:text-rose-400 text-slate-500 rounded"
              title="Delete Current Screen"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Canvas Tool Switcher: Pointer (Select) vs Hand (Pan) */}
        <div className="flex items-center gap-0.5 bg-[#161B26] p-0.5 rounded-lg border border-[#232A3B]">
          <button
            onClick={() => setCanvasTool('select')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              canvasTool === 'select' 
                ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Selection Tool (V) - Click to select & edit components"
          >
            <MousePointer className="w-3 h-3" />
            <span className="hidden sm:inline">Select</span>
          </button>
          <button
            onClick={() => setCanvasTool('hand')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              canvasTool === 'hand' 
                ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Hand / Pan Tool (H / Space) - Click and drag anywhere to pan emulator"
          >
            <Hand className="w-3 h-3" />
            <span className="hidden sm:inline">Pan</span>
          </button>
        </div>

        {/* Spacebar Pan Indicator */}
        {isSpacePressed && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/30">
            <Move className="w-3 h-3 animate-pulse" />
            <span>Drag Canvas to Pan</span>
          </div>
        )}

        {/* Zoom, Fit, Reset, Device Viewport & Theme Mode */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Target Device Viewport Selector */}
          <div className="relative flex items-center">
            <select
              value={devicePreset}
              onChange={(e) => setDevicePreset(e.target.value as any)}
              className="bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] text-slate-200 text-[11px] font-medium rounded-md px-2 py-1 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              title="Select Target Device Viewport"
            >
              <option value="pixel9">📱 Android (Pixel 9 · 412×915)</option>
              <option value="galaxy_s24">📱 Android (Galaxy S24 · 360×780)</option>
              <option value="iphone16">📱 iOS (iPhone 16 Pro · 393×852)</option>
              <option value="galaxy_tab">📟 Android Tablet (Galaxy Tab · 800×1200)</option>
              <option value="ipad">📟 iPad Pro (Tablet · 820×1180)</option>
              <option value="desktop">🖥️ Desktop 1080p / Web (1200×780)</option>
              <option value="foldable">📱 Foldable Device (768×888)</option>
              <option value="multi_view">🔲 Multi-Viewport Comparison</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2.5 pointer-events-none" />
          </div>

          {/* Orientation Policy Selector */}
          {devicePreset !== 'multi_view' && (
            <div className="relative flex items-center">
              <select
                value={orientationPolicy}
                onChange={(e) => {
                  const newPolicy = e.target.value as any;
                  setOrientationPolicy(newPolicy);
                  if (newPolicy === 'portrait_only' && orientation === 'landscape') {
                    toggleOrientation();
                  } else if (newPolicy === 'landscape_only' && orientation === 'portrait') {
                    toggleOrientation();
                  }
                }}
                className="bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] text-slate-300 text-[11px] font-medium rounded-md px-2 py-1 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                title="Application Orientation Policy (Portrait Only, Landscape Only, or Both with Auto-Adaptation)"
              >
                <option value="adaptive">🔄 Both (Adaptive Split)</option>
                <option value="portrait_only">📱 Portrait Only</option>
                <option value="landscape_only">🖥️ Landscape Only</option>
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 pointer-events-none" />
            </div>
          )}

          {/* Orientation Toggle Button */}
          {devicePreset !== 'multi_view' && (
            <button
              onClick={() => {
                if (orientationPolicy === 'portrait_only' && orientation === 'portrait') {
                  const proceed = confirm("Application policy is set to 'Portrait Only'. Switch to 'Adaptive (Both)' to enable landscape orientation?");
                  if (!proceed) return;
                  setOrientationPolicy('adaptive');
                } else if (orientationPolicy === 'landscape_only' && orientation === 'landscape') {
                  const proceed = confirm("Application policy is set to 'Landscape Only'. Switch to 'Adaptive (Both)' to enable portrait orientation?");
                  if (!proceed) return;
                  setOrientationPolicy('adaptive');
                }
                toggleOrientation();
              }}
              className={`px-2 py-1 rounded-md text-[11px] border border-[#232A3B] bg-[#161B26] hover:bg-[#1E2536] text-slate-300 hover:text-white transition-colors flex items-center gap-1 shadow-sm`}
              title={`Switch to ${orientation === 'portrait' ? 'Landscape' : 'Portrait'} Orientation`}
            >
              <RotateCw className={`w-3.5 h-3.5 transition-transform ${orientation === 'landscape' ? 'text-indigo-400' : ''}`} />
              <span className="hidden sm:inline font-mono capitalize">{orientation}</span>
            </button>
          )}

          {/* Dark / Light Theme Mode Switcher for Emulator */}
          <button
            onClick={toggleThemeMode}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all border ${
              project.theme.mode === 'light'
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30 shadow-sm'
                : 'bg-[#161B26] text-slate-300 border-[#232A3B] hover:text-white hover:bg-[#1E2536]'
            }`}
            title={project.theme.mode === 'light' ? "Emulator in Light Theme (Click for Dark)" : "Emulator in Dark Theme (Click for Light)"}
          >
            {project.theme.mode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            {dims.w} × {dims.h} px
          </span>

          <div className="flex items-center gap-0.5 bg-[#161B26] p-0.5 rounded-lg border border-[#232A3B]">
            <button 
              onClick={() => setZoom(Math.max(30, zoom - 10))}
              className="p-1 hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-9 text-center text-slate-300">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1 hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleFitToScreen}
              className="p-1 hover:text-white rounded text-slate-400"
              title="Fit to Screen"
            >
              <Focus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={resetCanvasView}
              className="p-1 hover:text-white rounded text-slate-400"
              title="Reset View (100% Zoom, Center Pan)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Overflow Detection Warnings Bar */}
      {overflowIssues.length > 0 && mode === 'design' && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Responsive Warning:</strong> {overflowIssues[0].details}
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/20">
            💡 {overflowIssues[0].suggestedFix}
          </span>
        </div>
      )}

      {/* 4. Canvas Viewport Stage with Pan */}
      <div 
        ref={containerRef}
        data-canvas-bg="true"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`flex-1 overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(#1E2536_1px,transparent_1px)] [background-size:16px_16px] relative canvas-stage select-none ${
          isPanning ? 'cursor-grabbing' : (canvasTool === 'hand' || isSpacePressed) ? 'cursor-grab' : 'cursor-default'
        }`}
      >
        {/* Floating Quick Action Toolbar (in Design Mode on selected widget) */}
        {mode === 'design' && selectedComp && selectedComp.parentId && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 z-40 bg-[#161B26] border border-[#232A3B] shadow-2xl rounded-lg p-1.5 flex items-center gap-1.5 text-slate-300 animate-in fade-in duration-150"
          >
            <span className="text-[11px] font-mono px-2 text-indigo-400 font-bold">{selectedComp.type}</span>
            <div className="h-3 w-[1px] bg-[#232A3B]" />

            {/* Move Up & Move Down */}
            <button
              onClick={() => moveComponentOrder(selectedComp.id, 'up')}
              className="p-1 hover:bg-[#1E2536] hover:text-white rounded text-slate-400"
              title="Move Up in Parent"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveComponentOrder(selectedComp.id, 'down')}
              className="p-1 hover:bg-[#1E2536] hover:text-white rounded text-slate-400"
              title="Move Down in Parent"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <div className="h-3 w-[1px] bg-[#232A3B]" />

            {/* Replace Widget Morphing Selector */}
            <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-[#111520] border border-[#232A3B]">
              <RefreshCw className="w-3 h-3 text-indigo-400 shrink-0" />
              <select
                value={selectedComp.type}
                onChange={(e) => replaceComponentType(selectedComp.id, e.target.value)}
                className="bg-transparent text-[10px] text-slate-200 font-mono focus:outline-none cursor-pointer"
                title="Replace / Morph this widget into another type"
              >
                <option value={selectedComp.type} disabled>Replace with...</option>
                <option value="Container">Container</option>
                <option value="Card">Card</option>
                <option value="Text">Text</option>
                <option value="TextField">TextField</option>
                <option value="ElevatedButton">ElevatedButton</option>
                <option value="Column">Column</option>
                <option value="Row">Row</option>
                <option value="ListView">ListView</option>
                <option value="GridView">GridView</option>
                <option value="KPICard">KPICard</option>
                <option value="VideoPlayer">VideoPlayer</option>
                <option value="MultiAxisChart">MultiAxisChart</option>
              </select>
            </div>

            <div className="h-3 w-[1px] bg-[#232A3B]" />

            <button
              onClick={() => duplicateComponent(selectedComp.id)}
              className="p-1.5 hover:bg-[#1E2536] hover:text-white rounded"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => removeComponent(selectedComp.id)}
              className="p-1.5 hover:bg-[#1E2536] hover:text-rose-400 rounded"
              title="Delete (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MULTI-VIEWPORT SIDE-BY-SIDE MODE */}
        {(() => {
          const themeBg = project.theme.tokens.backgroundColor
            ? project.theme.tokens.backgroundColor.replace('0xFF', '#').replace('0x40', '#')
            : (project.theme.mode === 'light' ? '#F8FAFC' : '#0F172A');
          const themeText = project.theme.tokens.textColor
            ? project.theme.tokens.textColor.replace('0xFF', '#')
            : (project.theme.mode === 'light' ? '#0F172A' : '#F8FAFC');
          const themeFont = project.theme.tokens.fontFamily || 'Inter';

          if (devicePreset === 'multi_view') {
            return (
              <div 
                className="flex items-start gap-8 transform origin-center transition-transform duration-75"
                style={{ 
                  transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${zoom / 100})` 
                }}
              >
                {/* 1. Android Phone View */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-2 font-mono flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                    Android Mobile (412 × 915)
                  </span>
                  <div className="w-[360px] h-[720px] rounded-[36px] p-2.5 bg-[#171C28] border-4 border-[#2A3448] shadow-2xl relative flex flex-col">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black z-40 border border-slate-800" />
                    <div 
                      style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
                      className="w-full h-full rounded-[26px] overflow-hidden flex flex-col transition-colors duration-200"
                    >
                      {currentScreen && <WidgetRenderer componentId={currentScreen.rootComponentId} />}
                    </div>
                  </div>
                </div>

                {/* 2. Android Tablet View */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-2 font-mono flex items-center gap-1.5">
                    <Tablet className="w-3.5 h-3.5 text-emerald-400" />
                    Android Tablet (800 × 600)
                  </span>
                  <div className="w-[580px] h-[440px] rounded-[24px] p-3 bg-[#1C202E] border-4 border-[#333E56] shadow-2xl relative flex flex-col">
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-900 border border-slate-700 z-40" />
                    <div 
                      style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
                      className="w-full h-full rounded-[16px] overflow-hidden flex flex-col transition-colors duration-200"
                    >
                      {currentScreen && <WidgetRenderer componentId={currentScreen.rootComponentId} />}
                    </div>
                  </div>
                </div>

                {/* 3. Desktop Window View */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-2 font-mono flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-purple-400" />
                    Desktop Web (780 × 500)
                  </span>
                  <div className="w-[780px] h-[500px] rounded-xl bg-[#161B26] border-2 border-[#2D374D] shadow-2xl overflow-hidden flex flex-col">
                    <div className="h-8 bg-[#0E121C] border-b border-[#232A3B] px-3 flex items-center gap-2 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                      <span className="ml-2 text-[10px] font-mono text-slate-400 truncate">https://nova-commerce.web.app</span>
                    </div>
                    <div 
                      style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
                      className="w-full flex-1 overflow-hidden flex flex-col transition-colors duration-200"
                    >
                      {currentScreen && <WidgetRenderer componentId={currentScreen.rootComponentId} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (devicePreset === 'desktop') {
            return (
              <div 
                style={{
                  width: `${dims.w}px`,
                  height: `${dims.h}px`,
                  transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${zoom / 100})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'width 0.2s, height 0.2s, transform 0.05s'
                }}
                className="rounded-xl bg-[#161B26] border-2 border-[#2D374D] shadow-2xl relative shrink-0 flex flex-col overflow-hidden"
              >
                {/* Desktop Window Title Bar */}
                <div className="h-9 bg-[#0E121C] border-b border-[#232A3B] px-3.5 flex items-center justify-between select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#161B26] border border-[#232A3B] text-[11px] font-mono text-slate-400 max-w-[320px] w-full justify-center">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span className="truncate">https://nova-commerce.web.app</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono hidden sm:inline">1080p Desktop</div>
                </div>

                {/* Screen Content */}
                <div 
                  style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
                  className="w-full flex-1 overflow-hidden flex flex-col relative transition-colors duration-200"
                >
                  {currentScreen && <WidgetRenderer componentId={currentScreen.rootComponentId} />}
                </div>
              </div>
            );
          }

          if (devicePreset === 'galaxy_tab' || devicePreset === 'ipad') {
            return (
              <div 
                style={{
                  width: `${dims.w}px`,
                  height: `${dims.h}px`,
                  transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${zoom / 100})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'width 0.2s, height 0.2s, transform 0.05s'
                }}
                className="rounded-[28px] p-3.5 bg-[#1B202D] border-4 border-[#323D54] shadow-2xl relative shrink-0 flex flex-col"
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 z-40" />
                <div 
                  style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
                  className="w-full h-full rounded-[18px] overflow-hidden flex flex-col relative transition-colors duration-200"
                >
                  {currentScreen && <WidgetRenderer componentId={currentScreen.rootComponentId} />}
                </div>
              </div>
            );
          }

          if (devicePreset === 'pixel9' || devicePreset === 'galaxy_s24') {
            return (
              <div 
                style={{
                  width: `${dims.w}px`,
                  height: `${dims.h}px`,
                  transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${zoom / 100})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'width 0.2s, height 0.2s, transform 0.05s'
                }}
                className="rounded-[40px] p-2.5 bg-[#171C28] border-4 border-[#2A3448] shadow-2xl relative shrink-0 flex flex-col"
              >
                {/* Android Punch-hole Camera */}
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black z-40 border border-slate-800" />
                <div 
                  style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
                  className="w-full h-full rounded-[30px] overflow-hidden flex flex-col relative transition-colors duration-200"
                >
                  {currentScreen && <WidgetRenderer componentId={currentScreen.rootComponentId} />}
                </div>
              </div>
            );
          }

          // Default Mobile (iPhone / Custom)
          return (
            <div 
              style={{
                width: `${dims.w}px`,
                height: `${dims.h}px`,
                transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${zoom / 100})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'width 0.2s, height 0.2s, transform 0.05s'
              }}
              className="rounded-[42px] p-3 bg-[#1A1F2C] border-4 border-[#2D374D] shadow-2xl relative shrink-0 flex flex-col"
            >
              {devicePreset === 'iphone16' && orientation === 'portrait' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-end px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                </div>
              )}
              <div 
                onDragOver={(e) => {
                  if (mode === 'design') {
                    e.preventDefault();
                  }
                }}
                onDrop={(e) => {
                  if (mode !== 'design') return;
                  e.preventDefault();
                  const widgetType = e.dataTransfer.getData('text/plain');
                  if (widgetType) {
                    if (widgetType === 'Card' || widgetType === 'Container') {
                      openFullStackModal(currentScreen?.rootComponentId);
                    } else {
                      addComponent(currentScreen?.rootComponentId || '', widgetType);
                    }
                  }
                }}
                style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
                className="w-full h-full rounded-[32px] overflow-hidden flex flex-col relative transition-colors duration-200"
              >
                {currentScreen && (
                  <WidgetRenderer componentId={currentScreen.rootComponentId} />
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

