import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { TeamLogo } from "../utils/teamLogos";

const COMP_BG = {
  BUNDESLIGA:
    "linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.62)), url('/bundesliga.jpg') center / cover no-repeat fixed",
  CHAMPIONS_LEAGUE:
    "linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.60)), url('/champions.jpg') center / cover no-repeat fixed",
  DFB_POKAL:
    "linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.62)), url('/dfb-pokal.jpg') center / cover no-repeat fixed",
  FRIENDLY:
    "linear-gradient(160deg, #1f2937 0%, #111827 100%)",
  ALL:
    "linear-gradient(160deg, #0a1d4f 0%, #1e3a8a 60%, #0a1d4f 100%)",
};

const COMP_META = {
  BUNDESLIGA:       { label: "Bundesliga",       bg: "#d20a11", color: "white" },
  CHAMPIONS_LEAGUE: { label: "Champions League", bg: "#0a3d8a", color: "white" },
  DFB_POKAL:        { label: "DFB Pokal",        bg: "#f59e0b", color: "#111" },
  FRIENDLY:         { label: "Friendly",         bg: "#525252", color: "white" },
};

const ALL_TABS = ["ALL", "BUNDESLIGA", "CHAMPIONS_LEAGUE", "DFB_POKAL", "FRIENDLY"];

export default function Matches() {
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("ALL");
  const [hoverComp, setHoverComp] = useState(null);  // hover-driven background

  useEffect(() => {
    api.listMatches()
      .then((data) => setMatches(data.items || []))
      .catch((err)  => setError(err.detail?.message || "Failed to load matches"))
      .finally(()   => setLoading(false));
  }, []);

  const visible = filter === "ALL" ? matches : matches.filter((m) => m.competition === filter);
  const usedComps = [...new Set(matches.map((m) => m.competition))];
  const tabs = ALL_TABS.filter((t) => t === "ALL" || usedComps.includes(t));

  // Hover overrides filter; filter overrides default
  const bg = COMP_BG[hoverComp] || COMP_BG[filter] || COMP_BG.ALL;

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      width: "100%",
      background: bg,
      transition: "background 0.6s ease",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "48px 24px 64px",
    }}>
      {/* Floating white card */}
      <div style={{
        background: "white",
        borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: 820,
        padding: "36px 36px 28px",
        animation: "slideUp .35s cubic-bezier(.2,.7,.3,1)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Upcoming Matches</h1>
          <p style={{ margin: "5px 0 0", color: "var(--gray-600)", fontSize: 14 }}>
            Select a match to browse available seats
          </p>
        </div>

        {/* Competition filter tabs */}
        {tabs.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {tabs.map((t) => {
              const active = filter === t;
              const meta = COMP_META[t];
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 99,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: active
                      ? "2px solid transparent"
                      : "2px solid var(--gray-200)",
                    background: active
                      ? (t === "ALL" ? "var(--blue)" : (meta?.bg || "var(--blue)"))
                      : "white",
                    color: active
                      ? (t === "DFB_POKAL" ? "#111" : "white")
                      : "var(--gray-600)",
                    boxShadow: active ? "0 4px 14px rgba(0,0,0,0.18)" : "none",
                    transition: "all 0.18s",
                  }}
                >
                  {t === "ALL" ? "All competitions" : (meta?.label || t)}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />
            ))}
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {!loading && visible.length === 0 && (
          <p style={{ color: "var(--gray-400)", textAlign: "center", padding: "32px 0" }}>
            No matches found for this competition.
          </p>
        )}

        {/* Match cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map((m) => {
            const comp = COMP_META[m.competition] || COMP_META.FRIENDLY;
            const date = new Date(m.kickoff_at);
            return (
              <Link
                key={m.id}
                to={`/matches/${m.id}`}
                style={{
                  textDecoration: "none", color: "inherit",
                  display: "block",
                  background: "white",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 14,
                  padding: "18px 22px",
                  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                  boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.14)";
                  e.currentTarget.style.borderColor = "var(--red)";
                  setHoverComp(m.competition);   // ← background changes per match
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)";
                  e.currentTarget.style.borderColor = "var(--gray-200)";
                  setHoverComp(null);
                }}
              >
                {/* Top row: badge + date */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    background: comp.bg, color: comp.color,
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.8,
                    padding: "4px 10px", borderRadius: 6,
                    textTransform: "uppercase",
                  }}>
                    {comp.label}
                  </span>
                  <span style={{ color: "var(--gray-500)", fontSize: 13 }}>
                    {date.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Teams row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Home */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <TeamLogo team={m.home_team} size={56} />
                    <strong style={{ fontSize: 14, textAlign: "center", lineHeight: 1.3 }}>{m.home_team.name}</strong>
                  </div>

                  {/* VS */}
                  <div style={{ textAlign: "center", flex: "0 0 auto", padding: "0 12px" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--gray-300)", letterSpacing: 3 }}>VS</div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 5 }}>{m.stadium.name}</div>
                  </div>

                  {/* Away */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <TeamLogo team={m.away_team} size={56} />
                    <strong style={{ fontSize: 14, textAlign: "center", lineHeight: 1.3 }}>{m.away_team.name}</strong>
                  </div>
                </div>

                {/* Browse seats link */}
                <div style={{ marginTop: 14, textAlign: "right", fontSize: 13, color: "var(--red)", fontWeight: 700 }}>
                  Browse seats →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
