import { useEffect, useState } from "react";
import { tfEngine } from "@/lib/tfjs";

export function useModelLoader(autoLoad = true) {
  const [status, setStatus] = useState(tfEngine.status);
  const [ready, setReady] = useState(tfEngine.isLoaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onStatus = (event: Event) => setStatus((event as CustomEvent<string>).detail);
    const onReady = () => {
      setReady(true);
      setStatus("Models Ready");
    };
    window.addEventListener("tfjs-status", onStatus);
    window.addEventListener("tfjs-loaded", onReady);
    if (autoLoad) {
      tfEngine.loadModels().catch((err) => setError(err instanceof Error ? err.message : String(err)));
    }
    return () => {
      window.removeEventListener("tfjs-status", onStatus);
      window.removeEventListener("tfjs-loaded", onReady);
    };
  }, [autoLoad]);

  return { status, ready, error };
}
