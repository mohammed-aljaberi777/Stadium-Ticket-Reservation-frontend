import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(email, password, fullName);
      navigate("/2fa/setup");
    } catch (err) {
      setError(err.detail?.message || err.detail || "Registration failed");
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
          <h1 style={{ fontSize: 26 }}>Create account</h1>
          <p style={{ color: "var(--gray-600)", margin: "4px 0 0", fontSize: 14 }}>Join Bayern Tickets and book your seats</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
              placeholder="Max Mustermann"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              placeholder="Min. 8 characters"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={busy} style={{ width: "100%", marginTop: 4 }}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--gray-600)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
