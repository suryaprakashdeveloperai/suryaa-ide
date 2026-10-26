import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CreditCard, 
  Layers, 
  Cpu, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useEditorStore } from '../../core/store';

export const UpgradeModal: React.FC = () => {
  const { 
    isUpgradeModalOpen, 
    closeUpgradeModal, 
    billingStatus, 
    subscribePlan 
  } = useEditorStore();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isUpgradeModalOpen) return null;

  const hoursRemaining = billingStatus?.hoursRemaining ?? 72;
  const daysLeft = Math.floor(hoursRemaining / 24);
  const hoursLeft = Math.floor(hoursRemaining % 24);
  const plan = billingStatus?.plan || 'trial';

  const handleSubscribe = async (tier: 'pro' | 'enterprise') => {
    setIsUpgrading(true);
    setSuccessMessage(null);
    try {
      const ok = await subscribePlan(tier);
      if (ok) {
        setSuccessMessage(`Successfully subscribed to Suryaa IDE ${tier.toUpperCase()}! Entitlements active.`);
        setTimeout(() => {
          setSuccessMessage(null);
          closeUpgradeModal();
        }, 1500);
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#111520] border border-[#232A3B] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200 max-h-[90vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 p-6 border-b border-[#232A3B]">
          <button
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-200 to-white bg-clip-text text-transparent">
                  Suryaa IDE Pro Subscription & Account
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {plan.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Full-Stack Visual Studio by Surya Prakash T (B.Tech AIML)
              </p>
            </div>
          </div>
        </div>

        {/* Current Entitlement / Trial Status Bar */}
        <div className="bg-[#161B26] px-6 py-3 border-b border-[#232A3B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            {plan === 'trial' ? (
              <span>
                <strong className="text-white">3-Day Free Trial:</strong>{' '}
                <span className="text-amber-300 font-mono font-bold">
                  {daysLeft}d {hoursLeft}h remaining
                </span>{' '}
                (server-enforced timestamp)
              </span>
            ) : (
              <span>
                <strong className="text-emerald-400">Active Paid Plan:</strong>{' '}
                <span className="text-white font-semibold">{plan.toUpperCase()}</span> (Renews automatically)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-mono text-[11px]">user@suryaaide.com</span>
          </div>
        </div>

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Pricing & Entitlement Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
          {/* Pro Plan */}
          <div className="p-5 rounded-2xl bg-[#161B26] border border-indigo-500/30 hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Professional</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">POPULAR</span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-extrabold text-white">$29</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Designed for professional Flutter & full-stack software engineers building production apps.
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited Gemini 2.5 Flash & Pro Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Claude 3.7 Sonnet & 3.5 Haiku Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1,000 AI Credits / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Visual Layout Engine (Containers, Grid, Flex, Stack)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Automated Dart Analysis & Error Auto-Repair</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full-Stack FastAPI Python Backend Generation</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('pro')}
              disabled={isUpgrading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro ($29/mo)'}</span>
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="p-5 rounded-2xl bg-[#161B26] border border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Enterprise</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">UNLIMITED</span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-extrabold text-white">$99</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Complete enterprise studio for teams, high-throughput AI pipelines, and commercial SaaS builds.
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Everything in Pro with 10,000 AI Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Dedicated Low-Latency Sandboxed Build Runners</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Bring-Your-Own API Keys (BYOK Encrypted Vault)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Custom Design System & Reusable Widget Library</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Audit Logging & Team Workspace Collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>24/7 SLA Priority Architecture Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('enterprise')}
              disabled={isUpgrading}
              className="w-full py-2.5 rounded-xl bg-[#1E2536] hover:bg-[#283248] border border-purple-500/40 text-purple-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{plan === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise ($99/mo)'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0E121C] border-t border-[#232A3B] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure 256-bit TLS Encryption · Cancel anytime with 1-click</span>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="px-3 py-1 rounded-lg bg-[#161B26] hover:bg-[#1E2536] text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
