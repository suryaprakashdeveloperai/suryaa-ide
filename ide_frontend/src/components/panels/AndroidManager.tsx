import React from 'react';
import { useEditorStore } from '../../core/store';
import { Smartphone, Shield, CheckSquare, Square, FileText } from 'lucide-react';

const COMMON_PERMISSIONS = [
  { id: "android.permission.INTERNET", label: "Internet Access", desc: "Allows network & API calls" },
  { id: "android.permission.ACCESS_NETWORK_STATE", label: "Network State", desc: "Check connection connectivity" },
  { id: "android.permission.CAMERA", label: "Camera", desc: "Capture photos & video streams" },
  { id: "android.permission.READ_EXTERNAL_STORAGE", label: "Read Storage", desc: "Read images and files" },
  { id: "android.permission.ACCESS_FINE_LOCATION", label: "GPS Location", desc: "Precise device location" },
  { id: "android.permission.POST_NOTIFICATIONS", label: "Push Notifications", desc: "Send alerts & foreground notices" },
];

export const AndroidManager: React.FC = () => {
  const { project, updateAndroidConfig } = useEditorStore();
  const android = project.metadata.android || {
    packageName: "com.nova.commerce",
    appName: project.metadata.name,
    versionName: "1.0.0",
    versionCode: 1,
    minSdk: 21,
    targetSdk: 34,
    permissions: ["android.permission.INTERNET"]
  };

  const togglePermission = (permId: string) => {
    const perms = [...android.permissions];
    const idx = perms.indexOf(permId);
    if (idx >= 0) {
      perms.splice(idx, 1);
    } else {
      perms.push(permId);
    }
    updateAndroidConfig({ permissions: perms });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Android Project Identity</h2>
        <p className="text-[11px] text-slate-500">Package name, SDK targets, and Android permissions</p>
      </div>

      {/* Package Name & App Name */}
      <div className="space-y-3 p-3 rounded-xl bg-[#161B26] border border-[#232A3B]">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Application ID / Package Name</label>
          <input
            type="text"
            value={android.packageName}
            onChange={(e) => updateAndroidConfig({ packageName: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-[#0E121C] border border-[#232A3B] text-xs text-white font-mono"
            placeholder="com.example.app"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Android App Display Name</label>
          <input
            type="text"
            value={android.appName}
            onChange={(e) => updateAndroidConfig({ appName: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-[#0E121C] border border-[#232A3B] text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Min SDK Version</label>
            <input
              type="number"
              min="21"
              max="34"
              value={android.minSdk}
              onChange={(e) => updateAndroidConfig({ minSdk: Number(e.target.value) })}
              className="w-full px-2 py-1 rounded bg-[#0E121C] border border-[#232A3B] text-xs text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Target SDK Version</label>
            <input
              type="number"
              min="26"
              max="34"
              value={android.targetSdk}
              onChange={(e) => updateAndroidConfig({ targetSdk: Number(e.target.value) })}
              className="w-full px-2 py-1 rounded bg-[#0E121C] border border-[#232A3B] text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Permissions Checklist */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-300 block">Android Permissions</span>
        <div className="space-y-1.5">
          {COMMON_PERMISSIONS.map((perm) => {
            const isChecked = android.permissions.includes(perm.id);
            return (
              <div
                key={perm.id}
                onClick={() => togglePermission(perm.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-colors flex items-start gap-2.5 ${
                  isChecked 
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200' 
                    : 'bg-[#161B26] border-[#232A3B] text-slate-400 hover:border-slate-600'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-semibold block">{perm.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">{perm.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
