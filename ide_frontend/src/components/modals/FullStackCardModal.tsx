import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Database, 
  Radio, 
  Layers, 
  Check, 
  ArrowRight, 
  Code2, 
  Server,
  Table,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useEditorStore } from '../../core/store';

export const FullStackCardModal: React.FC = () => {
  const { 
    isFullStackModalOpen, 
    closeFullStackModal, 
    fullStackModalParentId,
    addFullStackCard 
  } = useEditorStore();

  const [widgetName, setWidgetName] = useState("SensorTelemetryCard");
  const [title, setTitle] = useState("Live Turbine Telemetry");
  const [subtitle, setSubtitle] = useState("Vibration & Temperature Telemetry Stream");
  const [createApi, setCreateApi] = useState(true);
  const [apiPath, setApiPath] = useState("sensor_telemetry");
  const [createDb, setCreateDb] = useState(true);
  const [tableName, setTableName] = useState("sensor_telemetry");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isFullStackModalOpen) return null;

  const handleNameChange = (val: string) => {
    setWidgetName(val);
    const slug = val
      .replace(/Card$/i, '')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '');
    if (slug) {
      setApiPath(slug);
      setTableName(slug);
    }
  };

  const handleConfirmCreate = () => {
    addFullStackCard({
      widgetName: widgetName.trim() || "TelemetryCard",
      title: title.trim() || "Telemetry Stream",
      subtitle: subtitle.trim(),
      createApi,
      apiPath: apiPath.trim() || "telemetry",
      createDb,
      tableName: tableName.trim() || "telemetry",
      targetParentId: fullStackModalParentId || undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      closeFullStackModal();
    }, 900);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 p-4"
      onClick={closeFullStackModal}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#111520] border border-[#232A3B] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232A3B] flex items-center justify-between bg-[#161B26]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Full-Stack Card Generator
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  UI + FastAPI + SQLite
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Create a responsive Flutter Card with an auto-generated backend API & database table
              </p>
            </div>
          </div>
          <button 
            onClick={closeFullStackModal}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Success state banner */}
          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-sm">Full-Stack Card Generated!</div>
                <div className="text-xs text-emerald-300/80">UI Widget, FastAPI endpoint, and SQLite schema successfully created and bound.</div>
              </div>
            </div>
          )}

          {/* Section 1: Widget & Entity Identity */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 1. Widget & Entity Identity
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Entity / Widget Class Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={widgetName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. SensorTelemetryCard"
                  className="w-full bg-[#161B26] border border-[#232A3B] focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Card Display Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Live Turbine Telemetry"
                  className="w-full bg-[#161B26] border border-[#232A3B] focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Real-time vibration & temperature stream"
                className="w-full bg-[#161B26] border border-[#232A3B] focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="h-px bg-[#232A3B]" />

          {/* Section 2: Backend API Generation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> 2. FastAPI Endpoint Generation
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={createApi}
                  onChange={(e) => setCreateApi(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 bg-[#161B26] border-[#232A3B] cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">Create API Route</span>
              </label>
            </div>

            {createApi && (
              <div className="p-3.5 bg-[#161B26]/60 border border-[#232A3B] rounded-xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    GET / POST
                  </span>
                  <span className="font-mono text-xs text-slate-400">/api/v1/</span>
                  <input
                    type="text"
                    value={apiPath}
                    onChange={(e) => setApiPath(e.target.value)}
                    className="flex-1 bg-[#111520] border border-[#232A3B] rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="sensor_telemetry"
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono bg-[#0E121C] p-2 rounded border border-[#232A3B]">
                  <span className="text-slate-500"># Mock Telemetry Stream:</span><br />
                  {`{ "id": 1, "title": "${title}", "metric_value": 94.6, "status": "Optimal" }`}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-[#232A3B]" />

          {/* Section 3: SQLite Database Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> 3. SQLite Database Schema
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={createDb}
                  onChange={(e) => setCreateDb(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 bg-[#161B26] border-[#232A3B] cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">Create SQLite Table</span>
              </label>
            </div>

            {createDb && (
              <div className="p-3.5 bg-[#161B26]/60 border border-[#232A3B] rounded-xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">Table Name:</span>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="flex-1 bg-[#111520] border border-[#232A3B] rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="sensor_telemetry"
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono bg-[#0E121C] p-2 rounded border border-[#232A3B]">
                  <span className="text-slate-500">-- SQLAlchemy Schema Columns:</span><br />
                  id: Integer (PK) · title: String · metric_value: Float · status: String · created_at: DateTime
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Box */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-white">Full-Stack Assets to be generated upon confirmation:</div>
              <ul className="text-slate-300 space-y-0.5 list-disc pl-4 text-[11px]">
                <li>Flutter UI Card widget (<span className="text-indigo-300 font-mono">{widgetName}</span>) with title, metric, status beacon, and refresh button</li>
                {createApi && <li>FastAPI REST Endpoint (<span className="text-emerald-300 font-mono">/api/v1/{apiPath}</span>) with GET & POST</li>}
                {createDb && <li>SQLite SQLAlchemy Table (<span className="text-amber-300 font-mono">{tableName}</span>) with auto-migration</li>}
                <li>Automatic data connector registration and reactive state binding</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#232A3B] bg-[#161B26]/80 flex items-center justify-between">
          <button
            onClick={closeFullStackModal}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmCreate}
            disabled={isSuccess || !widgetName.trim()}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Confirm & Create Full-Stack Card
          </button>
        </div>
      </div>
    </div>
  );
};
