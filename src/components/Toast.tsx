import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

const toneClasses = {
  success: {
    border: "border-aegis-success/30",
    text: "text-aegis-success",
    icon: CheckCircle2,
  },
  error: {
    border: "border-aegis-danger/30",
    text: "text-aegis-danger",
    icon: XCircle,
  },
  info: {
    border: "border-aegis-primary/30",
    text: "text-aegis-primary",
    icon: Info,
  },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useSimulation();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toneClasses[toast.tone];
          const Icon = config.icon;

          return (
            <motion.button
              key={toast.id}
              type="button"
              onClick={() => dismissToast(toast.id)}
              className={`pointer-events-auto rounded-2xl border bg-aegis-card/95 p-4 text-left shadow-glow backdrop-blur ${config.border}`}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 ${config.text}`} />
                <div>
                  <div className="text-sm font-semibold text-white">{toast.title}</div>
                  <div className="mt-1 text-sm text-aegis-text/70">{toast.description}</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
