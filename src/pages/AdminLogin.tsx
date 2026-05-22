import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Wordmark } from "@/components/site/Wordmark";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate("/admin", { replace: true });
  }, [loading, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError("Invalid email or password");
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#1A0A05" }}>
      <div
        className="w-full max-w-sm rounded-md p-8 border"
        style={{ backgroundColor: "#2A1208", borderColor: "rgba(212,160,23,0.25)" }}
      >
        <div className="text-center mb-8">
          <Wordmark className="text-3xl" />
          <p className="mt-2 text-xs uppercase tracking-[0.3em]" style={{ color: "rgba(253,246,237,0.6)" }}>Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(253,246,237,0.6)" }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-login-input w-full px-3 py-2 rounded-sm focus:outline-none"
              style={{ backgroundColor: "#1A0A05", border: "1px solid rgba(212,160,23,0.3)", color: "#FDF6ED" }}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(253,246,237,0.6)" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login-input w-full px-3 py-2 rounded-sm focus:outline-none"
              style={{ backgroundColor: "#1A0A05", border: "1px solid rgba(212,160,23,0.3)", color: "#FDF6ED" }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#C0392B" }} role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 font-medium tracking-wide rounded-sm transition-colors disabled:opacity-50 hover:brightness-90"
            style={{ backgroundColor: "#C0392B", color: "#FFFFFF" }}
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
      <style>{`
        .admin-login-input:focus { border-color: #D4A017 !important; }
      `}</style>
    </div>
  );
}
