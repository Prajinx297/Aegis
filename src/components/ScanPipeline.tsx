import { motion } from "framer-motion";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/cn";

export interface PipelineStep {
  id: string;
  label: string;
  detail?: string;
}

interface ScanPipelineProps {
  steps: PipelineStep[];
  currentStep: number;
  completed: boolean;
}

export function ScanPipeline({ steps, currentStep, completed }: ScanPipelineProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isComplete = index < currentStep || (completed && index === steps.length - 1);
        const isActive = index === currentStep && !completed;

        return (
          <motion.div
            key={step.id}
            layout
            className={cn(
              "rounded-2xl border p-4 transition",
              isComplete
                ? "border-aegis-success/30 bg-aegis-success/10"
                : isActive
                  ? "border-aegis-primary/30 bg-aegis-primary/10"
                  : "border-aegis-border bg-aegis-card/70",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-aegis-success" />
                ) : isActive ? (
                  <LoaderCircle className="h-5 w-5 animate-spin text-aegis-primary" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-aegis-border text-[10px] font-semibold text-aegis-muted">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">{step.label}</div>
                {step.detail ? <div className="mt-1 text-sm text-aegis-muted">{step.detail}</div> : null}
              </div>
              {isActive ? <LoadingSpinner size={16} /> : null}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
