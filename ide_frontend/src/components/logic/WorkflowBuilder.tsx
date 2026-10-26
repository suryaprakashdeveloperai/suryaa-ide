import React, { useState } from 'react';
import { useEditorStore } from '../../core/store';
import { ComponentNode, Screen } from '../../types/schema';
import { 
  GitFork, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Play, 
  Sparkles, 
  Smartphone, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  Gauge, 
  Activity, 
  BarChart2, 
  DollarSign, 
  Zap, 
  Radio, 
  Trash2, 
  Copy, 
  ChevronDown,
  Navigation,
  Globe
} from 'lucide-react';

interface NavigationEdge {
  id: string;
  sourceScreenId: string;
  targetScreenId: string;
  sourceScreenName: string;
  targetScreenName: string;
  sourceCompId: string;
  sourceCompType: string;
  triggerLabel: string;
  targetRoute: string;
}

export const WorkflowBuilder: React.FC = () => {
  const { 
    project, 
    activeScreenId, 
    setActiveScreen, 
    setMode, 
    addScreen, 
    deleteScreen, 
    duplicateScreen,
    batchAddComponents 
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'screens' | 'logic'>('screens');
  const [selectedScreenForMenu, setSelectedScreenForMenu] = useState<string | null>(null);
  const [isAddScreenModalOpen, setIsAddScreenModalOpen] = useState(false);
  const [newScreenName, setNewScreenName] = useState("");
  const [newScreenRoute, setNewScreenRoute] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Compute Navigation Binding Edges from Component Properties
  const computeNavigationEdges = (): NavigationEdge[] => {
    const edges: NavigationEdge[] = [];
    const compMap = project.components || {};

    // Helper: find which screen owns a component
    const getScreenForComponent = (compId: string): Screen | undefined => {
      for (const screen of project.screens) {
        // Traverse tree starting from root
        const queue = [screen.rootComponentId];
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          if (currentId === compId) return screen;
          const node = compMap[currentId];
          if (node && node.childIds) {
            queue.push(...node.childIds);
          }
        }
      }
      return undefined;
    };

    // Scan all components for navigation actions
    Object.values(compMap).forEach((comp: ComponentNode) => {
      const p = comp.properties || {};
      if (p.action === 'navigate' || p.targetScreen || p.targetRoute) {
        const sourceScreen = getScreenForComponent(comp.id);
        if (!sourceScreen) return;

        let targetScreen: Screen | undefined;
        if (p.targetScreen) {
          targetScreen = project.screens.find(s => s.id === p.targetScreen);
        }
        if (!targetScreen && p.targetRoute) {
          targetScreen = project.screens.find(s => s.route === p.targetRoute);
        }

        if (targetScreen) {
          edges.push({
            id: `edge_${comp.id}_${targetScreen.id}`,
            sourceScreenId: sourceScreen.id,
            targetScreenId: targetScreen.id,
            sourceScreenName: sourceScreen.name,
            targetScreenName: targetScreen.name,
            sourceCompId: comp.id,
            sourceCompType: comp.type,
            triggerLabel: p.label || p.text || p.title || comp.type,
            targetRoute: targetScreen.route
          });
        }
      }
    });

    return edges;
  };

  const navEdges = computeNavigationEdges();

  // Helper to count widgets inside a screen
  const getWidgetCount = (screen: Screen): number => {
    let count = 0;
    const queue = [screen.rootComponentId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      count++;
      const node = project.components[currentId];
      if (node && node.childIds) {
        queue.push(...node.childIds);
      }
    }
    return count;
  };

  // Helper to add a specific widget directly to a screen
  const handleAddWidgetToScreen = (screen: Screen, widgetType: string) => {
    setSelectedScreenForMenu(null);
    const timestamp = Date.now();
    const newId = `${widgetType.toLowerCase()}_${timestamp}`;

    let defaultProperties: Record<string, any> = {};

    switch (widgetType) {
      case 'CircularGauge':
        defaultProperties = {
          title: "Pressure Telemetry",
          value: 78.4,
          unit: "PSI",
          min: 0,
          max: 120,
          target: 85,
          color: "#6366F1",
          showNeedle: true
        };
        break;
      case 'ArcGauge':
        defaultProperties = {
          title: "Turbine Velocity",
          value: 6420,
          unit: "RPM",
          min: 0,
          max: 8000,
          color: "#10B981"
        };
        break;
      case 'MultiAxisChart':
        defaultProperties = {
          title: "Multi-Axis Telemetry Curve",
          chartType: "line",
          xAxisTitle: "Time (UTC)",
          xAxisLabels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
          yAxisTitle: "Primary (PSI)",
          yAxisSecondaryTitle: "Secondary (°C)",
          showSecondaryYAxis: true,
          showLegend: true,
          series: [
            { id: "s1", name: "Turbine Pressure", color: "#6366F1", data: [45, 68, 52, 88, 96, 78], yAxis: "left" },
            { id: "s2", name: "Core Temperature", color: "#10B981", data: [22, 28, 35, 30, 42, 45], yAxis: "right" }
          ]
        };
        break;
      case 'MetricCardCompact':
        defaultProperties = {
          title: "Daily Production",
          value: "$28,450",
          trend: "+16.8%",
          trendPositive: true,
          color: "#6366F1"
        };
        break;
      case 'RadialProgressBox':
        defaultProperties = {
          title: "Batch Yield",
          value: 84,
          max: 100,
          subtitle: "840 GB / 1 TB",
          color: "#06B6D4"
        };
        break;
      case 'SparklineBox':
        defaultProperties = {
          title: "Network Throughput",
          value: "5.2 Gbps",
          trend: "+6.8%",
          color: "#8B5CF6"
        };
        break;
      case 'StatusBeaconBox':
        defaultProperties = {
          title: "Primary Cluster Master",
          status: "online",
          code: "200 OK",
          latency: "11 ms",
          region: "us-east-1"
        };
        break;
      case 'ElevatedButton':
        defaultProperties = {
          label: "Execute Process Action",
          backgroundColor: "#6366F1",
          textColor: "#FFFFFF"
        };
        break;
      default:
        defaultProperties = {
          text: `Sample ${widgetType}`
        };
        break;
    }

    // Find the body container of the screen
    const root = project.components[screen.rootComponentId];
    let targetParentId = screen.rootComponentId;
    if (root && root.type === 'Scaffold') {
      const bodyChild = root.childIds.find(cid => project.components[cid]?.type !== 'AppBar');
      if (bodyChild) targetParentId = bodyChild;
    }

    const newNode: ComponentNode = {
      id: newId,
      type: widgetType,
      parentId: targetParentId,
      childIds: [],
      properties: defaultProperties
    };

    batchAddComponents([newNode], targetParentId);
    setActiveScreen(screen.id);
    showToast(`✨ Added [${widgetType}] to page "${screen.name}"!`);
  };

  const handleCreateNewScreen = () => {
    if (!newScreenName.trim()) return;
    const route = newScreenRoute.trim() || `/${newScreenName.toLowerCase().replace(/\s+/g, '-')}`;
    const newScrId = addScreen(newScreenName.trim(), route.startsWith('/') ? route : `/${route}`);
    setIsAddScreenModalOpen(false);
    setNewScreenName("");
    setNewScreenRoute("");
    setActiveScreen(newScrId);
    showToast(`✨ Created screen "${newScreenName}" with route "${route}"!`);
  };

  return (
    <div className="flex-1 h-full bg-[#0A0D14] flex flex-col overflow-hidden select-none relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl shadow-indigo-500/50 flex items-center gap-2 border border-indigo-400 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Control Bar */}
      <div className="h-14 border-b border-[#232A3B] px-5 flex items-center justify-between bg-[#111520] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Suryaa Visual Page & Route Binding Studio
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                GoRouter v14
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Interactive navigation graph binding {project.screens.length} pages and {navEdges.length} active routes
            </span>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-[#0E121C] border border-[#232A3B] text-xs">
            <button
              onClick={() => setActiveTab('screens')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activeTab === 'screens' 
                  ? 'bg-indigo-600 text-white font-bold shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📱 Page Navigation Graph ({project.screens.length})
            </button>
            <button
              onClick={() => setActiveTab('logic')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activeTab === 'logic' 
                  ? 'bg-indigo-600 text-white font-bold shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Logic Event DAG
            </button>
          </div>

          <button
            onClick={() => setIsAddScreenModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Page</span>
          </button>
        </div>
      </div>

      {/* Main Graph Canvas */}
      {activeTab === 'screens' ? (
        <div className="flex-1 overflow-auto relative p-8 bg-[radial-gradient(#1E2536_1px,transparent_1px)] [background-size:24px_24px] flex flex-col justify-start custom-scrollbar">
          {/* Active Navigation Route Badges */}
          {navEdges.length > 0 && (
            <div className="mb-6 p-3 rounded-xl bg-[#111520]/80 border border-[#232A3B] backdrop-blur flex items-center gap-3 overflow-x-auto max-w-4xl mx-auto custom-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-indigo-400" /> Page Bindings:
              </span>
              <div className="flex items-center gap-2">
                {navEdges.map(edge => (
                  <div 
                    key={edge.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161B26] border border-indigo-500/30 text-xs text-slate-300 font-mono shrink-0 shadow-sm"
                  >
                    <span className="text-indigo-400 font-semibold">{edge.sourceScreenName}</span>
                    <span className="text-slate-500 text-[10px]">({edge.triggerLabel})</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-emerald-400 font-semibold">{edge.targetScreenName}</span>
                    <span className="text-[10px] text-slate-500">[{edge.targetRoute}]</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screen Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
            {project.screens.map((screen, sIdx) => {
              const isSelected = activeScreenId === screen.id;
              const widgetCount = getWidgetCount(screen);
              const isInitial = sIdx === 0 || screen.route === '/';
              const outboundEdges = navEdges.filter(e => e.sourceScreenId === screen.id);
              const inboundEdges = navEdges.filter(e => e.targetScreenId === screen.id);

              return (
                <div 
                  key={screen.id}
                  onClick={() => setActiveScreen(screen.id)}
                  className={`rounded-2xl transition-all relative overflow-visible cursor-pointer group flex flex-col bg-[#111520] border ${
                    isSelected 
                      ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/40' 
                      : 'border-[#232A3B] hover:border-slate-500 shadow-lg'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-[#232A3B] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-[#161B26] text-slate-400 group-hover:text-white'
                      }`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate max-w-[120px]">
                            {screen.name}
                          </h4>
                          {isInitial && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                              INITIAL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <Globe className="w-2.5 h-2.5 text-slate-500" />
                          <span>{screen.route}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Screen Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateScreen(screen.id);
                          showToast(`✨ Duplicated screen "${screen.name}"!`);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E2536]"
                        title="Duplicate Screen"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {project.screens.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteScreen(screen.id);
                            showToast(`Deleted screen "${screen.name}".`);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#1E2536]"
                          title="Delete Screen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Specs & Route Connectivity */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-indigo-400" /> Components:
                        </span>
                        <span className="text-white font-bold">{widgetCount} items</span>
                      </div>

                      {/* Route Connectivity Badges */}
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#232A3B]/50">
                        <span className="text-slate-500">Inbound Routes:</span>
                        <span className="text-emerald-400 font-semibold">{inboundEdges.length} link(s)</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500">Outbound Triggers:</span>
                        <span className="text-indigo-400 font-semibold">{outboundEdges.length} jump(s)</span>
                      </div>
                    </div>

                    {/* Quick "+ Point & Add Widget" Menu */}
                    <div className="pt-2 border-t border-[#232A3B] space-y-2">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScreenForMenu(selectedScreenForMenu === screen.id ? null : screen.id);
                          }}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-indigo-400" />
                            <span>+ Point & Add Widget</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {selectedScreenForMenu === screen.id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-0 bottom-full mb-2 w-full rounded-xl bg-[#161B26] border border-[#232A3B] shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in"
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 block">
                              Gauges & Small-Box KPIs
                            </span>
                            <button
                              onClick={() => handleAddWidgetToScreen(screen, 'CircularGauge')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#1E2536] text-xs text-slate-200 flex items-center gap-2"
                            >
                              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                              <span>⭕ Circular Gauge (PSI)</span>
                            </button>
                            <button
                              onClick={() => handleAddWidgetToScreen(screen, 'ArcGauge')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#1E2536] text-xs text-slate-200 flex items-center gap-2"
                            >
                              <Activity className="w-3.5 h-3.5 text-emerald-400" />
                              <span>⚡ Arc Gauge (Speedometer)</span>
                            </button>
                            <button
                              onClick={() => handleAddWidgetToScreen(screen, 'MultiAxisChart')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#1E2536] text-xs text-slate-200 flex items-center gap-2"
                            >
                              <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                              <span>📈 Multi-Axis Telemetry Chart</span>
                            </button>
                            <button
                              onClick={() => handleAddWidgetToScreen(screen, 'MetricCardCompact')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#1E2536] text-xs text-slate-200 flex items-center gap-2"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                              <span>💎 Compact Metric Card</span>
                            </button>
                            <button
                              onClick={() => handleAddWidgetToScreen(screen, 'RadialProgressBox')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#1E2536] text-xs text-slate-200 flex items-center gap-2"
                            >
                              <Radio className="w-3.5 h-3.5 text-cyan-400" />
                              <span>🔄 Radial Progress Ring</span>
                            </button>
                            <button
                              onClick={() => handleAddWidgetToScreen(screen, 'SparklineBox')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#1E2536] text-xs text-slate-200 flex items-center gap-2"
                            >
                              <Zap className="w-3.5 h-3.5 text-violet-400" />
                              <span>〰️ Sparkline Trend Box</span>
                            </button>
                            <button
                              onClick={() => handleAddWidgetToScreen(screen, 'StatusBeaconBox')}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#1E2536] text-xs text-slate-200 flex items-center gap-2"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                              <span>🟢 Status Beacon Node</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Open in Visual Canvas Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveScreen(screen.id);
                          setMode('design');
                        }}
                        className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in Visual Canvas</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Logic DAG View (Event trigger flow) */
        <div className="flex-1 p-8 overflow-auto relative bg-[radial-gradient(#1E2536_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center custom-scrollbar">
          <div className="flex items-center gap-8">
            {(project.workflows[0]?.nodes || [
              { id: "node_init", title: "App Launch Init", type: "trigger", config: { trigger: "onScreenInit" } },
              { id: "node_api", title: "Fetch Remote Telemetry", type: "apiCall", config: { endpoint: "/telemetry" } },
              { id: "node_render", title: "Render Gauges & Charts", type: "action", config: { target: "canvas" } }
            ]).map((node: any, index: number) => (
              <React.Fragment key={node.id}>
                <div className="w-64 p-4 rounded-xl bg-[#161B26] border border-[#232A3B] shadow-xl hover:border-indigo-500 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      node.type === 'trigger' ? 'bg-amber-500/20 text-amber-300' :
                      node.type === 'apiCall' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {node.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{node.id}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{node.title}</h4>
                  <div className="mt-3 pt-2 border-t border-[#232A3B] text-[10px] text-slate-400 font-mono">
                    {JSON.stringify(node.config)}
                  </div>
                </div>
                {index < 2 && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-0.5 bg-indigo-500" />
                    <div className="text-[10px] text-indigo-400 font-mono mt-1">next</div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Add New Screen Modal */}
      {isAddScreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111520] border border-[#232A3B] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#232A3B] pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" /> Create New Screen
              </span>
              <button 
                onClick={() => setIsAddScreenModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Screen Name</label>
                <input
                  type="text"
                  placeholder="e.g. Telemetry Dashboard, Settings, Profile"
                  value={newScreenName}
                  onChange={(e) => {
                    setNewScreenName(e.target.value);
                    if (!newScreenRoute) {
                      setNewScreenRoute(`/${e.target.value.toLowerCase().replace(/\s+/g, '-')}`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#232A3B] text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Navigation Route (GoRouter)</label>
                <input
                  type="text"
                  placeholder="e.g. /telemetry"
                  value={newScreenRoute}
                  onChange={(e) => setNewScreenRoute(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#232A3B] text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232A3B]">
              <button
                onClick={() => setIsAddScreenModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#161B26] hover:bg-[#1E2536] text-xs text-slate-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewScreen}
                disabled={!newScreenName.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                Create Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
