import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { PropsWithChildren } from "react";

interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                {description ? <p className="mt-1 text-sm text-aegis-muted">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-aegis-border bg-aegis-black/10 p-2 text-aegis-muted transition hover:border-aegis-primary/30 hover:text-aegis-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
