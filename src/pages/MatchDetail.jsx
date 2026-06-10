import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import StadiumMap, { sectionToSide } from "../components/StadiumMap";
import { TeamLogo } from "../utils/teamLogos";

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [sections, setSections] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getMatch(matchId), api.getSections(matchId)])
      .then(([m, s]) => { setMatch(m); setSections(s.items || []); })
      .catch((err) => setError(err.detail?.message || "Failed to load match"))
      .finally(() => setLoading(false));
  }, [matchId]);

  async function showSection(section) {
    if (openSection?.section_id === section.section_id) {
      setOpenSection(null); setSeats([]); setSelectedSeats([]); return;
    }
    setOpenSection(section); setSelectedSeats([]); setSeatsLoading(true);
    try {
      const data = await api.getSeats(matchId, section.section_id);
      setSeats(data.items || []);
    } catch (err) {
      setError(err.detail?.message || "Failed to load seats");
    } finally {
      setSeatsLoading(false);
    }
  }

  function toggleSeat(seat) {
    setSelectedSeats((cur) => {
      if (cur.find((s) => s.match_seat_id === seat.match_seat_id))
        return cur.filter((s) => s.match_seat_id !== seat.match_seat_id);
      if (cur.length >= (match?.max_tickets_per_user || 4)) return cur;
      // attach the section name so the confirm page can display it
      return [...cur, { ...seat, section: openSection?.name || "" }];
    });
  }

  async function holdSeats() {
    setError("");
    try {
      const hold = await api.createHold(matchId, selectedSeats.map((s) => s.match_seat_id));
      navigate(`/confirm/${hold.hold_id}`, { state: { hold, match, seats: selectedSeats } });
    } catch (err) {
      setError(err.detail?.message || err.detail?.detail || "Failed to hold seats");
    }
  }

  if (loading) return (
    <div className="page-body">
      <div className="card card-wide" style={{ alignSelf: "flex-start" }}>
        <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius)", marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius)" }} />
      </div>
    </div>
  );

  if (!match) return (
    <div className="page-body">
      <div className="card"><p className="error">{error || "Match not found"}</p></div>
    </div>
  );

  const total = selectedSeats.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const maxSeats = match.max_tickets_per_user || 4;

  return (
    <div className="page-body">
      <div className="card card-wide" style={{ alignSelf: "flex-start" }}>
        <Link to="/matches" className="back-link">← All matches</Link>

        {/* Match header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20,
          background: "linear-gradient(135deg, var(--blue) 0%, var(--blue-mid) 100%)",
          borderRadius: "var(--radius)", padding: "24px 28px", marginBottom: 24, color: "white",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 10 }}>
            <TeamLogo team={match.home_team} size={64} />
            <strong style={{ fontSize: 15, textAlign: "center", lineHeight: 1.3 }}>{match.home_team.name}</strong>
          </div>
          <div style={{ textAlign: "center", flex: "0 0 auto" }}>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 3, opacity: .75 }}>VS</div>
            <div style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>
              {new Date(match.kickoff_at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ fontSize: 12, opacity: .6, marginTop: 2 }}>{match.stadium.name}</div>
            <div style={{
              marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: .5,
              background: "rgba(255,255,255,.15)", padding: "3px 10px", borderRadius: 99,
              display: "inline-block",
            }}>
              {match.competition.replace(/_/g, " ")}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 10 }}>
            <TeamLogo team={match.away_team} size={64} />
            <strong style={{ fontSize: 15, textAlign: "center", lineHeight: 1.3 }}>{match.away_team.name}</strong>
          </div>
        </div>

        <StadiumMap
          highlight={openSection ? sectionToSide(openSection.name) : null}
          sectionName={openSection?.name}
        />

        {error && <p className="error" style={{ marginTop: 16 }}>{error}</p>}

        {/* Sales window banner */}
        {(() => {
          const now = new Date();
          const opensAt = match.sales_open_at ? new Date(match.sales_open_at) : null;
          const closesAt = match.sales_close_at ? new Date(match.sales_close_at) : null;
          if (opensAt && now < opensAt) {
            return (
              <div style={{
                marginTop: 20, padding: "16px 20px",
                background: "#fff7ed", border: "1px solid #fed7aa",
                color: "#92400e", borderRadius: "var(--radius-sm)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ fontSize: 24 }}>⏳</div>
                <div>
                  <strong>Sales haven't opened yet</strong>
                  <div style={{ fontSize: 13, marginTop: 2 }}>
                    Tickets go on sale on{" "}
                    {opensAt.toLocaleString("en-GB", {
                      weekday: "long", day: "numeric", month: "long",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          }
          if (closesAt && now > closesAt) {
            return (
              <div style={{
                marginTop: 20, padding: "16px 20px",
                background: "#fee2e2", border: "1px solid #fecaca",
                color: "#991b1b", borderRadius: "var(--radius-sm)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ fontSize: 24 }}>🔒</div>
                <div>
                  <strong>Ticket sales have closed</strong>
                  <div style={{ fontSize: 13, marginTop: 2 }}>This match is no longer accepting bookings.</div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div style={{ marginTop: 28, marginBottom: 8, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Choose a section</h2>
          <span style={{ fontSize: 13, color: "var(--gray-600)" }}>Max {maxSeats} tickets per fan</span>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sections.map((s) => {
            const isOpen = openSection?.section_id === s.section_id;
            const avail = s.available_seats;
            const availColor = avail === 0 ? "var(--red)" : avail < 10 ? "var(--amber)" : "var(--green)";
            return (
              <li key={s.section_id} className="section-row">
                <button className="section-btn" onClick={() => showSection(s)}>
                  <span>
                    <strong style={{ fontSize: 15 }}>{s.name}</strong>
                    <span style={{ color: "var(--gray-600)", fontSize: 13, marginLeft: 8 }}>
                      {s.category} · {s.tier}
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
                    <span style={{ color: availColor, fontWeight: 700, fontSize: 13 }}>
                      {avail} left
                    </span>
                    <span style={{ color: "var(--gray-600)" }}>from €{s.min_price}</span>
                    <span style={{ color: "var(--gray-400)", fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
                  </span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 0 18px" }}>
                    {seatsLoading && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 6, marginTop: 8 }}>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="skeleton" style={{ height: 44, borderRadius: "var(--radius-sm)" }} />
                        ))}
                      </div>
                    )}
                    {!seatsLoading && seats.length === 0 && (
                      <p style={{ color: "var(--gray-400)", fontSize: 14, margin: "12px 0 0" }}>No available seats in this section.</p>
                    )}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
                      gap: 6, marginTop: 8,
                    }}>
                      {seats.map((seat) => {
                        const sel = selectedSeats.find((x) => x.match_seat_id === seat.match_seat_id);
                        return (
                          <button
                            key={seat.match_seat_id}
                            className={"seat-btn" + (sel ? " seat-selected" : "")}
                            onClick={() => toggleSeat(seat)}
                          >
                            R{seat.row}<br />S{seat.seat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {selectedSeats.length > 0 && (
          <div className="booking-bar">
            <div>
              <strong style={{ fontSize: 16 }}>
                {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected
              </strong>
              <div style={{ color: "var(--gray-600)", fontSize: 14, marginTop: 2 }}>
                Total: <strong style={{ color: "var(--gray-900)" }}>€{total.toFixed(2)}</strong>
              </div>
            </div>
            <button onClick={holdSeats} style={{ padding: "12px 28px" }}>
              Hold for 5 min →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
