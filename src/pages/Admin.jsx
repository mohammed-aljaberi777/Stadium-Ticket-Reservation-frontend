import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { TeamLogo } from "../utils/teamLogos";

const STATUS_COLORS = {
  SCHEDULED:   { bg: "#dbeafe", color: "#1d4ed8" },
  ON_SALE:     { bg: "#dcfce7", color: "#16a34a" },
  SOLD_OUT:    { bg: "#fee2e2", color: "#dc2626" },
  IN_PROGRESS: { bg: "#fef9c3", color: "#b45309" },
  COMPLETED:   { bg: "#f3f4f6", color: "#6b7280" },
  CANCELLED:   { bg: "#fee2e2", color: "#991b1b" },
};

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("matches");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { refresh(); }, []);

  function refresh() {
    setLoading(true);
    api.listMatches()
      .then((d) => setMatches(d.items || []))
      .finally(() => setLoading(false));
  }

  if (user && user.role !== "ADMIN") return <Navigate to="/matches" replace />;

  const TABS = [
    { id: "matches",   icon: "📅", label: "Matches" },
    { id: "new-team",  icon: "🏟️", label: "New Team" },
    { id: "new-match", icon: "⚽", label: "New Match" },
  ];

  return (
    <div style={{ width: "100%", minHeight: "calc(100vh - 60px)", background: "var(--gray-50)" }}>

      {/* ── Hero banner ── */}
      <div style={{
        position: "relative",
        height: 200,
        background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url('/bundesliga.jpg') center / cover no-repeat",
        display: "flex",
        alignItems: "flex-end",
        padding: "0 0 28px 0",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, background: "var(--red)",
            borderRadius: "50%", fontSize: 26, marginBottom: 10,
            boxShadow: "0 4px 14px rgba(220,5,45,.5)",
            border: "3px solid rgba(255,255,255,.25)",
          }}>⚙️</div>
          <h1 style={{ margin: 0, color: "white", fontSize: 30, fontWeight: 900, letterSpacing: -0.5 }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.65)", fontSize: 14 }}>
            {user?.full_name} · {user?.role}
          </p>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        display: "flex", justifyContent: "center",
        background: "white",
        borderBottom: "1px solid var(--gray-200)",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        position: "sticky", top: 60, zIndex: 90,
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "transparent",
              border: 0,
              borderBottom: tab === t.id ? "3px solid var(--red)" : "3px solid transparent",
              color: tab === t.id ? "var(--red)" : "var(--gray-600)",
              padding: "14px 28px",
              fontWeight: tab === t.id ? 700 : 500,
              fontSize: 15,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              transition: "color 0.15s, border-color 0.15s",
              boxShadow: "none",
              borderRadius: 0,
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "36px 24px 64px" }}>
        <div style={{ width: "100%", maxWidth: 820, animation: "slideUp .3s ease" }}>
          {tab === "matches"   && <MatchesList matches={matches} loading={loading} onRefresh={refresh} />}
          {tab === "new-team"  && <NewTeamForm onCreated={refresh} />}
          {tab === "new-match" && <NewMatchForm onCreated={() => { refresh(); setTab("matches"); }} />}
        </div>
      </div>
    </div>
  );
}

// ── Matches list ─────────────────────────────────────────────────
function MatchesList({ matches, loading, onRefresh }) {
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius)" }} />)}
    </div>
  );
  if (matches.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-400)" }}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
      <p style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>No matches yet</p>
      <p style={{ margin: "6px 0 20px", fontSize: 14 }}>Create your first match using the tab above.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0 }}>All Matches</h2>
          <p style={{ margin: "3px 0 0", color: "var(--gray-600)", fontSize: 14 }}>{matches.length} matches total</p>
        </div>
        <button className="btn-sm btn-ghost" onClick={onRefresh}>↺ Refresh</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {matches.map((m) => {
          const sc = STATUS_COLORS[m.status] || { bg: "#f3f4f6", color: "#6b7280" };
          return (
            <div key={m.id} style={{
              background: "white", border: "1.5px solid var(--gray-200)",
              borderRadius: "var(--radius)", padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow var(--transition)",
            }}>
              <TeamLogo team={m.home_team} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 15 }}>{m.home_team.name} vs {m.away_team.name}</strong>
                <div style={{ color: "var(--gray-600)", fontSize: 13, marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span>{m.competition.replace(/_/g, " ")}</span>
                  <span>·</span>
                  <span>{new Date(m.kickoff_at).toLocaleString("en-GB", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}</span>
                  <span>·</span>
                  <span>Max {m.max_tickets_per_user}/fan</span>
                </div>
              </div>
              <TeamLogo team={m.away_team} size={42} />
              <span className="badge" style={{ background: sc.bg, color: sc.color, flexShrink: 0 }}>
                {m.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Create team ──────────────────────────────────────────────────
function NewTeamForm({ onCreated }) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [country, setCountry] = useState("Germany");
  const [logoData, setLogoData] = useState("");      // base64 data URI of the uploaded image
  const [logoFileName, setLogoFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function handleFileChange(e) {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG / JPG / SVG / WebP).");
      return;
    }
    if (file.size > 500 * 1024) {
      setError(`Image is too large (${(file.size / 1024).toFixed(0)} KB). Max 500 KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoData(reader.result);     // "data:image/png;base64,..."
      setLogoFileName(file.name);
    };
    reader.onerror = () => setError("Could not read the image file.");
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    setLogoData("");
    setLogoFileName("");
  }

  async function submit(e) {
    e.preventDefault();
    setError(""); setMsg(""); setBusy(true);
    try {
      const team = await api.createTeam({
        name,
        short_name: shortName,
        country,
        logo_url: logoData || null,
      });
      setMsg(`Team "${team.name}" created successfully.`);
      setName(""); setShortName(""); setCountry("Germany");
      setLogoData(""); setLogoFileName("");
      onCreated?.();
    } catch (err) {
      const d = err.detail;
      let msg = "Failed to create team";
      if (typeof d === "string") msg = d;
      else if (d?.message) msg = d.message;
      else if (Array.isArray(d) && d[0]?.msg) msg = d[0].msg;
      else if (d) msg = JSON.stringify(d);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "32px 36px", boxShadow: "var(--shadow)" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0 }}>Create a Team</h2>
        <p style={{ margin: "4px 0 0", color: "var(--gray-600)", fontSize: 14 }}>Add a new club to the system</p>
      </div>
      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Full club name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="FC Bayern München" />
          </div>
          <div className="field">
            <label>Short code (max 10)</label>
            <input value={shortName} onChange={(e) => setShortName(e.target.value.toUpperCase())} required maxLength={10} placeholder="FCB" />
          </div>
          <div className="field">
            <label>Country</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} required placeholder="Germany" />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Team logo (optional)</label>
            {!logoData ? (
              <label
                htmlFor="logo-upload"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  padding: "24px 16px",
                  border: "2px dashed var(--gray-200)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gray-50)",
                  cursor: "pointer",
                  transition: "border-color .15s, background .15s",
                  color: "var(--gray-600)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--red)";
                  e.currentTarget.style.background = "var(--red-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--gray-200)";
                  e.currentTarget.style.background = "var(--gray-50)";
                }}
              >
                <div style={{ fontSize: 32 }}>🖼️</div>
                <strong style={{ fontSize: 14 }}>Click to upload an image</strong>
                <span style={{ fontSize: 12 }}>PNG · JPG · SVG · WebP — max 500 KB</span>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px",
                border: "1.5px solid var(--green)",
                borderRadius: "var(--radius-sm)",
                background: "var(--green-bg)",
              }}>
                <img
                  src={logoData}
                  alt="Logo preview"
                  style={{
                    width: 56, height: 56, borderRadius: "50%",
                    objectFit: "contain", background: "white",
                    border: "2px solid white", boxShadow: "var(--shadow-sm)",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14, color: "var(--gray-900)", display: "block" }}>
                    {logoFileName}
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--green)" }}>
                    ✓ Ready to upload
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearLogo}
                  className="btn-ghost btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        {msg && <p className="success-banner" style={{ marginTop: 16 }}>✓ {msg}</p>}
        {error && <p className="error" style={{ marginTop: 16 }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ marginTop: 20, width: "100%" }}>
          {busy ? "Creating…" : "Create team"}
        </button>
      </form>
    </div>
  );
}

// ── Create match ─────────────────────────────────────────────────
function NewMatchForm({ onCreated }) {
  const [teams, setTeams] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [stadiumId, setStadiumId]   = useState("");
  const [homeId, setHomeId]         = useState("");
  const [awayId, setAwayId]         = useState("");
  const [competition, setCompetition] = useState("BUNDESLIGA");
  const [kickoffAt, setKickoffAt]   = useState("");
  const [salesOpenAt, setSalesOpenAt] = useState("");
  const [salesCloseAt, setSalesCloseAt] = useState("");
  const [maxTickets, setMaxTickets] = useState(4);
  const [busy, setBusy]   = useState(false);
  const [msg, setMsg]     = useState("");
  const [error, setError] = useState("");

  // Load all teams + stadiums from the admin endpoints — so newly created
  // teams show up even if they're not part of any existing match yet.
  useEffect(() => {
    Promise.all([
      api.listAdminTeams().catch(() => ({ items: [] })),
      api.listAdminStadiums().catch(() => ({ items: [] })),
    ]).then(([t, s]) => {
      setTeams(t.items || []);
      setStadiums(s.items || []);
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(""); setMsg(""); setBusy(true);
    try {
      const m = await api.createMatch({
        stadium_id:          stadiumId,
        home_team_id:        homeId,
        away_team_id:        awayId,
        competition,
        kickoff_at:          new Date(kickoffAt).toISOString(),
        sales_open_at:       new Date(salesOpenAt).toISOString(),
        sales_close_at:      new Date(salesCloseAt).toISOString(),
        max_tickets_per_user: parseInt(maxTickets),
      });
      setMsg(`Match created (id: ${m.id.slice(0, 8)}…). Remember to generate seat inventory!`);
      onCreated?.();
    } catch (err) {
      const d = err.detail;
      let msg = "Failed to create match";
      if (typeof d === "string") msg = d;
      else if (d?.message) msg = d.message;
      else if (Array.isArray(d) && d[0]?.msg) msg = d[0].msg;
      else if (d) msg = JSON.stringify(d);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const selectStyle = {
    padding: "11px 14px", border: "1.5px solid var(--gray-200)",
    borderRadius: "var(--radius-sm)", font: "inherit", fontSize: 15,
    background: "var(--gray-50)", color: "var(--gray-900)",
    width: "100%", cursor: "pointer",
    transition: "border-color .15s, box-shadow .15s",
  };

  return (
    <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "32px 36px", boxShadow: "var(--shadow)" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0 }}>Create a Match</h2>
        <p style={{ margin: "4px 0 0", color: "var(--gray-600)", fontSize: 14 }}>
          After saving, generate per-match seat inventory via the seed script.
        </p>
      </div>

      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Stadium – full width */}
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Stadium</label>
            <select value={stadiumId} onChange={(e) => setStadiumId(e.target.value)} required style={selectStyle}>
              <option value="">Choose a stadium</option>
              {stadiums.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.city}</option>)}
            </select>
          </div>

          {/* Home team */}
          <div className="field">
            <label>Home team</label>
            <select value={homeId} onChange={(e) => setHomeId(e.target.value)} required style={selectStyle}>
              <option value="">Choose home team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Away team */}
          <div className="field">
            <label>Away team</label>
            <select value={awayId} onChange={(e) => setAwayId(e.target.value)} required style={selectStyle}>
              <option value="">Choose away team</option>
              {teams.filter((t) => t.id !== homeId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Competition */}
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Competition</label>
            <select value={competition} onChange={(e) => setCompetition(e.target.value)} required style={selectStyle}>
              <option value="BUNDESLIGA">Bundesliga</option>
              <option value="DFB_POKAL">DFB Pokal</option>
              <option value="CHAMPIONS_LEAGUE">Champions League</option>
              <option value="FRIENDLY">Friendly</option>
            </select>
          </div>

          {/* Kickoff */}
          <div className="field">
            <label>Kickoff time</label>
            <input type="datetime-local" value={kickoffAt} onChange={(e) => setKickoffAt(e.target.value)} required />
          </div>

          {/* Max tickets */}
          <div className="field">
            <label>Max tickets per fan</label>
            <input type="number" min="1" max="20" value={maxTickets} onChange={(e) => setMaxTickets(e.target.value)} required />
          </div>

          {/* Sales open */}
          <div className="field">
            <label>Sales open at</label>
            <input type="datetime-local" value={salesOpenAt} onChange={(e) => setSalesOpenAt(e.target.value)} required />
          </div>

          {/* Sales close */}
          <div className="field">
            <label>Sales close at</label>
            <input type="datetime-local" value={salesCloseAt} onChange={(e) => setSalesCloseAt(e.target.value)} required />
          </div>
        </div>

        {msg   && <p className="success-banner" style={{ marginTop: 20 }}>✓ {msg}</p>}
        {error && <p className="error"          style={{ marginTop: 20 }}>{error}</p>}

        <button type="submit" disabled={busy} style={{ marginTop: 24, width: "100%" }}>
          {busy ? "Creating match…" : "Create match"}
        </button>
      </form>
    </div>
  );
}
