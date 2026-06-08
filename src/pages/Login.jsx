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
      // Backend returns {code, message} in detail
      const code = err.detail?.code;
      if (code === "TOTP_REQUIRED") {
        setNeeds2FA(true);
        setError("Enter the 6-digit code from your authenticator app.");
      } else if (code === "TOTP_INVALID") {
        setError("Invalid 2FA code. Try again.");
      } else {
        setError(err.detail?.message || err.detail || "Login failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>Sign in</h1>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {needs2FA && (
          <label>
            6-digit code
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              required
              autoFocus
              placeholder="123456"
            />
          </label>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
