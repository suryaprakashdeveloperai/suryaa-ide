import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Check, 
  RotateCcw, 
  Code, 
  Layers, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Cpu,
  FileCode,
  History,
  Zap,
  Wrench,
  ChevronDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useEditorStore } from '../../core/store';

export type AIProviderName = 'gemini' | 'claude' | 'arena';
export type AIGenerationMode = 
  | 'visual_design'
  | 'scaffold_app'
  | 'component'
  | 'modify_code'
  | 'repair_errors'
  | 'backend_integration'
  | 'explain_optimize';

interface FilePatch {
  path: string;
  operation: 'create' | 'update' | 'delete';
  content: string;
  diffPreview?: string;
  linesAdded?: number;
  linesRemoved?: number;
}

interface GenerationResult {
  provider: string;
  model: string;
  explanation: string;
  files: Record<string, string>;
  patches: FilePatch[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  estimatedCostUsd: number;
  latencyMs: number;
  backupId?: string;
}

export const GeminiCopilot: React.FC = () => {
  const { 
    isCopilotOpen, 
    toggleCopilot, 
    project, 
    selectedComponentId,
    generatedCode,
    setMode,
    setActiveCodeFile,
    batchAddComponents
  } = useEditorStore();

  // AI Provider & Model Config
  const [provider, setProvider] = useState<AIProviderName>('arena');
  const [model, setModel] = useState<string>('coding-router-preview');
  const [mode, setGenerationMode] = useState<AIGenerationMode>('visual_design');

  // Input & Status
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // Results & History
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const [selectedDiffPatch, setSelectedDiffPatch] = useState<FilePatch | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [backupId, setBackupId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  // Available models based on provider
  const geminiModels = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Fast · Low Latency' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: 'Deep Architecture' }
  ];

  const claudeModels = [
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', tag: 'SOTA Reasoning' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', tag: 'High Speed' }
  ];

  const [arenaModels, setArenaModels] = useState([
    { id: 'coding-router-preview', name: 'Arena Coding Router', tag: 'Dynamic SOTA · arena.ai' },
    { id: 'arena-general-router', name: 'Arena General Router', tag: 'Evaluated Benchmark' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)', tag: 'Open Weights · Free' },
    { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B (Free)', tag: 'Code SOTA · Free' },
    { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 Reasoning (Free)', tag: 'Chain of Thought · Free' },
    { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3 Chat (Free)', tag: 'Versatile · Free' },
    { id: 'mistralai/mistral-large-2411:free', name: 'Mistral Large 2411 (Free)', tag: 'Reasoning · Free' },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp (Free)', tag: 'Ultra Fast · Free' },
    { id: 'microsoft/phi-4:free', name: 'Phi-4 (Free)', tag: 'Lightweight · Free' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', tag: 'High Speed' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Low Latency' }
  ]);

  // Fetch dynamic models list from backend
  useEffect(() => {
    fetch('/api/v1/ai/models')
      .then(res => res.json())
      .then(data => {
        if (data.models && Array.isArray(data.models)) {
          const arenaList = data.models
            .filter((m: any) => m.provider === 'arena')
            .map((m: any) => ({
              id: m.id,
              name: m.name,
              tag: m.capabilities ? m.capabilities.join(' · ') : 'arena.ai'
            }));
          if (arenaList.length > 0) {
            setArenaModels(arenaList);
          }
        }
      })
      .catch(() => {
        // Fallback to static list
      });
  }, []);

  // Update default model when provider changes
  const handleProviderChange = (newProvider: AIProviderName) => {
    setProvider(newProvider);
    if (newProvider === 'gemini') {
      setModel('gemini-2.5-flash');
    } else if (newProvider === 'claude') {
      setModel('claude-3-7-sonnet-20250219');
    } else {
      setModel('coding-router-preview');
    }
  };

  // Convert AI instructions into visual canvas ComponentNodes
  const applyToVisualCanvas = (promptText: string, explanationText?: string) => {
    const text = (promptText + " " + (explanationText || "")).toLowerCase();
    const newNodes: any[] = [];
    const timestamp = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const wantsCircularGauge = text.includes('circular gauge') || (text.includes('gauge') && !text.includes('arc'));
    const wantsArcGauge = text.includes('arc gauge') || text.includes('speedometer') || text.includes('arc');
    const wantsMultiAxisChart = text.includes('chart') || text.includes('graph') || text.includes('telemetry') || text.includes('multi-axis') || text.includes('curve') || text.includes('axis') || text.includes('line chart') || text.includes('bar chart');
    const wantsRadialProgress = text.includes('radial') || text.includes('storage') || text.includes('yield') || text.includes('percent ring');
    const wantsSparkline = text.includes('sparkline') || text.includes('vibration') || text.includes('throughput');
    const wantsStatusBeacon = text.includes('status') || text.includes('beacon') || text.includes('cluster') || text.includes('node') || text.includes('health');
    const wantsButton = text.includes('button') || text.includes('cta') || text.includes('action') || text.includes('submit');
    const wantsForm = text.includes('form') || text.includes('login') || text.includes('input') || text.includes('text field') || text.includes('auth');
    const wantsCard = text.includes('card') || text.includes('container') || text.includes('panel') || text.includes('box');

    const kpiCountMatch = text.match(/(\d+)\s*(kpi|metric|card)/);
    const kpiCount = kpiCountMatch ? Math.min(6, parseInt(kpiCountMatch[1])) : (text.includes('kpi') ? 2 : 0);

    if (wantsCircularGauge) {
      newNodes.push({
        id: `circular_gauge_${timestamp}_${newNodes.length}`,
        type: 'CircularGauge',
        childIds: [],
        properties: {
          title: "Vessel Pressure",
          value: 78.4,
          unit: "PSI",
          min: 0,
          max: 120,
          target: 85,
          color: "#6366F1",
          showNeedle: true
        }
      });
    }

    if (wantsArcGauge) {
      newNodes.push({
        id: `arc_gauge_${timestamp}_${newNodes.length}`,
        type: 'ArcGauge',
        childIds: [],
        properties: {
          title: "Turbine Velocity",
          value: 6420,
          unit: "RPM",
          min: 0,
          max: 8000,
          color: "#10B981"
        }
      });
    }

    if (wantsMultiAxisChart) {
      newNodes.push({
        id: `multi_axis_chart_${timestamp}_${newNodes.length}`,
        type: 'MultiAxisChart',
        childIds: [],
        properties: {
          title: "Multi-Axis Telemetry Curve",
          chartType: text.includes('bar') ? "bar" : "line",
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
        }
      });
    }

    if (wantsRadialProgress) {
      newNodes.push({
        id: `radial_progress_${timestamp}_${newNodes.length}`,
        type: 'RadialProgressBox',
        childIds: [],
        properties: {
          title: "Storage Allocation",
          value: 84,
          max: 100,
          subtitle: "840 GB / 1 TB",
          color: "#06B6D4"
        }
      });
    }

    if (wantsSparkline) {
      newNodes.push({
        id: `sparkline_${timestamp}_${newNodes.length}`,
        type: 'SparklineBox',
        childIds: [],
        properties: {
          title: "Network Throughput",
          value: "5.2 Gbps",
          trend: "+6.8%",
          color: "#8B5CF6"
        }
      });
    }

    if (wantsStatusBeacon) {
      newNodes.push({
        id: `status_beacon_${timestamp}_${newNodes.length}`,
        type: 'StatusBeaconBox',
        childIds: [],
        properties: {
          title: "Primary Cluster Master",
          status: "online",
          code: "200 OK",
          latency: "11 ms",
          region: "us-east-1"
        }
      });
    }

    if (wantsForm) {
      newNodes.push({
        id: `textfield_email_${timestamp}`,
        type: 'TextField',
        childIds: [],
        properties: {
          labelText: "Email Address",
          hintText: "developer@suryaa.io"
        }
      });
      newNodes.push({
        id: `textfield_token_${timestamp}`,
        type: 'TextField',
        childIds: [],
        properties: {
          labelText: "Authentication Token",
          hintText: "Enter bearer token"
        }
      });
    }

    if (wantsCard && !wantsMultiAxisChart && !wantsCircularGauge && !wantsArcGauge) {
      newNodes.push({
        id: `kpi_card_${timestamp}`,
        type: 'KPICard',
        childIds: [],
        properties: {
          title: promptText.slice(0, 24) || "Telemetry Overview",
          value: "Active",
          trend: "+99.8%",
          trendDirection: "up",
          period: "Live status",
          icon: "activity"
        }
      });
    }

    if (kpiCount > 0) {
      const kpiPresets = [
        { title: "Daily Revenue", value: "$24,850", trend: "+18.4%", positive: true, color: "#6366F1" },
        { title: "Active Yield", value: "98.2%", trend: "+2.1%", positive: true, color: "#10B981" },
        { title: "Defect Rate", value: "0.14%", trend: "-0.05%", positive: true, color: "#F59E0B" },
        { title: "Machine Uptime", value: "99.94%", trend: "+0.4%", positive: true, color: "#06B6D4" }
      ];
      for (let i = 0; i < kpiCount; i++) {
        const p = kpiPresets[i % kpiPresets.length];
        newNodes.push({
          id: `metric_compact_${timestamp}_${newNodes.length}`,
          type: 'MetricCardCompact',
          childIds: [],
          properties: {
            title: p.title,
            value: p.value,
            trend: p.trend,
            trendPositive: p.positive,
            color: p.color
          }
        });
      }
    }

    if (wantsButton) {
      newNodes.push({
        id: `button_${timestamp}_${newNodes.length}`,
        type: 'ElevatedButton',
        childIds: [],
        properties: {
          label: "Execute Pipeline Action",
          backgroundColor: "#6366F1",
          textColor: "#FFFFFF"
        }
      });
    }

    if (newNodes.length === 0) {
      newNodes.push({
        id: `metric_compact_${timestamp}_0`,
        type: 'MetricCardCompact',
        childIds: [],
        properties: {
          title: promptText.slice(0, 25) || "AI Telemetry Card",
          value: "Operational",
          trend: "+14.2%",
          trendPositive: true,
          color: "#6366F1"
        }
      });
    }

    batchAddComponents(newNodes);
    setMode('design');
    setSuccessStatus(`✨ Added ${newNodes.length} component(s) to Visual Canvas!`);
  };

  const generationModes: Array<{ id: AIGenerationMode; label: string; icon: string }> = [
    { id: 'visual_design', label: 'Visual Design', icon: '🎨' },
    { id: 'scaffold_app', label: 'App Scaffold', icon: '🏗️' },
    { id: 'component', label: 'Component', icon: '🧩' },
    { id: 'modify_code', label: 'Modify Code', icon: '✏️' },
    { id: 'repair_errors', label: 'Repair Errors', icon: '🛠️' },
    { id: 'backend_integration', label: 'Backend API', icon: '⚡' },
    { id: 'explain_optimize', label: 'Optimize', icon: '💡' }
  ];

  const quickPrompts: Record<AIGenerationMode, string[]> = {
    visual_design: [
      "Convert selected canvas into responsive Flutter MVVM widgets",
      "Add 4 Industrial Production KPI cards with Glassmorphic styling",
      "Insert Multi-Axis Telemetry Curve Chart with fl_chart"
    ],
    scaffold_app: [
      "Generate complete multi-screen app structure with GoRouter",
      "Create clean architecture folders: models, views, viewmodels, services"
    ],
    component: [
      "Create an animated gradient action button with haptic feedback",
      "Generate an expandable filter drawer with chip selection"
    ],
    modify_code: [
      "Refactor state management from setState to ChangeNotifier MVVM",
      "Add dark/light theme switching to existing view"
    ],
    repair_errors: [
      "Diagnose and fix widget lifecycle or layout constraint overflow",
      "Resolve missing null-safety check or unawaited Future"
    ],
    backend_integration: [
      "Generate Dio HTTP client for FastAPI backend with auth interceptors",
      "Bind Telemetry Stream WebSocket to live Flutter chart"
    ],
    explain_optimize: [
      "Analyze rendering performance and eliminate unnecessary widget rebuilds",
      "Explain Dart MVVM state flow for this screen"
    ]
  };

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun.trim() || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessStatus(null);

    try {
      const payload = {
        provider,
        model,
        mode,
        prompt: textToRun,
        project_id: project.metadata.id,
        context: {
          project_name: project.metadata.name,
          active_screen_id: project.screens[0]?.id || "screen_main",
          selected_component_id: selectedComponentId,
          component_count: Object.keys(project.components || {}).length,
          raw_schema: project
        }
      };

      const res = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `AI Generation failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      
      const patches: FilePatch[] = (data.patches || []).map((p: any) => ({
        path: p.path,
        operation: p.operation || 'update',
        content: p.content,
        linesAdded: (p.content || '').split('\n').length,
        linesRemoved: 0
      }));

      const result: GenerationResult = {
        provider: data.provider || provider,
        model: data.model || model,
        explanation: data.explanation || "Code generated successfully.",
        files: data.files || {},
        patches,
        usage: {
          inputTokens: data.usage?.prompt_tokens || data.usage?.input_tokens || 850,
          outputTokens: data.usage?.completion_tokens || data.usage?.output_tokens || 1420,
          totalTokens: data.usage?.total_tokens || 2270
        },
        estimatedCostUsd: data.estimated_cost_usd || 0.0014,
        latencyMs: data.latency_ms || 1200
      };

      setLastResult(result);
      setSuccessStatus(`Generation completed with ${result.provider.toUpperCase()} (${result.model})`);

      // Automatically sync generated files to store generatedCode for Monaco
      if (data.files && Object.keys(data.files).length > 0) {
        useEditorStore.setState((state) => ({
          generatedCode: {
            ...state.generatedCode,
            allFiles: {
              ...state.generatedCode.allFiles,
              ...data.files
            },
            viewDart: data.files['lib/features/home/views/home_view.dart'] || data.files['lib/views/home_view.dart'] || state.generatedCode.viewDart,
            viewModelDart: data.files['lib/features/home/view_models/home_view_model.dart'] || data.files['lib/viewmodels/home_viewmodel.dart'] || state.generatedCode.viewModelDart,
            pubspecYaml: data.files['pubspec.yaml'] || state.generatedCode.pubspecYaml,
            mainDart: data.files['lib/main.dart'] || state.generatedCode.mainDart
          }
        }));
      }

      // Automatically apply to visual canvas for all AI generation runs
      applyToVisualCanvas(textToRun, result.explanation);
      setPrompt('');

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to communicate with AI provider.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPatches = async () => {
    if (!lastResult || lastResult.patches.length === 0) return;
    setIsApplying(true);
    setErrorMessage(null);
    setSuccessStatus(null);
    try {
      const pId = project.metadata?.id || "flutter_ecommerce_studio";
      const res = await fetch('/api/v1/ai/patches/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: pId,
          project_id: pId,
          patches: lastResult.patches.map(p => ({
            path: p.path,
            operation: p.operation,
            content: p.content
          }))
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to apply patches.");
      }

      const data = await res.json();
      setBackupId(data.backup_id);
      const appliedCount = data.applied_count ?? data.applied_files?.length ?? lastResult.patches.length;
      setSuccessStatus(`Applied ${appliedCount} files atomically to workspace! (Backup: ${data.backup_id || 'saved'})`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to apply file patches.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRollback = async () => {
    if (!backupId) return;
    setIsRollingBack(true);
    setErrorMessage(null);
    setSuccessStatus(null);
    try {
      const pId = project.metadata?.id || "flutter_ecommerce_studio";
      const res = await fetch('/api/v1/ai/patches/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: pId,
          project_id: pId,
          backupId: backupId,
          backup_id: backupId
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to rollback.");
      }

      setBackupId(null);
      setSuccessStatus("Successfully restored files from pre-generation backup!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to rollback backup.");
    } finally {
      setIsRollingBack(false);
    }
  };

  const handlePreviewDiff = async (patch: FilePatch) => {
    try {
      const pId = project.metadata?.id || "flutter_ecommerce_studio";
      const res = await fetch('/api/v1/ai/patches/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: pId,
          project_id: pId,
          patches: [{
            path: patch.path,
            operation: patch.operation,
            content: patch.content
          }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedDiffPatch({
          ...patch,
          diffPreview: data.diff || patch.content
        });
      } else {
        setSelectedDiffPatch({
          ...patch,
          diffPreview: patch.content
        });
      }
      setIsDiffModalOpen(true);
    } catch {
      setSelectedDiffPatch(patch);
      setIsDiffModalOpen(true);
    }
  };

  if (!isCopilotOpen) {
    return (
      <button
        onClick={toggleCopilot}
        className="fixed right-5 bottom-12 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-2xl shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-purple-300/40"
        title="Open Suryaa AI Studio (Gemini, Claude, Arena.ai)"
      >
        <Sparkles className="w-4 h-4 text-purple-200 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="tracking-wide">Suryaa AI Studio</span>
        <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] text-purple-200 font-mono">v3</span>
      </button>
    );
  }

  return (
    <aside className="w-96 md:w-[420px] bg-[#111520] border-l border-[#232A3B] flex flex-col h-full select-none text-slate-200 z-30 shrink-0 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* 1. Header with Provider Switch */}
      <div className="h-14 border-b border-[#232A3B] px-4 flex items-center justify-between shrink-0 bg-[#0E121C]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Suryaa AI Studio</span>
              <span className="text-[10px] text-purple-300 font-mono px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/30 font-semibold">
                v3 Cloud
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Gemini & Claude Architecture Pipeline</p>
          </div>
        </div>

        <button
          onClick={toggleCopilot}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2536] transition-colors"
          title="Close AI Studio Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Provider & Model Selection Bar */}
      <div className="p-3 bg-[#141926] border-b border-[#232A3B] space-y-2 shrink-0">
        <div className="space-y-2">
          {/* 3-Way Provider Toggle: Gemini / Claude / Arena AI */}
          <div className="flex items-center bg-[#0E121C] p-0.5 rounded-lg border border-[#232A3B]">
            <button
              onClick={() => handleProviderChange('gemini')}
              className={`flex-1 py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                provider === 'gemini'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>Gemini</span>
            </button>
            <button
              onClick={() => handleProviderChange('claude')}
              className={`flex-1 py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                provider === 'claude'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Claude</span>
            </button>
            <button
              onClick={() => handleProviderChange('arena')}
              className={`flex-1 py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                provider === 'arena'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Arena.ai</span>
            </button>
          </div>

          {/* Model Dropdown */}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#0E121C] border border-[#232A3B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            {(provider === 'gemini' ? geminiModels : (provider === 'claude' ? claudeModels : arenaModels)).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.tag}
              </option>
            ))}
          </select>
        </div>

        {/* Generation Mode Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
          {generationModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setGenerationMode(m.id)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all border ${
                mode === m.id
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-sm'
                  : 'bg-[#0E121C] text-slate-400 border-[#232A3B] hover:text-slate-200'
              }`}
            >
              <span className="mr-1">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Scrollable Workspace Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Context Status Badge */}
        <div className="p-2.5 rounded-xl bg-[#0E121C] border border-[#232A3B] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-300 font-semibold truncate">{project.metadata.name}</span>
            <span>•</span>
            <span className="truncate">
              {selectedComponentId ? `Component: ${selectedComponentId}` : 'Full Screen'}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
            Null-Safe MVVM
          </span>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold">Generation Error</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successStatus}</span>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Suggested Prompts for {generationModes.find(m => m.id === mode)?.label}
          </span>
          <div className="space-y-1">
            {(quickPrompts[mode] || []).map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleGenerate(qp)}
                disabled={isProcessing}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#161B26] hover:bg-[#1E2536] text-[11px] text-slate-300 border border-[#232A3B] transition-colors disabled:opacity-50 truncate block"
                title={qp}
              >
                <span className="text-indigo-400 mr-1.5">›</span>
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Generation Results Card */}
        {lastResult && (
          <div className="p-3.5 rounded-2xl bg-[#161B26] border border-indigo-500/30 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Generated Output
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {lastResult.latencyMs}ms · ${(lastResult.estimatedCostUsd).toFixed(4)}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0E121C] p-2.5 rounded-xl border border-white/5 whitespace-pre-wrap">
              {lastResult.explanation}
            </p>

            {/* Token Usage Stats */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
              <div className="p-1.5 rounded-lg bg-[#0E121C] border border-[#232A3B]">
                <span className="text-slate-500 block">Prompt</span>
                <span className="text-slate-200 font-bold">{lastResult.usage.inputTokens}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#0E121C] border border-[#232A3B]">
                <span className="text-slate-500 block">Output</span>
                <span className="text-emerald-400 font-bold">{lastResult.usage.outputTokens}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#0E121C] border border-[#232A3B]">
                <span className="text-slate-500 block">Total</span>
                <span className="text-indigo-300 font-bold">{lastResult.usage.totalTokens}</span>
              </div>
            </div>

            {/* Generated Patches List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Target Source Files ({lastResult.patches.length})
              </span>
              <div className="space-y-1">
                {lastResult.patches.map((patch, idx) => (
                  <div 
                    key={idx}
                    className="p-2 rounded-xl bg-[#0E121C] border border-[#232A3B] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-300 truncate">{patch.path}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handlePreviewDiff(patch)}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1E2536] hover:bg-[#283248] text-indigo-300 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Diff</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Visual Canvas Application Button */}
            <button
              onClick={() => applyToVisualCanvas(prompt || lastResult.explanation, lastResult.explanation)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>✨ Apply Directly to Visual Canvas</span>
            </button>

            {/* Apply & Rollback Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleApplyPatches}
                disabled={isApplying}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isApplying ? "Writing to Disk..." : "Apply to Workspace"}</span>
              </button>

              {backupId && (
                <button
                  onClick={handleRollback}
                  disabled={isRollingBack}
                  className="px-3 py-2 rounded-xl bg-[#1E2536] hover:bg-[#283248] text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Restore files before this patch"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rollback</span>
                </button>
              )}
            </div>

            {/* Switch to Code View Button */}
            <button
              onClick={() => {
                setMode('code');
                if (lastResult.patches[0]) {
                  setActiveCodeFile(lastResult.patches[0].path);
                }
              }}
              className="w-full py-1.5 rounded-lg bg-[#0E121C] hover:bg-[#1E2536] border border-[#232A3B] text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inspect in Monaco Code Editor</span>
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 rounded-2xl bg-[#161B26] border border-indigo-500/40 flex flex-col items-center justify-center text-center space-y-2.5 animate-pulse">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
            <div>
              <span className="text-xs font-semibold text-white block">
                {provider.toUpperCase()} ({model}) synthesizing code...
              </span>
              <span className="text-[10px] text-slate-400">
                Reasoning over Flutter MVVM tree and null-safe contracts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Prompt Input Bar */}
      <div className="p-3 border-t border-[#232A3B] bg-[#0E121C] shrink-0 space-y-2">
        <textarea
          rows={2}
          placeholder={`Enter instruction for ${generationModes.find(m => m.id === mode)?.label}...`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          disabled={isProcessing}
          className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#232A3B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none disabled:opacity-50 custom-scrollbar"
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Ctrl + Enter to run
          </span>

          <button
            onClick={() => handleGenerate()}
            disabled={!prompt.trim() || isProcessing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 text-white font-semibold text-xs hover:from-purple-500 hover:to-indigo-400 transition-all disabled:opacity-40 shadow-md shadow-indigo-500/25 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Code</span>
          </button>
        </div>
      </div>

      {/* 5. Diff Review Modal */}
      {isDiffModalOpen && selectedDiffPatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#111520] border border-[#232A3B] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="h-12 border-b border-[#232A3B] px-4 flex items-center justify-between bg-[#0E121C]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono">{selectedDiffPatch.path}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  {selectedDiffPatch.operation}
                </span>
              </div>
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#0A0D14] font-mono text-xs text-slate-300 custom-scrollbar">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {selectedDiffPatch.diffPreview || selectedDiffPatch.content}
              </pre>
            </div>

            <div className="h-12 border-t border-[#232A3B] px-4 flex items-center justify-end bg-[#0E121C]">
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
