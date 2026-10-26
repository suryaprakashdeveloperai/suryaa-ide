import React, { useState } from 'react';
import { useEditorStore } from '../../core/store';
import { X, Sparkles, Layout, Cpu, ShoppingBag, BarChart3, CheckCircle2 } from 'lucide-react';

const TEMPLATES = [
  {
    id: "iot_telemetry",
    title: "Industrial IoT & Telemetry Studio",
    desc: "Real-time sensor metrics, multi-axis throughput graphs, camera stream, and machine status.",
    icon: Cpu,
    color: "from-emerald-500 to-teal-600",
    badge: "Industrial"
  },
  {
    id: "saas_analytics",
    title: "Enterprise SaaS & KPI Dashboard",
    desc: "Multi-tab revenue analytics, dual-axis conversion curves, customer churn gauge, and KPI trends.",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-600",
    badge: "Enterprise"
  },
  {
    id: "ecommerce_store",
    title: "Modern E-Commerce Store",
    desc: "Product grid catalog, search filters, interactive cart counter, banner promotions, and checkout.",
    icon: ShoppingBag,
    color: "from-rose-500 to-pink-600",
    badge: "Mobile"
  },
  {
    id: "blank_canvas",
    title: "Blank Clean Canvas",
    desc: "A completely clean Flutter Scaffold and AppBar ready for custom drag-and-drop design.",
    icon: Layout,
    color: "from-slate-600 to-slate-800",
    badge: "Starter"
  }
];

export const TemplateModal: React.FC = () => {
  const { isTemplateModalOpen, closeTemplateModal, project, setThemePreset } = useEditorStore();
  const [selectedTemplate, setSelectedTemplate] = useState("iot_telemetry");
  const [projectName, setProjectName] = useState("Industrial Telemetry Hub");
  const [packageName, setPackageName] = useState("com.iot.telemetry");

  if (!isTemplateModalOpen) return null;

  const handleCreate = () => {
    // In future iterations can load distinct component trees
    closeTemplateModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-[680px] bg-[#111520] border border-[#232A3B] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="h-14 border-b border-[#232A3B] px-6 flex items-center justify-between bg-[#161B26]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Create New Project or Template</h3>
          </div>
          <button
            onClick={closeTemplateModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161B26] border border-[#232A3B] text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Package Identifier</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161B26] border border-[#232A3B] text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Architecture Template</label>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                const IconComponent = tmpl.icon;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/50' 
                        : 'bg-[#161B26] border-[#232A3B] hover:border-slate-600 hover:bg-[#1A2030]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tmpl.color} flex items-center justify-center text-white shadow-md`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {tmpl.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1">{tmpl.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{tmpl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-16 border-t border-[#232A3B] px-6 flex items-center justify-between bg-[#161B26]">
          <span className="text-xs text-slate-500">All templates generate clean MVVM Flutter code.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={closeTemplateModal}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/30 transition-all"
            >
              Open Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
