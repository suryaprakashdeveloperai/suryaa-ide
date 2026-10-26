import React, { useState, useMemo } from 'react';
import { 
  FolderTree, 
  Folder, 
  FolderPlus, 
  FilePlus, 
  FileCode, 
  FileText, 
  Trash2, 
  Edit2, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  HardDrive, 
  Check, 
  X, 
  File, 
  Layers, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useEditorStore } from '../../core/store';

export const StorageManager: React.FC = () => {
  const { 
    generatedCode, 
    activeCodeFile, 
    setActiveCodeFile, 
    setMode,
    createProjectFile, 
    deleteProjectFile, 
    renameProjectFile, 
    createProjectFolder 
  } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  
  // New file inline creation state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");

  // New folder inline creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderPath, setNewFolderPath] = useState("");

  // Rename state
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renamedName, setRenamedName] = useState("");

  const allFiles = generatedCode.allFiles || {};
  const filePaths = Object.keys(allFiles);

  // Compute file hierarchy tree
  const fileTree = useMemo(() => {
    interface TreeNode {
      name: string;
      fullPath: string;
      isFolder: boolean;
      children: Record<string, TreeNode>;
    }

    const root: Record<string, TreeNode> = {};

    filePaths.forEach((path) => {
      if (searchQuery.trim() && !path.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      const parts = path.split('/');
      let curr = root;

      parts.forEach((part, idx) => {
        const isFolder = idx < parts.length - 1;
        const currentPath = parts.slice(0, idx + 1).join('/');

        if (!curr[part]) {
          curr[part] = {
            name: part,
            fullPath: currentPath,
            isFolder,
            children: {}
          };
        }
        curr = curr[part].children;
      });
    });

    return root;
  }, [filePaths, searchQuery]);

  const toggleFolder = (folderPath: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const handleCreateFileSubmit = () => {
    if (!newFilePath.trim()) return;
    let path = newFilePath.trim();
    if (!path.includes('.')) {
      path += '.dart';
    }
    createProjectFile(path, `// ${path}\n`);
    setIsCreatingFile(false);
    setNewFilePath("");
    setActiveCodeFile(path);
  };

  const handleCreateFolderSubmit = () => {
    if (!newFolderPath.trim()) return;
    createProjectFolder(newFolderPath.trim());
    setIsCreatingFolder(false);
    setNewFolderPath("");
  };

  const handleRenameSubmit = (oldPath: string) => {
    if (!renamedName.trim() || renamedName === oldPath) {
      setRenamingPath(null);
      return;
    }
    const parts = oldPath.split('/');
    parts[parts.length - 1] = renamedName.trim();
    const newPath = parts.join('/');
    renameProjectFile(oldPath, newPath);
    setRenamingPath(null);
    setRenamedName("");
  };

  // Calculate approximate storage usage
  const totalBytes = useMemo(() => {
    return Object.values(allFiles).reduce((acc, code) => acc + (code ? code.length : 0), 0);
  }, [allFiles]);

  const formattedBytes = totalBytes > 1024 
    ? `${(totalBytes / 1024).toFixed(1)} KB` 
    : `${totalBytes} Bytes`;

  const renderTree = (nodes: Record<string, any>, depth: number = 0) => {
    const keys = Object.keys(nodes).sort((a, b) => {
      const isFolderA = nodes[a].isFolder;
      const isFolderB = nodes[b].isFolder;
      if (isFolderA && !isFolderB) return -1;
      if (!isFolderA && isFolderB) return 1;
      return a.localeCompare(b);
    });

    return keys.map((key) => {
      const node = nodes[key];
      if (node.isFolder) {
        const isCollapsed = collapsedFolders[node.fullPath];
        return (
          <div key={node.fullPath} className="flex flex-col">
            <div 
              onClick={() => toggleFolder(node.fullPath)}
              style={{ paddingLeft: `${depth * 12 + 6}px` }}
              className="flex items-center justify-between py-1.5 px-2 hover:bg-white/5 rounded-lg cursor-pointer text-slate-300 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-1.5 truncate">
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                )}
                <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold font-mono truncate">{node.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {Object.keys(node.children).length}
              </span>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col border-l border-[#232A3B] ml-3.5">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      // File item
      const isSelected = activeCodeFile === node.fullPath;
      const isDart = node.name.endsWith('.dart');
      const isPython = node.name.endsWith('.py');
      const isJson = node.name.endsWith('.json');
      const isYaml = node.name.endsWith('.yaml');

      return (
        <div 
          key={node.fullPath}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors group ${
            isSelected 
              ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => {
            setActiveCodeFile(node.fullPath);
            setMode('code');
          }}
        >
          <div className="flex items-center gap-2 truncate">
            {isDart ? (
              <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : isPython ? (
              <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : isJson || isYaml ? (
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}

            {renamingPath === node.fullPath ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={renamedName}
                  onChange={(e) => setRenamedName(e.target.value)}
                  className="bg-[#0E121C] border border-indigo-500 rounded px-1 py-0.5 text-xs text-white font-mono focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(node.fullPath);
                    if (e.key === 'Escape') setRenamingPath(null);
                  }}
                />
                <button
                  onClick={() => handleRenameSubmit(node.fullPath)}
                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setRenamingPath(null)}
                  className="p-1 text-slate-400 hover:bg-white/10 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-xs font-mono truncate">{node.name}</span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenamingPath(node.fullPath);
                setRenamedName(node.name);
              }}
              className="p-1 hover:text-indigo-300 text-slate-500 rounded"
              title="Rename File"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete file '${node.fullPath}'?`)) {
                  deleteProjectFile(node.fullPath);
                }
              }}
              className="p-1 hover:text-rose-400 text-slate-500 rounded"
              title="Delete File"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col flex-1 h-full select-none">
      {/* Storage & Files Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232A3B]">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Storage & Files
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingFolder(false);
            }}
            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-medium transition-all flex items-center gap-1 border border-indigo-500/30"
            title="Create New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>+ File</span>
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
            }}
            className="p-1.5 rounded-lg bg-[#161B26] hover:bg-[#1E2536] text-slate-300 hover:text-white text-[11px] font-medium transition-all flex items-center gap-1 border border-[#232A3B]"
            title="Create New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Folder</span>
          </button>
        </div>
      </div>

      {/* Storage Quota & Capacity Bar */}
      <div className="py-2.5 px-3 my-2.5 bg-[#161B26]/80 rounded-xl border border-[#232A3B] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Project Storage</span>
          <span className="font-mono text-indigo-300 font-bold">{formattedBytes} / 50 MB</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#0E121C] overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
            style={{ width: `${Math.min(100, Math.max(5, (totalBytes / (50 * 1024 * 1024)) * 100))}%` }} 
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{filePaths.length} Files Total</span>
          <span>FastAPI + Flutter</span>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter files..."
          className="w-full bg-[#161B26] border border-[#232A3B] focus:border-indigo-500 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-2 text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Inline Create File Box */}
      {isCreatingFile && (
        <div className="p-3 bg-[#161B26] border border-indigo-500/40 rounded-xl mb-3 space-y-2 animate-in fade-in">
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FilePlus className="w-3.5 h-3.5 text-indigo-400" /> New Project File
            </span>
            <button 
              onClick={() => setIsCreatingFile(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            placeholder="e.g. lib/features/analytics/chart_view.dart"
            className="w-full bg-[#0E121C] border border-[#232A3B] focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFileSubmit();
              if (e.key === 'Escape') setIsCreatingFile(false);
            }}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setIsCreatingFile(false)}
              className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFileSubmit}
              disabled={!newFilePath.trim()}
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              Create File
            </button>
          </div>
        </div>
      )}

      {/* Inline Create Folder Box */}
      {isCreatingFolder && (
        <div className="p-3 bg-[#161B26] border border-indigo-500/40 rounded-xl mb-3 space-y-2 animate-in fade-in">
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-indigo-400" /> New Project Folder
            </span>
            <button 
              onClick={() => setIsCreatingFolder(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={newFolderPath}
            onChange={(e) => setNewFolderPath(e.target.value)}
            placeholder="e.g. lib/features/dashboard"
            className="w-full bg-[#0E121C] border border-[#232A3B] focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolderSubmit();
              if (e.key === 'Escape') setIsCreatingFolder(false);
            }}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setIsCreatingFolder(false)}
              className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFolderSubmit}
              disabled={!newFolderPath.trim()}
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              Create Folder
            </button>
          </div>
        </div>
      )}

      {/* Files Tree Viewer */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
        {filePaths.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No files found. Click <span className="text-indigo-400 font-semibold">+ File</span> to create one.
          </div>
        ) : (
          renderTree(fileTree)
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#232A3B] flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Click file to edit in Monaco</span>
        <button
          onClick={() => setMode('code')}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          Open Code Editor <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
