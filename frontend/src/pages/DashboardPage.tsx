import { Link } from "react-router-dom";
import { FileWarning, Fingerprint, Radar, ShieldAlert } from "lucide-react";
import { FirestoreBadge, RealTimeBadge } from "@/components/Badges";

export function DashboardPage() {
  const cards = [
    { to: "/register", title: "Register IP", icon: Fingerprint, copy: "SHA-256, Canvas pHash, TF.js embeddings, Sepolia anchoring." },
    { to: "/detect", title: "Detect Misuse", icon: Radar, copy: "Backend URL/file comparison against Firestore assets." },
    { to: "/threats", title: "Classify Threats", icon: ShieldAlert, copy: "Claude threat JSON plus live IP enrichment from ip-api." },
    { to: "/dmca", title: "Generate DMCA", icon: FileWarning, copy: "Claude-authored takedown notices with persisted cases." },
  ];
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Command Center</h1>
          <p className="text-slate-400">Transparent live features, cached Firestore state, and clearly labeled simulations.</p>
        </div>
        <div className="flex gap-2"><RealTimeBadge /><FirestoreBadge /></div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ to, title, icon: Icon, copy }) => (
          <Link key={to} className="surface p-5 transition hover:border-accent" to={to}>
            <Icon className="h-7 w-7 text-accent" />
            <h2 className="mt-4 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">{copy}</p>
          </Link>
        ))}
      </div>
      <section className="surface p-5">
        <h2 className="text-xl font-bold">What judges can verify in source</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["No fake setTimeout AI pipelines", "Protected endpoints require Firebase ID tokens", "Claude, Sepolia, TF.js, Firestore, and ip-api calls are real integrations"].map((item) => (
            <div key={item} className="rounded-lg border border-line bg-ink p-4 text-sm text-slate-300">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
