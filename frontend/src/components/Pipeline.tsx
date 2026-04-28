import { ReactNode, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export interface PipelineStep<T = unknown> {
  id: string;
  label: string;
  fn: () => Promise<T>;
  display: (result: T) => ReactNode;
}

interface StepState {
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  result?: unknown;
  error?: string;
}

export function Pipeline({ steps, onComplete }: { steps: PipelineStep[]; onComplete?: (results: Record<string, unknown>) => void }) {
  const [running, setRunning] = useState(false);
  const [states, setStates] = useState<Record<string, StepState>>(() =>
    Object.fromEntries(steps.map((step) => [step.id, { status: "PENDING" }])),
  );

  async function run() {
    setRunning(true);
    const results: Record<string, unknown> = {};
    for (const step of steps) {
      setStates((current) => ({ ...current, [step.id]: { status: "RUNNING" } }));
      try {
        const result = await step.fn();
        results[step.id] = result;
        setStates((current) => ({ ...current, [step.id]: { status: "COMPLETE", result } }));
      } catch (err) {
        setStates((current) => ({
          ...current,
          [step.id]: { status: "FAILED", error: err instanceof Error ? err.message : String(err) },
        }));
        setRunning(false);
        return;
      }
    }
    setRunning(false);
    onComplete?.(results);
  }

  return (
    <div className="space-y-3">
      <button className="button w-full" onClick={run} disabled={running || steps.length === 0}>
        {running && <Loader2 className="h-4 w-4 animate-spin" />}
        Execute Live Registration Pipeline
      </button>
      {steps.map((step) => {
        const state = states[step.id] ?? { status: "PENDING" };
        return (
          <div key={step.id} className="rounded-lg border border-line bg-ink/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{step.label}</p>
              {state.status === "RUNNING" && <Loader2 className="h-5 w-5 animate-spin text-accent" />}
              {state.status === "COMPLETE" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {state.status === "FAILED" && <XCircle className="h-5 w-5 text-danger" />}
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {state.status === "COMPLETE" && step.display(state.result)}
              {state.status === "FAILED" && <span className="text-danger">{state.error}</span>}
              {state.status === "PENDING" && <span className="text-slate-500">Waiting for the previous real async step.</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
