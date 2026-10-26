import React, { useState } from 'react';
import { useEditorStore } from '../../core/store';
import { ComponentNode, AnimationConfig } from '../../types/schema';
import { 
  Trash2, 
  Copy, 
  Play, 
  Pause, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Server, 
  Gauge, 
  DollarSign, 
  Users, 
  BarChart3,
  Video,
  Sparkles,
  Menu,
  ArrowLeft,
  X,
  Search,
  Bell,
  Settings,
  ShoppingBag,
  Home,
  Grid,
  User,
  Radio,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Smartphone,
  Layers,
  LogOut,
  Compass
} from 'lucide-react';

interface WidgetRendererProps {
  componentId: string;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ componentId }) => {
  const { 
    project, 
    selectedComponentId, 
    selectComponent, 
    removeComponent, 
    duplicateComponent,
    addComponent,
    mode,
    activeTabIndices,
    setActiveTabIndex,
    runtimeInputValues,
    setRuntimeInputValue,
    testingAnimationId,
    apiDataCache,
    updateComponentLayout,
    setComponentLayoutRealtime,
    toggleLockComponent,
    toggleHideComponent,
    zoom,
    activeScreenId,
    setActiveScreen,
    isEmulatorDrawerOpen,
    setEmulatorDrawerOpen,
    toggleEmulatorDrawer,
    openFullStackModal,
    updateComponentProperty,
    orientation,
    orientationPolicy
  } = useEditorStore();

  const [railSelectedIdx, setRailSelectedIdx] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const comp = project.components[componentId];
  if (!comp) return null;

  const isSelected = selectedComponentId === componentId;
  const isDesignMode = mode === 'design';
  const isRuntimeMode = mode === 'runtime';
  const isLight = project.theme.mode === 'light';
  const tokens = project.theme.tokens;
  const activePreset = project.theme.activePreset || 'glassmorphism';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDesignMode) {
      selectComponent(componentId);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isDesignMode) return;
    e.stopPropagation();
    const widgetType = e.dataTransfer.getData('text/plain');
    if (widgetType) {
      if (widgetType === 'Card' || widgetType === 'Container') {
        openFullStackModal(componentId);
      } else {
        addComponent(componentId, widgetType);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDesignMode) return;
    e.preventDefault();
    e.stopPropagation();
  };

  // Dynamic resize handler for the 8 perimeter handles
  const handleResizeHandleDown = (
    e: React.MouseEvent,
    direction: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (comp.layout?.isLocked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const scale = Math.max(0.1, (zoom || 100) / 100);

    // Read live untransformed offset width & height of the wrapper element
    const wrapperEl = e.currentTarget.parentElement as HTMLElement;
    const rawW = comp.layout?.width;
    const rawH = comp.layout?.height;
    const startW: number = typeof rawW === 'number' 
      ? rawW 
      : (typeof rawW === 'string' && !isNaN(Number(rawW)) ? Number(rawW) : (wrapperEl ? wrapperEl.offsetWidth : 160));
    const startH: number = typeof rawH === 'number' 
      ? rawH 
      : (typeof rawH === 'string' && !isNaN(Number(rawH)) ? Number(rawH) : (wrapperEl ? wrapperEl.offsetHeight : 120));

    let latestW = startW;
    let latestH = startH;

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';

    const cursorMap: Record<string, string> = {
      nw: 'nwse-resize', se: 'nwse-resize',
      ne: 'nesw-resize', sw: 'nesw-resize',
      n: 'ns-resize', s: 'ns-resize',
      e: 'ew-resize', w: 'ew-resize'
    };
    document.body.style.cursor = cursorMap[direction] || 'default';

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      // Unscale mouse deltas by canvas zoom factor so handles track the mouse 1:1!
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      let newW = startW;
      let newH = startH;

      if (direction.includes('e')) newW = Math.max(40, startW + deltaX);
      if (direction.includes('w')) newW = Math.max(40, startW - deltaX);
      if (direction.includes('s')) newH = Math.max(30, startH + deltaY);
      if (direction.includes('n')) newH = Math.max(30, startH - deltaY);

      latestW = Math.round(newW);
      latestH = Math.round(newH);

      setComponentLayoutRealtime(comp.id, {
        width: latestW,
        height: latestH,
        sizingMode: 'fixed'
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;

      updateComponentLayout(comp.id, {
        width: latestW,
        height: latestH,
        sizingMode: 'fixed'
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Base wrapper for selection rings and drag handles
  const wrapWithSelection = (content: React.ReactNode, isContainer: boolean = false) => {
    if (comp.layout?.isHidden) {
      if (!isDesignMode) return null;
    }

    const layoutW = comp.layout?.width;
    const layoutH = comp.layout?.height;

    const sizeModeW = comp.properties.sizeModeWidth || (comp.layout?.sizingMode === 'fill' ? 'fill' : comp.layout?.sizingMode === 'flex' ? 'expanded' : layoutW ? 'fixed' : 'auto');
    const sizeModeH = comp.properties.sizeModeHeight || (comp.layout?.sizingMode === 'fill' ? 'fill' : comp.layout?.sizingMode === 'flex' ? 'expanded' : layoutH ? 'fixed' : 'auto');

    let renderedWidth: string | number | undefined = '100%';
    let flexStyle: React.CSSProperties = {};

    if (sizeModeW === 'auto') {
      renderedWidth = 'auto';
    } else if (sizeModeW === 'fill') {
      renderedWidth = '100%';
    } else if (sizeModeW === 'expanded') {
      renderedWidth = 'auto';
      flexStyle = { flex: comp.properties.flex || 1, flexGrow: comp.properties.flex || 1 };
    } else if (layoutW !== undefined) {
      renderedWidth = typeof layoutW === 'number' ? `${layoutW}px` : layoutW;
    } else if (comp.properties.width !== undefined) {
      renderedWidth = `${comp.properties.width}px`;
    }

    let renderedHeight: string | number | undefined = undefined;
    if (sizeModeH === 'fill') {
      renderedHeight = '100%';
    } else if (sizeModeH === 'expanded') {
      renderedHeight = '100%';
      flexStyle = { ...flexStyle, flex: comp.properties.flex || 1, flexGrow: comp.properties.flex || 1 };
    } else if (layoutH !== undefined) {
      renderedHeight = typeof layoutH === 'number' ? `${layoutH}px` : layoutH;
    } else if (comp.properties.height !== undefined) {
      renderedHeight = `${comp.properties.height}px`;
    }

    const getAlignmentStyles = (alignment?: string): { alignSelf?: string; justifySelf?: string } => {
      if (!alignment) return {};
      switch (alignment) {
        case 'topLeft':
          return { alignSelf: 'flex-start', justifySelf: 'start' };
        case 'topCenter':
          return { alignSelf: 'center', justifySelf: 'center' };
        case 'topRight':
          return { alignSelf: 'flex-end', justifySelf: 'end' };
        case 'centerLeft':
          return { alignSelf: 'flex-start', justifySelf: 'start' };
        case 'center':
          return { alignSelf: 'center', justifySelf: 'center' };
        case 'centerRight':
          return { alignSelf: 'flex-end', justifySelf: 'end' };
        case 'bottomLeft':
          return { alignSelf: 'flex-start', justifySelf: 'start' };
        case 'bottomCenter':
          return { alignSelf: 'center', justifySelf: 'center' };
        case 'bottomRight':
          return { alignSelf: 'flex-end', justifySelf: 'end' };
        default:
          return {};
      }
    };

    const alignStyles = getAlignmentStyles(comp.properties.alignment);

    // 4-Sided Margin
    const marginTop = comp.properties.marginTop ?? comp.properties.margin ?? 0;
    const marginRight = comp.properties.marginRight ?? comp.properties.margin ?? 0;
    const marginBottom = comp.properties.marginBottom ?? comp.properties.margin ?? 0;
    const marginLeft = comp.properties.marginLeft ?? comp.properties.margin ?? 0;

    // 4-Sided Padding for widgets that are not container/card/scaffold
    const isContainerWidget = comp.type === 'Container' || comp.type === 'Card' || comp.type === 'Scaffold';
    const paddingTop = !isContainerWidget ? (comp.properties.paddingTop ?? comp.properties.padding ?? 0) : 0;
    const paddingRight = !isContainerWidget ? (comp.properties.paddingRight ?? comp.properties.padding ?? 0) : 0;
    const paddingBottom = !isContainerWidget ? (comp.properties.paddingBottom ?? comp.properties.padding ?? 0) : 0;
    const paddingLeft = !isContainerWidget ? (comp.properties.paddingLeft ?? comp.properties.padding ?? 0) : 0;

    const wrapperStyle: React.CSSProperties = {
      width: renderedWidth,
      ...(renderedHeight ? { height: renderedHeight } : {}),
      ...flexStyle,
      ...(sizeModeW === 'fill' ? { alignSelf: 'stretch', width: '100%' } : (sizeModeW === 'auto' || sizeModeW === 'fixed' || (layoutW && sizeModeW !== 'fill') ? { flexShrink: 0, ...alignStyles } : alignStyles)),
      marginTop: `${marginTop}px`,
      marginRight: `${marginRight}px`,
      marginBottom: `${marginBottom}px`,
      marginLeft: `${marginLeft}px`,
      ...(paddingTop || paddingRight || paddingBottom || paddingLeft ? {
        paddingTop: `${paddingTop}px`,
        paddingRight: `${paddingRight}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
      } : {}),
      ...(comp.layout?.maxWidth ? { maxWidth: `${comp.layout.maxWidth}px` } : {}),
      ...(comp.layout?.maxHeight ? { maxHeight: `${comp.layout.maxHeight}px` } : {}),
      minWidth: comp.layout?.minWidth !== undefined ? `${comp.layout.minWidth}px` : 0,
      minHeight: comp.layout?.minHeight !== undefined ? `${comp.layout.minHeight}px` : 0,
      boxSizing: 'border-box'
    };

    if (!isDesignMode) {
      return (
        <div className="relative" style={wrapperStyle}>
          {content}
        </div>
      );
    }

    const isHidden = comp.layout?.isHidden;
    const isLocked = comp.layout?.isLocked;

    return (
      <div
        onClick={handleClick}
        onDrop={isContainer ? handleDrop : undefined}
        onDragOver={isContainer ? handleDragOver : undefined}
        style={wrapperStyle}
        className={`relative ${
          isHidden ? 'opacity-40 grayscale border border-dashed border-amber-500/50' : ''
        } ${
          isSelected 
            ? `ring-2 ring-indigo-500 ring-offset-2 ${isLight ? 'ring-offset-slate-100' : 'ring-offset-[#0A0D14]'}` 
            : `hover:outline hover:outline-1 ${isLight ? 'hover:outline-indigo-500/50' : 'hover:outline-indigo-400/50'}`
        }`}
      >
        {/* Selection Chip & Controls */}
        {isSelected && (
          <div className="absolute -top-3.5 left-2 z-30 flex items-center gap-1.5 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-mono shadow-md">
            <span>{comp.type}</span>
            {comp.layout?.width && comp.layout?.height && (
              <span className="text-[9px] text-indigo-200 font-bold border-l border-indigo-400 pl-1">
                {comp.layout.width}×{comp.layout.height}
              </span>
            )}
            {(comp.layout?.width || comp.layout?.height) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateComponentLayout(comp.id, { width: undefined, height: undefined, sizingMode: 'auto' });
                }}
                className="hover:text-amber-300 text-indigo-200 text-[10px] font-bold pl-0.5"
                title="Reset Size to Default Auto"
              >
                ↺
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLockComponent(comp.id);
              }}
              className={`p-0.5 rounded hover:bg-indigo-500 ${isLocked ? 'text-amber-300' : 'text-indigo-200'}`}
              title={isLocked ? "Unlock Component" : "Lock Component"}
            >
              {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHideComponent(comp.id);
              }}
              className="p-0.5 rounded hover:bg-indigo-500 text-indigo-200"
              title={isHidden ? "Show Component" : "Hide Component"}
            >
              {isHidden ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateComponent(comp.id);
              }}
              className="hover:text-indigo-200"
              title="Duplicate"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
            {comp.parentId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeComponent(comp.id);
                }}
                className="hover:text-rose-300"
                title="Delete"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}

        {/* 8 Visible Drag Handles for Resizing */}
        {isSelected && !isLocked && (
          <>
            <div onMouseDown={(e) => handleResizeHandleDown(e, 'nw')} className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Top-Left" />
            <div onMouseDown={(e) => handleResizeHandleDown(e, 'n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-ns-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Top" />
            <div onMouseDown={(e) => handleResizeHandleDown(e, 'ne')} className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Top-Right" />
            <div onMouseDown={(e) => handleResizeHandleDown(e, 'e')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-ew-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Right" />
            <div onMouseDown={(e) => handleResizeHandleDown(e, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Bottom-Right" />
            <div onMouseDown={(e) => handleResizeHandleDown(e, 's')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-ns-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Bottom" />
            <div onMouseDown={(e) => handleResizeHandleDown(e, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Bottom-Left" />
            <div onMouseDown={(e) => handleResizeHandleDown(e, 'w')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-ew-resize z-40 shadow-sm hover:scale-125 transition-transform" title="Resize Left" />
          </>
        )}

        {content}
      </div>
    );
  };

  // Full CSS keyframe animation styles
  const getAnimationStyles = (): React.CSSProperties => {
    const isTesting = testingAnimationId === comp.id;
    if (!isTesting && (!comp.animation || !comp.animation.autoPlay)) return {};
    const animConfig: AnimationConfig = comp.animation || { 
      type: 'fade', 
      duration: 600, 
      delay: 0,
      curve: 'easeInOut',
      repeat: 'once',
      autoPlay: true
    };
    const duration = `${animConfig.duration || 600}ms`;
    const curve = animConfig.curve === 'bounceOut' ? 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' : 'ease-in-out';
    const iteration = isTesting ? '1' : (animConfig.repeat === 'loop' ? 'infinite' : animConfig.repeat === 'reverse' ? 'infinite alternate' : '1');

    switch (animConfig.type) {
      case 'fade':
        return { animation: `fadeIn ${duration} ${curve} ${iteration} forwards` };
      case 'scale':
        return { animation: `scaleUp ${duration} ${curve} ${iteration} forwards` };
      case 'slide':
      case 'slideUp':
        return { animation: `slideUp ${duration} ${curve} ${iteration} forwards` };
      case 'slideDown':
        return { animation: `slideDown ${duration} ${curve} ${iteration} forwards` };
      case 'slideLeft':
        return { animation: `slideLeft ${duration} ${curve} ${iteration} forwards` };
      case 'slideRight':
        return { animation: `slideRight ${duration} ${curve} ${iteration} forwards` };
      case 'rotate':
        return { animation: `rotate360 ${duration} linear ${iteration}` };
      case 'bounce':
        return { animation: `bounceSlow ${duration} ${curve} ${iteration}` };
      case 'pulse':
        return { animation: `pulseGlow ${duration} ${curve} ${iteration}` };
      case 'shake':
        return { animation: `shakeWidget ${duration} ${curve} ${iteration}` };
      default:
        return { animation: `fadeIn ${duration} ${curve} ${iteration} forwards` };
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // PRESET STYLING ENGINE FOR SURFACES, BUTTONS, INPUTS, AND HEADERS
  // ══════════════════════════════════════════════════════════════════════
  const getPresetSurfaceStyle = (customBg?: string, customRadius?: number, customElevation?: number): React.CSSProperties => {
    const defaultSurfaceBg = isLight 
      ? '#FFFFFF' 
      : (tokens.surfaceColor.startsWith('0x40') ? 'rgba(30, 41, 59, 0.6)' : tokens.surfaceColor.replace('0xFF', '#'));
    const surfaceBg = customBg?.startsWith('#') 
      ? customBg 
      : (customBg ? customBg.replace('0xFF', '#') : defaultSurfaceBg);

    const radius = customRadius !== undefined ? customRadius : tokens.borderRadius;

    switch (activePreset) {
      case 'neobrutalism':
        return {
          backgroundColor: customBg ? surfaceBg : '#FFFFFF',
          border: '2.5px solid #000000',
          borderRadius: `${Math.min(radius, 4)}px`,
          boxShadow: '4px 4px 0px #000000',
          color: '#000000'
        };

      case 'claymorphism': {
        const clayRadius = Math.max(radius, 24);
        return {
          backgroundColor: isLight ? '#FFFFFF' : '#2A303C',
          borderRadius: `${clayRadius}px`,
          border: 'none',
          boxShadow: isLight
            ? 'inset -5px -5px 10px rgba(0, 0, 0, 0.08), inset 5px 5px 10px rgba(255, 255, 255, 0.85), 0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.06)'
            : 'inset -5px -5px 10px rgba(0, 0, 0, 0.35), inset 5px 5px 10px rgba(255, 255, 255, 0.1), 0 12px 24px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.2)',
          color: isLight ? '#2D3436' : '#F8FAFC'
        };
      }

      case 'skeuomorphism': {
        const skeuoRadius = Math.max(radius, 12);
        return isLight
          ? {
              background: 'linear-gradient(180deg, #FFFFFF 0%, #E8E2D8 100%)',
              borderTop: '1.5px solid rgba(255, 255, 255, 0.9)',
              borderBottom: '2px solid #C4BCB0',
              borderLeft: '1px solid #DFD9CF',
              borderRight: '1px solid #DFD9CF',
              borderRadius: `${skeuoRadius}px`,
              boxShadow: '0 8px 18px rgba(60, 45, 30, 0.16), inset 0 1px 0 #FFFFFF',
              color: '#3E2723'
            }
          : {
              background: 'linear-gradient(180deg, #323846 0%, #1C2029 100%)',
              borderTop: '1.5px solid rgba(255, 255, 255, 0.22)',
              borderBottom: '2.5px solid rgba(0, 0, 0, 0.65)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
              borderRight: '1px solid rgba(0, 0, 0, 0.35)',
              borderRadius: `${skeuoRadius}px`,
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF'
            };
      }

      case 'neumorphism':
        return {
          backgroundColor: '#E0E5EC',
          borderRadius: `${Math.max(radius, 20)}px`,
          border: 'none',
          boxShadow: '8px 8px 16px #bec3c9, -8px -8px 16px #ffffff',
          color: '#2D3748'
        };

      case 'neon':
        return {
          backgroundColor: 'rgba(18, 18, 30, 0.85)',
          border: '1.5px solid #00FFCC',
          borderRadius: `${radius}px`,
          boxShadow: '0 0 16px rgba(0, 255, 204, 0.3), inset 0 0 8px rgba(0, 255, 204, 0.1)',
          color: '#00FFCC'
        };

      case 'bento':
        return {
          backgroundColor: '#18181B',
          border: '1px solid #27272A',
          borderRadius: `${Math.max(radius, 18)}px`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          color: '#FAFAFA'
        };

      case 'fluent':
        return {
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(38, 38, 38, 0.85)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isLight ? '#E5E5E5' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: `${radius}px`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          color: isLight ? '#201F1E' : '#FFFFFF'
        };

      case 'flat':
        return {
          backgroundColor: '#FFFFFF',
          borderRadius: `${radius}px`,
          border: 'none',
          boxShadow: 'none',
          color: '#2C3E50'
        };

      case 'minimalism':
        return {
          backgroundColor: isLight ? '#FFFFFF' : '#111111',
          border: `1px solid ${isLight ? '#E5E7EB' : '#262626'}`,
          borderRadius: `${radius}px`,
          boxShadow: 'none',
          color: isLight ? '#0A0A0A' : '#FAFAFA'
        };

      case 'editorial':
        return {
          backgroundColor: '#F5F0E6',
          border: '1px solid #E7E5E4',
          borderRadius: `${Math.min(radius, 4)}px`,
          boxShadow: 'none',
          color: '#1C1917',
          fontFamily: 'Playfair Display, Georgia, serif'
        };

      case 'gradient':
        return {
          background: 'linear-gradient(135deg, rgba(36, 0, 70, 0.9) 0%, rgba(18, 0, 36, 0.9) 100%)',
          border: '1px solid rgba(233, 64, 87, 0.3)',
          borderRadius: `${radius}px`,
          boxShadow: '0 8px 24px rgba(138, 35, 135, 0.3)',
          color: '#FFFFFF'
        };

      case 'enterprise':
        return {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: `${radius}px`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          color: '#212529'
        };

      case 'glassmorphism':
      default:
        return {
          backgroundColor: surfaceBg,
          borderRadius: `${radius}px`,
          backdropFilter: tokens.blur ? `blur(${tokens.blur}px)` : undefined,
          border: `1px solid ${isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.12)'}`,
          boxShadow: isLight 
            ? '0 8px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7)' 
            : '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          color: isLight ? '#0F172A' : '#FFFFFF'
        };
    }
  };

  const getPresetButtonStyle = (customBg?: string): React.CSSProperties => {
    const primaryHex = comp.properties.backgroundColor?.replace('0xFF', '#') || tokens.primaryColor.replace('0xFF', '#');
    const radius = tokens.borderRadius;

    switch (activePreset) {
      case 'neobrutalism':
        return {
          backgroundColor: customBg || '#FFE600',
          color: '#000000',
          border: '2.5px solid #000000',
          borderRadius: '2px',
          boxShadow: '4px 4px 0px #000000',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        };

      case 'claymorphism':
        return {
          backgroundColor: customBg || '#FF6B6B',
          color: '#FFFFFF',
          borderRadius: '9999px',
          border: 'none',
          fontWeight: 700,
          boxShadow: 'inset -3px -3px 6px rgba(0, 0, 0, 0.22), inset 3px 3px 6px rgba(255, 255, 255, 0.45), 0 8px 20px -2px rgba(255, 107, 107, 0.45)'
        };

      case 'skeuomorphism':
        return {
          background: 'linear-gradient(180deg, #C5914E 0%, #8B5A2B 100%)',
          color: '#FFFFFF',
          fontWeight: 700,
          borderTop: '1.5px solid rgba(255, 255, 255, 0.45)',
          borderBottom: '2.5px solid rgba(0, 0, 0, 0.5)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
          borderRight: '1px solid rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)'
        };

      case 'neumorphism':
        return {
          backgroundColor: '#E0E5EC',
          color: '#2D3748',
          fontWeight: 700,
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '6px 6px 12px #bec3c9, -6px -6px 12px #ffffff'
        };

      case 'neon':
        return {
          backgroundColor: '#00FFCC',
          color: '#05050A',
          fontWeight: 800,
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 0 20px rgba(0, 255, 204, 0.6), 0 0 40px rgba(0, 255, 204, 0.2)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        };

      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)',
          color: '#FFFFFF',
          fontWeight: 700,
          borderRadius: '18px',
          border: 'none',
          boxShadow: '0 6px 18px rgba(233, 64, 87, 0.45)'
        };

      case 'flat':
        return {
          backgroundColor: customBg || '#2ECC71',
          color: '#FFFFFF',
          fontWeight: 600,
          borderRadius: '6px',
          border: 'none',
          boxShadow: 'none'
        };

      case 'editorial':
        return {
          backgroundColor: '#1C1917',
          color: '#FFFFFF',
          fontWeight: 600,
          borderRadius: '2px',
          border: '1px solid #1C1917',
          boxShadow: 'none',
          fontFamily: 'Playfair Display, Georgia, serif'
        };

      case 'material3':
        return {
          backgroundColor: primaryHex,
          color: '#FFFFFF',
          fontWeight: 600,
          borderRadius: '9999px',
          border: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        };

      default:
        return {
          backgroundColor: primaryHex,
          color: '#FFFFFF',
          fontWeight: 600,
          borderRadius: `${radius}px`,
          border: 'none',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
        };
    }
  };

  const getPresetInputStyle = (): React.CSSProperties => {
    switch (activePreset) {
      case 'neobrutalism':
        return {
          backgroundColor: '#FFFFFF',
          border: '2.5px solid #000000',
          borderRadius: '2px',
          boxShadow: '3px 3px 0px #000000',
          color: '#000000',
          fontWeight: 600
        };

      case 'claymorphism':
        return {
          backgroundColor: isLight ? '#F0F3FA' : '#1F242E',
          borderRadius: '20px',
          border: 'none',
          boxShadow: isLight 
            ? 'inset 3px 3px 6px rgba(0,0,0,0.08), inset -3px -3px 6px rgba(255,255,255,0.7)'
            : 'inset 3px 3px 6px rgba(0,0,0,0.3), inset -3px -3px 6px rgba(255,255,255,0.05)',
          color: isLight ? '#2D3436' : '#FFFFFF'
        };

      case 'skeuomorphism':
        return {
          backgroundColor: isLight ? '#EFEBE4' : '#161922',
          border: `1px solid ${isLight ? '#C5BEB2' : '#0B0D12'}`,
          borderRadius: '8px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.15)',
          color: isLight ? '#3E2723' : '#FFFFFF'
        };

      case 'neumorphism':
        return {
          backgroundColor: '#E0E5EC',
          borderRadius: '14px',
          border: 'none',
          boxShadow: 'inset 4px 4px 8px #bec3c9, inset -4px -4px 8px #ffffff',
          color: '#2D3748'
        };

      case 'neon':
        return {
          backgroundColor: '#0A0A14',
          border: '1px solid #00FFCC',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0, 255, 204, 0.2)',
          color: '#00FFCC'
        };

      default:
        return {
          backgroundColor: isLight ? '#FFFFFF' : 'rgba(0,0,0,0.2)',
          border: `1px solid ${isLight ? '#CBD5E1' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: `${tokens.borderRadius / 1.5}px`,
          color: isLight ? '#0F172A' : '#FFFFFF'
        };
    }
  };

  const getPresetAppBarStyle = (compBg?: string, compFg?: string): { barStyle: React.CSSProperties, textColor: string, iconClass: string } => {
    const defaultBg = isLight ? '#FFFFFF' : tokens.surfaceColor.replace('0xFF', '#').replace('0x40', '#');
    const defaultTextColor = isLight ? '#0F172A' : tokens.textColor.replace('0xFF', '#');

    switch (activePreset) {
      case 'neobrutalism':
        return {
          barStyle: {
            backgroundColor: compBg?.replace('0xFF', '#') || '#FFE600',
            borderBottom: '3px solid #000000',
            boxShadow: '0 4px 0px #000000'
          },
          textColor: '#000000',
          iconClass: 'text-black hover:bg-black/10'
        };

      case 'skeuomorphism':
        return {
          barStyle: isLight
            ? {
                background: 'linear-gradient(180deg, #FFFFFF 0%, #D8D1C5 100%)',
                borderBottom: '2.5px solid #8C7B68',
                boxShadow: '0 4px 10px rgba(60, 45, 30, 0.2), inset 0 1px 0 #FFFFFF'
              }
            : {
                background: 'linear-gradient(180deg, #3A4252 0%, #20242E 100%)',
                borderBottom: '3px solid #101217',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
              },
          textColor: isLight ? '#3E2723' : '#FFFFFF',
          iconClass: isLight ? 'text-amber-950 hover:bg-black/10' : 'text-white hover:bg-white/10'
        };

      case 'claymorphism':
        return {
          barStyle: {
            backgroundColor: isLight ? '#FFFFFF' : '#2A303C',
            boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08), inset 0 -4px 8px rgba(0,0,0,0.04)',
            borderBottom: 'none'
          },
          textColor: isLight ? '#2D3436' : '#FFFFFF',
          iconClass: isLight ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'
        };

      case 'neumorphism':
        return {
          barStyle: {
            backgroundColor: '#E0E5EC',
            boxShadow: '0 4px 8px #bec3c9',
            borderBottom: 'none'
          },
          textColor: '#2D3748',
          iconClass: 'text-slate-700 hover:bg-black/5'
        };

      case 'neon':
        return {
          barStyle: {
            backgroundColor: 'rgba(5, 5, 10, 0.95)',
            borderBottom: '1.5px solid #00FFCC',
            boxShadow: '0 0 16px rgba(0, 255, 204, 0.3)'
          },
          textColor: '#00FFCC',
          iconClass: 'text-[#00FFCC] hover:bg-[#00FFCC]/10'
        };

      default:
        return {
          barStyle: {
            backgroundColor: compBg?.replace('0xFF', '#') || defaultBg,
            backdropFilter: tokens.blur ? `blur(${tokens.blur}px)` : undefined,
            borderBottom: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)'}`
          },
          textColor: compFg || defaultTextColor,
          iconClass: isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
        };
    }
  };

  // RENDER BASED ON WIDGET TYPE
  switch (comp.type) {
    /* ══════════════════════════════════════════════
       SCAFFOLD (SCREEN CONTAINER)
       ══════════════════════════════════════════════ */
    case 'Scaffold': {
      const showAppBar = comp.properties.showAppBar !== false;
      const navMode = comp.properties.showDrawer || 'none';

      return (
        <div 
          onClick={handleClick}
          className="flex h-full w-full overflow-hidden relative"
          style={{ 
            backgroundColor: comp.properties.backgroundColor?.replace('0xFF', '#') || tokens.backgroundColor.replace('0xFF', '#').replace('0x40', '#') 
          }}
        >
          {/* Vertical NavigationRail on Tablets & Desktops */}
          {navMode === 'navigationRail' && (
            <div className={`w-16 ${isLight ? 'bg-white border-r border-slate-200 shadow-sm' : 'bg-[#161B26] border-r border-white/10'} flex flex-col items-center py-4 gap-4 shrink-0 z-20`}>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white mb-2 shadow">
                <Sparkles className="w-4 h-4" />
              </div>
              {project.screens.map((screen, idx) => {
                const isCurrent = screen.id === activeScreenId;
                return (
                  <button
                    key={screen.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveScreen(screen.id);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      isCurrent 
                        ? (isLight ? 'bg-indigo-50 text-indigo-600 font-bold' : 'bg-indigo-600/30 text-indigo-400 font-bold')
                        : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                    }`}
                    title={`${screen.name} (${screen.route})`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[9px] truncate max-w-[50px]">{screen.name.replace('Screen', '')}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Slide-out Left Drawer Overlay */}
          {isEmulatorDrawerOpen && (() => {
            const headerTitle = comp.properties.drawerHeaderTitle || comp.properties.headerTitle || project.metadata.name || "Suryaa App";
            const headerSubtitle = comp.properties.drawerHeaderSubtitle || comp.properties.headerSubtitle || "operator@suryaa.io";
            const avatarText = comp.properties.drawerAvatarText || "SP";
            const avatarUrl = comp.properties.drawerAvatarUrl;
            const headerGradKey = comp.properties.drawerHeaderGradient || "indigo";
            const gradClassMap: Record<string, string> = {
              indigo: 'from-indigo-900 via-indigo-800 to-purple-900',
              emerald: 'from-emerald-950 via-emerald-800 to-teal-900',
              cyan: 'from-cyan-950 via-cyan-800 to-blue-900',
              purple: 'from-purple-950 via-purple-800 to-pink-900',
              rose: 'from-rose-950 via-rose-800 to-red-900',
              slate: 'from-slate-900 via-slate-800 to-zinc-900',
            };
            const headerGradient = gradClassMap[headerGradKey] || gradClassMap.indigo;
            const showScreens = comp.properties.drawerShowScreens !== false;
            const customItems: any[] = comp.properties.drawerItems || [
              { id: "item_home", label: "Dashboard", icon: "home", route: "/" },
              { id: "item_orders", label: "Orders & Cart", icon: "shopping_bag", route: "/orders" },
              { id: "item_telemetry", label: "Live Telemetry", icon: "activity", route: "/telemetry" },
              { id: "item_settings", label: "Settings", icon: "settings", route: "/settings" }
            ];
            const showLogout = comp.properties.drawerShowLogout !== false;
            const logoutLabel = comp.properties.drawerLogoutLabel || "Sign Out";
            const footerText = comp.properties.drawerFooterText || `${project.screens.length} screens • v3.0`;

            const getDrawerItemIcon = (iconName: string) => {
              switch (iconName?.toLowerCase()) {
                case 'home': return <Home className="w-4 h-4 text-indigo-400 shrink-0" />;
                case 'shopping_bag':
                case 'cart': return <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />;
                case 'activity':
                case 'telemetry':
                case 'stream': return <Activity className="w-4 h-4 text-cyan-400 shrink-0" />;
                case 'settings': return <Settings className="w-4 h-4 text-amber-400 shrink-0" />;
                case 'users':
                case 'profile': return <User className="w-4 h-4 text-purple-400 shrink-0" />;
                case 'bell': return <Bell className="w-4 h-4 text-rose-400 shrink-0" />;
                case 'server': return <Server className="w-4 h-4 text-blue-400 shrink-0" />;
                default: return <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />;
              }
            };

            return (
              <div 
                onClick={() => setEmulatorDrawerOpen(false)}
                className={`absolute inset-0 bg-black/60 z-50 flex animate-in fade-in duration-150 ${navMode === 'endDrawer' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`w-64 h-full ${isLight ? 'bg-white text-slate-800' : 'bg-[#111520] text-slate-200'} ${
                    navMode === 'endDrawer'
                      ? (isLight ? 'border-l border-slate-200 animate-in slide-in-from-right' : 'border-l border-[#232A3B] animate-in slide-in-from-right')
                      : (isLight ? 'border-r border-slate-200 animate-in slide-in-from-left' : 'border-r border-[#232A3B] animate-in slide-in-from-left')
                  } flex flex-col shadow-2xl duration-200`}
                >
                  {/* UserAccountsDrawerHeader */}
                  <div className={`p-4 bg-gradient-to-tr ${headerGradient} text-white flex flex-col justify-end h-32 border-b border-white/10 shrink-0 shadow-inner`}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full border border-white/40 object-cover mb-2 shadow" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-sm mb-2 shadow">
                        {avatarText}
                      </div>
                    )}
                    <div className="font-bold text-sm truncate">{headerTitle}</div>
                    <div className="text-[11px] text-white/80 truncate">{headerSubtitle}</div>
                  </div>

                  {/* Drawer Menu Items */}
                  <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1 block">
                      {showScreens ? "Pages / Screens" : "Navigation Menu"}
                    </span>

                    {showScreens ? (
                      project.screens.map((screen) => {
                        const isCurrent = screen.id === activeScreenId;
                        return (
                          <div 
                            key={screen.id}
                            onClick={() => {
                              setActiveScreen(screen.id);
                              setEmulatorDrawerOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                              isCurrent 
                                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/10')
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span className="truncate">{screen.name}</span>
                            </div>
                            <span className={`text-[10px] font-mono ${isCurrent ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {screen.route}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      customItems.map((item, idx) => (
                        <div 
                          key={item.id || idx}
                          onClick={() => {
                            setEmulatorDrawerOpen(false);
                            const matched = project.screens.find(s => s.route === item.route || s.name.toLowerCase() === item.label?.toLowerCase());
                            if (matched) setActiveScreen(matched.id);
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {getDrawerItemIcon(item.icon)}
                            <span className="truncate font-medium">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500">
                              {item.route}
                            </span>
                          </div>
                        </div>
                      ))
                    )}

                    {showLogout && (
                      <div 
                        onClick={() => setEmulatorDrawerOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs cursor-pointer text-rose-400 hover:bg-rose-500/10 transition-all font-medium mt-2 border-t border-white/5"
                      >
                        <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{logoutLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer */}
                  <div className={`p-3 border-t ${isLight ? 'border-slate-200' : 'border-[#232A3B]'} flex items-center justify-between shrink-0`}>
                    <span className="text-[10px] text-slate-500 font-mono truncate">{footerText}</span>
                    <button 
                      onClick={() => setEmulatorDrawerOpen(false)}
                      className={`p-1.5 rounded-lg hover:bg-white/10 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                      title="Close Sidebar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Main Scaffold Content Column */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* 1. Fixed AppBar at top */}
            {showAppBar && comp.childIds.map((cid) => {
              const child = project.components[cid];
              if (child?.type === 'AppBar') {
                return <WidgetRenderer key={cid} componentId={cid} />;
              }
              return null;
            })}

            {/* 2. Scrollable Body Content (Simulated Device Viewport) */}
            <div 
              onDragOver={(e) => {
                if (isDesignMode) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onDrop={(e) => {
                if (!isDesignMode) return;
                e.preventDefault();
                e.stopPropagation();
                const widgetType = e.dataTransfer.getData('text/plain');
                if (widgetType) {
                  if (widgetType === 'Card' || widgetType === 'Container') {
                    openFullStackModal(comp.id);
                  } else {
                    addComponent(comp.id, widgetType);
                  }
                }
              }}
              className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col relative"
              onWheel={(e) => e.stopPropagation()}
            >
              {(() => {
                const bodyChildren = comp.childIds.filter((cid) => project.components[cid]?.type !== 'AppBar');
                if (bodyChildren.length === 0) {
                  return (
                    <div 
                      data-empty-drop-zone="true"
                      className="flex-1 min-h-[360px] m-4 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/[0.03] hover:border-indigo-400/60 hover:bg-indigo-500/[0.06] transition-all flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
                      onClick={() => openFullStackModal(comp.id)}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-sm text-slate-200 mb-1">Canvas is Empty</div>
                      <p className="text-xs text-slate-400 max-w-[260px] mb-4">
                        Drag & drop widgets from the left palette, or click quick actions below
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openFullStackModal(comp.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          + Full-Stack Card (API & DB)
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addComponent(comp.id, 'Column');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] text-slate-300 hover:text-white text-xs font-medium"
                        >
                          + Vertical Column
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addComponent(comp.id, 'MultiAxisChart');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] text-slate-300 hover:text-white text-xs font-medium"
                        >
                          + Telemetry Chart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addComponent(comp.id, 'CircularGauge');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#161B26] hover:bg-[#1E2536] border border-[#232A3B] text-slate-300 hover:text-white text-xs font-medium"
                        >
                          + Circular Gauge
                        </button>
                      </div>
                    </div>
                  );
                }

                return bodyChildren.map((cid) => (
                  <WidgetRenderer key={cid} componentId={cid} />
                ));
              })()}
            </div>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       APPBAR (NAVBAR HEADER)
       ══════════════════════════════════════════════ */
    case 'AppBar': {
      const isCentered = comp.properties.centerTitle !== false;
      const { barStyle, textColor: appBarTextColor, iconClass: iconBtnClass } = getPresetAppBarStyle(
        comp.properties.backgroundColor,
        comp.properties.foregroundColor
      );

      return wrapWithSelection(
        <div 
          className="h-14 px-4 flex items-center shrink-0 select-none shadow-md transition-all relative"
          style={{
            ...barStyle,
            color: appBarTextColor,
            ...getAnimationStyles()
          }}
        >
          {/* Leading Icon */}
          <div className="flex items-center">
            {comp.properties.leadingIcon === 'arrow_back' ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (project.screens.length > 1) {
                    setActiveScreen(project.screens[0].id);
                  }
                }}
                className={`p-1.5 rounded-full mr-2 ${iconBtnClass}`}
                title="Go Back to Home Screen"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : comp.properties.leadingIcon === 'close' ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (project.screens.length > 1) {
                    setActiveScreen(project.screens[0].id);
                  }
                }}
                className={`p-1.5 rounded-full mr-2 ${iconBtnClass}`}
                title="Close Page"
              >
                <X className="w-5 h-5" />
              </button>
            ) : comp.properties.leadingIcon !== 'none' ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEmulatorDrawer();
                }}
                className={`p-1.5 rounded-full mr-2 ${iconBtnClass}`}
                title="Toggle Navigation Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : null}
          </div>

          {/* Title with Inline Editing & Empty Title Support */}
          <div className={`flex-1 flex ${isCentered ? 'justify-center' : 'justify-start'}`}>
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={comp.properties.title ?? ""}
                placeholder="AppBar Title..."
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    setIsEditingTitle(false);
                  }
                }}
                onBlur={() => setIsEditingTitle(false)}
                onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                className="bg-black/40 border border-indigo-400 text-sm font-bold text-center focus:outline-none px-2 py-0.5 rounded shadow-inner"
                style={{ color: appBarTextColor, minWidth: '120px', maxWidth: '220px' }}
              />
            ) : (
              <span 
                className="font-bold text-base truncate cursor-pointer hover:opacity-80 transition-opacity"
                onDoubleClick={(e) => {
                  if (isDesignMode) {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }
                }}
                title={isDesignMode ? "Double click to edit or delete title" : undefined}
                style={{
                  fontFamily: comp.properties.fontFamily || tokens.fontFamily || 'Inter',
                  color: appBarTextColor
                }}
              >
                {comp.properties.title === "" ? (
                  isDesignMode ? (
                    <span className="text-slate-400/60 italic text-xs font-normal tracking-normal">(Untitled AppBar)</span>
                  ) : null
                ) : (
                  comp.properties.title ?? "Suryaa App"
                )}
              </span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            <button className={`p-1.5 rounded-full ${iconBtnClass}`}>
              <Search className="w-4 h-4" />
            </button>
            <button className={`p-1.5 rounded-full ${iconBtnClass}`}>
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleEmulatorDrawer();
              }}
              title="Toggle Navigation Drawer"
              className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow ml-1 transition-transform hover:scale-105 active:scale-95"
            >
              {comp.properties.drawerAvatarText || "SP"}
            </button>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       TABBAR & VIEWS
       ══════════════════════════════════════════════ */
    case 'TabBar': {
      const tabs = comp.properties.tabs || [
        { id: "tab_1", label: "Tab 1" },
        { id: "tab_2", label: "Tab 2" }
      ];
      const activeIdx = activeTabIndices[comp.id] ?? (comp.properties.activeTab || 0);

      let tabStripClass = `flex border-b shrink-0 ${isLight ? 'border-slate-200 bg-slate-100/90' : 'border-white/10 bg-black/20'}`;
      if (activePreset === 'neobrutalism') {
        tabStripClass = 'flex border-b-[2.5px] border-black bg-white shrink-0';
      } else if (activePreset === 'claymorphism') {
        tabStripClass = 'flex border-none bg-black/5 dark:bg-white/5 rounded-2xl p-1 m-2 shrink-0';
      } else if (activePreset === 'skeuomorphism') {
        tabStripClass = isLight
          ? 'flex border-b-2 border-[#C4BCB0] bg-gradient-to-b from-white to-[#E8E2D8] shrink-0'
          : 'flex border-b-2 border-black/50 bg-gradient-to-b from-[#2D3342] to-[#1B1E28] shrink-0';
      }

      return wrapWithSelection(
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className={tabStripClass}>
            {tabs.map((tab: any, idx: number) => {
              const isActive = activeIdx === idx;
              let activeTextClass = isLight ? 'text-indigo-600 font-bold' : 'text-indigo-400 font-bold';
              let inactiveTextClass = isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200';

              if (activePreset === 'neobrutalism') {
                activeTextClass = 'text-black font-extrabold';
                inactiveTextClass = 'text-slate-600 hover:text-black';
              } else if (activePreset === 'neon') {
                activeTextClass = 'text-[#00FFCC] font-bold drop-shadow-[0_0_8px_#00FFCC]';
              } else if (activePreset === 'claymorphism') {
                activeTextClass = 'text-rose-500 font-bold bg-white dark:bg-[#2A303C] rounded-xl shadow-sm';
              }

              return (
                <button
                  key={tab.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTabIndex(comp.id, idx);
                    if (isDesignMode) selectComponent(comp.id);
                  }}
                  className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative ${
                    isActive ? activeTextClass : inactiveTextClass
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && activePreset !== 'claymorphism' && (
                    <div 
                      className={`absolute bottom-0 left-0 right-0 ${
                        activePreset === 'neobrutalism' 
                          ? 'h-[3px] bg-black' 
                          : activePreset === 'neon'
                          ? 'h-0.5 bg-[#00FFCC] shadow-[0_0_8px_#00FFCC]'
                          : activePreset === 'skeuomorphism'
                          ? 'h-1 bg-amber-600 shadow-sm'
                          : 'h-0.5 bg-indigo-500 shadow-sm shadow-indigo-500'
                      }`} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {comp.childIds.map((cid, idx) => {
              if (idx === activeIdx || isDesignMode) {
                return <WidgetRenderer key={cid} componentId={cid} />;
              }
              return null;
            })}
          </div>
        </div>,
        true
      );
    }

    /* ══════════════════════════════════════════════
       TEXT WIDGET WITH TYPOGRAPHY & DATA BINDING
       ══════════════════════════════════════════════ */
    case 'Text': {
      let displayText = comp.properties.text ?? "Text Widget";
      if (comp.properties.dataBinding) {
        const binding = comp.properties.dataBinding;
        if (binding.includes('product') && apiDataCache.api_products) {
          displayText = apiDataCache.api_products[0]?.title || displayText;
        } else if (binding.includes('revenue') && apiDataCache.api_analytics) {
          displayText = `$${apiDataCache.api_analytics.revenue.toLocaleString()}`;
        }
      }

      const textColor = comp.properties.textColor || comp.properties.color?.replace('0xFF', '#') || (isLight ? '#0F172A' : tokens.textColor.replace('0xFF', '#'));
      const fontWeight = comp.properties.fontWeight === 'bold' ? 700 : (comp.properties.fontWeight || 400);

      return wrapWithSelection(
        <p 
          style={{
            fontFamily: comp.properties.fontFamily || tokens.fontFamily || 'Inter',
            fontSize: `${comp.properties.fontSize || 16}px`,
            fontWeight,
            fontStyle: comp.properties.fontStyle || 'normal',
            textDecoration: comp.properties.textDecoration || 'none',
            textAlign: comp.properties.textAlign || 'left',
            color: textColor,
            letterSpacing: comp.properties.letterSpacing ? `${comp.properties.letterSpacing}px` : undefined,
            ...getAnimationStyles()
          }}
        >
          {displayText}
        </p>
      );
    }

    /* ══════════════════════════════════════════════
       CONTAINER WIDGET
       ══════════════════════════════════════════════ */
    case 'Container': {
      const surfaceStyle = getPresetSurfaceStyle(
        comp.properties.backgroundColor,
        comp.properties.borderRadius,
        comp.properties.elevation
      );

      const layout = comp.layout || {};
      const layoutMode = layout.layoutMode || 'flex';
      const sizingMode = layout.sizingMode || (comp.properties.sizeModeWidth === 'fixed' ? 'fixed' : 'auto');

      // Width calculation
      let widthStyle: string | number | undefined = undefined;
      if (sizingMode === 'fill' || comp.properties.sizeModeWidth === 'fill') {
        widthStyle = '100%';
      } else if (sizingMode === 'hug' || comp.properties.sizeModeWidth === 'auto') {
        widthStyle = 'fit-content';
      } else if (layout.width) {
        widthStyle = `${layout.width}px`;
      } else if (comp.properties.width) {
        widthStyle = `${comp.properties.width}px`;
      }

      // Height calculation
      let heightStyle: string | number | undefined = undefined;
      if (sizingMode === 'fill' || comp.properties.sizeModeHeight === 'fill') {
        heightStyle = '100%';
      } else if (layout.height) {
        heightStyle = `${layout.height}px`;
      } else if (comp.properties.height) {
        heightStyle = `${comp.properties.height}px`;
      }

      // Layout mode: Flex, Grid, Stack, Absolute
      let layoutStyles: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
      if (layoutMode === 'grid') {
        layoutStyles = {
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${comp.properties.gridMinItemWidth || 130}px, 1fr))`,
          gap: `${comp.properties.spacing || 12}px`
        };
      } else if (layoutMode === 'stack') {
        layoutStyles = {
          display: 'block',
          position: 'relative'
        };
      } else if (layoutMode === 'flex') {
        const isRow = comp.properties.direction === 'horizontal' || comp.properties.direction === 'row';
        const isLandscapeAdaptive = orientation === 'landscape' && orientationPolicy === 'adaptive';
        if (isLandscapeAdaptive && !isRow && comp.childIds.length >= 2) {
          layoutStyles = {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: `${comp.properties.spacing || 12}px`
          };
        } else {
          layoutStyles = {
            display: 'flex',
            flexDirection: isRow ? 'row' : 'column',
            alignItems: comp.properties.crossAxisAlignment === 'center' ? 'center' : 'stretch',
            justifyContent: comp.properties.mainAxisAlignment === 'center' ? 'center' : 'flex-start',
            gap: `${comp.properties.spacing || 8}px`
          };
        }
      }

      return wrapWithSelection(
        <div 
          className="transition-all relative"
          style={{
            ...layoutStyles,
            width: widthStyle,
            height: heightStyle,
            minWidth: layout.minWidth ? `${layout.minWidth}px` : undefined,
            maxWidth: layout.maxWidth ? `${layout.maxWidth}px` : undefined,
            minHeight: layout.minHeight ? `${layout.minHeight}px` : undefined,
            maxHeight: layout.maxHeight ? `${layout.maxHeight}px` : undefined,
            paddingTop: `${comp.properties.paddingTop ?? comp.properties.padding ?? 16}px`,
            paddingRight: `${comp.properties.paddingRight ?? comp.properties.padding ?? 16}px`,
            paddingBottom: `${comp.properties.paddingBottom ?? comp.properties.padding ?? 16}px`,
            paddingLeft: `${comp.properties.paddingLeft ?? comp.properties.padding ?? 16}px`,
            marginTop: `${comp.properties.marginTop ?? comp.properties.margin ?? 0}px`,
            marginRight: `${comp.properties.marginRight ?? comp.properties.margin ?? 0}px`,
            marginBottom: `${comp.properties.marginBottom ?? comp.properties.margin ?? 0}px`,
            marginLeft: `${comp.properties.marginLeft ?? comp.properties.margin ?? 0}px`,
            ...surfaceStyle,
            ...(comp.properties.borderWidth ? { borderWidth: `${comp.properties.borderWidth}px` } : {}),
            ...(comp.properties.borderColor ? { borderColor: comp.properties.borderColor.replace('0xFF', '#') } : {}),
            ...getAnimationStyles()
          }}
        >
          {comp.childIds.map((cid) => (
            <WidgetRenderer key={cid} componentId={cid} />
          ))}
          {comp.childIds.length === 0 && isDesignMode && (
            <div className={`p-4 border-2 border-dashed ${isLight ? 'border-slate-300 text-slate-500' : 'border-white/20 text-slate-400'} rounded-lg text-center text-xs w-full`}>
              Empty Container ({layoutMode.toUpperCase()} mode). Drop widgets here.
            </div>
          )}
        </div>,
        true
      );
    }

    /* ══════════════════════════════════════════════
       CARD WIDGET
       ══════════════════════════════════════════════ */
    case 'Card': {
      const surfaceStyle = getPresetSurfaceStyle(
        comp.properties.backgroundColor,
        comp.properties.borderRadius,
        comp.properties.elevation
      );

      return wrapWithSelection(
        <div 
          onClick={(e) => {
            if (comp.properties.action === 'navigate' && comp.properties.targetScreen) {
              setActiveScreen(comp.properties.targetScreen);
            }
          }}
          className="relative w-full h-full overflow-hidden"
          style={{
            paddingTop: `${comp.properties.paddingTop ?? comp.properties.padding ?? 16}px`,
            paddingRight: `${comp.properties.paddingRight ?? comp.properties.padding ?? 16}px`,
            paddingBottom: `${comp.properties.paddingBottom ?? comp.properties.padding ?? 16}px`,
            paddingLeft: `${comp.properties.paddingLeft ?? comp.properties.padding ?? 16}px`,
            ...surfaceStyle,
            ...getAnimationStyles()
          }}
        >
          {comp.childIds.map((cid) => (
            <WidgetRenderer key={cid} componentId={cid} />
          ))}
        </div>,
        true
      );
    }

    /* ══════════════════════════════════════════════
       DRAWER WIDGET (STANDALONE)
       ══════════════════════════════════════════════ */
    case 'Drawer': {
      const headerTitle = comp.properties.drawerHeaderTitle || comp.properties.headerTitle || project.metadata.name || "Suryaa App";
      const headerSubtitle = comp.properties.drawerHeaderSubtitle || comp.properties.headerSubtitle || "operator@suryaa.io";
      const avatarText = comp.properties.drawerAvatarText || "SP";

      return wrapWithSelection(
        <div 
          onClick={handleClick}
          className="w-full max-w-xs rounded-2xl overflow-hidden border border-[#232A3B] shadow-xl bg-[#111520] text-white flex flex-col my-2 select-none"
        >
          <div className="p-4 bg-gradient-to-tr from-indigo-900 to-purple-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-sm">
              {avatarText}
            </div>
            <div className="flex-1 truncate">
              <div className="font-bold text-sm truncate">{headerTitle}</div>
              <div className="text-[11px] text-indigo-200 truncate">{headerSubtitle}</div>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-1">Navigation Drawer Preview</div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-medium">
              <Menu className="w-4 h-4 shrink-0" />
              <span>Full sidebar drawer configured</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleEmulatorDrawer();
              }}
              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
            >
              <Eye className="w-3.5 h-3.5" /> Toggle Full Drawer in Emulator
            </button>
          </div>
        </div>,
        true
      );
    }

    /* ══════════════════════════════════════════════
       BUTTON WIDGET
       ══════════════════════════════════════════════ */
    case 'ElevatedButton': {
      const buttonStyle = getPresetButtonStyle(comp.properties.backgroundColor?.replace('0xFF', '#'));
      return wrapWithSelection(
        <button 
          onClick={(e) => {
            if (comp.properties.action === 'navigate' && comp.properties.targetScreen) {
              setActiveScreen(comp.properties.targetScreen);
              return;
            }
            if (isRuntimeMode) {
              alert(`Action '${comp.properties.action || 'button_tap'}' executed in Runtime mode!`);
            }
          }}
          className="px-4 py-2.5 text-sm transition-all text-center w-full active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
          style={{
            ...buttonStyle,
            fontFamily: comp.properties.fontFamily || tokens.fontFamily || 'Inter',
            ...getAnimationStyles()
          }}
        >
          {comp.properties.label || "Action Button"}
        </button>
      );
    }

    /* ══════════════════════════════════════════════
       TEXT FIELD WIDGET
       ══════════════════════════════════════════════ */
    case 'TextField': {
      const currentVal = runtimeInputValues[comp.id] ?? "";
      const inputStyle = getPresetInputStyle();
      const labelColor = activePreset === 'neobrutalism' ? '#000000' : (isLight ? '#334155' : '#CBD5E1');

      return wrapWithSelection(
        <div className="w-full space-y-1">
          {comp.properties.labelText && (
            <label 
              className="block text-xs font-semibold"
              style={{ color: labelColor }}
            >
              {comp.properties.labelText}
            </label>
          )}
          <input 
            type={comp.properties.isPassword ? "password" : "text"} 
            placeholder={comp.properties.hintText || "Type something..."}
            value={isRuntimeMode ? currentVal : (comp.properties.value || "")}
            onChange={(e) => {
              if (isRuntimeMode) {
                setRuntimeInputValue(comp.id, e.target.value);
              }
            }}
            readOnly={!isRuntimeMode}
            className={`w-full px-3 py-2 text-xs focus:outline-none transition-all ${isRuntimeMode ? 'cursor-text' : 'cursor-default'}`}
            style={{
              ...inputStyle,
              fontFamily: tokens.fontFamily || 'Inter'
            }}
          />
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       VIDEO PLAYER
       ══════════════════════════════════════════════ */
    case 'VideoPlayer': {
      const videoUrl = comp.properties.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      return wrapWithSelection(
        <div 
          className="w-full rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg relative"
          style={{ aspectRatio: comp.properties.aspectRatio === '4:3' ? '4/3' : '16/9', ...getAnimationStyles() }}
        >
          <video
            src={videoUrl}
            controls={comp.properties.showControls !== false}
            autoPlay={comp.properties.autoPlay || false}
            loop={comp.properties.loop || false}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] flex items-center gap-1 font-mono">
            <Video className="w-2.5 h-2.5 text-indigo-400" />
            Flutter Stream
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       KPI CARD (16 STYLES)
       ══════════════════════════════════════════════ */
    case 'KPICard': {
      let val = comp.properties.value || "$84,230";
      if (comp.properties.dataBinding && apiDataCache.api_analytics) {
        val = `$${apiDataCache.api_analytics.revenue.toLocaleString()}`;
      }
      const kpiType = comp.properties.kpiType || 'trend';
      const surfaceStyle = getPresetSurfaceStyle(
        comp.properties.backgroundColor,
        comp.properties.borderRadius,
        comp.properties.elevation
      );
      const titleColor = activePreset === 'neobrutalism' ? '#000000' : (isLight ? '#64748B' : '#94A3B8');
      const valColor = activePreset === 'neobrutalism' ? '#000000' : (isLight ? '#0F172A' : '#FFFFFF');

      // Adaptive padding and font sizes based on layout width and height
      const rawCardW = comp.layout?.width;
      const rawCardH = comp.layout?.height;
      const cardW = typeof rawCardW === 'number' ? rawCardW : (typeof rawCardW === 'string' && !isNaN(Number(rawCardW)) ? Number(rawCardW) : undefined);
      const cardH = typeof rawCardH === 'number' ? rawCardH : (typeof rawCardH === 'string' && !isNaN(Number(rawCardH)) ? Number(rawCardH) : undefined);

      const isCompact = (cardW !== undefined && cardW < 160) || (cardH !== undefined && cardH < 130);
      const isTiny = (cardW !== undefined && cardW < 120) || (cardH !== undefined && cardH < 95);
      const isMicro = (cardW !== undefined && cardW < 80) || (cardH !== undefined && cardH < 65);

      const padding = isMicro ? 'p-1' : isTiny ? 'p-2' : isCompact ? 'p-2.5' : 'p-4';
      const valFontSize = isMicro ? 'text-[11px]' : isTiny ? 'text-xs' : isCompact ? 'text-sm' : 'text-xl';
      const titleFontSize = isMicro ? 'text-[8px]' : isTiny ? 'text-[9px]' : isCompact ? 'text-[10px]' : 'text-xs';

      if (kpiType === 'progress') {
        return wrapWithSelection(
          <div 
            onClick={() => {
              if (comp.properties.action === 'navigate' && comp.properties.targetScreen) {
                setActiveScreen(comp.properties.targetScreen);
              }
            }}
            className={`${padding} space-y-1.5 relative w-full h-full overflow-hidden flex flex-col justify-between`}
            style={{ ...surfaceStyle, ...getAnimationStyles() }}
          >
            <div className={`flex items-center justify-between ${titleFontSize}`} style={{ color: titleColor }}>
              <span className="font-semibold truncate">{comp.properties.title || "Project Progress"}</span>
              {!isMicro && <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
            </div>
            <div className={`${valFontSize} font-extrabold truncate`} style={{ color: valColor }}>{val}</div>
            <div className="space-y-1">
              <div className={`h-2 w-full rounded-full ${isLight ? 'bg-slate-200' : 'bg-slate-800'} overflow-hidden border ${activePreset === 'neobrutalism' ? 'border-2 border-black' : 'border-transparent'}`}>
                <div 
                  className={`h-full rounded-full w-3/4 ${activePreset === 'neobrutalism' ? 'bg-[#FFE600]' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                />
              </div>
              {!isTiny && !isMicro && (
                <span className="text-[9px] font-mono block truncate" style={{ color: titleColor }}>
                  75% achieved
                </span>
              )}
            </div>
          </div>
        );
      }

      return wrapWithSelection(
        <div 
          onClick={() => {
            if (comp.properties.action === 'navigate' && comp.properties.targetScreen) {
              setActiveScreen(comp.properties.targetScreen);
            }
          }} 
          className={`${padding} space-y-1 relative w-full h-full overflow-hidden flex flex-col justify-between`}
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className={`flex items-center justify-between ${titleFontSize}`} style={{ color: titleColor }}>
            <span className="font-semibold truncate">{comp.properties.title || "Total Revenue"}</span>
            {!isMicro && <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
          </div>
          <div className={`${valFontSize} font-extrabold truncate`} style={{ color: valColor }}>{val}</div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 truncate">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>{comp.properties.trend || "+14.8%"}</span>
            {!isTiny && !isMicro && <span className="font-normal truncate" style={{ color: titleColor }}>vs last month</span>}
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       SIX-CHART ENGINE: LINE, BAR, PIE SVG
       ══════════════════════════════════════════════ */
    /* ══════════════════════════════════════════════
       ADVANCED MULTI-AXIS CHART & TELEMETRY STUDIO
       ══════════════════════════════════════════════ */
    case 'MultiAxisChart':
    case 'LineChart': {
      const surfaceStyle = getPresetSurfaceStyle();
      const chartHeaderColor = activePreset === 'neobrutalism' ? '#000000' : (isLight ? '#1E293B' : '#E2E8F0');
      const chartType = comp.properties.chartType || 'line';
      const xAxisTitle = comp.properties.xAxisTitle || 'Time (UTC)';
      const yAxisTitle = comp.properties.yAxisTitle || 'Primary (PSI)';
      const yAxisSecondaryTitle = comp.properties.yAxisSecondaryTitle || 'Secondary (°C)';
      const showSecondary = comp.properties.showSecondaryYAxis !== false;
      const showLegend = comp.properties.showLegend !== false;

      // Multi-Series data
      const defaultSeries = [
        { id: 's1', name: 'Pressure L1', color: '#6366F1', data: [35, 60, 48, 85, 92, 74], yAxis: 'left', curve: 'smooth' },
        { id: 's2', name: 'Temperature', color: '#10B981', data: [18, 24, 30, 26, 34, 38], yAxis: 'right', curve: 'smooth' }
      ];
      const seriesList: Array<{
        id: string;
        name: string;
        color: string;
        data: number[];
        yAxis?: 'left' | 'right';
        curve?: string;
      }> = (comp.properties.series && comp.properties.series.length > 0) ? comp.properties.series : defaultSeries;

      const rawLabels = comp.properties.xAxisLabels;
      const xLabels: string[] = Array.isArray(rawLabels) && rawLabels.length > 0 
        ? rawLabels 
        : ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

      const width = 320;
      const height = 120;
      const padLeft = 28;
      const padRight = showSecondary ? 28 : 12;
      const padTop = 12;
      const padBottom = 22;
      const plotW = width - padLeft - padRight;
      const plotH = height - padTop - padBottom;

      return wrapWithSelection(
        <div 
          className="p-4 space-y-3 relative transition-all"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: chartHeaderColor }}>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{comp.properties.title || "Multi-Axis Telemetry Curve"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                activePreset === 'neobrutalism'
                  ? 'bg-[#FFE600] text-black font-bold border-2 border-black'
                  : isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {chartType} · fl_chart
              </span>
            </div>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
              {seriesList.map((s, idx) => (
                <div key={s.id || idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>{s.name}</span>
                  <span className="text-[9px] text-slate-500">({s.yAxis === 'right' ? 'R-Axis' : 'L-Axis'})</span>
                </div>
              ))}
            </div>
          )}

          {/* SVG Chart Engine */}
          <div className="h-40 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              <defs>
                {seriesList.map((s, idx) => (
                  <linearGradient key={`grad_${comp.id}_${s.id || idx}`} id={`grad_${comp.id}_${s.id || idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={isLight ? 0.35 : 0.45} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((pct, i) => {
                const y = padTop + plotH * pct;
                return (
                  <line 
                    key={i} 
                    x1={padLeft} 
                    y1={y} 
                    x2={width - padRight} 
                    y2={y} 
                    stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"} 
                    strokeDasharray={pct < 1 ? "3 3" : undefined} 
                  />
                );
              })}

              {/* Left Y Axis Label */}
              <text 
                x={padLeft - 4} 
                y={padTop + 4} 
                textAnchor="end" 
                fontSize="7" 
                fill={isLight ? "#64748B" : "#94A3B8"} 
                fontFamily="monospace"
              >
                {yAxisTitle}
              </text>

              {/* Right Y Axis Label if enabled */}
              {showSecondary && (
                <text 
                  x={width - padRight + 4} 
                  y={padTop + 4} 
                  textAnchor="start" 
                  fontSize="7" 
                  fill={isLight ? "#64748B" : "#94A3B8"} 
                  fontFamily="monospace"
                >
                  {yAxisSecondaryTitle}
                </text>
              )}

              {/* Series Renderers */}
              {chartType === 'bar' ? (
                // Grouped Bar Chart
                xLabels.map((_, xIdx) => {
                  const numSeries = seriesList.length;
                  const groupW = plotW / xLabels.length;
                  const barW = Math.max(3, (groupW * 0.6) / numSeries);
                  const startX = padLeft + xIdx * groupW + groupW * 0.2;

                  return (
                    <g key={xIdx}>
                      {seriesList.map((s, sIdx) => {
                        const val = s.data[xIdx] ?? 0;
                        const maxVal = Math.max(...s.data, 100);
                        const normH = Math.min(plotH, Math.max(4, (val / maxVal) * plotH));
                        const bx = startX + sIdx * barW;
                        const by = padTop + plotH - normH;

                        return (
                          <rect
                            key={s.id || sIdx}
                            x={bx}
                            y={by}
                            width={barW - 1}
                            height={normH}
                            fill={s.color}
                            rx={2}
                          />
                        );
                      })}
                    </g>
                  );
                })
              ) : (
                // Line / Area Curves
                seriesList.map((s, sIdx) => {
                  const data = s.data.length > 0 ? s.data : [10, 40, 25, 70, 85, 60];
                  const maxVal = Math.max(...data, 100);
                  const points = data.map((val, idx) => {
                    const x = padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
                    const y = padTop + plotH - (val / maxVal) * plotH;
                    return { x, y };
                  });

                  if (points.length === 0) return null;

                  // Create smooth SVG cubic bezier path
                  let pathD = `M ${points[0].x} ${points[0].y}`;
                  for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[i];
                    const p1 = points[i + 1];
                    const cx = (p0.x + p1.x) / 2;
                    pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                  }

                  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`;

                  return (
                    <g key={s.id || sIdx}>
                      {/* Optional area fill */}
                      <path 
                        d={areaD} 
                        fill={`url(#grad_${comp.id}_${s.id || sIdx})`} 
                      />
                      {/* Stroke line */}
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke={s.color} 
                        strokeWidth={activePreset === 'neobrutalism' ? '3' : '2.5'} 
                        strokeLinecap="round" 
                      />
                      {/* Data Dots */}
                      {points.map((pt, pIdx) => (
                        <circle 
                          key={pIdx} 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="3" 
                          fill={s.color} 
                          stroke={isLight ? "#FFFFFF" : "#0F172A"} 
                          strokeWidth="1.5" 
                        />
                      ))}
                    </g>
                  );
                })
              )}

              {/* Bottom X-Axis line */}
              <line 
                x1={padLeft} 
                y1={padTop + plotH} 
                x2={width - padRight} 
                y2={padTop + plotH} 
                stroke={isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"} 
              />
            </svg>
          </div>

          {/* X Axis Labels & Title */}
          <div className="space-y-1">
            <div className={`flex items-center justify-between text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-mono px-2`}>
              {xLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
            {xAxisTitle && (
              <div className="text-center text-[9px] font-mono text-slate-500">
                {xAxisTitle}
              </div>
            )}
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       CIRCULAR GAUGE COMPONENT
       ══════════════════════════════════════════════ */
    case 'CircularGauge': {
      const surfaceStyle = getPresetSurfaceStyle();
      const val = Number(comp.properties.value ?? 74);
      const min = Number(comp.properties.min ?? 0);
      const max = Number(comp.properties.max ?? 100);
      const unit = comp.properties.unit || 'PSI';
      const title = comp.properties.title || 'Pressure Gauge';
      const color = comp.properties.color || '#6366F1';
      const showNeedle = comp.properties.showNeedle !== false;

      // Calculate percentage clamped 0..1
      const pct = Math.min(1, Math.max(0, (val - min) / Math.max(1, max - min)));
      const radius = 48;
      const circumference = 2 * Math.PI * radius; // ~301.6
      // Use 270 degree arc (0.75 of circle)
      const arcLength = circumference * 0.75;
      const strokeDashoffset = arcLength * (1 - pct);
      const needleAngle = -135 + pct * 270;

      return wrapWithSelection(
        <div 
          className="p-4 flex flex-col items-center justify-center relative transition-all"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className="text-xs font-semibold mb-2 self-start flex items-center gap-1.5" style={{ color: isLight ? '#1E293B' : '#E2E8F0' }}>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>{title}</span>
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 120 120">
              <defs>
                <linearGradient id={`gaugeGrad_${comp.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>

              {/* Background Track Arc (270 degrees) */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}
                strokeWidth="8"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(135 60 60)"
              />

              {/* Progress Arc */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={`url(#gaugeGrad_${comp.id})`}
                strokeWidth="8"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(135 60 60)"
                className="transition-all duration-500 ease-out"
              />

              {/* Needle */}
              {showNeedle && (
                <g transform={`rotate(${needleAngle} 60 60)`}>
                  <line 
                    x1="60" 
                    y1="60" 
                    x2="60" 
                    y2="22" 
                    stroke={activePreset === 'neobrutalism' ? '#000000' : '#F43F5E'} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                  <circle cx="60" cy="60" r="4" fill={activePreset === 'neobrutalism' ? '#000000' : '#FFFFFF'} />
                </g>
              )}
            </svg>

            {/* Center Value Readout */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className={`text-xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {val}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase -mt-0.5">
                {unit}
              </span>
            </div>
          </div>

          {/* Min / Max Labels */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 px-4 mt-1">
            <span>{min}</span>
            <span className="text-indigo-400 font-semibold">{Math.round(pct * 100)}%</span>
            <span>{max}</span>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       ARC GAUGE (180° SPEEDOMETER)
       ══════════════════════════════════════════════ */
    case 'ArcGauge': {
      const surfaceStyle = getPresetSurfaceStyle();
      const val = Number(comp.properties.value ?? 6200);
      const min = Number(comp.properties.min ?? 0);
      const max = Number(comp.properties.max ?? 8000);
      const unit = comp.properties.unit || 'RPM';
      const title = comp.properties.title || 'Engine Speed';
      const color = comp.properties.color || '#10B981';

      const pct = Math.min(1, Math.max(0, (val - min) / Math.max(1, max - min)));
      const needleAngle = -90 + pct * 180;

      return wrapWithSelection(
        <div 
          className="p-4 flex flex-col items-center justify-center relative transition-all"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className="text-xs font-semibold mb-1 self-start flex items-center gap-1.5" style={{ color: isLight ? '#1E293B' : '#E2E8F0' }}>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{title}</span>
          </div>

          <div className="relative w-44 h-28 flex items-center justify-center overflow-visible">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 160 100">
              <defs>
                <linearGradient id={`arcGrad_${comp.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              {/* Background semi-circle track */}
              <path
                d="M 20 85 A 60 60 0 0 1 140 85"
                fill="none"
                stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Multi-colored active arc */}
              <path
                d="M 20 85 A 60 60 0 0 1 140 85"
                fill="none"
                stroke={`url(#arcGrad_${comp.id})`}
                strokeWidth="10"
                strokeDasharray="188.5"
                strokeDashoffset={188.5 * (1 - pct)}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />

              {/* Needle pointer */}
              <g transform={`rotate(${needleAngle} 80 85)`}>
                <line 
                  x1="80" 
                  y1="85" 
                  x2="80" 
                  y2="30" 
                  stroke={activePreset === 'neobrutalism' ? '#000000' : '#FFFFFF'} 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                <circle cx="80" cy="85" r="5" fill={activePreset === 'neobrutalism' ? '#000000' : color} />
              </g>
            </svg>

            {/* Bottom Value Readout */}
            <div className="absolute bottom-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {val.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {unit}
              </span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 px-4 mt-2">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       COMPACT METRIC KPI BOX
       ══════════════════════════════════════════════ */
    case 'MetricCardCompact': {
      const surfaceStyle = getPresetSurfaceStyle();
      const title = comp.properties.title || 'Daily Revenue';
      const val = comp.properties.value || '$12,450';
      const trend = comp.properties.trend || '+18.2%';
      const isPositive = comp.properties.trendPositive !== false;
      const color = comp.properties.color || '#6366F1';

      return wrapWithSelection(
        <div 
          className="p-3.5 space-y-2 relative transition-all rounded-xl"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span className="truncate">{title}</span>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-xl font-bold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {val}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded ${
              isPositive 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-rose-400 bg-rose-500/10'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend}</span>
            </div>
          </div>

          {/* Inline mini sparkline */}
          <div className="h-6 w-full pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d="M 0 18 Q 20 6, 40 14 T 70 4 T 100 8"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       RADIAL PROGRESS KPI BOX
       ══════════════════════════════════════════════ */
    case 'RadialProgressBox': {
      const surfaceStyle = getPresetSurfaceStyle();
      const title = comp.properties.title || 'Storage Used';
      const val = Number(comp.properties.value ?? 78);
      const max = Number(comp.properties.max ?? 100);
      const subtitle = comp.properties.subtitle || '780 GB of 1 TB';
      const color = comp.properties.color || '#06B6D4';

      const pct = Math.min(100, Math.max(0, (val / max) * 100));
      const radius = 22;
      const circ = 2 * Math.PI * radius; // ~138.2
      const offset = circ * (1 - pct / 100);

      return wrapWithSelection(
        <div 
          className="p-3.5 flex items-center gap-3.5 relative transition-all rounded-xl"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          {/* Radial Ring */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 54 54">
              <circle
                cx="27"
                cy="27"
                r={radius}
                fill="none"
                stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}
                strokeWidth="4.5"
              />
              <circle
                cx="27"
                cy="27"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="4.5"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className={`absolute text-[11px] font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {Math.round(pct)}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className={`text-xs font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {title}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
              {subtitle}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] font-mono text-cyan-400 uppercase">Optimal</span>
            </div>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       SPARKLINE KPI BOX
       ══════════════════════════════════════════════ */
    case 'SparklineBox': {
      const surfaceStyle = getPresetSurfaceStyle();
      const title = comp.properties.title || 'Network Throughput';
      const val = comp.properties.value || '4.8 Gbps';
      const trend = comp.properties.trend || '+5.4%';
      const color = comp.properties.color || '#8B5CF6';

      return wrapWithSelection(
        <div 
          className="p-3.5 space-y-2 relative transition-all rounded-xl"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 truncate">{title}</span>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          </div>

          <div className={`text-lg font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {val}
          </div>

          <div className="h-10 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 140 36" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`sparkGrad_${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 30 L 0 24 Q 25 10, 50 18 T 90 6 T 140 12 L 140 36 L 0 36 Z"
                fill={`url(#sparkGrad_${comp.id})`}
              />
              <path
                d="M 0 24 Q 25 10, 50 18 T 90 6 T 140 12"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      );
    }

    /* ══════════════════════════════════════════════
       STATUS BEACON KPI BOX
       ══════════════════════════════════════════════ */
    case 'StatusBeaconBox': {
      const surfaceStyle = getPresetSurfaceStyle();
      const title = comp.properties.title || 'Cluster Master';
      const status = comp.properties.status || 'online';
      const code = comp.properties.code || '200 OK';
      const latency = comp.properties.latency || '12 ms';
      const region = comp.properties.region || 'us-east-1';

      const statusColor = status === 'online' 
        ? '#10B981' 
        : status === 'warning' 
        ? '#F59E0B' 
        : '#EF4444';

      return wrapWithSelection(
        <div 
          className="p-3.5 space-y-2 relative transition-all rounded-xl"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span 
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: statusColor }}
                />
                <span 
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ backgroundColor: statusColor }}
                />
              </span>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {title}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
              {region}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-mono font-bold" style={{ color: statusColor }}>
              {code}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ⚡ {latency}
            </span>
          </div>
        </div>
      );
    }

    case 'BarChart': {
      const surfaceStyle = getPresetSurfaceStyle();
      const chartHeaderColor = activePreset === 'neobrutalism' ? '#000000' : (isLight ? '#1E293B' : '#E2E8F0');

      return wrapWithSelection(
        <div 
          className="p-4 space-y-3 relative transition-all"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: chartHeaderColor }}>
            <span>{comp.properties.title || "Metrics Bar Chart"}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              activePreset === 'neobrutalism'
                ? 'bg-[#FFE600] text-black font-bold border-2 border-black'
                : isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              fl_chart
            </span>
          </div>
          <div className="h-32 flex items-end justify-between gap-3 px-2 pt-4">
            {[
              { h: '45%', val: '18k', label: 'Mon' },
              { h: '65%', val: '26k', label: 'Tue' },
              { h: '82%', val: '34k', label: 'Wed' },
              { h: '98%', val: '48k', label: 'Thu' },
              { h: '75%', val: '42k', label: 'Fri' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className={`text-[9px] font-mono ${isLight ? 'text-indigo-600' : 'text-indigo-300'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {bar.val}
                </span>
                <div 
                  className={`w-full transition-all shadow-md ${
                    activePreset === 'neobrutalism'
                      ? 'bg-[#FFE600] border-2 border-black rounded-none'
                      : activePreset === 'claymorphism'
                      ? 'bg-rose-400 rounded-t-xl shadow-inner'
                      : 'rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400'
                  }`}
                  style={{ height: bar.h }}
                />
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} font-mono`}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'PieChart': {
      const surfaceStyle = getPresetSurfaceStyle();
      const chartHeaderColor = activePreset === 'neobrutalism' ? '#000000' : (isLight ? '#1E293B' : '#E2E8F0');

      return wrapWithSelection(
        <div 
          className="p-4 space-y-3 relative transition-all"
          style={{ ...surfaceStyle, ...getAnimationStyles() }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: chartHeaderColor }}>
            <span>{comp.properties.title || "Category Distribution"}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              activePreset === 'neobrutalism'
                ? 'bg-[#FFE600] text-black font-bold border-2 border-black'
                : isLight ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              fl_chart
            </span>
          </div>
          <div className="h-32 flex items-center justify-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#6366F1" strokeWidth="5" strokeDasharray="45 100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="30 100" strokeDashoffset="-45" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray="15 100" strokeDashoffset="-75" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F43F5E" strokeWidth="5" strokeDasharray="10 100" strokeDashoffset="-90" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-xs font-bold ${activePreset === 'neobrutalism' ? 'text-black' : (isLight ? 'text-slate-900' : 'text-white')}`}>100%</span>
                <span className={`text-[8px] ${activePreset === 'neobrutalism' ? 'text-black' : (isLight ? 'text-slate-500' : 'text-slate-400')} uppercase`}>Total</span>
              </div>
            </div>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className={activePreset === 'neobrutalism' ? 'text-black font-bold' : (isLight ? 'text-slate-700' : 'text-slate-300')}>45% Mobile</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className={activePreset === 'neobrutalism' ? 'text-black font-bold' : (isLight ? 'text-slate-700' : 'text-slate-300')}>30% Web</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className={activePreset === 'neobrutalism' ? 'text-black font-bold' : (isLight ? 'text-slate-700' : 'text-slate-300')}>15% Desktop</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className={activePreset === 'neobrutalism' ? 'text-black font-bold' : (isLight ? 'text-slate-700' : 'text-slate-300')}>10% IoT</span></div>
            </div>
          </div>
        </div>
      );
    }

    case 'Column': {
      const isLandscapeAdaptive = orientation === 'landscape' && orientationPolicy === 'adaptive';
      const useLandscapeGrid = isLandscapeAdaptive && comp.childIds.length >= 2;

      return wrapWithSelection(
        <div 
          className={useLandscapeGrid 
            ? "grid grid-cols-2 gap-3 p-3 flex-1 overflow-y-auto items-start custom-scrollbar" 
            : "flex flex-col gap-3 p-3 flex-1 overflow-y-auto custom-scrollbar"
          }
          style={{
            alignItems: comp.properties.crossAxisAlignment === 'center' ? 'center' : 'stretch',
            justifyContent: comp.properties.mainAxisAlignment === 'center' ? 'center' : 'flex-start'
          }}
        >
          {comp.childIds.map((cid) => (
            <WidgetRenderer key={cid} componentId={cid} />
          ))}
          {comp.childIds.length === 0 && isDesignMode && (
            <div className={`p-4 border-2 border-dashed ${isLight ? 'border-slate-300 text-slate-500' : 'border-white/20 text-slate-400'} rounded-lg text-center text-xs`}>
              Empty Column. Drag widgets here.
            </div>
          )}
        </div>,
        true
      );
    }

    case 'Row': {
      return wrapWithSelection(
        <div 
          className="flex flex-row gap-2 items-center"
          style={{
            justifyContent: comp.properties.mainAxisAlignment === 'center' ? 'center' : 'flex-start'
          }}
        >
          {comp.childIds.map((cid) => (
            <WidgetRenderer key={cid} componentId={cid} />
          ))}
          {comp.childIds.length === 0 && isDesignMode && (
            <div className={`p-3 border-2 border-dashed ${isLight ? 'border-slate-300 text-slate-500' : 'border-white/20 text-slate-400'} rounded-lg text-center text-xs`}>
              Empty Row
            </div>
          )}
        </div>,
        true
      );
    }

    case 'ListView': {
      return wrapWithSelection(
        <div 
          className="flex flex-col gap-2 p-2 overflow-y-auto flex-1 custom-scrollbar"
          onWheel={(e) => e.stopPropagation()}
        >
          {comp.childIds.map((cid) => (
            <WidgetRenderer key={cid} componentId={cid} />
          ))}
          {comp.childIds.length === 0 && isDesignMode && (
            <div className={`p-4 border-2 border-dashed ${isLight ? 'border-indigo-300 text-indigo-600 bg-indigo-50/50' : 'border-indigo-500/30 text-indigo-300'} rounded-lg text-center text-xs`}>
              Empty ListView (Scrollable). Drag items here.
            </div>
          )}
        </div>,
        true
      );
    }

    case 'GridView': {
      const cols = comp.properties.crossAxisCount || 2;
      return wrapWithSelection(
        <div 
          className="grid gap-2.5 p-2 overflow-y-auto flex-1 custom-scrollbar"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          onWheel={(e) => e.stopPropagation()}
        >
          {comp.childIds.map((cid) => (
            <WidgetRenderer key={cid} componentId={cid} />
          ))}
          {comp.childIds.length === 0 && isDesignMode && (
            <div className={`col-span-full p-4 border-2 border-dashed ${isLight ? 'border-indigo-300 text-indigo-600 bg-indigo-50/50' : 'border-indigo-500/30 text-indigo-300'} rounded-lg text-center text-xs`}>
              Empty GridView ({cols} columns). Drag items here.
            </div>
          )}
        </div>,
        true
      );
    }

    case 'Image': {
      return wrapWithSelection(
        <div 
          className="w-full overflow-hidden rounded-lg bg-slate-800"
          style={{ height: `${comp.properties.height || 140}px`, ...getAnimationStyles() }}
        >
          <img 
            src={comp.properties.src || "https://picsum.photos/400/200"} 
            alt="Widget Preview"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    default:
      return wrapWithSelection(
        <div className="p-3 border border-white/10 rounded-lg text-xs text-slate-400">
          [{comp.type}]
          {comp.childIds.map((cid) => (
            <WidgetRenderer key={cid} componentId={cid} />
          ))}
        </div>,
        true
      );
  }
};
