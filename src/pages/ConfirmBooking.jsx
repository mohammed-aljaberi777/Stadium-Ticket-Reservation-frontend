import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function ConfirmBooking() {
  const { holdId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const initial = state?.hold || null;
  const [secondsLeft, setSecondsLeft] = useState(initial?.seconds_remaining ?? 300);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (success || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, success]);

  if (!initial) return (
    <div className="page-body">
      <div className="card">
        <p>Hold info not found — please pick seats again.</p>
        <Link to="/matches"><button style={{ marginTop: 8 }}>← Back to matches</button></Link>
      </div>
    </div>
  );

  const match = state.match;
  const seats = state.seats || [];
  const total = seats.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;

  async function confirm() {
    setError(""); setBusy(true);
    try {
      const booking = await api.createBooking(holdId);
      setSuccess(booking);
    } catch (err) {
      setError(err.detail?.message || "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  async function release() {
    try { await api.releaseHold(holdId); } catch (_) {}
    navigate("/matches");
  }

  if (success) return (
    <div className="page-body">
      <div className="card card-md" style={{ textAlign: "center", animation: "pop .4s cubic-bezier(.2,.7,.3,1)" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
        <h1 style={{ fontSize: 28 }}>Booking confirmed!</h1>
        <p style={{ color: "var(--gray-600)", marginTop: 4 }}>Your tickets are ready in your wallet.</p>

        <div style={{
          background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "20px 24px",
          margin: "24px 0", textAlign: "left", border: "1px solid var(--gray-200)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "var(--gray-600)", fontSize: 14 }}>Reference</span>
            <strong style={{ fontFamily: "monospace", letterSpacing: 1 }}>{success.reference_code}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--gray-600)", fontSize: 14 }}>Total paid</span>
            <strong>€{success.total_amount}</strong>
          </div>
        </div>

        <Link to="/tickets"><button style={{ width: "100%" }}>View my tickets →</button></Link>
      </div>
    </div>
  );

  return (
    <div className="page-body">
      <div className="card card-md">
        <Link to="/matches" className="back-link">← Back to matches</Link>
        <h1>Confirm booking</h1>
        <p style={{ color: "var(--gray-600)", margin: "4px 0 20px", fontSize: 14 }}>
          {match.home_team.name} vs {match.away_team.name} ·{" "}
          {new Date(match.kickoff_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} ·{" "}
          {match.stadium.name}
        </p>

        {/* Countdown */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
          borderRadius: "var(--radius-sm)", marginBottom: 20,
          background: expired ? "#fee2e2" : "#fff7ed",
          border: `1px solid ${expired ? "#fecaca" : "#fed7aa"}`,
          color: expired ? "#991b1b" : "#92400e",
        }}>
          <div style={{ fontSize: 22 }}>{expired ? "⏰" : "⏳"}</div>
          <div>
            {expired
              ? <strong>Hold expired — your seats have been released.</strong>
              : <><strong>Hold expires in {minutes}:{secs}</strong> — confirm before time runs out</>}
          </div>
        </div>

        {/* Seat list */}
        <div style={{ border: "1px solid var(--gray-200)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 20 }}>
          {seats.map((s, i) => (
            <div key={s.match_seat_id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px",
              borderTop: i > 0 ? "1px solid var(--gray-200)" : "none",
            }}>
              <span style={{ fontSize: 15 }}>
                <strong>{s.section || "Section"}</strong>
                {" · "} Row {s.row}, Seat {s.seat}
              </span>
              <strong>€{parseFloat(s.price).toFixed(2)}</strong>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px", borderTop: "2px solid var(--gray-200)",
            background: "var(--gray-50)",
          }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <strong style={{ fontSize: 20 }}>€{total.toFixed(2)}</strong>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={confirm} disabled={busy || expired} style={{ flex: 1 }}>
            {busy ? "Confirming…" : "Confirm booking"}
          </button>
          <button className="btn-ghost" onClick={release} disabled={busy} style={{ padding: "12px 20px" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
