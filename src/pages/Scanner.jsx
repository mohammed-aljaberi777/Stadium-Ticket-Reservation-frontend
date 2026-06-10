import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Scanner() {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState("camera");      // "camera" | "manual"
  const [scannerRunning, setScannerRunning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState(null);      // {APPROVED|REJECTED, ticket?, reason?}
  const [error, setError] = useState("");
  const html5QrCodeRef = useRef(null);

  // Start camera-based scanning
  useEffect(() => {
    if (mode !== "camera") return;
    if (result) return;  // pause scanner while showing a result

    const qrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = qrCode;
    setScannerRunning(true);
    setError("");

    qrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          // Stop scanner immediately to prevent multiple reads
          await qrCode.stop().catch(() => {});
          setScannerRunning(false);
          verify(decodedText);
        },
        () => { /* ignore per-frame errors */ }
      )
      .catch((err) => {
        setError(`Camera error: ${err.message || err}`);
        setScannerRunning(false);
      });

    return () => {
      if (qrCode.isScanning) qrCode.stop().catch(() => {});
    };
  }, [mode, result]);

  async function verify(qr_token) {
    setError("");
    try {
      const r = await api.verify(qr_token);
      setResult(r);
    } catch (err) {
      setError(err.detail?.message || err.detail || "Verification failed");
    }
  }

  async function verifyManual(e) {
    e.preventDefault();
    if (!manualToken.trim()) return;
    verify(manualToken.trim());
  }

  function scanAgain() {
    setResult(null);
    setManualToken("");
  }

  // ---- UI ----

  return (
    <div className="card" style={{ maxWidth: 580 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gate Scanner</h1>
          <small>{user?.full_name} · {user?.role}</small>
        </div>
        <button onClick={logout}>Log out</button>
      </header>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => { setMode("camera"); setResult(null); }}
          style={{ flex: 1, background: mode === "camera" ? "#dc0000" : "#e7e7ea", color: mode === "camera" ? "white" : "#333" }}
        >
          📷 Camera
        </button>
        <button
          onClick={() => { setMode("manual"); setResult(null); }}
          style={{ flex: 1, background: mode === "manual" ? "#dc0000" : "#e7e7ea", color: mode === "manual" ? "white" : "#333" }}
        >
          ⌨️ Paste token
        </button>
      </div>

      {/* The result block */}
      {result && (
        <div
          style={{
            padding: 20,
            borderRadius: 10,
            background: result.result === "APPROVED" ? "#dcfce7" : "#fee2e2",
            border: `2px solid ${result.result === "APPROVED" ? "#16a34a" : "#dc2626"}`,
            textAlign: "center",
            marginBottom: 16,
            animation: "pop 0.3s ease-out",
          }}
        >
          <h2 style={{ margin: 0, color: result.result === "APPROVED" ? "#15803d" : "#991b1b", fontSize: 36 }}>
            {result.result === "APPROVED" ? "✓ APPROVED" : "✗ REJECTED"}
          </h2>
          {result.ticket ? (
            <>
              <p style={{ margin: "12px 0 4px", fontSize: 18 }}>
                <strong>{result.ticket.user_full_name}</strong>
              </p>
              <p style={{ margin: 0 }}>
                {result.ticket.section}, Row {result.ticket.row}, Seat {result.ticket.seat}
              </p>
              <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
                {result.ticket.match}
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: "12px 0 4px" }}><strong>{result.reason}</strong></p>
              {result.details?.used_at && (
                <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
                  Used at: {new Date(result.details.used_at).toLocaleString()}
                </p>
              )}
            </>
          )}
          <button onClick={scanAgain} style={{ marginTop: 16, background: "#18181b" }}>
            Scan next ticket
          </button>
        </div>
      )}

      {/* Camera view */}
      {mode === "camera" && !result && (
        <>
          <div id="qr-reader" style={{ width: "100%", borderRadius: 10, overflow: "hidden" }} />
          {!scannerRunning && !error && <p style={{ textAlign: "center" }}>Starting camera…</p>}
          {error && <p className="error">{error}</p>}
          <p style={{ color: "#666", fontSize: 13, textAlign: "center", marginTop: 12 }}>
            Point your camera at a ticket QR code. The system will verify it automatically.
          </p>
        </>
      )}

      {/* Manual paste */}
      {mode === "manual" && !result && (
        <form onSubmit={verifyManual}>
          <label>
            Paste the JWT token from the QR
            <textarea
              rows={4}
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="eyJhbGciOi..."
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                padding: 8,
                border: "1px solid #d4d4d8",
                borderRadius: 8,
                resize: "vertical",
              }}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Verify</button>
        </form>
      )}

      <div style={{ marginTop: 16, fontSize: 13, color: "#888" }}>
        <Link to="/matches">← Back to matches</Link>
      </div>
    </div>
  );
}
