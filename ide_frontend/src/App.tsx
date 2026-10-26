import React, { useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DesignCanvas } from './components/canvas/DesignCanvas';
import { WorkflowBuilder } from './components/logic/WorkflowBuilder';
import { CodeEditor } from './components/code/CodeEditor';
import { PropertyInspector } from './components/inspector/PropertyInspector';
import { BottomDrawer } from './components/layout/BottomDrawer';
import { TemplateModal } from './components/modals/TemplateModal';
import { UpgradeModal } from './components/modals/UpgradeModal';
import { FullStackCardModal } from './components/modals/FullStackCardModal';
import { StreamAppArchitectModal } from './components/modals/StreamAppArchitectModal';
import { GeminiCopilot } from './components/panels/GeminiCopilot';
import { useEditorStore } from './core/store';

export const App: React.FC = () => {
  const { 
    mode, 
    zenMode,
    undo, 
    redo, 
    saveProject, 
    selectedComponentId, 
    removeComponent,
    duplicateComponent,
    copyComponent,
    pasteComponent,
    sidebarWidth,
    setSidebarWidth,
    inspectorWidth,
    setInspectorWidth,
    generateProject
  } = useEditorStore();

  // Pre-generate code on studio startup so Monaco is immediately ready
  useEffect(() => {
    generateProject();
  }, [generateProject]);

  // Left Splitter Resize Handler
  const handleLeftSplitterDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setSidebarWidth(startWidth + delta);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Right Splitter Resize Handler
  const handleRightSplitterDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = inspectorWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      setInspectorWidth(startWidth + delta);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveProject();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedComponentId) {
        e.preventDefault();
        copyComponent(selectedComponentId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteComponent();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedComponentId) {
        e.preventDefault();
        duplicateComponent(selectedComponentId);
      } else if (e.key === 'Delete' && selectedComponentId) {
        e.preventDefault();
        removeComponent(selectedComponentId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveProject, selectedComponentId, removeComponent, duplicateComponent, copyComponent, pasteComponent]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0D14] text-[#F3F4F6] select-none font-sans">
      {/* 1. Studio Top Navigation */}
      <Navbar />

      {/* 2. Main Studio Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbox Rail & Drawer */}
        {!zenMode && <Sidebar />}

        {/* Left Draggable Splitter */}
        {!zenMode && (
          <div
            onMouseDown={handleLeftSplitterDown}
            className="w-1 hover:w-1.5 bg-[#1E2536] hover:bg-indigo-500 cursor-col-resize transition-all z-20 shrink-0"
            title="Drag to resize widget sidebar"
          />
        )}

        {/* Center Main Stage (Design Canvas / Logic Builder / Monaco Code) */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {(mode === 'design' || mode === 'preview' || mode === 'runtime') && <DesignCanvas />}
          {mode === 'logic' && <WorkflowBuilder />}
          {mode === 'code' && <CodeEditor />}
        </main>

        {/* Right Draggable Splitter */}
        {!zenMode && mode === 'design' && (
          <div
            onMouseDown={handleRightSplitterDown}
            className="w-1 hover:w-1.5 bg-[#1E2536] hover:bg-indigo-500 cursor-col-resize transition-all z-20 shrink-0"
            title="Drag to resize property inspector"
          />
        )}

        {/* Right Property Inspector (in Design mode only) */}
        {!zenMode && mode === 'design' && <PropertyInspector />}

        {/* Gemini AI Copilot Side Drawer */}
        <GeminiCopilot />
      </div>

      {/* 3. Bottom Terminal & Diagnostics Console */}
      <BottomDrawer />

      {/* 4. New Project & Template Gallery Modal */}
      <TemplateModal />

      {/* 5. Subscription & 3-Day Free Trial Upgrade Modal */}
      <UpgradeModal />

      {/* 6. Full-Stack Connected Card (API + DB) Generator Modal */}
      <FullStackCardModal />

      {/* 7. Stream URL Full-Stack Docker Architect Modal */}
      <StreamAppArchitectModal />
    </div>
  );
};

export default App;
