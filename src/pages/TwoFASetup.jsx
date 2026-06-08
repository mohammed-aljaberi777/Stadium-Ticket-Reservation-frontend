import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, BASE_URL } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function TwoFASetup() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  const [secret, setSecret] = useState("");
  const [qrSrc, setQrSrc] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);

  useEffect(() => {
    async function start() {
      try {
        const data = await api.setup2FA();
        setSecret(data.secret);
        // Fetch the QR PNG with the Bearer token, convert to a data URL
        const res = await fetch(`${BASE_URL}/v1/auth/2fa/qr`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        const blob = await res.blob();
        setQrSrc(URL.createObjectURL(blob));
      } catch (err) {
        // Already enabled? skip ahead.
        if (err.detail === "2FA is already enabled") navigate("/matches");
        else setError(err.detail?.message || err.detail || "Could not start 2FA setup");
      } finally {
        setSetupLoading(false);
      }
    }
    start();
  }, [navigate]);

  async function onVerify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.verify2FA(code);
      await refresh();  // pull fresh user with totp_enabled=true
      navigate("/matches");
    } catch (err) {
      setError(err.detail?.message || "Invalid code. Make sure your clock is in sync.");
    } finally {
      setBusy(false);
    }
  }

  if (setupLoading) return <div className="card"><p>Preparing your 2FA setup…</p></div>;

  return (
    <div className="card">
      <h1>Set up Two-Factor Authentication</h1>
      <p>
        {user?.full_name ? `Hi ${user.full_name}. ` : ""}
        Scan this QR code with Google Authenticator, Authy, or Microsoft Authenticator on
        your phone. Then enter the 6-digit code below to activate.
      </p>

      {qrSrc && (
        <img src={qrSrc} alt="2FA QR code" style={{ width: 220, height: 220, display: "block", margin: "16px 0" }} />
      )}

      <details style={{ marginBottom: 16 }}>
        <summary>Can't scan? Enter the secret manually</summary>
        <code style={{ display: "block", padding: 8, background: "#f4f4f4", marginTop: 8, wordBreak: "break-all" }}>
          {secret}
        </code>
      </details>

      <form onSubmit={onVerify}>
        <label>
          6-digit code
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="123456"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Verifying…" : "Activate 2FA"}
        </button>
      </form>
    </div>
  );
}
