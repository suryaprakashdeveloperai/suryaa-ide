import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../core/store';
import { RefreshCw, Copy, Check, ChevronDown, FileCode, Layers } from 'lucide-react';

interface CodeFileInfo {
  id: string;
  name: string;
  lang: string;
  icon: string;
}

const DEFAULT_FILES: CodeFileInfo[] = [
  { id: 'lib/main.dart', name: 'main.dart', lang: 'dart', icon: '🎯' },
  { id: 'lib/app/theme/app_theme.dart', name: 'app_theme.dart', lang: 'dart', icon: '🎨' },
  { id: 'lib/features/home/views/home_view.dart', name: 'home_view.dart', lang: 'dart', icon: '📱' },
  { id: 'lib/features/home/view_models/home_view_model.dart', name: 'home_view_model.dart', lang: 'dart', icon: '🧠' },
  { id: 'lib/app/app.dart', name: 'app.dart', lang: 'dart', icon: '🚀' },
  { id: 'lib/bootstrap.dart', name: 'bootstrap.dart', lang: 'dart', icon: '⚡' },
  { id: 'pubspec.yaml', name: 'pubspec.yaml', lang: 'yaml', icon: '📦' },
  { id: 'backend/app/main.py', name: 'backend/main.py', lang: 'python', icon: '🐍' },
];

const getFileIcon = (filePath: string): string => {
  if (filePath.includes('docker') || filePath.endsWith('Dockerfile')) return '🐳';
  if (filePath.includes('database') || filePath.includes('models') || filePath.includes('postgres')) return '🗄️';
  if (filePath.endsWith('_view.dart')) return '📱';
  if (filePath.endsWith('_view_model.dart')) return '🧠';
  if (filePath.endsWith('app_theme.dart') || filePath.includes('theme')) return '🎨';
  if (filePath.endsWith('main.dart')) return '🎯';
  if (filePath.endsWith('app.dart')) return '🚀';
  if (filePath.endsWith('bootstrap.dart')) return '⚡';
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return '📦';
  if (filePath.endsWith('.py')) return '🐍';
  if (filePath.endsWith('.xml')) return '🤖';
  if (filePath.endsWith('.md')) return '📝';
  if (filePath.endsWith('.dart')) return '⚡';
  return '📄';
};

const getFileLang = (filePath: string): string => {
  if (filePath.endsWith('.dart')) return 'dart';
  if (filePath.endsWith('.py')) return 'python';
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'yaml';
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.xml')) return 'xml';
  if (filePath.endsWith('.md')) return 'markdown';
  return 'plaintext';
};

export const CodeEditor: React.FC = () => {
  const { 
    generatedCode, 
    generateProject, 
    isGenerating, 
    activeCodeFile, 
    setActiveCodeFile 
  } = useEditorStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateProject();
  }, [generateProject]);

  // Merge default tabs with any dynamically generated files from AI or backend
  const availableFiles = useMemo<CodeFileInfo[]>(() => {
    const fileMap = new Map<string, CodeFileInfo>();

    // Add default files
    DEFAULT_FILES.forEach(f => fileMap.set(f.id, f));

    // Add any extra files from generatedCode.allFiles
    if (generatedCode.allFiles) {
      Object.keys(generatedCode.allFiles).forEach((path) => {
        if (!fileMap.has(path)) {
          const parts = path.split('/');
          const filename = parts[parts.length - 1];
          fileMap.set(path, {
            id: path,
            name: filename,
            lang: getFileLang(path),
            icon: getFileIcon(path),
          });
        }
      });
    }

    return Array.from(fileMap.values());
  }, [generatedCode.allFiles]);

  const getFileContent = () => {
    if (generatedCode.allFiles && generatedCode.allFiles[activeCodeFile] !== undefined) {
      return generatedCode.allFiles[activeCodeFile];
    }
    switch (activeCodeFile) {
      case 'lib/main.dart':
        return generatedCode.mainDart || generatedCode.allFiles?.['lib/main.dart'] || "";
      case 'lib/app/theme/app_theme.dart':
        return generatedCode.themeDart || generatedCode.allFiles?.['lib/app/theme/app_theme.dart'] || "";
      case 'lib/features/home/views/home_view.dart':
        return generatedCode.viewDart || generatedCode.allFiles?.['lib/features/home/views/home_view.dart'] || "";
      case 'lib/features/home/view_models/home_view_model.dart':
        return generatedCode.viewModelDart || generatedCode.allFiles?.['lib/features/home/view_models/home_view_model.dart'] || "";
      case 'pubspec.yaml':
        return generatedCode.pubspecYaml || generatedCode.allFiles?.['pubspec.yaml'] || "";
      case 'backend/app/main.py':
        return generatedCode.pythonMain || generatedCode.allFiles?.['backend/app/main.py'] || "";
      default:
        return generatedCode.allFiles?.[activeCodeFile] || generatedCode.mainDart || "";
    }
  };

  const currentFile = availableFiles.find((f) => f.id === activeCodeFile) || {
    id: activeCodeFile,
    name: activeCodeFile.split('/').pop() || activeCodeFile,
    lang: getFileLang(activeCodeFile),
    icon: getFileIcon(activeCodeFile)
  };

  const fileContent = getFileContent();
  const lineCount = fileContent ? fileContent.split('\n').length : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full bg-[#0A0D14] flex flex-col overflow-hidden">
      {/* File Tabs & Controls Header */}
      <div className="h-10 border-b border-[#232A3B] px-3 flex items-center justify-between bg-[#111520] select-none gap-2">
        {/* Horizontal Tab Strip */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-1 min-w-0 pr-1">
          {availableFiles.slice(0, 6).map((f) => {
            const isActive = activeCodeFile === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveCodeFile(f.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 ${
                  isActive 
                    ? 'bg-[#1E2536] text-white font-medium border-b-2 border-indigo-500 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B26]'
                }`}
                title={f.id}
              >
                <span>{f.icon}</span>
                <span className="truncate max-w-[120px]">{f.name}</span>
              </button>
            );
          })}

          {/* All Files Dropdown Picker */}
          <div className="relative shrink-0 ml-1">
            <select
              value={activeCodeFile}
              onChange={(e) => setActiveCodeFile(e.target.value)}
              className="bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] text-slate-300 text-xs rounded px-2 py-1 pr-6 font-mono appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
              title="Browse all project files"
            >
              {availableFiles.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#111520] text-slate-200">
                  {f.icon} {f.id}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Action Controls & Diagnostics */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
            {lineCount} lines · {currentFile.lang}
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E2536] hover:bg-[#283248] text-slate-300 hover:text-white text-xs border border-[#232A3B] transition-colors"
            title="Copy current file content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={generateProject}
            disabled={isGenerating}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            title="Re-generate and sync deterministic Flutter code"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Code</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={currentFile.lang}
          theme="vs-dark"
          value={fileContent}
          options={{
            readOnly: false,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            padding: { top: 12, bottom: 12 },
            find: {
              addExtraSpaceOnTop: true,
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'never'
            },
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true }
          }}
        />
      </div>
    </div>
  );
};

