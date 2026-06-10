import { useState } from "react";

// Wikipedia Commons PNG thumbnails — reliable, no API key needed.
// onError falls back to the colored text circle.
const LOGO_URLS = {
  FCB: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg/200px-FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg.png",
  BVB: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/200px-Borussia_Dortmund_logo.svg.png",
  S04: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/FC_Schalke_04_Logo.svg/200px-FC_Schalke_04_Logo.svg.png",
  RBL: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/RB_Leipzig_2014_logo.svg/200px-RB_Leipzig_2014_logo.svg.png",
  B04: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Bayer_Leverkusen_logo.svg/200px-Bayer_Leverkusen_logo.svg.png",
  SGE: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/200px-Eintracht_Frankfurt_Logo.svg.png",
  RMA: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Real_Madrid_CF.08.svg/200px-Real_Madrid_CF.08.svg.png",
  MCI: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Manchester_City_FC_badge.svg/200px-Manchester_City_FC_badge.svg.png",
  PSG: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Paris_Saint-Germain_F.C..svg/200px-Paris_Saint-Germain_F.C..svg.png",
  FCB_NEW: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/FC_Bayern_M%C3%BCnchen_AG_logo.svg/200px-FC_Bayern_M%C3%BCnchen_AG_logo.svg.png",
};

const FALLBACK_COLORS = {
  FCB: { bg: "#DC052D", text: "#FFFFFF", ring: "#0066B2" },
  BVB: { bg: "#FDE100", text: "#000000", ring: "#000000" },
  S04: { bg: "#004D9D", text: "#FFFFFF", ring: "#FFFFFF" },
  RBL: { bg: "#DD0741", text: "#FFFFFF", ring: "#E4002B" },
  B04: { bg: "#E32219", text: "#FFFFFF", ring: "#000000" },
  SGE: { bg: "#E1000F", text: "#FFFFFF", ring: "#000000" },
  RMA: { bg: "#FFFFFF", text: "#00529F", ring: "#FFC107" },
  MCI: { bg: "#6CABDD", text: "#FFFFFF", ring: "#1C2C5B" },
  PSG: { bg: "#004170", text: "#FFFFFF", ring: "#DA291C" },
  DEFAULT: { bg: "#525252", text: "#FFFFFF", ring: "#FFFFFF" },
};

function lighten(hex, pct) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * pct / 100));
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * pct / 100));
  const b = Math.min(255, (n & 0xff) + Math.round(255 * pct / 100));
  return `rgb(${r},${g},${b})`;
}

export function TeamLogo({ team, size = 40 }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (!team) return null;

  const short = team.short_name;
  // Priority: team-provided logo_url from the DB > hardcoded LOGO_URLS map
  const url = team.logo_url || LOGO_URLS[short];

  if (url && !imgFailed) {
    return (
      <img
        src={url}
        alt={team.name}
        title={team.name}
        width={size}
        height={size}
        style={{
          borderRadius: "50%",
          objectFit: "contain",
          background: "white",
          border: "2px solid #e5e7eb",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          transition: "transform 0.15s",
        }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  // Fallback: colored text circle
  const c = FALLBACK_COLORS[short] || FALLBACK_COLORS.DEFAULT;
  return (
    <div
      title={team.name}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${lighten(c.bg, 20)}, ${c.bg})`,
        color: c.text,
        border: `2px solid ${c.ring}`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: size * 0.30, letterSpacing: 0.5,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18), inset 0 -2px 4px rgba(0,0,0,0.15)",
        flexShrink: 0, userSelect: "none", transition: "transform 0.15s",
      }}
    >
      {short || team.name?.slice(0, 3).toUpperCase() || "?"}
    </div>
  );
}
