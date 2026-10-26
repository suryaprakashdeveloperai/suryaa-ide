import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../core/store';
import { 
  Database, 
  Play, 
  Table, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Code2, 
  FileText, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface MigrationResult {
  status: string;
  databaseEngine: string;
  dbFileName: string;
  dbPath: string;
  fileSizeKb: number;
  totalTables: number;
  totalRecords: number;
  tables: Array<{
    name: string;
    tableName: string;
    rowCount: number;
    fields: string[];
  }>;
}

interface TableRowData {
  tableName: string;
  count: number;
  rows: Record<string, any>[];
}

interface ApiTestResponse {
  endpoint: string;
  status: number;
  latencyMs: number;
  data: any;
}

export const BackendDesigner: React.FC = () => {
  const { project } = useEditorStore();
  const backend = project.backend;
  const projectId = project.metadata?.id || "flutter_ecommerce_studio";

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [activeTableTab, setActiveTableTab] = useState<string>("products");
  const [tableData, setTableData] = useState<TableRowData | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // Live API Testing State
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiTestResponse | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Auto-fetch table data on mount or table tab change
  const fetchTableRows = async (tableName: string) => {
    setIsLoadingTable(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/database/tables/${tableName}/rows`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (e) {
      console.error("Failed to fetch table rows:", e);
    } finally {
      setIsLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchTableRows(activeTableTab);
  }, [activeTableTab, projectId]);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/database/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const data: MigrationResult = await res.json();
        setMigrationResult(data);
        if (data.tables && data.tables[0]) {
          setActiveTableTab(data.tables[0].tableName);
          fetchTableRows(data.tables[0].tableName);
        }
      }
    } catch (e) {
      console.error("Migration failed:", e);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleTestApi = async (endpointPath: string, entityName: string) => {
    setTestingEndpoint(endpointPath);
    const startTime = performance.now();
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/api/${entityName.toLowerCase()}`);
      const latency = Math.round(performance.now() - startTime);
      const data = await res.json();
      setApiResponse({
        endpoint: endpointPath,
        status: res.status,
        latencyMs: latency,
        data
      });
    } catch (e: any) {
      setApiResponse({
        endpoint: endpointPath,
        status: 500,
        latencyMs: Math.round(performance.now() - startTime),
        data: { error: e.message }
      });
    } finally {
      setTestingEndpoint(null);
    }
  };

  const handleCopyEndpoint = (path: string) => {
    navigator.clipboard.writeText(`http://127.0.0.1:8001/api/v1/projects/${projectId}/api${path}`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">FastAPI & Live Database</h2>
        <p className="text-[11px] text-slate-500">Physical SQLite database, schema migrations & live REST endpoints</p>
      </div>

      {/* 1. Database Engine & Initialization Card */}
      <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">SQLite 3 Engine</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {migrationResult ? `${migrationResult.dbFileName} (${migrationResult.fileSizeKb} KB)` : "app.db (Physical SQLite)"}
              </span>
            </div>
          </div>

          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            title="Create physical SQLite app.db and run table DDL migrations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
            <span>{isMigrating ? "Migrating..." : "Create & Migrate DB"}</span>
          </button>
        </div>

        {migrationResult && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Database Migrated Successfully</span>
            </div>
            <p className="text-[10px] text-emerald-400/80">
              {migrationResult.totalTables} tables created · {migrationResult.totalRecords} sample records seeded in physical storage.
            </p>
          </div>
        )}
      </div>

      {/* 2. Interactive Table Data Viewer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-indigo-400" />
            Live Database Tables & Rows
          </span>
          <button
            onClick={() => fetchTableRows(activeTableTab)}
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
            title="Refresh rows from database"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingTable ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table Selection Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#161B26] rounded-lg border border-[#232A3B] overflow-x-auto custom-scrollbar">
          {(backend.entities || []).map((ent) => {
            const tname = ent.tableName || ent.name.toLowerCase() + "s";
            const isActive = activeTableTab === tname;
            return (
              <button
                key={tname}
                onClick={() => setActiveTableTab(tname)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors shrink-0 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2536]'
                }`}
              >
                {tname}
              </button>
            );
          })}
        </div>

        {/* Data Grid / Table Records */}
        <div className="rounded-lg border border-[#232A3B] bg-[#0E121C] overflow-hidden">
          {tableData && tableData.rows && tableData.rows.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar max-h-48">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-[#232A3B] bg-[#161B26] text-slate-400">
                    {Object.keys(tableData.rows[0]).map((col) => (
                      <th key={col} className="px-2.5 py-1.5 font-bold uppercase tracking-wider text-[10px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232A3B]/60 text-slate-300">
                  {tableData.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161B26]/50 transition-colors">
                      {Object.values(row).map((val: any, colIdx) => (
                        <td key={colIdx} className="px-2.5 py-1 truncate max-w-[140px]">
                          {typeof val === 'number' ? (
                            <span className="text-emerald-400 font-semibold">{val}</span>
                          ) : (
                            String(val ?? '-')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">
              {isLoadingTable ? "Loading table records..." : "Click 'Create & Migrate DB' above to create tables and seed initial data."}
            </div>
          )}
        </div>
      </div>

      {/* 3. Live Generated REST Endpoints & Tester */}
      <div className="space-y-2 pt-2 border-t border-[#232A3B]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Live REST Endpoints (FastAPI)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Active 127.0.0.1:8001</span>
        </div>

        <div className="space-y-1.5">
          {backend.endpoints.map((ep) => {
            const isTestingThis = testingEndpoint === ep.path;
            const entityName = ep.entity || "products";
            return (
              <div 
                key={ep.path} 
                className="p-2.5 rounded-lg bg-[#161B26] border border-[#232A3B] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono shrink-0">
                      {ep.methods[0] || 'GET'}
                    </span>
                    <span className="text-xs font-mono text-slate-200 truncate">
                      /api/v1/projects/{projectId}/api{ep.path}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyEndpoint(ep.path)}
                      className="p-1 rounded hover:bg-[#1E2536] text-slate-400 hover:text-white"
                      title="Copy Full URL"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleTestApi(ep.path, entityName)}
                      disabled={isTestingThis}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition-colors disabled:opacity-50"
                      title="Test live endpoint against SQLite database"
                    >
                      <Play className={`w-3 h-3 ${isTestingThis ? 'animate-spin' : ''}`} />
                      <span>{isTestingThis ? "Calling..." : "Test API"}</span>
                    </button>
                  </div>
                </div>

                {/* API Response Modal / Snippet */}
                {apiResponse && apiResponse.endpoint === ep.path && (
                  <div className="p-2 rounded bg-[#0E121C] border border-[#232A3B] space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        HTTP {apiResponse.status} OK
                      </span>
                      <span className="text-slate-400">{apiResponse.latencyMs}ms</span>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-300 bg-black/40 p-2 rounded overflow-x-auto max-h-32 custom-scrollbar">
                      {JSON.stringify(apiResponse.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

