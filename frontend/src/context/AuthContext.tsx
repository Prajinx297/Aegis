import { User, onAuthStateChanged } from "firebase/auth";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, signInWithEmail, signInWithGoogle, signOut, signUpWithEmail } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<unknown>;
  loginWithEmail: (email: string, password: string) => Promise<unknown>;
  register: (name: string, email: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: signInWithGoogle,
      loginWithEmail: signInWithEmail,
      register: signUpWithEmail,
      logout: signOut,
      getToken: async () => user?.getIdToken(),
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
