import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, BASE_URL } from "../api/client";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrUrls, setQrUrls] = useState({});

  useEffect(() => {
    api
      .myTickets()
      .then((data) => setTickets(data.items || []))
      .catch((err) => setError(err.detail?.message || "Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    tickets.forEach((t) => {
      if (qrUrls[t.id]) return;
      fetch(`${BASE_URL}/v1/tickets/${t.id}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.blob())
        .then((blob) => setQrUrls((cur) => ({ ...cur, [t.id]: URL.createObjectURL(blob) })))
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  return (
    <div className="page-body" style={{ alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: 880 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/matches" className="back-link">← All matches</Link>
          <h1>My Tickets</h1>
          <p style={{ color: "var(--gray-600)", margin: "4px 0 0", fontSize: 14 }}>
            {tickets.length > 0 ? `${tickets.length} ticket${tickets.length > 1 ? "s" : ""} in your wallet` : ""}
          </p>
        </div>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 340, borderRadius: "var(--radius)" }} />
            ))}
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {!loading && tickets.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--gray-400)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No tickets yet</p>
            <p style={{ margin: "6px 0 20px", fontSize: 14 }}>Head to Matches to book your first seat.</p>
            <Link to="/matches"><button>Browse matches</button></Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {tickets.map((t) => {
            const issued = t.status === "ISSUED";
            return (
              <div key={t.id} className="ticket-card">
                {/* Header stripe */}
                <div className="ticket-header">
                  <div style={{ fontSize: 13, opacity: .75, marginBottom: 4 }}>
                    {new Date(t.match.kickoff_at).toLocaleString("en-GB", {
                      weekday: "short", day: "numeric", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, color: "white" }}>
                    {t.match.home_team} <span style={{ opacity: .6 }}>vs</span> {t.match.away_team}
                  </h3>
                  <div style={{ fontSize: 12, opacity: .65, marginTop: 4 }}>{t.match.stadium}</div>
                </div>

                {/* Body */}
                <div className="ticket-body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>Section</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t.seat.section}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>Seat</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Row {t.seat.row} · {t.seat.seat}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>Price</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>€{t.price_paid}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>Status</div>
                      <span
                        className="badge"
                        style={{
                          background: issued ? "var(--green-bg)" : "#fee2e2",
                          color: issued ? "var(--green)" : "#991b1b",
                          marginTop: 2,
                        }}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR footer */}
                <div className="ticket-footer">
                  {qrUrls[t.id] ? (
                    <img
                      src={qrUrls[t.id]}
                      alt="QR ticket"
                      style={{ width: 160, height: 160, borderRadius: 4 }}
                    />
                  ) : (
                    <div className="skeleton" style={{ width: 160, height: 160, borderRadius: 4 }} />
                  )}
                  <p style={{ fontSize: 11, color: "var(--gray-400)", margin: 0, letterSpacing: .5 }}>
                    {t.reference_code}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
