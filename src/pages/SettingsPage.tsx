import { motion } from "framer-motion";
import { KeyRound, Mail, Shield, SlidersHorizontal } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSimulation } from "@/hooks/useSimulation";

export function SettingsPage() {
  const { pushToast } = useSimulation();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <motion.section whileHover={{ scale: 1.01 }} className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-aegis-primary" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Preferences</h2>
        </div>
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-5">
            <div className="text-sm font-medium text-white">Theme</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-aegis-text/70">Dark mode first, with a global toggle.</div>
              <ThemeToggle />
            </div>
          </div>
          <div className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-5">
            <div className="flex items-center gap-3 text-sm font-medium text-white">
              <Mail className="h-4 w-4 text-aegis-accent" />
              Notifications
            </div>
            <div className="mt-4 space-y-3 text-sm text-aegis-text/75">
              {["Critical threat alerts", "DMCA resolution updates", "Weekly integrity report"].map((item, index) => (
                <label key={item} className="flex items-center justify-between">
                  <span>{item}</span>
                  <input type="checkbox" defaultChecked={index < 2} className="h-4 w-4 accent-aegis-primary" />
                </label>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              pushToast({
                tone: "success",
                title: "Preferences saved",
                description: "Your monitoring preferences were applied instantly.",
              })
            }
            className="rounded-2xl bg-aegis-primary px-5 py-3 font-semibold text-white shadow-glow"
          >
            Save Preferences
          </button>
        </div>
      </motion.section>

      <div className="space-y-6">
        <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-aegis-primary" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">API keys</h2>
          </div>
          <div className="mt-6 grid gap-4">
            {[
              { label: "Gemini API Key", value: "AIzaSyAegis-vertex-••••••2f18" },
              { label: "Blockchain RPC", value: "https://polygon-mainnet.g.alchemy.com/v2/••••••" },
              { label: "Abuse API Token", value: "aegis_abuse_tok_live_••••••" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">
                <div className="text-sm text-aegis-muted">{item.label}</div>
                <div className="mt-2 font-mono text-sm text-aegis-accent">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-aegis-border bg-aegis-card p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-aegis-success" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Security controls</h2>
          </div>
          <div className="mt-6 space-y-4 text-sm text-aegis-text/75">
            <div className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">Role-based access is enabled for Legal, Broadcast Ops, and Trust & Safety.</div>
            <div className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">Webhook signing is required for all takedown automation events.</div>
            <div className="rounded-2xl border border-aegis-border bg-aegis-black/20 p-4">Threat intelligence exports are encrypted at rest and in transit.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
