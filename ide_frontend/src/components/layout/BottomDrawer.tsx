import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../core/store';
import { Terminal, Wrench, ChevronUp, ChevronDown, Trash2, CheckCircle2 } from 'lucide-react';

export const BottomDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'diagnostics'>('logs');
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const { buildLogs, buildStatus } = useEditorStore();

  useEffect(() => {
    fetch('/api/v1/devices/diagnostics')
      .then(res => res.json())
      .then(data => setDiagnostics(data))
      .catch(() => {});
  }, []);

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="h-7 bg-[#0E121C] border-t border-[#232A3B] px-4 flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:bg-[#161B26] select-none"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Console & Diagnostics</span>
          {buildStatus === 'running' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </div>
        <ChevronUp className="w-3.5 h-3.5" />
      </div>
    );
  }

  return (
    <div className="h-44 bg-[#0E121C] border-t border-[#232A3B] flex flex-col select-none z-20">
      {/* Drawer Header Tabs */}
      <div className="h-8 border-b border-[#232A3B] px-3 flex items-center justify-between bg-[#111520]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'logs' ? 'bg-[#1E2536] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3 text-indigo-400" />
            Build Terminal
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'diagnostics' ? 'bg-[#1E2536] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3 h-3 text-emerald-400" />
            SDK Diagnostics
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white"
            title="Collapse"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] custom-scrollbar">
        {activeTab === 'logs' ? (
          <div className="space-y-1">
            {buildLogs.map((log, index) => (
              <div key={index} className="text-slate-300 leading-relaxed">
                <span className="text-slate-600 select-none mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200">Dart SDK</span>
                <span className="text-[10px] text-emerald-400 font-bold">READY</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {diagnostics?.dart?.path || "C:...\\dart-sdk\\bin\\dart.exe"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Official Google Dart 3.13.7</p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200">Flutter SDK</span>
                <span className={`text-[10px] font-bold ${diagnostics?.flutter?.available ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {diagnostics?.flutter?.available ? 'ACTIVE' : 'CONFIGURABLE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {diagnostics?.flutter?.path || "Custom SDK Directory"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {diagnostics?.flutter?.version || "Stand-alone clean MVVM generator ready"}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200">Python 3.12 Engine</span>
                <span className="text-[10px] text-emerald-400 font-bold">HEALTHY</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Python 3.12.10 (AMD64)</p>
              <p className="text-[10px] text-slate-500 mt-1">FastAPI, Uvicorn, SQLAlchemy 2.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
