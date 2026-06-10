import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password, needs2FA ? totpCode : undefined);
      navigate("/matches");
    } catch (err) {
      const code = err.detail?.code;
      if (code === "TOTP_REQUIRED") {
        setNeeds2FA(true);
        setError("Enter the 6-digit code from your authenticator app.");
      } else if (code === "TOTP_INVALID") {
        setError("Invalid 2FA code — try again.");
      } else {
        setError(err.detail?.message || err.detail || "Login failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)", width: "100%", justifyContent: "center", alignItems: "center", background: "var(--gray-50)" }}>
      <div className="card" style={{ maxWidth: 440, boxShadow: "var(--shadow-lg)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #dc052d, #a80021)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, marginBottom: 14,
            boxShadow: "0 6px 20px rgba(220,5,45,.35)"
          }}>⚽</div>
          <h1 style={{ fontSize: 26 }}>Welcome back</h1>
          <p style={{ color: "var(--gray-600)", margin: "4px 0 0", fontSize: 14 }}>Sign in to your Bayern Tickets account</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {needs2FA && (
            <div className="field" style={{ animation: "slideUp .3s ease" }}>
              <label>Authenticator code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
                autoFocus
                placeholder="123 456"
                style={{ letterSpacing: 4, fontSize: 20, textAlign: "center" }}
              />
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={busy} style={{ width: "100%", marginTop: 4 }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--gray-600)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
