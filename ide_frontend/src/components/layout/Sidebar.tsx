import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  FolderTree, 
  Palette, 
  Database, 
  Smartphone,
  ShieldCheck, 
  DownloadCloud,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Radio,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Box,
  Layout,
  BarChart2,
  Activity,
  Gauge,
  Type,
  ToggleLeft,
  List,
  Grid,
  Zap,
  Globe,
  LayoutTemplate,
  Copy,
  Edit2,
  Check,
  HardDrive
} from 'lucide-react';
import { useEditorStore, LeftSidebarTab } from '../../core/store';
import { ThemeStudio } from '../panels/ThemeStudio';
import { BackendDesigner } from '../panels/BackendDesigner';
import { AndroidManager } from '../panels/AndroidManager';
import { SecurityCenter } from '../panels/SecurityCenter';
import { DownloadCenter } from '../panels/DownloadCenter';
import { ApiManager } from '../panels/ApiManager';
import { StorageManager } from '../panels/StorageManager';

interface WidgetItem {
  type: string;
  label: string;
  desc: string;
  icon?: any;
}

interface WidgetCategory {
  id: string;
  name: string;
  icon: any;
  items: WidgetItem[];
}

const WIDGET_CATEGORIES: WidgetCategory[] = [
  {
    id: "structural",
    name: "Structural & Navigation",
    icon: Layout,
    items: [
      { type: "AppBar", label: "App Bar", desc: "Top header with title, actions & leading menu" },
      { type: "Drawer", label: "Navigation Drawer", desc: "Side drawer with user profile & menu items" },
      { type: "NavigationRail", label: "Navigation Rail", desc: "Vertical icon sidebar for tablets & desktops" },
      { type: "TabBar", label: "Tab Bar", desc: "Multi-tab bar & page view layout" },
      { type: "BottomNavigationBar", label: "Bottom Nav Bar", desc: "Fixed bottom screen navigation items" }
    ]
  },
  {
    id: "layout",
    name: "Layout & Containers",
    icon: Box,
    items: [
      { type: "Container", label: "Container", desc: "Stylable box with padding, margin & colors" },
      { type: "Card", label: "Card", desc: "Elevated surface with rounded corners" },
      { type: "Column", label: "Column", desc: "Vertical flex layout" },
      { type: "Row", label: "Row", desc: "Horizontal flex layout" },
      { type: "Center", label: "Center", desc: "Centers child within available space" },
      { type: "SizedBox", label: "SizedBox", desc: "Fixed width & height spacer box" }
    ]
  },
  {
    id: "charts",
    name: "Charts & Analytics",
    icon: BarChart2,
    items: [
      { type: "MultiAxisChart", label: "Multi-Axis Chart", desc: "Dual Y-axes, Line & Bar curves with fl_chart" },
      { type: "BarChart", label: "Bar Chart", desc: "Grouped and stacked telemetry bars" },
      { type: "PieChart", label: "Donut / Pie Chart", desc: "Radial sections with percentage badges" },
      { type: "SparklineChart", label: "Compact Sparkline", desc: "Micro inline trend telemetry" }
    ]
  },
  {
    id: "kpi",
    name: "KPI Metric Cards",
    icon: Activity,
    items: [
      { type: "KPICard", label: "KPI Metric Card", desc: "16 configurable styles: Sparklines, Gauges, Trends" },
      { type: "GoalActualCard", label: "Goal vs Actual Card", desc: "Target progress and variance metric" },
      { type: "StatusCard", label: "Status Badge Card", desc: "Live health status with pulse glow" }
    ]
  },
  {
    id: "gauges",
    name: "Gauges & Compact KPI Boxes",
    icon: Gauge,
    items: [
      { type: "CircularGauge", label: "Circular Radial Gauge", desc: "270°/360° radial gauge with needle & color threshold zones" },
      { type: "ArcGauge", label: "Arc Speedometer Gauge", desc: "180° semi-circular tachometer with gradient track" },
      { type: "MetricCardCompact", label: "Compact Metric Box", desc: "High-density square KPI box with status dot & progress" },
      { type: "RadialProgressBox", label: "Radial Ring Box", desc: "Compact percentage ring with center metric" },
      { type: "SparklineBox", label: "Sparkline Trend Box", desc: "Compact box with real-time inline trend curve" },
      { type: "StatusBeaconBox", label: "Status Beacon Box", desc: "Hardware beacon box with pulsating LED & telemetry" }
    ]
  },
  {
    id: "content",
    name: "Content & Media",
    icon: Type,
    items: [
      { type: "Text", label: "Text", desc: "Formatted typography widget with Google Fonts" },
      { type: "Image", label: "Image", desc: "Network or asset image with rounded corners" },
      { type: "Icon", label: "Icon", desc: "Material icon glyph" },
      { type: "VideoPlayer", label: "Video Player", desc: "MP4 / HLS video stream with controls" },
      { type: "Divider", label: "Divider", desc: "Horizontal separation line" }
    ]
  },
  {
    id: "inputs",
    name: "Inputs & Controls",
    icon: ToggleLeft,
    items: [
      { type: "ElevatedButton", label: "Elevated Button", desc: "Primary action button with elevation" },
      { type: "TextField", label: "Text Field", desc: "User input text box with validation" },
      { type: "Switch", label: "Switch", desc: "Boolean toggle slider" },
      { type: "Checkbox", label: "Checkbox", desc: "Selection check control" },
      { type: "Slider", label: "Slider", desc: "Range slider input (0-100)" }
    ]
  },
  {
    id: "lists",
    name: "Lists & Grids",
    icon: List,
    items: [
      { type: "ListView", label: "List View", desc: "Scrollable vertical list container" },
      { type: "GridView", label: "Grid View", desc: "2D responsive item grid layout" },
      { type: "ListTile", label: "List Tile", desc: "Standard row with icon, title & trailing action" }
    ]
  },
  {
    id: "animations",
    name: "Animation & Effects",
    icon: Zap,
    items: [
      { type: "AnimatedContainer", label: "Animated Container", desc: "Smooth transition on size or color changes" },
      { type: "FadeTransition", label: "Fade Transition", desc: "Smooth opacity entrance and exit" },
      { type: "ScaleTransition", label: "Scale Transition", desc: "Smooth zoom scaling effect" }
    ]
  },
  {
    id: "data",
    name: "Data & API Components",
    icon: Globe,
    items: [
      { type: "ApiStreamBuilder", label: "API Stream Builder", desc: "Real-time reactive data subscription" },
      { type: "FutureBuilder", label: "Future Builder", desc: "Async API data loader with spinner" }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { 
    sidebarTab, 
    setSidebarTab, 
    sidebarWidth,
    project, 
    selectedComponentId, 
    selectComponent,
    removeComponent,
    addComponent,
    moveComponentOrder,
    isCopilotOpen,
    toggleCopilot,
    activeScreenId,
    setActiveScreen,
    addScreen,
    deleteScreen,
    duplicateScreen,
    updateScreenInfo,
    openFullStackModal
  } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageRoute, setNewPageRoute] = useState("");
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoute, setEditRoute] = useState("");

  const toggleCategory = (id: string) => {
    setCollapsedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Filter categories and widgets based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return WIDGET_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return WIDGET_CATEGORIES.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.label.toLowerCase().includes(q) || 
        item.type.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const totalMatches = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <aside className="flex h-full bg-[#111520] border-r border-[#232A3B] select-none z-20 shrink-0">
      {/* 1. Icon Navigation Rail */}
      <div className="w-12 bg-[#0E121C] border-r border-[#232A3B] flex flex-col items-center py-3 gap-2 shrink-0">
        <button
          onClick={() => setSidebarTab('widgets')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'widgets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Widget Palette & Catalog"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('pages')}
          className={`p-2.5 rounded-lg transition-colors relative ${
            sidebarTab === 'pages' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Screens & Navigation (Multi-Page)"
        >
          <LayoutTemplate className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-indigo-500 text-[8px] font-bold px-1 rounded-full text-white">
            {project.screens.length}
          </span>
        </button>

        <button
          onClick={() => setSidebarTab('tree')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'tree' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Component Hierarchy Tree"
        >
          <FolderTree className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('theme')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'theme' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Theme Studio & Styling Tokens"
        >
          <Palette className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('android')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'android' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Android Package & Permissions"
        >
          <Smartphone className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('api')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'api' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="API & Data Streams (Live Connectors)"
        >
          <Radio className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('backend')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'backend' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="FastAPI & Database Designer"
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('security')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'security' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Cybersecurity Center"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('builds')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'builds' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Builds & Download Center"
        >
          <DownloadCloud className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSidebarTab('storage')}
          className={`p-2.5 rounded-lg transition-colors ${
            sidebarTab === 'storage' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1E2536]'
          }`}
          title="Storage & File Maintenance (lib, backend, assets)"
        >
          <HardDrive className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-[#232A3B] my-1" />

        <button
          onClick={toggleCopilot}
          className={`p-2.5 rounded-lg transition-all ${
            isCopilotOpen 
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/40' 
              : 'text-purple-400 hover:text-white hover:bg-purple-600/20'
          }`}
          title="Toggle Suryaa AI Studio (Gemini, Claude, Arena.ai)"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Resizable Expandable Panel Content */}
      <div 
        style={{ width: `${sidebarWidth}px` }} 
        className="overflow-y-auto custom-scrollbar p-3 text-slate-200 flex flex-col"
      >
        {/* WIDGETS TAB */}
        {sidebarTab === 'widgets' && (
          <div className="flex flex-col flex-1">
            {/* Header & Instant Search */}
            <div className="mb-3 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Widget Catalog</h2>
                <span className="text-[10px] text-slate-500 font-mono">
                  {searchQuery ? `${totalMatches} found` : "9 Categories"}
                </span>
              </div>

              {/* Instant Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search widgets (e.g. Card, Chart, Button)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#161B26] border border-[#232A3B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Full-Stack Generator Action */}
            <div className="mb-3">
              <button
                onClick={() => openFullStackModal()}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-indigo-600/30 hover:from-indigo-600 hover:to-purple-600 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all group shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-white block">
                      + Full-Stack Card
                    </span>
                    <span className="text-[10px] text-indigo-300 block">
                      FastAPI + SQLite + UI Auto-Bind
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Accordion Categories */}
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const isCollapsed = !searchQuery && !!collapsedCategories[cat.id];
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.id} className="border border-[#232A3B] rounded-xl overflow-hidden bg-[#161B26]/40">
                      {/* Accordion Category Header */}
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#1E2536] transition-colors bg-[#161B26]/80"
                      >
                        <div className="flex items-center gap-2">
                          <CatIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px] font-semibold text-slate-200">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                            {cat.items.length}
                          </span>
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Items Grid */}
                      {!isCollapsed && (
                        <div className="p-2 grid grid-cols-1 gap-1.5 bg-[#0E121C]/60 border-t border-[#232A3B]/50">
                          {cat.items.map((w) => (
                            <div
                              key={w.type}
                              draggable
                              onDragStart={(e) => handleDragStart(e, w.type)}
                              onClick={() => {
                                const targetParent = selectedComponentId || "comp_content_column";
                                addComponent(targetParent, w.type);
                              }}
                              className="p-2 rounded-lg bg-[#161B26] hover:bg-indigo-600/20 border border-[#232A3B] hover:border-indigo-500/50 cursor-grab active:cursor-grabbing transition-all group flex items-start gap-2.5 shadow-sm"
                              title={`Drag onto canvas or click to add ${w.label}`}
                            >
                              <div className="w-7 h-7 rounded bg-[#111520] border border-[#232A3B] group-hover:border-indigo-400/40 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400 font-mono text-[10px] font-bold">
                                {w.type.slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 block truncate">
                                  {w.label}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate leading-tight">
                                  {w.desc}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                /* Empty Search State */
                <div className="p-6 text-center text-slate-500 space-y-2 bg-[#161B26]/30 rounded-xl border border-dashed border-[#232A3B]">
                  <Search className="w-6 h-6 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs font-medium text-slate-300">No widgets found</p>
                  <p className="text-[11px] text-slate-500">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGES TAB */}
        {sidebarTab === 'pages' && (
          <div className="flex flex-col flex-1 space-y-3">
            <div className="flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Screens & Pages</h2>
                <p className="text-[10px] text-slate-500">{project.screens.length} pages in project</p>
              </div>
              <button
                onClick={() => {
                  setIsCreatingPage(true);
                  setNewPageName(`Screen ${project.screens.length + 1}`);
                  setNewPageRoute(`/screen_${project.screens.length + 1}`);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Page</span>
              </button>
            </div>

            {/* Create New Page Inline Box */}
            {isCreatingPage && (
              <div className="p-3 bg-[#161B26] border border-indigo-500/50 rounded-xl space-y-2.5 shadow-lg shadow-indigo-500/10 shrink-0">
                <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  Add New Screen / Page
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Screen Name</label>
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => {
                      setNewPageName(e.target.value);
                      if (!newPageRoute || newPageRoute.startsWith('/screen_')) {
                        setNewPageRoute(`/${e.target.value.toLowerCase().replace(/\s+/g, '_')}`);
                      }
                    }}
                    placeholder="e.g. Analytics, Settings, Profile"
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-[#0E121C] border border-[#232A3B] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Named Route (URL)</label>
                  <input
                    type="text"
                    value={newPageRoute}
                    onChange={(e) => setNewPageRoute(e.target.value)}
                    placeholder="e.g. /analytics"
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-[#0E121C] border border-[#232A3B] text-xs font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsCreatingPage(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newPageName.trim()) {
                        addScreen(newPageName.trim(), newPageRoute.trim());
                        setIsCreatingPage(false);
                      }
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Create Screen
                  </button>
                </div>
              </div>
            )}

            {/* List of Screens */}
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
              {project.screens.map((screen) => {
                const isActive = screen.id === activeScreenId;
                const isEditing = editingScreenId === screen.id;

                return (
                  <div
                    key={screen.id}
                    onClick={() => {
                      if (!isEditing) setActiveScreen(screen.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-[#161B26]/60 border-[#232A3B] hover:border-slate-600 hover:bg-[#161B26]'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="text-[9px] text-slate-400 font-medium">Screen Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full mt-0.5 px-2 py-1 rounded bg-[#0E121C] border border-indigo-500 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 font-medium">Route</label>
                          <input
                            type="text"
                            value={editRoute}
                            onChange={(e) => setEditRoute(e.target.value)}
                            className="w-full mt-0.5 px-2 py-1 rounded bg-[#0E121C] border border-indigo-500 text-xs font-mono text-indigo-300"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => setEditingScreenId(null)}
                            className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              updateScreenInfo(screen.id, editName, editRoute);
                              setEditingScreenId(null);
                            }}
                            className="px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white truncate">{screen.name}</span>
                            {isActive && (
                              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-indigo-400 truncate mt-0.5">
                            {screen.route}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingScreenId(screen.id);
                              setEditName(screen.name);
                              setEditRoute(screen.route);
                            }}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
                            title="Edit Screen Info"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => duplicateScreen(screen.id)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
                            title="Duplicate Screen"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {project.screens.length > 1 && (
                            <button
                              onClick={() => deleteScreen(screen.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/10"
                              title="Delete Screen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Redirection Guide Box */}
            <div className="p-3 rounded-xl bg-[#161B26]/40 border border-[#232A3B] space-y-1.5 text-[11px] text-slate-400 shrink-0">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Multi-Page Redirection
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400">
                1. Select any <strong className="text-white">ElevatedButton</strong>, <strong className="text-white">Card</strong>, or <strong className="text-white">KPICard</strong>.
              </p>
              <p className="text-[10px] leading-relaxed text-slate-400">
                2. In the Property Inspector, open <strong className="text-indigo-300">Tap Action & Page Redirection</strong> and select your destination screen.
              </p>
              <p className="text-[10px] leading-relaxed text-slate-400">
                3. Clicking the hamburger menu in the emulator <strong className="text-white">AppBar</strong> also slides open the Drawer to switch between all screens!
              </p>
            </div>
          </div>
        )}

        {/* TREE TAB */}
        {sidebarTab === 'tree' && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Component Tree</h2>
            <div className="space-y-1">
              {Object.values(project.components).map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectComponent(c.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                    selectedComponentId === c.id
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'hover:bg-[#1E2536] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-indigo-300 text-[11px] font-bold">{c.type}</span>
                    <span className="text-[10px] opacity-60 font-mono truncate">{c.id}</span>
                  </div>
                  {c.parentId && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveComponentOrder(c.id, 'up');
                        }}
                        className="p-1 hover:text-white"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComponent(c.id);
                        }}
                        className="p-1 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OTHER SIDEBAR PANELS */}
        {sidebarTab === 'theme' && <ThemeStudio />}
        {sidebarTab === 'android' && <AndroidManager />}
        {sidebarTab === 'api' && <ApiManager />}
        {sidebarTab === 'backend' && <BackendDesigner />}
        {sidebarTab === 'security' && <SecurityCenter />}
        {sidebarTab === 'builds' && <DownloadCenter />}
        {sidebarTab === 'storage' && <StorageManager />}
      </div>
    </aside>
  );
};
