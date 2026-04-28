import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { AegisMark } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";

function firebaseMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("auth/invalid-credential")) return "Invalid email or password.";
  if (message.includes("auth/email-already-in-use")) return "That email already has an account.";
  if (message.includes("auth/weak-password")) return "Use a stronger password.";
  return message;
}

export function LoginPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (tab === "signin") await auth.loginWithEmail(email, password);
      else await auth.register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(firebaseMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    try {
      await auth.login();
      navigate("/dashboard");
    } catch (err) {
      toast.error(firebaseMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink p-4">
      <form className="surface w-full max-w-md p-6" onSubmit={submit}>
        <AegisMark />
        <div className="mt-6 grid grid-cols-2 rounded-md border border-line p-1">
          <button type="button" className={`rounded px-3 py-2 text-sm ${tab === "signin" ? "bg-accent text-ink" : ""}`} onClick={() => setTab("signin")}>Sign In</button>
          <button type="button" className={`rounded px-3 py-2 text-sm ${tab === "register" ? "bg-accent text-ink" : ""}`} onClick={() => setTab("register")}>Create Account</button>
        </div>
        <div className="mt-5 space-y-3">
          {tab === "register" && <input className="field" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />}
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="button w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {tab === "signin" ? "Sign in" : "Create account"}
          </button>
          <button className="button-secondary w-full" type="button" disabled={loading} onClick={google}>Continue with Google</button>
        </div>
      </form>
    </main>
  );
}
