import { useAuth } from "@/context/AuthContext";

export function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <header><h1 className="text-3xl font-black">Settings</h1><p className="text-slate-400">Profile and environment-backed API configuration.</p></header>
      <section className="surface p-5">
        <h2 className="text-xl font-bold">Profile</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <p>Email: {user?.email}</p>
          <p>UID: <code>{user?.uid}</code></p>
          <p>Backend: <code>{import.meta.env.VITE_API_URL || "http://localhost:8000"}</code></p>
        </div>
      </section>
      <section className="surface p-5">
        <h2 className="text-xl font-bold">API Configuration</h2>
        <p className="mt-2 text-sm text-slate-400">Secrets stay server-side in Railway/FastAPI env vars. The browser only receives Firebase public config and VITE_API_URL.</p>
      </section>
    </div>
  );
}
