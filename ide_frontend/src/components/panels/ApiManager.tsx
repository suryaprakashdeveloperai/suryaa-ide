import React, { useState } from 'react';
import { useEditorStore } from '../../core/store';
import { ApiConnector } from '../../types/schema';
import { 
  Database, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Code2, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const ApiManager: React.FC = () => {
  const { 
    project, 
    apiDataCache, 
    fetchApiData, 
    saveApiConnector, 
    removeApiConnector 
  } = useEditorStore();

  const connectors = project.apiConnectors || [];
  const [selectedId, setSelectedId] = useState<string>(connectors[0]?.id || "");
  const [isTesting, setIsTesting] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const selected = connectors.find(c => c.id === selectedId) || connectors[0];

  const handleTest = async () => {
    if (!selected) return;
    setIsTesting(true);
    await fetchApiData(selected.id);
    setIsTesting(false);
  };

  const handleConnectFastAPI = () => {
    const fastapiConnector: ApiConnector = {
      id: `api_fastapi_${Date.now().toString().slice(-4)}`,
      name: "FastAPI Engine Products",
      url: "http://127.0.0.1:8001/api/v1/projects/",
      method: "GET",
      sampleResponse: [
        { id: 1, title: "Suryaa AI Vision Pro", price: 299.99, stock: 45 },
        { id: 2, title: "Neural Audio Pods", price: 149.50, stock: 120 }
      ],
      mockData: [
        { id: 1, title: "Suryaa AI Vision Pro", price: 299.99, stock: 45 },
        { id: 2, title: "Neural Audio Pods", price: 149.50, stock: 120 }
      ]
    };
    saveApiConnector(fastapiConnector);
    setSelectedId(fastapiConnector.id);
  };

  const handleAddNew = () => {
    const newConn: ApiConnector = {
      id: `api_custom_${Date.now().toString().slice(-4)}`,
      name: "Custom REST Stream",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      method: "GET",
      sampleResponse: { id: 1, title: "Sample dynamic data", body: "Connected via Suryaa IDE" },
      mockData: { id: 1, title: "Sample dynamic data", body: "Connected via Suryaa IDE" }
    };
    saveApiConnector(newConn);
    setSelectedId(newConn.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const activeData = selected ? (apiDataCache[selected.id] || selected.sampleResponse) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111520] select-none text-slate-200">
      {/* Header */}
      <div className="h-12 border-b border-[#232A3B] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            API & Data Streams
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] text-[11px] text-indigo-300 transition-colors"
            title="Create Custom API Stream"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      </div>

      {/* Body: Stream List & Inspector */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Quick Connect to FastAPI Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Local FastAPI Backend</div>
              <div className="text-[10px] text-slate-400">Daemon running on port 8001</div>
            </div>
          </div>
          <button
            onClick={handleConnectFastAPI}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold shadow transition-all shrink-0"
          >
            + Auto Connect
          </button>
        </div>

        {/* Connectors Selector Tabs */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
            Active Data Connectors ({connectors.length})
          </label>
          <div className="space-y-1">
            {connectors.map(c => (
              <div 
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  selected?.id === c.id
                    ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm'
                    : 'bg-[#161B26] border-[#232A3B] text-slate-300 hover:bg-[#1C2230]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    c.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {c.method}
                  </span>
                  <span className="font-semibold truncate">{c.name}</span>
                </div>
                {connectors.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeApiConnector(c.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded"
                    title="Remove connector"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Connector Editor */}
        {selected && (
          <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Connector Name</label>
              <input
                type="text"
                value={selected.name}
                onChange={(e) => saveApiConnector({ ...selected, name: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <label className="text-[10px] text-slate-400 block mb-1">Method</label>
                <select
                  value={selected.method}
                  onChange={(e) => saveApiConnector({ ...selected, method: e.target.value as any })}
                  className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="col-span-3">
                <label className="text-[10px] text-slate-400 block mb-1">Endpoint URL</label>
                <input
                  type="text"
                  value={selected.url}
                  onChange={(e) => saveApiConnector({ ...selected, url: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Test & Fetch Trigger */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? "Fetching..." : "Test Stream Request"}
              </button>

              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            </div>

            {/* Response Preview */}
            <div className="pt-2 border-t border-[#232A3B]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Response Stream Data
                </span>
                <button
                  onClick={() => copyToClipboard(selected.id)}
                  className="text-[10px] text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  {copiedPath === selected.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedPath === selected.id ? "Copied ID!" : "Copy Binding ID"}
                </button>
              </div>
              <pre className="p-2.5 rounded bg-[#0D111A] border border-[#1E2536] text-[10px] text-emerald-300 font-mono overflow-x-auto max-h-48 custom-scrollbar">
                {JSON.stringify(activeData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Data Binding Guidance Card */}
        <div className="p-3 rounded-xl bg-[#141924] border border-[#232A3B] space-y-1.5 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>How Data Binding Works</span>
          </div>
          <p>
            1. Select any <strong>Text</strong>, <strong>Image</strong>, or <strong>KPI Card</strong> on the canvas.
          </p>
          <p>
            2. In the Property Inspector, enter a <strong>Data Binding Path</strong> like <code className="text-indigo-300 bg-black/30 px-1 py-0.5 rounded">item.title</code> or <code className="text-indigo-300 bg-black/30 px-1 py-0.5 rounded">revenue</code>.
          </p>
          <p>
            3. Switch to <strong>Runtime Mode</strong> to see live dynamic data stream in real time!
          </p>
        </div>
      </div>
    </div>
  );
};
