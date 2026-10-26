import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Radio, 
  Database, 
  Server, 
  ShieldCheck, 
  Activity, 
  Fingerprint, 
  RotateCw, 
  Layout, 
  CheckCircle2, 
  FileCode2, 
  Box,
  Sliders,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import { useEditorStore, OrientationPolicy } from '../../core/store';

export const StreamAppArchitectModal: React.FC = () => {
  const { 
    isStreamArchitectModalOpen, 
    closeStreamArchitectModal, 
    buildStreamDrivenApp 
  } = useEditorStore();

  const [streamUrl, setStreamUrl] = useState("wss://stream.iot-telemetry.io/sensors/v1");
  const [streamTag, setStreamTag] = useState("sensor_group_alpha");
  const [xAxisTag, setXAxisTag] = useState("timestamp");
  const [primaryYAxisTag, setPrimaryYAxisTag] = useState("pressure_psi");
  const [secondaryYAxisTag, setSecondaryYAxisTag] = useState("temperature_c");

  const [includeDocker, setIncludeDocker] = useState(true);
  const [includePostgres, setIncludePostgres] = useState(true);
  const [includeJwtAuth, setIncludeJwtAuth] = useState(true);

  const [loginStyle, setLoginStyle] = useState<'cyberpunk' | 'executive' | 'terminal' | 'aurora'>('cyberpunk');
  const [orientationPolicy, setOrientationPolicyState] = useState<OrientationPolicy>('adaptive');
  const [generateDedicatedTelemetry, setGenerateDedicatedTelemetry] = useState(true);
  const [generateLiveLogs, setGenerateLiveLogs] = useState(true);

  if (!isStreamArchitectModalOpen) return null;

  const presets = [
    {
      name: "Industrial Turbine IoT",
      url: "wss://factory.iot-cloud.com/v1/sensors/live",
      tag: "turbine_telemetry_04",
      x: "timestamp",
      y1: "pressure_psi",
      y2: "temperature_c",
      style: "cyberpunk" as const
    },
    {
      name: "Financial Market Ticker",
      url: "wss://ticker.crypto-exchange.io/v2/stream",
      tag: "market_depth_btc",
      x: "time_utc",
      y1: "last_price_usd",
      y2: "volume_24h",
      style: "aurora" as const
    },
    {
      name: "Server Cluster Observability",
      url: "http://127.0.0.1:8001/api/v1/stream/live",
      tag: "cluster_node_metrics",
      x: "sample_tick",
      y1: "throughput_mbps",
      y2: "cpu_load_pct",
      style: "terminal" as const
    },
    {
      name: "Corporate Executive Telemetry",
      url: "https://stream.enterprise-cloud.net/v1/telemetry",
      tag: "facility_energy_feed",
      x: "timestamp",
      y1: "power_kw",
      y2: "efficiency_pct",
      style: "executive" as const
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setStreamUrl(p.url);
    setStreamTag(p.tag);
    setXAxisTag(p.x);
    setPrimaryYAxisTag(p.y1);
    setSecondaryYAxisTag(p.y2);
    setLoginStyle(p.style);
  };

  const handleConfirm = () => {
    buildStreamDrivenApp({
      streamUrl,
      streamTag,
      xAxisTag,
      primaryYAxisTag,
      secondaryYAxisTag,
      includeDocker,
      includePostgres,
      includeJwtAuth,
      loginStyle,
      orientationPolicy,
      generateDedicatedTelemetry,
      generateLiveLogs
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-[#0E121B] border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E2536] flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-[#111522] to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Stream URL Full-Stack Architect
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Docker + PostgreSQL + JWT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous live stream receiver with tag filtering, dynamic axes, containerized backend & multi-style login
              </p>
            </div>
          </div>
          <button 
            onClick={closeStreamArchitectModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 text-xs">

          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Stream Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-2 rounded-xl bg-[#141A28] border border-[#232D42] hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left flex flex-col justify-between"
                >
                  <span className="font-semibold text-white text-[11px] truncate">{p.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Tag: {p.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Continuous Stream & Tag Input */}
          <div className="p-4 rounded-xl bg-[#141926] border border-[#20293D] space-y-3">
            <span className="text-[11px] font-bold text-cyan-400 block uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> 1. Stream Connection & Tag Filtering
            </span>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Continuous Live Stream URL *</label>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="wss://... or https://.../stream"
                className="w-full px-3 py-2 rounded-lg bg-[#0C101A] border border-[#222B3F] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-400 block">Stream Tag / Metric Topic Path</label>
                <span className="text-[9px] text-cyan-400 font-medium">Extracts specific tag if provided</span>
              </div>
              <input
                type="text"
                value={streamTag}
                onChange={(e) => setStreamTag(e.target.value)}
                placeholder="e.g. sensor_group_alpha or devices.turbine_1.telemetry (empty = root)"
                className="w-full px-3 py-2 rounded-lg bg-[#0C101A] border border-[#222B3F] text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The backend stream consumer filters incoming stream frames and parses keys located specifically under this tag.
              </p>
            </div>
          </div>

          {/* 2. Dynamic X & Y Axes Mapping */}
          <div className="p-4 rounded-xl bg-[#141926] border border-[#20293D] space-y-3">
            <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> 2. Dynamic X & Y Axes Mapping
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">X-Axis Coordinate Tag</label>
                <input
                  type="text"
                  value={xAxisTag}
                  onChange={(e) => setXAxisTag(e.target.value)}
                  placeholder="e.g. timestamp, time_utc, tick"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C101A] border border-[#222B3F] text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Primary Y-Axis Field (Left)</label>
                <input
                  type="text"
                  value={primaryYAxisTag}
                  onChange={(e) => setPrimaryYAxisTag(e.target.value)}
                  placeholder="e.g. pressure_psi, throughput"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C101A] border border-[#222B3F] text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Secondary Y-Axis Field (Right)</label>
                <input
                  type="text"
                  value={secondaryYAxisTag}
                  onChange={(e) => setSecondaryYAxisTag(e.target.value)}
                  placeholder="e.g. temperature_c, load"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C101A] border border-[#222B3F] text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Docker & PostgreSQL Architecture */}
          <div className="p-4 rounded-xl bg-[#141926] border border-[#20293D] space-y-3">
            <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" /> 3. Containerized Backend & Database (Docker)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0C101A] border border-[#222B3F] cursor-pointer hover:border-amber-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={includeDocker}
                  onChange={(e) => setIncludeDocker(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">Dockerfile & Compose</span>
                  <span className="text-[9px] text-slate-500">Resilient standalone stack</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0C101A] border border-[#222B3F] cursor-pointer hover:border-amber-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={includePostgres}
                  onChange={(e) => setIncludePostgres(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">PostgreSQL 16 DB</span>
                  <span className="text-[9px] text-slate-500">Persistent volume pgdata</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0C101A] border border-[#222B3F] cursor-pointer hover:border-amber-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={includeJwtAuth}
                  onChange={(e) => setIncludeJwtAuth(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">JWT Authentication</span>
                  <span className="text-[9px] text-slate-500">Bcrypt + PyJWT token auth</span>
                </div>
              </label>
            </div>
            <div className="text-[10px] text-slate-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
              🛡️ <strong>Docker Resilience:</strong> The generated <code>docker-compose.yml</code> and <code>Dockerfile</code> keep the stream ingestion service and PostgreSQL database running independently even if local backend source files are modified or deleted.
            </div>
          </div>

          {/* 4. High-End Customizable Login Screen Styles */}
          <div className="p-4 rounded-xl bg-[#141926] border border-[#20293D] space-y-3">
            <span className="text-[11px] font-bold text-fuchsia-400 block uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 4. Customizable Flutter Login Screen Design
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Cyberpunk HUD */}
              <div 
                onClick={() => setLoginStyle('cyberpunk')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  loginStyle === 'cyberpunk'
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                    : 'border-[#222B3F] bg-[#0C101A] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-cyan-400" /> Biometric Cyberpunk HUD
                  </span>
                  {loginStyle === 'cyberpunk' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-400">
                  Neon border glow, biometric fingerprint ripple button, holographic status badge & monospace cipher inputs.
                </p>
              </div>

              {/* Option 2: Executive Clean SaaS */}
              <div 
                onClick={() => setLoginStyle('executive')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  loginStyle === 'executive'
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/10'
                    : 'border-[#222B3F] bg-[#0C101A] hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" /> Executive Clean SaaS
                  </span>
                  {loginStyle === 'executive' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[10px] text-slate-400">
                  Minimalist slate aesthetic, Inter typography, tabbed Sign In / Create Account switch, corporate ambient shadows.
                </p>
              </div>

              {/* Option 3: Mission Control Terminal */}
              <div 
                onClick={() => setLoginStyle('terminal')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  loginStyle === 'terminal'
                    ? 'border-amber-500 bg-amber-950/20 shadow-md shadow-amber-500/10'
                    : 'border-[#222B3F] bg-[#0C101A] hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" /> Mission Control Terminal
                  </span>
                  {loginStyle === 'terminal' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-slate-400">
                  Aerospace military clearance header, hardware node ID detection, security PIN matrix and ASCII telemetry pulse.
                </p>
              </div>

              {/* Option 4: Fintech Aurora Glass */}
              <div 
                onClick={() => setLoginStyle('aurora')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  loginStyle === 'aurora'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                    : 'border-[#222B3F] bg-[#0C101A] hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Fintech Aurora Glass
                  </span>
                  {loginStyle === 'aurora' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-400">
                  Mesh gradient aurora background, frosted glassmorphism card (blur 24px), smooth floating inputs and instant unlock.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Orientation Policy & Multi-Screen Suite */}
          <div className="p-4 rounded-xl bg-[#141926] border border-[#20293D] space-y-3">
            <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5" /> 5. Orientation Policy & Dedicated Screens
            </span>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1.5">App Orientation Policy</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'portrait_only' as const, label: '📱 Portrait Only', desc: 'Locks to vertical layout' },
                  { id: 'adaptive' as const, label: '🔄 Adaptive (Both)', desc: 'Auto-adapts 2-column split in landscape' },
                  { id: 'landscape_only' as const, label: '🖥️ Landscape Only', desc: 'Dedicated wide monitor view' }
                ].map((pol) => (
                  <button
                    key={pol.id}
                    type="button"
                    onClick={() => setOrientationPolicyState(pol.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      orientationPolicy === pol.id
                        ? 'bg-emerald-950/20 border-emerald-500 text-white font-semibold'
                        : 'bg-[#0C101A] border-[#222B3F] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold">{pol.label}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5 block">{pol.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={generateDedicatedTelemetry}
                  onChange={(e) => setGenerateDedicatedTelemetry(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span>Generate Dedicated Telemetry Screen (/telemetry)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={generateLiveLogs}
                  onChange={(e) => setGenerateLiveLogs(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span>Generate Live Audit Log Stream Screen (/logs)</span>
              </label>
            </div>
          </div>

          {/* Confirmation Summary */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/30 to-cyan-950/30 border border-indigo-500/20 text-[11px] space-y-1">
            <span className="font-bold text-white block mb-1">🚀 Application Synthesis Plan:</span>
            <div className="text-slate-300">
              • <strong>Backend Stack:</strong> Standalone FastAPI + PostgreSQL 16 + Docker Compose with volume persistence
            </div>
            <div className="text-slate-300">
              • <strong>Stream Binding:</strong> Continuous ingestion from <code>{streamUrl}</code> [Tag: <code>{streamTag || 'root'}</code>]
            </div>
            <div className="text-slate-300">
              • <strong>Dynamic Axes:</strong> X-Axis (<code>{xAxisTag}</code>) · Primary Y (<code>{primaryYAxisTag}</code>) · Secondary Y (<code>{secondaryYAxisTag}</code>)
            </div>
            <div className="text-slate-300">
              • <strong>Security:</strong> Full JWT Authentication with <code>{loginStyle}</code> Flutter UI
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#1E2536] bg-[#0A0D14] flex items-center justify-between">
          <button
            type="button"
            onClick={closeStreamArchitectModal}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Confirm & Build Full Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};
