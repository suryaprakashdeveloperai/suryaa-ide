import React, { useState } from 'react';
import { useEditorStore } from '../../core/store';
import { 
  Trash2, 
  Copy, 
  Sliders, 
  Type, 
  Box, 
  Sparkles, 
  Play, 
  Plus, 
  Video, 
  BarChart2, 
  Activity, 
  Layers,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Italic,
  Underline,
  Strikethrough,
  Database,
  Radio,
  Check,
  Eye,
  EyeOff,
  Link2,
  Unlink2,
  RotateCcw,
  AlertTriangle,
  Maximize2,
  Lock,
  Unlock,
  Zap,
  X,
  Menu,
  LogOut,
  User,
  Compass,
  ChevronRight,
  Smartphone
} from 'lucide-react';

const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Poppins",
  "Outfit",
  "Montserrat",
  "Lato",
  "Playfair Display",
  "JetBrains Mono",
  "Courier Prime"
];

const PRESET_COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Slate", hex: "#94A3B8" },
  { name: "Dark Slate", hex: "#1E293B" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Black", hex: "#000000" }
];

const DEFAULT_DRAWER_ITEMS = [
  { id: "item_home", label: "Dashboard", icon: "home", route: "/" },
  { id: "item_orders", label: "Orders & Cart", icon: "shopping_bag", route: "/orders" },
  { id: "item_telemetry", label: "Live Telemetry", icon: "activity", route: "/telemetry" },
  { id: "item_settings", label: "Settings", icon: "settings", route: "/settings" }
];

export const PropertyInspector: React.FC = () => {
  const { 
    project, 
    selectedComponentId, 
    inspectorWidth,
    updateComponentProperty,
    updateComponentLayout,
    toggleLockComponent,
    toggleHideComponent,
    updateComponentAnimation,
    removeComponent,
    duplicateComponent,
    testAnimation,
    testingAnimationId,
    isEmulatorDrawerOpen,
    toggleEmulatorDrawer,
    mode 
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'props' | 'layout' | 'animation'>('props');
  const [isPaddingLinked, setIsPaddingLinked] = useState(true);
  const [isMarginLinked, setIsMarginLinked] = useState(true);

  if (mode !== 'design' || !selectedComponentId || !project.components[selectedComponentId]) {
    return (
      <aside 
        style={{ width: `${inspectorWidth}px` }} 
        className="bg-[#111520] border-l border-[#232A3B] p-4 flex flex-col items-center justify-center text-center text-slate-500 select-none shrink-0"
      >
        <Sliders className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-xs font-medium text-slate-400">
          {mode !== 'design' ? 'Switch to Design mode to inspect' : 'No Component Selected'}
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Click any widget on the canvas to edit its typography, box model, colors, and live animations.
        </p>
      </aside>
    );
  }

  const comp = project.components[selectedComponentId];
  const props = comp.properties || {};
  const anim = comp.animation;
  const isTestingAnim = testingAnimationId === comp.id;

  const handleColorChange = (propKey: string, hex: string) => {
    updateComponentProperty(comp.id, propKey, hex);
  };

  const renderDrawerCustomizer = (targetComp: any) => {
    const p = targetComp.properties || {};
    const currentItems: any[] = p.drawerItems || p.items || DEFAULT_DRAWER_ITEMS;
    const showScreens = p.drawerShowScreens !== false;

    return (
      <div className="space-y-3 p-3 rounded-xl bg-[#131824] border border-indigo-500/20">
        {/* Header & Toggle Preview */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Menu className="w-3.5 h-3.5" /> Navigation Drawer Studio
          </span>
          <button
            type="button"
            onClick={toggleEmulatorDrawer}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              isEmulatorDrawerOpen
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow"
            }`}
          >
            {isEmulatorDrawerOpen ? <X className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {isEmulatorDrawerOpen ? "Close on Canvas" : "Preview on Canvas"}
          </button>
        </div>

        {/* 1. User Header Section */}
        <div className="space-y-2 pt-1 border-t border-[#232A3B]">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">
            User Header & Branding
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-400 block mb-0.5">Account / App Name</label>
              <input
                type="text"
                value={p.drawerHeaderTitle ?? p.headerTitle ?? project.metadata.name ?? ""}
                placeholder="Suryaa Studio"
                onChange={(e) => {
                  updateComponentProperty(targetComp.id, 'drawerHeaderTitle', e.target.value);
                  updateComponentProperty(targetComp.id, 'headerTitle', e.target.value);
                }}
                className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 block mb-0.5">Avatar Initials</label>
              <input
                type="text"
                maxLength={4}
                value={p.drawerAvatarText ?? p.avatarText ?? "SP"}
                placeholder="SP"
                onChange={(e) => updateComponentProperty(targetComp.id, 'drawerAvatarText', e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white uppercase text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-slate-400 block mb-0.5">Subtitle / Email / Role</label>
            <input
              type="text"
              value={p.drawerHeaderSubtitle ?? p.headerSubtitle ?? "operator@suryaa.io"}
              placeholder="operator@suryaa.io"
              onChange={(e) => {
                updateComponentProperty(targetComp.id, 'drawerHeaderSubtitle', e.target.value);
                updateComponentProperty(targetComp.id, 'headerSubtitle', e.target.value);
              }}
              className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[9px] text-slate-400 block mb-0.5">Avatar Image URL (Optional)</label>
            <input
              type="text"
              value={p.drawerAvatarUrl ?? ""}
              placeholder="https://images.unsplash.com/photo-..."
              onChange={(e) => updateComponentProperty(targetComp.id, 'drawerAvatarUrl', e.target.value)}
              className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[9px] text-slate-400 block mb-1">Header Theme Gradient</label>
            <div className="grid grid-cols-6 gap-1.5">
              {[
                { id: 'indigo', class: 'from-indigo-900 to-purple-900' },
                { id: 'emerald', class: 'from-emerald-900 to-teal-900' },
                { id: 'cyan', class: 'from-cyan-900 to-blue-900' },
                { id: 'purple', class: 'from-purple-900 to-pink-900' },
                { id: 'rose', class: 'from-rose-900 to-red-900' },
                { id: 'slate', class: 'from-slate-900 to-zinc-900' },
              ].map((grad) => {
                const isSelected = (p.drawerHeaderGradient || 'indigo') === grad.id;
                return (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => updateComponentProperty(targetComp.id, 'drawerHeaderGradient', grad.id)}
                    className={`h-6 rounded bg-gradient-to-r ${grad.class} border transition-all ${
                      isSelected ? 'border-white ring-2 ring-indigo-500 scale-105' : 'border-white/10 hover:border-white/40'
                    }`}
                    title={grad.id}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Menu Items Section */}
        <div className="space-y-2 pt-2 border-t border-[#232A3B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">
              Navigation Menu Items
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400">{showScreens ? "Auto Screens" : "Custom"}</span>
              <input
                type="checkbox"
                checked={!showScreens}
                onChange={(e) => updateComponentProperty(targetComp.id, 'drawerShowScreens', !e.target.checked)}
                className="accent-indigo-500 rounded"
                title="Switch to custom menu items"
              />
            </div>
          </div>

          {showScreens ? (
            <div className="p-2 rounded-lg bg-[#0F131D] border border-[#232A3B] space-y-1">
              <span className="text-[10px] text-indigo-300 font-medium block">
                Auto-listing all {project.screens.length} project screens:
              </span>
              {project.screens.map((scr) => (
                <div key={scr.id} className="flex items-center justify-between text-[11px] text-slate-300 px-1.5 py-0.5">
                  <span className="truncate">{scr.name}</span>
                  <span className="text-[9px] font-mono text-slate-500">{scr.route}</span>
                </div>
              ))}
              <div className="text-[9px] text-slate-400 mt-1 italic">
                Tip: Check "Custom" above to create bespoke menu items, custom icons, or external routes.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {currentItems.map((item, index) => (
                  <div key={item.id || index} className="p-2 rounded-lg bg-[#111520] border border-[#232A3B] space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.icon || 'home'}
                        onChange={(e) => {
                          const updated = [...currentItems];
                          updated[index] = { ...updated[index], icon: e.target.value };
                          updateComponentProperty(targetComp.id, 'drawerItems', updated);
                        }}
                        className="w-20 px-1 py-0.5 rounded bg-[#161B26] border border-[#232A3B] text-[10px] text-white"
                      >
                        <option value="home">Home</option>
                        <option value="activity">Activity</option>
                        <option value="shopping_bag">Orders</option>
                        <option value="settings">Settings</option>
                        <option value="users">Profile</option>
                        <option value="bell">Alerts</option>
                        <option value="server">Server</option>
                      </select>

                      <input
                        type="text"
                        value={item.label || ""}
                        placeholder="Item Label"
                        onChange={(e) => {
                          const updated = [...currentItems];
                          updated[index] = { ...updated[index], label: e.target.value };
                          updateComponentProperty(targetComp.id, 'drawerItems', updated);
                        }}
                        className="flex-1 px-1.5 py-0.5 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const updated = currentItems.filter((_, idx) => idx !== index);
                          updateComponentProperty(targetComp.id, 'drawerItems', updated);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Menu Item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={item.route || ""}
                        placeholder="Route /screen (e.g. /home)"
                        onChange={(e) => {
                          const updated = [...currentItems];
                          updated[index] = { ...updated[index], route: e.target.value };
                          updateComponentProperty(targetComp.id, 'drawerItems', updated);
                        }}
                        className="flex-1 px-1.5 py-0.5 rounded bg-[#161B26] border border-[#232A3B] text-[10px] font-mono text-indigo-300"
                      />
                      <input
                        type="text"
                        value={item.badge || ""}
                        placeholder="Badge"
                        onChange={(e) => {
                          const updated = [...currentItems];
                          updated[index] = { ...updated[index], badge: e.target.value };
                          updateComponentProperty(targetComp.id, 'drawerItems', updated);
                        }}
                        className="w-14 px-1.5 py-0.5 rounded bg-[#161B26] border border-[#232A3B] text-[9px] text-amber-300 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newItem = {
                    id: `item_${Date.now()}`,
                    label: `Link ${currentItems.length + 1}`,
                    icon: 'activity',
                    route: `/route_${currentItems.length + 1}`
                  };
                  updateComponentProperty(targetComp.id, 'drawerItems', [...currentItems, newItem]);
                }}
                className="w-full py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center justify-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" /> Add Navigation Item
              </button>
            </div>
          )}
        </div>

        {/* 3. Actions & Footer Section */}
        <div className="space-y-2 pt-2 border-t border-[#232A3B]">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">
            Footer & Actions
          </span>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-300 flex items-center gap-1.5">
              <LogOut className="w-3 h-3 text-rose-400" /> Show Sign Out / Logout Tile
            </label>
            <input
              type="checkbox"
              checked={p.drawerShowLogout !== false}
              onChange={(e) => updateComponentProperty(targetComp.id, 'drawerShowLogout', e.target.checked)}
              className="accent-indigo-500 rounded"
            />
          </div>

          {p.drawerShowLogout !== false && (
            <div>
              <label className="text-[9px] text-slate-400 block mb-0.5">Logout Button Label</label>
              <input
                type="text"
                value={p.drawerLogoutLabel ?? "Sign Out / Disconnect"}
                placeholder="Sign Out"
                onChange={(e) => updateComponentProperty(targetComp.id, 'drawerLogoutLabel', e.target.value)}
                className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
              />
            </div>
          )}

          <div>
            <label className="text-[9px] text-slate-400 block mb-0.5">Footer Status / Version Tag</label>
            <input
              type="text"
              value={p.drawerFooterText ?? "v3.0 • Production Build"}
              placeholder="v3.0 • Production Build"
              onChange={(e) => updateComponentProperty(targetComp.id, 'drawerFooterText', e.target.value)}
              className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside 
      style={{ width: `${inspectorWidth}px` }} 
      className="bg-[#111520] border-l border-[#232A3B] flex flex-col h-full select-none text-slate-200 shrink-0"
    >
      {/* 1. Inspector Header */}
      <div className="h-12 border-b border-[#232A3B] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-400 font-mono">{comp.type}</span>
          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[100px]">{comp.id}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleLockComponent(comp.id)}
            className={`p-1 rounded transition-colors ${comp.layout?.isLocked ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'}`}
            title={comp.layout?.isLocked ? "Unlock Component" : "Lock Component"}
          >
            {comp.layout?.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => toggleHideComponent(comp.id)}
            className={`p-1 rounded transition-colors ${comp.layout?.isHidden ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'}`}
            title={comp.layout?.isHidden ? "Unhide Component" : "Hide Component"}
          >
            {comp.layout?.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => duplicateComponent(comp.id)}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {comp.parentId && (
            <button
              onClick={() => removeComponent(comp.id)}
              className="p-1 text-slate-400 hover:text-rose-400 rounded"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Inspector Category Tabs */}
      <div className="flex border-b border-[#232A3B] bg-[#0E121C] text-xs font-medium shrink-0">
        <button
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'props' ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'layout' ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setActiveTab('animation')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'animation' ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Animation
        </button>
      </div>

      {/* 3. Tab Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* ══════════════════════════════════════════════
            TAB 1: PROPERTIES
            ══════════════════════════════════════════════ */}
        {activeTab === 'props' && (
          <div className="space-y-4">
            {/* 0. APPEARANCE & BACKGROUND COLOR (UNIVERSAL SELECTOR) */}
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Appearance & Colors
                </span>
                {props.backgroundColor && (
                  <button
                    onClick={() => updateComponentProperty(comp.id, 'backgroundColor', undefined)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    title="Reset to Theme Default"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Reset
                  </button>
                )}
              </div>

              {/* Background Color Picker */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">Background Color</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={props.backgroundColor?.startsWith('#') ? props.backgroundColor : (props.backgroundColor?.startsWith('0xFF') ? `#${props.backgroundColor.slice(4)}` : '#1E293B')}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-[#232A3B] bg-transparent cursor-pointer p-0.5"
                    title="Choose Custom Background Color"
                  />
                  <input
                    type="text"
                    placeholder="e.g. #1E293B or Theme Default"
                    value={props.backgroundColor || ''}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* 10 Instant Palette Swatches */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {[
                    { hex: '#6366F1', name: 'Indigo Primary' },
                    { hex: '#0F172A', name: 'Slate Dark' },
                    { hex: '#1E293B', name: 'Slate Surface' },
                    { hex: '#FFFFFF', name: 'Pure White' },
                    { hex: '#10B981', name: 'Emerald' },
                    { hex: '#EF4444', name: 'Rose Red' },
                    { hex: '#FFE600', name: 'Cyber Yellow' },
                    { hex: '#8B5CF6', name: 'Violet' },
                    { hex: '#06B6D4', name: 'Cyan' },
                    { hex: '#F97316', name: 'Amber Orange' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      onClick={() => handleColorChange('backgroundColor', c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 shadow-sm ${
                        props.backgroundColor === c.hex ? 'ring-2 ring-indigo-400 scale-110 border-white' : 'border-white/20'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* INTERACTION & MULTI-PAGE REDIRECTION */}
            {(comp.type === 'ElevatedButton' || comp.type === 'Card' || comp.type === 'Container' || comp.type === 'KPICard') && (
              <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Tap Action & Page Redirection
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">On Tap Trigger</label>
                  <select
                    value={props.action || 'none'}
                    onChange={(e) => updateComponentProperty(comp.id, 'action', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  >
                    <option value="none">None</option>
                    <option value="navigate">Navigate to Page / Screen</option>
                    <option value="api_call">Execute Backend API Call</option>
                    <option value="dialog">Show Alert Dialog</option>
                    <option value="snack_bar">Show Toast / SnackBar</option>
                  </select>
                </div>

                {props.action === 'navigate' && (
                  <div className="space-y-2 p-2.5 rounded-lg bg-[#111520] border border-[#232A3B]">
                    <label className="text-[10px] text-indigo-300 font-semibold block">Target Page to Open</label>
                    <select
                      value={props.targetScreen || (project.screens[0]?.id || '')}
                      onChange={(e) => {
                        const targetScr = project.screens.find(s => s.id === e.target.value);
                        updateComponentProperty(comp.id, 'targetScreen', e.target.value);
                        if (targetScr) {
                          updateComponentProperty(comp.id, 'targetRoute', targetScr.route);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white font-medium"
                    >
                      {project.screens.map((s) => (
                        <option key={s.id} value={s.id}>
                          📱 {s.name} ({s.route})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Navigator Route:</span>
                      <span className="font-mono text-indigo-300 font-bold">
                        {props.targetRoute || project.screens.find(s => s.id === props.targetScreen)?.route || '/'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SCAFFOLD / SCREEN ROOT SETTINGS */}
            {comp.type === 'Scaffold' && (
              <div className="p-3 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Screen Scaffold Settings
                </span>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300">Include App Bar</label>
                  <input
                    type="checkbox"
                    checked={props.showAppBar ?? true}
                    onChange={(e) => updateComponentProperty(comp.id, 'showAppBar', e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Navigation Sidebar</label>
                  <select
                    value={props.showDrawer || 'drawer'}
                    onChange={(e) => updateComponentProperty(comp.id, 'showDrawer', e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  >
                    <option value="none">None (Standard View)</option>
                    <option value="drawer">Left Standard Drawer (Sidebar)</option>
                    <option value="endDrawer">Right EndDrawer</option>
                    <option value="navigationRail">Vertical NavigationRail (Tablet/Desktop)</option>
                  </select>
                </div>

                {props.showDrawer !== 'none' && (
                  <div className="mt-3">
                    {renderDrawerCustomizer(comp)}
                  </div>
                )}
              </div>
            )}

            {/* STANDALONE DRAWER COMPONENT */}
            {comp.type === 'Drawer' && (
              <div className="p-3 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Navigation Drawer Studio
                </span>
                {renderDrawerCustomizer(comp)}
              </div>
            )}

            {/* APPBAR PROPERTIES */}
            {comp.type === 'AppBar' && (
              <div className="space-y-3 p-3 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                    AppBar Settings
                  </span>
                  {props.title ? (
                    <button
                      type="button"
                      onClick={() => updateComponentProperty(comp.id, 'title', '')}
                      className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                      title="Clear full title"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Title
                    </button>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 block">Title Text</label>
                    <span className="text-[9px] text-slate-500">Supports full deletion</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={props.title ?? ""}
                      placeholder="Suryaa App (empty = no title)"
                      onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 pr-8 rounded bg-[#111520] border border-[#232A3B] text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    {props.title && (
                      <button
                        type="button"
                        onClick={() => updateComponentProperty(comp.id, 'title', '')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                        title="Delete full name"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center pt-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={props.centerTitle ?? true}
                        onChange={(e) => updateComponentProperty(comp.id, 'centerTitle', e.target.checked)}
                        className="accent-indigo-500 rounded"
                      />
                      <span>Center Title</span>
                    </label>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Elevation</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={props.elevation ?? 4}
                      onChange={(e) => updateComponentProperty(comp.id, 'elevation', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Leading Icon</label>
                  <select
                    value={props.leadingIcon || "menu"}
                    onChange={(e) => updateComponentProperty(comp.id, 'leadingIcon', e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  >
                    <option value="menu">Menu Burger (Drawer)</option>
                    <option value="arrow_back">Back Arrow</option>
                    <option value="close">Close Icon</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Background Color */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={props.backgroundColor?.startsWith('#') ? props.backgroundColor : '#1E293B'}
                      onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={props.backgroundColor || "#1E293B"}
                      onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DRAWER & NAVIGATION RAIL PROPERTIES */}
            {(comp.type === 'Drawer' || comp.type === 'NavigationRail') && renderDrawerCustomizer(comp)}

            {/* ══════════════════════════════════════════════
                TEXT & TYPOGRAPHY SUITE
                ══════════════════════════════════════════════ */}
            {(comp.type === 'Text' || 'text' in props || comp.type === 'ElevatedButton' || comp.type === 'TextField') && (
              <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" /> Typography & Text
                  </span>
                </div>

                {/* Text Content */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {comp.type === 'ElevatedButton' ? 'Button Label' : comp.type === 'TextField' ? 'Hint Text' : 'Text Content'}
                  </label>
                  <textarea
                    rows={2}
                    value={props.text ?? props.label ?? props.hintText ?? ""}
                    onChange={(e) => {
                      const key = comp.type === 'ElevatedButton' ? 'label' : comp.type === 'TextField' ? 'hintText' : 'text';
                      updateComponentProperty(comp.id, key, e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Data Binding Path */}
                <div className="p-2 rounded-lg bg-[#0F131D] border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-indigo-300 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-indigo-400" />
                      Dynamic Data Stream Binding
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. api_products[0].title or revenue"
                    value={props.dataBinding || ""}
                    onChange={(e) => updateComponentProperty(comp.id, 'dataBinding', e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs font-mono text-indigo-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Font Family</label>
                  <select
                    value={props.fontFamily || "Inter"}
                    onChange={(e) => updateComponentProperty(comp.id, 'fontFamily', e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Font Size ({props.fontSize || 16}px)</label>
                    <input
                      type="range"
                      min="10"
                      max="64"
                      value={props.fontSize || 16}
                      onChange={(e) => updateComponentProperty(comp.id, 'fontSize', Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Font Weight</label>
                    <select
                      value={props.fontWeight || "normal"}
                      onChange={(e) => updateComponentProperty(comp.id, 'fontWeight', e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    >
                      <option value="300">Light (300)</option>
                      <option value="normal">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="bold">Bold (700)</option>
                      <option value="800">Extra-Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                </div>

                {/* Text Formatting Controls */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Text Alignment & Style</label>
                  <div className="flex items-center gap-1 bg-[#111520] p-1 rounded-lg border border-[#232A3B]">
                    <button
                      onClick={() => updateComponentProperty(comp.id, 'textAlign', 'left')}
                      className={`p-1.5 rounded text-xs ${props.textAlign === 'left' || !props.textAlign ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateComponentProperty(comp.id, 'textAlign', 'center')}
                      className={`p-1.5 rounded text-xs ${props.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateComponentProperty(comp.id, 'textAlign', 'right')}
                      className={`p-1.5 rounded text-xs ${props.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateComponentProperty(comp.id, 'textAlign', 'justify')}
                      className={`p-1.5 rounded text-xs ${props.textAlign === 'justify' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Justify"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-[#232A3B] mx-1" />
                    <button
                      onClick={() => updateComponentProperty(comp.id, 'fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={`p-1.5 rounded text-xs ${props.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateComponentProperty(comp.id, 'textDecoration', props.textDecoration === 'underline' ? 'none' : 'underline')}
                      className={`p-1.5 rounded text-xs ${props.textDecoration === 'underline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Text Color Picker & Presets */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Text Color</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={props.textColor?.startsWith('#') ? props.textColor : '#FFFFFF'}
                      onChange={(e) => handleColorChange('textColor', e.target.value)}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={props.textColor || "#FFFFFF"}
                      onChange={(e) => handleColorChange('textColor', e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => handleColorChange('textColor', c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110 ${props.textColor === c.hex ? 'ring-2 ring-indigo-400 scale-110' : ''}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTAINER / CARD PROPERTIES */}
            {(comp.type === 'Container' || comp.type === 'Card') && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Surface & Border
                </span>

                {/* Surface Background Color */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Surface Color</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={props.backgroundColor?.startsWith('#') ? props.backgroundColor : '#1E293B'}
                      onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={props.backgroundColor || "#1E293B"}
                      onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => handleColorChange('backgroundColor', c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className="w-4 h-4 rounded-full border border-white/20 hover:scale-110"
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Border Radius ({props.borderRadius ?? 12}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    value={props.borderRadius ?? 12}
                    onChange={(e) => updateComponentProperty(comp.id, 'borderRadius', Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Border Width & Color */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Border Width</label>
                    <input
                      type="number"
                      min="0"
                      max="8"
                      value={props.borderWidth ?? 1}
                      onChange={(e) => updateComponentProperty(comp.id, 'borderWidth', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Elevation</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={props.elevation ?? 2}
                      onChange={(e) => updateComponentProperty(comp.id, 'elevation', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TABBAR PROPERTIES */}
            {comp.type === 'TabBar' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Tab Items</span>
                  <button
                    onClick={() => {
                      const tabs = [...(props.tabs || [])];
                      tabs.push({ id: `tab_${tabs.length + 1}`, label: `Tab ${tabs.length + 1}` });
                      updateComponentProperty(comp.id, 'tabs', tabs);
                    }}
                    className="text-[10px] text-indigo-400 flex items-center gap-1 hover:underline font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Tab
                  </button>
                </div>

                <div className="space-y-2">
                  {(props.tabs || []).map((t: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={t.label}
                        onChange={(e) => {
                          const tabs = [...props.tabs];
                          tabs[idx].label = e.target.value;
                          updateComponentProperty(comp.id, 'tabs', tabs);
                        }}
                        className="flex-1 px-2.5 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                      />
                      {props.tabs.length > 1 && (
                        <button
                          onClick={() => {
                            const tabs = props.tabs.filter((_: any, i: number) => i !== idx);
                            updateComponentProperty(comp.id, 'tabs', tabs);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPI CARD PROPERTIES */}
            {comp.type === 'KPICard' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  KPI Card Config
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">KPI Title</label>
                  <input
                    type="text"
                    value={props.title ?? ""}
                    placeholder="Total Revenue"
                    onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Metric Value</label>
                  <input
                    type="text"
                    value={props.value ?? ""}
                    placeholder="$128,450"
                    onChange={(e) => updateComponentProperty(comp.id, 'value', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Trend (+/- %)</label>
                    <input
                      type="text"
                      value={props.trend ?? ""}
                      placeholder="+24.8%"
                      onChange={(e) => updateComponentProperty(comp.id, 'trend', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Trend Direction</label>
                    <select
                      value={props.trendDirection || "up"}
                      onChange={(e) => updateComponentProperty(comp.id, 'trendDirection', e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    >
                      <option value="up">Up (+)</option>
                      <option value="down">Down (-)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* MULTI-AXIS CHART STUDIO */}
            {(comp.type === 'MultiAxisChart' || comp.type === 'LineChart' || comp.type === 'BarChart') && (
              <div className="space-y-4 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> Chart Studio & Multi-Axis
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    fl_chart
                  </span>
                </div>

                {/* Chart Title & Type */}
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Chart Title</label>
                    <input
                      type="text"
                      value={props.title ?? ""}
                      placeholder="Telemetry Analytics"
                      onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Visualization Style</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['line', 'bar'].map((ct) => (
                        <button
                          key={ct}
                          onClick={() => updateComponentProperty(comp.id, 'chartType', ct)}
                          className={`py-1.5 px-2 rounded text-xs font-mono capitalize transition-all ${
                            (props.chartType || 'line') === ct
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-[#111520] text-slate-400 hover:text-white border border-[#232A3B]'
                          }`}
                        >
                          {ct === 'line' ? '📈 Line Curve' : '📊 Grouped Bar'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* X-AXIS CONFIGURATION */}
                <div className="space-y-2 p-2.5 rounded-lg bg-[#111520] border border-[#232A3B]">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                    X-Axis Axis & Labels
                  </span>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">X-Axis Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Time (UTC), Days, Categories"
                      value={props.xAxisTitle ?? ""}
                      onChange={(e) => updateComponentProperty(comp.id, 'xAxisTitle', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">
                      X-Axis Data Points (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(props.xAxisLabels) ? props.xAxisLabels.join(', ') : (props.xAxisLabels || '00:00, 04:00, 08:00, 12:00, 16:00, 20:00')}
                      onChange={(e) => {
                        const labels = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        updateComponentProperty(comp.id, 'xAxisLabels', labels);
                      }}
                      className="w-full px-2 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Y-AXIS CONFIGURATION (DUAL AXIS) */}
                <div className="space-y-2 p-2.5 rounded-lg bg-[#111520] border border-[#232A3B]">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Dual Y-Axis Settings
                  </span>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">Primary Y-Axis Label (Left)</label>
                    <input
                      type="text"
                      placeholder="e.g. Pressure (PSI)"
                      value={props.yAxisTitle ?? ""}
                      onChange={(e) => updateComponentProperty(comp.id, 'yAxisTitle', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-[10px] text-slate-300">Enable Secondary Y-Axis (Right)</label>
                    <input
                      type="checkbox"
                      checked={props.showSecondaryYAxis !== false}
                      onChange={(e) => updateComponentProperty(comp.id, 'showSecondaryYAxis', e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                  </div>

                  {props.showSecondaryYAxis !== false && (
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-0.5">Secondary Y-Axis Label (Right)</label>
                      <input
                        type="text"
                        placeholder="e.g. Temperature (°C)"
                        value={props.yAxisSecondaryTitle ?? ""}
                        onChange={(e) => updateComponentProperty(comp.id, 'yAxisSecondaryTitle', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* MULTI-SERIES DATA MANAGER */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      Data Series ({(props.series || []).length || 2})
                    </span>
                    <button
                      onClick={() => {
                        const existing = props.series ? [...props.series] : [
                          { id: 's1', name: 'Pressure L1', color: '#6366F1', data: [35, 60, 48, 85, 92, 74], yAxis: 'left' },
                          { id: 's2', name: 'Temperature', color: '#10B981', data: [18, 24, 30, 26, 34, 38], yAxis: 'right' }
                        ];
                        const colors = ['#EC4899', '#06B6D4', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6'];
                        const nextColor = colors[existing.length % colors.length];
                        const newSeries = {
                          id: `series_${Date.now()}`,
                          name: `Series ${existing.length + 1}`,
                          color: nextColor,
                          data: [25, 45, 65, 55, 80, 70],
                          yAxis: existing.length % 2 === 0 ? 'left' : 'right'
                        };
                        updateComponentProperty(comp.id, 'series', [...existing, newSeries]);
                      }}
                      className="text-[10px] text-indigo-400 flex items-center gap-1 hover:underline font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Add Series
                    </button>
                  </div>

                  {/* Series List */}
                  <div className="space-y-2">
                    {((props.series && props.series.length > 0) ? props.series : [
                      { id: 's1', name: 'Pressure L1', color: '#6366F1', data: [35, 60, 48, 85, 92, 74], yAxis: 'left' },
                      { id: 's2', name: 'Temperature', color: '#10B981', data: [18, 24, 30, 26, 34, 38], yAxis: 'right' }
                    ]).map((s: any, idx: number) => (
                      <div key={s.id || idx} className="p-2.5 rounded-lg bg-[#111520] border border-[#232A3B] space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={s.color}
                            onChange={(e) => {
                              const updated = [...(props.series || [
                                { id: 's1', name: 'Pressure L1', color: '#6366F1', data: [35, 60, 48, 85, 92, 74], yAxis: 'left' },
                                { id: 's2', name: 'Temperature', color: '#10B981', data: [18, 24, 30, 26, 34, 38], yAxis: 'right' }
                              ])];
                              updated[idx].color = e.target.value;
                              updateComponentProperty(comp.id, 'series', updated);
                            }}
                            className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => {
                              const updated = [...(props.series || [
                                { id: 's1', name: 'Pressure L1', color: '#6366F1', data: [35, 60, 48, 85, 92, 74], yAxis: 'left' },
                                { id: 's2', name: 'Temperature', color: '#10B981', data: [18, 24, 30, 26, 34, 38], yAxis: 'right' }
                              ])];
                              updated[idx].name = e.target.value;
                              updateComponentProperty(comp.id, 'series', updated);
                            }}
                            className="flex-1 px-2 py-0.5 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                          />
                          <select
                            value={s.yAxis || 'left'}
                            onChange={(e) => {
                              const updated = [...(props.series || [
                                { id: 's1', name: 'Pressure L1', color: '#6366F1', data: [35, 60, 48, 85, 92, 74], yAxis: 'left' },
                                { id: 's2', name: 'Temperature', color: '#10B981', data: [18, 24, 30, 26, 34, 38], yAxis: 'right' }
                              ])];
                              updated[idx].yAxis = e.target.value;
                              updateComponentProperty(comp.id, 'series', updated);
                            }}
                            className="px-1.5 py-0.5 rounded bg-[#161B26] border border-[#232A3B] text-[10px] text-slate-300 font-mono"
                          >
                            <option value="left">Left Y</option>
                            <option value="right">Right Y</option>
                          </select>
                          {(props.series || []).length > 1 && (
                            <button
                              onClick={() => {
                                const updated = props.series.filter((_: any, i: number) => i !== idx);
                                updateComponentProperty(comp.id, 'series', updated);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Numeric Data Points</label>
                          <input
                            type="text"
                            value={Array.isArray(s.data) ? s.data.join(', ') : s.data}
                            onChange={(e) => {
                              const nums = e.target.value.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
                              const updated = [...(props.series || [
                                { id: 's1', name: 'Pressure L1', color: '#6366F1', data: [35, 60, 48, 85, 92, 74], yAxis: 'left' },
                                { id: 's2', name: 'Temperature', color: '#10B981', data: [18, 24, 30, 26, 34, 38], yAxis: 'right' }
                              ])];
                              updated[idx].data = nums;
                              updateComponentProperty(comp.id, 'series', updated);
                            }}
                            className="w-full px-2 py-0.5 rounded bg-[#161B26] border border-[#232A3B] text-[11px] font-mono text-indigo-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Toggles */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span>Show Legend</span>
                  <input
                    type="checkbox"
                    checked={props.showLegend !== false}
                    onChange={(e) => updateComponentProperty(comp.id, 'showLegend', e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                </div>
              </div>
            )}

            {/* CIRCULAR GAUGE PROPERTIES */}
            {comp.type === 'CircularGauge' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Circular Gauge Config
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Gauge Title</label>
                  <input
                    type="text"
                    value={props.title ?? ""}
                    placeholder="Pressure Gauge"
                    onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Current Value</label>
                    <input
                      type="number"
                      value={props.value ?? 74}
                      onChange={(e) => updateComponentProperty(comp.id, 'value', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Unit</label>
                    <input
                      type="text"
                      value={props.unit ?? ""}
                      placeholder="PSI"
                      onChange={(e) => updateComponentProperty(comp.id, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Min Value</label>
                    <input
                      type="number"
                      value={props.min ?? 0}
                      onChange={(e) => updateComponentProperty(comp.id, 'min', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Max Value</label>
                    <input
                      type="number"
                      value={props.max ?? 100}
                      onChange={(e) => updateComponentProperty(comp.id, 'max', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs text-slate-300">Show Pointer Needle</label>
                  <input
                    type="checkbox"
                    checked={props.showNeedle !== false}
                    onChange={(e) => updateComponentProperty(comp.id, 'showNeedle', e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                </div>

                {/* Accent Color */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Gauge Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={props.color || '#6366F1'}
                      onChange={(e) => updateComponentProperty(comp.id, 'color', e.target.value)}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={props.color || '#6366F1'}
                      onChange={(e) => updateComponentProperty(comp.id, 'color', e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ARC GAUGE PROPERTIES */}
            {comp.type === 'ArcGauge' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> 180° Speedometer Arc Gauge
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Gauge Title</label>
                  <input
                    type="text"
                    value={props.title ?? ""}
                    placeholder="Engine Speed"
                    onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Reading Value</label>
                    <input
                      type="number"
                      value={props.value ?? 6200}
                      onChange={(e) => updateComponentProperty(comp.id, 'value', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Unit</label>
                    <input
                      type="text"
                      value={props.unit ?? ""}
                      placeholder="RPM"
                      onChange={(e) => updateComponentProperty(comp.id, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Min Limit</label>
                    <input
                      type="number"
                      value={props.min ?? 0}
                      onChange={(e) => updateComponentProperty(comp.id, 'min', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Max Limit</label>
                    <input
                      type="number"
                      value={props.max ?? 8000}
                      onChange={(e) => updateComponentProperty(comp.id, 'max', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* METRIC CARD COMPACT PROPERTIES */}
            {comp.type === 'MetricCardCompact' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Compact Metric Box Config
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Metric Title</label>
                  <input
                    type="text"
                    value={props.title ?? ""}
                    placeholder="Daily Revenue"
                    onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Value String</label>
                  <input
                    type="text"
                    value={props.value ?? ""}
                    placeholder="$12,450"
                    onChange={(e) => updateComponentProperty(comp.id, 'value', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Trend (+/- %)</label>
                    <input
                      type="text"
                      value={props.trend ?? ""}
                      placeholder="+18.2%"
                      onChange={(e) => updateComponentProperty(comp.id, 'trend', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Positive Trend</label>
                    <select
                      value={props.trendPositive !== false ? 'yes' : 'no'}
                      onChange={(e) => updateComponentProperty(comp.id, 'trendPositive', e.target.value === 'yes')}
                      className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    >
                      <option value="yes">Green (Gain)</option>
                      <option value="no">Red (Drop)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* RADIAL PROGRESS BOX PROPERTIES */}
            {comp.type === 'RadialProgressBox' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Radial Ring Progress Config
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={props.title ?? ""}
                    placeholder="Storage Used"
                    onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={props.subtitle ?? ""}
                    placeholder="780 GB of 1 TB"
                    onChange={(e) => updateComponentProperty(comp.id, 'subtitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Value ({props.value ?? 78})</label>
                    <input
                      type="number"
                      value={props.value ?? 78}
                      onChange={(e) => updateComponentProperty(comp.id, 'value', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Max ({props.max ?? 100})</label>
                    <input
                      type="number"
                      value={props.max ?? 100}
                      onChange={(e) => updateComponentProperty(comp.id, 'max', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STATUS BEACON BOX PROPERTIES */}
            {comp.type === 'StatusBeaconBox' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B]">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Operational Status Beacon Config
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cluster / Node Title</label>
                  <input
                    type="text"
                    value={props.title ?? ""}
                    placeholder="Cluster Master"
                    onChange={(e) => updateComponentProperty(comp.id, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Status State</label>
                    <select
                      value={props.status || "online"}
                      onChange={(e) => updateComponentProperty(comp.id, 'status', e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    >
                      <option value="online">🟢 Online (Healthy)</option>
                      <option value="warning">🟡 Warning (High Load)</option>
                      <option value="offline">🔴 Offline (Down)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">HTTP / State Code</label>
                    <input
                      type="text"
                      value={props.code ?? ""}
                      placeholder="200 OK"
                      onChange={(e) => updateComponentProperty(comp.id, 'code', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Latency</label>
                    <input
                      type="text"
                      value={props.latency ?? ""}
                      placeholder="12 ms"
                      onChange={(e) => updateComponentProperty(comp.id, 'latency', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Region</label>
                    <input
                      type="text"
                      value={props.region ?? ""}
                      placeholder="us-east-1"
                      onChange={(e) => updateComponentProperty(comp.id, 'region', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 2: VISUAL LAYOUT & BOX MODEL
            ══════════════════════════════════════════════ */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            {/* Dimensions (Width × Height) for ANY Selected Widget */}
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Dimensions & Size
                </span>
                {(comp.layout?.width || comp.layout?.height || props.width || props.height) && (
                  <button
                    onClick={() => {
                      updateComponentLayout(comp.id, { width: undefined, height: undefined, sizingMode: 'auto' });
                      updateComponentProperty(comp.id, 'width', undefined);
                      updateComponentProperty(comp.id, 'height', undefined);
                      updateComponentProperty(comp.id, 'sizeModeWidth', 'auto');
                      updateComponentProperty(comp.id, 'sizeModeHeight', 'auto');
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    title="Reset to Natural Auto Size"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Width (px)</span>
                  <input
                    type="number"
                    min="40"
                    max="1200"
                    placeholder="Auto"
                    value={comp.layout?.width ?? props.width ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      updateComponentLayout(comp.id, { width: val, sizingMode: val ? 'fixed' : 'auto' });
                      updateComponentProperty(comp.id, 'width', val);
                      updateComponentProperty(comp.id, 'sizeModeWidth', val ? 'fixed' : 'auto');
                    }}
                    className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Height (px)</span>
                  <input
                    type="number"
                    min="30"
                    max="1200"
                    placeholder="Auto"
                    value={comp.layout?.height ?? props.height ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      updateComponentLayout(comp.id, { height: val, sizingMode: val ? 'fixed' : 'auto' });
                      updateComponentProperty(comp.id, 'height', val);
                      updateComponentProperty(comp.id, 'sizeModeHeight', val ? 'fixed' : 'auto');
                    }}
                    className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Size Presets */}
              <div className="flex items-center gap-1 pt-1">
                {[
                  { label: 'Compact', w: 120, h: 90 },
                  { label: 'Medium', w: 160, h: 120 },
                  { label: 'Large', w: 220, h: 160 },
                  { label: 'Auto', w: undefined, h: undefined }
                ].map((ps, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateComponentLayout(comp.id, { width: ps.w, height: ps.h, sizingMode: ps.w ? 'fixed' : 'auto' });
                      updateComponentProperty(comp.id, 'width', ps.w);
                      updateComponentProperty(comp.id, 'height', ps.h);
                      updateComponentProperty(comp.id, 'sizeModeWidth', ps.w ? 'fixed' : 'auto');
                      updateComponentProperty(comp.id, 'sizeModeHeight', ps.w ? 'fixed' : 'auto');
                    }}
                    className="flex-1 py-1 px-1 rounded bg-[#111520] hover:bg-[#1C2333] border border-[#232A3B] text-[10px] text-slate-300 font-mono transition-colors text-center"
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 0. Container Layout Mode (Flex, Grid, Stack, Absolute) */}
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
              <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                Container Layout Mode
              </span>

              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-[#111520] border border-[#232A3B]">
                {[
                  { id: 'flex', label: 'Flex' },
                  { id: 'grid', label: 'Grid' },
                  { id: 'stack', label: 'Stack' },
                  { id: 'absolute', label: 'Absolute' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateComponentLayout(comp.id, { layoutMode: m.id as any })}
                    className={`py-1 text-[10px] font-medium rounded transition-all ${
                      (comp.layout?.layoutMode || 'flex') === m.id
                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Min / Max Constraints */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#232A3B]/60">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-0.5">Min Width (px)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="None"
                    value={comp.layout?.minWidth ?? ''}
                    onChange={(e) => updateComponentLayout(comp.id, { minWidth: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-0.5">Max Width (px)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="None"
                    value={comp.layout?.maxWidth ?? ''}
                    onChange={(e) => updateComponentLayout(comp.id, { maxWidth: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-0.5">Min Height (px)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="None"
                    value={comp.layout?.minHeight ?? ''}
                    onChange={(e) => updateComponentLayout(comp.id, { minHeight: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-0.5">Max Height (px)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="None"
                    value={comp.layout?.maxHeight ?? ''}
                    onChange={(e) => updateComponentLayout(comp.id, { maxHeight: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 1. Size Modes (Auto / Fill / Fixed / Expanded) */}
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
              <span className="text-[11px] font-bold text-indigo-400 block uppercase tracking-wider">
                Size Modes & Sizing
              </span>

              {/* Width Mode */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Width Mode</label>
                <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-[#111520] border border-[#232A3B]">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'fill', label: 'Fill' },
                    { id: 'fixed', label: 'Fixed' },
                    { id: 'expanded', label: 'Flex' }
                  ].map((m) => {
                    const isActive = (props.sizeModeWidth || (comp.layout?.width === '100%' ? 'fill' : comp.layout?.sizingMode === 'flex' ? 'expanded' : comp.layout?.width ? 'fixed' : 'auto')) === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (m.id === 'auto') {
                            updateComponentProperty(comp.id, 'sizeModeWidth', 'auto');
                            updateComponentProperty(comp.id, 'width', undefined);
                            updateComponentLayout(comp.id, { width: undefined, sizingMode: 'auto' });
                          } else if (m.id === 'fill') {
                            updateComponentProperty(comp.id, 'sizeModeWidth', 'fill');
                            updateComponentLayout(comp.id, { width: '100%', sizingMode: 'fill' });
                          } else if (m.id === 'fixed') {
                            const fixedW = props.width || (typeof comp.layout?.width === 'number' ? comp.layout.width : 160);
                            updateComponentProperty(comp.id, 'sizeModeWidth', 'fixed');
                            updateComponentProperty(comp.id, 'width', fixedW);
                            updateComponentLayout(comp.id, { width: fixedW, sizingMode: 'fixed' });
                          } else if (m.id === 'expanded') {
                            updateComponentProperty(comp.id, 'sizeModeWidth', 'expanded');
                            updateComponentProperty(comp.id, 'flex', props.flex || 1);
                            updateComponentLayout(comp.id, { width: undefined, sizingMode: 'flex' });
                          }
                        }}
                        className={`py-1 text-[10px] font-medium rounded transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
                {props.sizeModeWidth === 'fixed' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Width (px):</span>
                    <input
                      type="number"
                      min="10"
                      max="1200"
                      value={comp.layout?.width && typeof comp.layout.width === 'number' ? comp.layout.width : (props.width ?? 160)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateComponentProperty(comp.id, 'width', val);
                        updateComponentLayout(comp.id, { width: val, sizingMode: 'fixed' });
                      }}
                      className="flex-1 px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                )}
                {props.sizeModeWidth === 'expanded' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Flex Factor</span>
                      <span className="font-mono text-indigo-400">{props.flex || 1}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={props.flex || 1}
                      onChange={(e) => updateComponentProperty(comp.id, 'flex', Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Height Mode */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Height Mode</label>
                <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-[#111520] border border-[#232A3B]">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'fill', label: 'Fill' },
                    { id: 'fixed', label: 'Fixed' },
                    { id: 'expanded', label: 'Flex' }
                  ].map((m) => {
                    const isActive = (props.sizeModeHeight || (comp.layout?.height === '100%' ? 'fill' : comp.layout?.sizingMode === 'flex' ? 'expanded' : comp.layout?.height ? 'fixed' : 'auto')) === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (m.id === 'auto') {
                            updateComponentProperty(comp.id, 'sizeModeHeight', 'auto');
                            updateComponentProperty(comp.id, 'height', undefined);
                            updateComponentLayout(comp.id, { height: undefined, sizingMode: 'auto' });
                          } else if (m.id === 'fill') {
                            updateComponentProperty(comp.id, 'sizeModeHeight', 'fill');
                            updateComponentLayout(comp.id, { height: '100%', sizingMode: 'fill' });
                          } else if (m.id === 'fixed') {
                            const fixedH = props.height || (typeof comp.layout?.height === 'number' ? comp.layout.height : 120);
                            updateComponentProperty(comp.id, 'sizeModeHeight', 'fixed');
                            updateComponentProperty(comp.id, 'height', fixedH);
                            updateComponentLayout(comp.id, { height: fixedH, sizingMode: 'fixed' });
                          } else if (m.id === 'expanded') {
                            updateComponentProperty(comp.id, 'sizeModeHeight', 'expanded');
                            updateComponentProperty(comp.id, 'flex', props.flex || 1);
                            updateComponentLayout(comp.id, { height: undefined, sizingMode: 'flex' });
                          }
                        }}
                        className={`py-1 text-[10px] font-medium rounded transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
                {props.sizeModeHeight === 'fixed' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Height (px):</span>
                    <input
                      type="number"
                      min="10"
                      max="1200"
                      value={comp.layout?.height && typeof comp.layout.height === 'number' ? comp.layout.height : (props.height ?? 120)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateComponentProperty(comp.id, 'height', val);
                        updateComponentLayout(comp.id, { height: val, sizingMode: 'fixed' });
                      }}
                      className="flex-1 px-2 py-1 rounded bg-[#111520] border border-[#232A3B] text-xs font-mono text-white"
                    />
                  </div>
                )}
              </div>

              {/* Parent-Child Validation Alert */}
              {(() => {
                const parent = comp.parentId ? project.components[comp.parentId] : null;
                const isFlexMode = props.sizeModeWidth === 'expanded' || props.sizeModeHeight === 'expanded';
                if (isFlexMode && parent && parent.type !== 'Row' && parent.type !== 'Column') {
                  return (
                    <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 flex items-start gap-2 text-[10px] text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Flutter Warning:</strong> Expanded/Flex requires a Row or Column parent. Using inside &lsquo;{parent.type}&rsquo; causes runtime RenderFlex errors.
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* 2. Visual 3x3 9-Point Alignment Grid */}
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  9-Point Alignment
                </span>
                <span className="text-[10px] font-mono text-indigo-300">
                  {props.alignment || 'center'}
                </span>
              </div>

              <div className="w-48 h-36 mx-auto bg-[#111520] p-2 rounded-xl border border-[#232A3B] grid grid-cols-3 grid-rows-3 gap-1.5 shadow-inner">
                {[
                  { id: 'topLeft', label: 'Top Left' },
                  { id: 'topCenter', label: 'Top Center' },
                  { id: 'topRight', label: 'Top Right' },
                  { id: 'centerLeft', label: 'Center Left' },
                  { id: 'center', label: 'Center' },
                  { id: 'centerRight', label: 'Center Right' },
                  { id: 'bottomLeft', label: 'Bottom Left' },
                  { id: 'bottomCenter', label: 'Bottom Center' },
                  { id: 'bottomRight', label: 'Bottom Right' }
                ].map((pos) => {
                  const isSelected = (props.alignment || 'center') === pos.id;
                  return (
                    <button
                      key={pos.id}
                      onClick={() => updateComponentProperty(comp.id, 'alignment', pos.id)}
                      className={`rounded-lg flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/50' 
                          : 'bg-[#161B26] hover:bg-[#1E2536] text-slate-500'
                      }`}
                      title={pos.label}
                    >
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white shadow' : 'bg-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Four-Sided Visual Box Model (Margin & Padding) */}
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  Box Model (Margin & Padding)
                </span>
                <button
                  onClick={() => {
                    updateComponentProperty(comp.id, 'padding', 16);
                    updateComponentProperty(comp.id, 'paddingTop', 16);
                    updateComponentProperty(comp.id, 'paddingRight', 16);
                    updateComponentProperty(comp.id, 'paddingBottom', 16);
                    updateComponentProperty(comp.id, 'paddingLeft', 16);
                    updateComponentProperty(comp.id, 'margin', 0);
                    updateComponentProperty(comp.id, 'marginTop', 0);
                    updateComponentProperty(comp.id, 'marginRight', 0);
                    updateComponentProperty(comp.id, 'marginBottom', 0);
                    updateComponentProperty(comp.id, 'marginLeft', 0);
                  }}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                  title="Reset to Defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Four-Sided Padding Control */}
              <div className="p-2.5 rounded-lg bg-[#111520] border border-[#232A3B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-300">Padding (EdgeInsets)</span>
                  <button
                    onClick={() => setIsPaddingLinked(!isPaddingLinked)}
                    className="p-1 rounded hover:bg-[#1E2536] text-indigo-400"
                    title={isPaddingLinked ? "Unlink sides" : "Link all sides"}
                  >
                    {isPaddingLinked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>

                {isPaddingLinked ? (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>All Sides</span>
                      <span className="font-mono text-indigo-400">{props.padding ?? 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="64"
                      value={props.padding ?? 16}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateComponentProperty(comp.id, 'padding', val);
                        updateComponentProperty(comp.id, 'paddingTop', val);
                        updateComponentProperty(comp.id, 'paddingRight', val);
                        updateComponentProperty(comp.id, 'paddingBottom', val);
                        updateComponentProperty(comp.id, 'paddingLeft', val);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div>
                      <span className="text-[9px] text-slate-500 block">TOP</span>
                      <input
                        type="number"
                        min="0"
                        max="64"
                        value={props.paddingTop ?? props.padding ?? 16}
                        onChange={(e) => updateComponentProperty(comp.id, 'paddingTop', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">RIGHT</span>
                      <input
                        type="number"
                        min="0"
                        max="64"
                        value={props.paddingRight ?? props.padding ?? 16}
                        onChange={(e) => updateComponentProperty(comp.id, 'paddingRight', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">BOTTOM</span>
                      <input
                        type="number"
                        min="0"
                        max="64"
                        value={props.paddingBottom ?? props.padding ?? 16}
                        onChange={(e) => updateComponentProperty(comp.id, 'paddingBottom', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">LEFT</span>
                      <input
                        type="number"
                        min="0"
                        max="64"
                        value={props.paddingLeft ?? props.padding ?? 16}
                        onChange={(e) => updateComponentProperty(comp.id, 'paddingLeft', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Four-Sided Margin Control */}
              <div className="p-2.5 rounded-lg bg-[#111520] border border-[#232A3B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-300">Margin</span>
                  <button
                    onClick={() => setIsMarginLinked(!isMarginLinked)}
                    className="p-1 rounded hover:bg-[#1E2536] text-indigo-400"
                    title={isMarginLinked ? "Unlink sides" : "Link all sides"}
                  >
                    {isMarginLinked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>

                {isMarginLinked ? (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>All Sides</span>
                      <span className="font-mono text-indigo-400">{props.margin ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="48"
                      value={props.margin ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateComponentProperty(comp.id, 'margin', val);
                        updateComponentProperty(comp.id, 'marginTop', val);
                        updateComponentProperty(comp.id, 'marginRight', val);
                        updateComponentProperty(comp.id, 'marginBottom', val);
                        updateComponentProperty(comp.id, 'marginLeft', val);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div>
                      <span className="text-[9px] text-slate-500 block">TOP</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={props.marginTop ?? props.margin ?? 0}
                        onChange={(e) => updateComponentProperty(comp.id, 'marginTop', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">RIGHT</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={props.marginRight ?? props.margin ?? 0}
                        onChange={(e) => updateComponentProperty(comp.id, 'marginRight', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">BOTTOM</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={props.marginBottom ?? props.margin ?? 0}
                        onChange={(e) => updateComponentProperty(comp.id, 'marginBottom', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">LEFT</span>
                      <input
                        type="number"
                        min="0"
                        max="48"
                        value={props.marginLeft ?? props.margin ?? 0}
                        onChange={(e) => updateComponentProperty(comp.id, 'marginLeft', Number(e.target.value))}
                        className="w-full text-center px-1 py-1 rounded bg-[#161B26] border border-[#232A3B] text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 3: ANIMATION & LIVE REPLAY
            ══════════════════════════════════════════════ */}
        {activeTab === 'animation' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#232A3B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Motion Engine
                </span>
                <button
                  onClick={() => {
                    if (anim) {
                      updateComponentAnimation(comp.id, undefined);
                    } else {
                      updateComponentAnimation(comp.id, {
                        type: 'fadeIn' as any,
                        duration: 600,
                        delay: 0,
                        curve: 'easeInOut',
                        repeat: 'once',
                        autoPlay: true
                      });
                    }
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                    anim ? 'bg-indigo-600 text-white shadow-sm' : 'bg-[#111520] text-slate-400 border border-[#232A3B]'
                  }`}
                >
                  {anim ? 'Active' : 'Enable'}
                </button>
              </div>

              {anim && (
                <div className="space-y-3 pt-2 border-t border-[#232A3B]">
                  {/* Live Replay Button */}
                  <button
                    onClick={() => testAnimation(comp.id)}
                    disabled={isTestingAnim}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-white ${isTestingAnim ? 'animate-spin' : ''}`} />
                    {isTestingAnim ? "Animating on Canvas..." : "▶ Test Animation Live"}
                  </button>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Animation Type</label>
                    <select
                      value={anim.type}
                      onChange={(e) => {
                        updateComponentAnimation(comp.id, { ...anim, type: e.target.value as any });
                        testAnimation(comp.id);
                      }}
                      className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    >
                      <option value="fade">Fade In (Opacity)</option>
                      <option value="scale">Scale Up (Grow)</option>
                      <option value="slideUp">Slide Up (Entrance)</option>
                      <option value="slideDown">Slide Down</option>
                      <option value="slideLeft">Slide Left</option>
                      <option value="slideRight">Slide Right</option>
                      <option value="rotate">Rotation 360°</option>
                      <option value="bounce">Bounce Slow</option>
                      <option value="pulse">Pulse Glow</option>
                      <option value="shake">Shake Attention</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Duration</span>
                      <span className="font-mono text-indigo-400">{anim.duration}ms</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="2500"
                      step="50"
                      value={anim.duration}
                      onChange={(e) => updateComponentAnimation(comp.id, { ...anim, duration: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Easing Curve</label>
                    <select
                      value={anim.curve}
                      onChange={(e) => updateComponentAnimation(comp.id, { ...anim, curve: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    >
                      <option value="easeInOut">Ease In Out (Curved)</option>
                      <option value="easeOut">Ease Out (Deceleration)</option>
                      <option value="bounceOut">Bounce Out (Elastic)</option>
                      <option value="linear">Linear</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Repeat Mode</label>
                    <select
                      value={anim.repeat}
                      onChange={(e) => updateComponentAnimation(comp.id, { ...anim, repeat: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded bg-[#111520] border border-[#232A3B] text-xs text-white"
                    >
                      <option value="once">Play Once on Entrance</option>
                      <option value="loop">Continuous Loop</option>
                      <option value="reverse">Ping-Pong / Reverse</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
