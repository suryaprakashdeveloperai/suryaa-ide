import React, { useEffect } from 'react';
import { useEditorStore } from '../../core/store';
import { DownloadCloud, Play, FileCode, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DownloadCenter: React.FC = () => {
  const { artifactsList, fetchArtifacts, triggerBuild, buildStatus } = useEditorStore();

  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Build & Artifacts</h2>
        <p className="text-[11px] text-slate-500">Generate, compile, and download verified binaries</p>
      </div>

      {/* Build Action Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-300 block">Trigger Platform Build</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => triggerBuild('apk_debug')}
            disabled={buildStatus === 'running'}
            className="p-2 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] hover:border-emerald-500/50 text-left transition-all disabled:opacity-50"
          >
            <span className="text-xs font-medium text-emerald-400 block">Debug APK</span>
            <span className="text-[10px] text-slate-500">Fast emulator testing</span>
          </button>

          <button
            onClick={() => triggerBuild('apk_release')}
            disabled={buildStatus === 'running'}
            className="p-2 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] hover:border-emerald-500/50 text-left transition-all disabled:opacity-50"
          >
            <span className="text-xs font-medium text-emerald-400 block">Release APK</span>
            <span className="text-[10px] text-slate-500">Optimized client binary</span>
          </button>

          <button
            onClick={() => triggerBuild('appbundle')}
            disabled={buildStatus === 'running'}
            className="p-2 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] hover:border-emerald-500/50 text-left transition-all disabled:opacity-50"
          >
            <span className="text-xs font-medium text-indigo-400 block">App Bundle</span>
            <span className="text-[10px] text-slate-500">Google Play distribution</span>
          </button>

          <button
            onClick={() => triggerBuild('source_export')}
            disabled={buildStatus === 'running'}
            className="p-2 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] hover:border-emerald-500/50 text-left transition-all disabled:opacity-50"
          >
            <span className="text-xs font-medium text-purple-400 block">Source Bundle</span>
            <span className="text-[10px] text-slate-500">Standalone clean ZIP</span>
          </button>
        </div>
      </div>

      {/* Artifacts List */}
      <div className="space-y-2 pt-2 border-t border-[#232A3B]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300">
            Output Artifacts ({artifactsList.length})
          </span>
          <button
            onClick={fetchArtifacts}
            className="text-[10px] text-indigo-400 hover:underline"
          >
            Refresh
          </button>
        </div>

        {artifactsList.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#161B26] border border-[#232A3B] text-center text-slate-500 text-xs">
            No artifacts generated yet. Trigger a build above.
          </div>
        ) : (
          artifactsList.map((art) => (
            <div key={art.id} className="p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{art.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]">{art.fileName}</p>
                </div>
                <a
                  href={art.downloadUrl}
                  download
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium flex items-center gap-1 shadow-sm transition-all"
                >
                  <DownloadCloud className="w-3 h-3" />
                  Get
                </a>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-[#232A3B]/60">
                <span>{art.fileSizeFormatted}</span>
                <span className="text-emerald-400 flex items-center gap-1" title={`SHA-256: ${art.sha256}`}>
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {art.sha256.slice(0, 8)}...
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
