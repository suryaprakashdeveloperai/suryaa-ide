import React from 'react';
import { useEditorStore } from '../../core/store';
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SecurityCenter: React.FC = () => {
  const { securityReport, runSecurityAudit } = useEditorStore();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Center</h2>
          <p className="text-[11px] text-slate-500">Static audits, secrets, and OWASP checks</p>
        </div>
        <button
          onClick={runSecurityAudit}
          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1 transition-all shadow-sm"
          title="Run Scan"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Scan
        </button>
      </div>

      {/* Score Card */}
      {securityReport ? (
        <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Security Score</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              securityReport.score >= 80 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {securityReport.status}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{securityReport.score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>

          <div className="grid grid-cols-4 gap-1 mt-3 pt-3 border-t border-[#232A3B] text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">Critical</span>
              <span className="text-xs font-bold text-rose-400">{securityReport.summary.critical}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">High</span>
              <span className="text-xs font-bold text-amber-400">{securityReport.summary.high}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Medium</span>
              <span className="text-xs font-bold text-blue-400">{securityReport.summary.medium}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Low</span>
              <span className="text-xs font-bold text-slate-400">{securityReport.summary.low}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#161B26] border border-[#232A3B] text-center">
          <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-300 font-medium">No Audit Run Yet</p>
          <p className="text-[11px] text-slate-500 mt-1">Click "Scan" above to perform static vulnerability scanning and secret detection.</p>
        </div>
      )}

      {/* Findings List */}
      {securityReport && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-300 block">
            Scan Findings ({securityReport.totalFindings})
          </span>

          {securityReport.findings.length === 0 ? (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center flex items-center justify-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero vulnerabilities detected!</span>
            </div>
          ) : (
            securityReport.findings.map((f: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getSeverityBadge(f.severity)}`}>
                    {f.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">{f.file}</span>
                </div>
                <h4 className="text-xs font-medium text-slate-200">{f.title}</h4>
                <p className="text-[10px] text-slate-400 leading-tight">{f.description}</p>
                <p className="text-[10px] text-indigo-400 font-medium pt-1">💡 {f.recommendation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
