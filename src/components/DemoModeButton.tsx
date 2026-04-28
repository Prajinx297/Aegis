import { motion } from "framer-motion";
import { Rocket, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/Modal";
import { useSimulation } from "@/hooks/useSimulation";

export function DemoModeButton() {
  const navigate = useNavigate();
  const { addThreat, runDetectionDemo, triggerDmcaDemo } = useSimulation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full border border-aegis-primary/30 bg-aegis-primary px-5 py-3 text-sm font-semibold text-white shadow-glow"
      >
        <WandSparkles className="h-4 w-4" />
        Demo Mode
      </motion.button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Quick-fire demo triggers"
        description="Drive the live experience in front of judges with one click."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <button
            type="button"
            className="rounded-2xl border border-aegis-border bg-aegis-card p-4 text-left transition hover:border-aegis-danger/30 hover:shadow-glow"
            onClick={() => {
              addThreat("UCL_Final_Opening_Cut.mp4");
              setOpen(false);
              navigate("/threats");
            }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-aegis-danger/15 text-aegis-danger">
              <Rocket className="h-4 w-4" />
            </div>
            <div className="font-semibold text-white">Simulate New Threat</div>
            <div className="mt-2 text-sm text-aegis-text/70">Inject a critical intelligence event into the live feed.</div>
          </button>
          <button
            type="button"
            className="rounded-2xl border border-aegis-border bg-aegis-card p-4 text-left transition hover:border-aegis-primary/30 hover:shadow-glow"
            onClick={() => {
              runDetectionDemo();
              setOpen(false);
              navigate("/detect");
            }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-aegis-primary/15 text-aegis-primary">
              <WandSparkles className="h-4 w-4" />
            </div>
            <div className="font-semibold text-white">Run Detection Demo</div>
            <div className="mt-2 text-sm text-aegis-text/70">Open the scan engine and auto-run a realistic infringement analysis.</div>
          </button>
          <button
            type="button"
            className="rounded-2xl border border-aegis-border bg-aegis-card p-4 text-left transition hover:border-aegis-success/30 hover:shadow-glow"
            onClick={() => {
              triggerDmcaDemo();
              setOpen(false);
              navigate("/dmca");
            }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-aegis-success/15 text-aegis-success">
              <Rocket className="h-4 w-4" />
            </div>
            <div className="font-semibold text-white">Trigger DMCA</div>
            <div className="mt-2 text-sm text-aegis-text/70">Auto-file a sample takedown case with a generated notice.</div>
          </button>
        </div>
      </Modal>
    </>
  );
}
