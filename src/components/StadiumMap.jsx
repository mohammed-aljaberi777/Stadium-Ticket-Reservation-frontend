import { useState } from "react";

// ── Geometry helpers ────────────────────────────────────────────
const CX = 400, CY = 268;

// [innerRx, innerRy, outerRx, outerRy] for each ring
const RINGS = [
  [126, 80, 166, 108],   // ring 0 – lower bowl
  [170, 112, 210, 140],  // ring 1 – middle tier
  [214, 144, 252, 170],  // ring 2 – upper tier
];

const CAT_COLORS = {
  1: "#dc2626",   // red
  2: "#f97316",   // orange
  3: "#16a34a",   // green
  4: "#1d4ed8",   // blue
  5: "#d97706",   // amber – Stehplätze
  6: "#7c3aed",   // purple – Business/Sponsor
};
const CAT_LABELS = {
  1: "Cat. 1", 2: "Cat. 2", 3: "Cat. 3",
  4: "Cat. 4", 5: "Stehplätze", 6: "Business",
};

function toRad(deg) { return (deg - 90) * Math.PI / 180; }
function ep(rx, ry, deg) {
  const r = toRad(deg);
  return [CX + rx * Math.cos(r), CY + ry * Math.sin(r)];
}
function f(n) { return n.toFixed(1); }

function buildPath(s0, e0, ring, gap = 0.6) {
  const s = s0 + gap, e = e0 - gap;
  const [irx, iry, orx, ory] = RINGS[ring];
  const lg = (e - s) > 180 ? 1 : 0;
  const [isx, isy] = ep(irx, iry, s);
  const [iex, iey] = ep(irx, iry, e);
  const [osx, osy] = ep(orx, ory, s);
  const [oex, oey] = ep(orx, ory, e);
  return `M${f(isx)} ${f(isy)} L${f(osx)} ${f(osy)} A${orx} ${ory} 0 ${lg} 1 ${f(oex)} ${f(oey)} L${f(iex)} ${f(iey)} A${irx} ${iry} 0 ${lg} 0 ${f(isx)} ${f(isy)}Z`;
}

function midPt(s0, e0, ring) {
  const m = (s0 + e0) / 2;
  const [irx, iry, orx, ory] = RINGS[ring];
  return ep((irx + orx) / 2, (iry + ory) / 2, m);
}

// ── Section definitions ─────────────────────────────────────────
// Angles: 0° = top (Nordkurve), clockwise.
// Zones: NORTH (-54→54), EAST (56→124), SOUTH (126→234), WEST (236→304)
const GROUPS = [
  // NORTH – Ring 0 (8 blocks 101-108)
  { zone:"NORTH", s:-54, e:54,  ring:0, n:101, cats:[2,2,1,1,1,1,2,2] },
  // NORTH – Ring 1 (14 blocks 201-214)
  { zone:"NORTH", s:-54, e:54,  ring:1, n:201, cats:[4,4,4,3,3,3,3,3,3,3,3,4,4,4] },
  // NORTH – Ring 2 (10 blocks 301-310)
  { zone:"NORTH", s:-54, e:54,  ring:2, n:301, cats:[4,4,4,4,4,4,4,4,4,4] },

  // EAST – Ring 0 (11 blocks 126-136)
  { zone:"EAST",  s:56,  e:124, ring:0, n:126, cats:[2,2,1,1,1,1,1,1,2,2,2] },
  // EAST – Ring 1 (13 blocks 235-247)
  { zone:"EAST",  s:56,  e:124, ring:1, n:235, cats:[3,6,6,6,6,6,6,6,6,6,6,3,3] },
  // EAST – Ring 2 (17 blocks 332-348)
  { zone:"EAST",  s:56,  e:124, ring:2, n:332, cats:Array(17).fill(4) },

  // SOUTH – Ring 0  (8 blocks 118-125, standing)
  { zone:"SOUTH", s:126, e:234, ring:0, n:118, cats:Array(8).fill(5) },
  // SOUTH – Ring 1  (9 blocks 226-234)
  { zone:"SOUTH", s:126, e:234, ring:1, n:226, cats:Array(9).fill(3) },
  // SOUTH – Ring 2  (14 blocks 318-331)
  { zone:"SOUTH", s:126, e:234, ring:2, n:318, cats:Array(14).fill(4) },

  // WEST – Ring 0  (9 blocks 109-117)
  { zone:"WEST",  s:236, e:304, ring:0, n:109, cats:[2,2,1,1,1,1,1,2,2] },
  // WEST – Ring 1  (11 blocks 215-225)
  { zone:"WEST",  s:236, e:304, ring:1, n:215, cats:[3,3,6,6,6,6,6,6,6,3,3] },
  // WEST – Ring 2  (11 blocks 311-321)
  { zone:"WEST",  s:236, e:304, ring:2, n:311, cats:Array(11).fill(4) },
];

const SECTIONS = GROUPS.flatMap((g) => {
  const step = (g.e - g.s) / g.cats.length;
  return g.cats.map((cat, i) => {
    const s0 = g.s + i * step, e0 = s0 + step;
    return {
      id:   g.n + i,
      label: String(g.n + i),
      s0, e0, span: step,
      ring: g.ring,
      cat,
      zone: g.zone,
      path: buildPath(s0, e0, g.ring),
      mid:  midPt(s0, e0, g.ring),
    };
  });
});

// ── Component ───────────────────────────────────────────────────
export default function StadiumMap({ highlight = null, sectionName = "" }) {
  const [hovered, setHovered] = useState(null);
  const hovSec = SECTIONS.find((s) => s.id === hovered);

  return (
    <div style={{
      width: "100%", maxWidth: 580, margin: "0 auto",
      background: "linear-gradient(160deg,#0a1d4f 0%,#091736 100%)",
      borderRadius: 18, padding: "14px 14px 10px",
      boxShadow: "0 8px 32px rgba(10,29,79,.4)",
      userSelect: "none",
    }}>
      <svg viewBox="0 0 800 536" style={{ width: "100%", display: "block" }}>
        <defs>
          {/* Glow for highlighted zone */}
          <filter id="glow-zone" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Gentle glow for hover */}
          <filter id="glow-hov" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Pitch grass gradient */}
          <linearGradient id="pitch-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a"/>
            <stop offset="50%" stopColor="#15803d"/>
            <stop offset="100%" stopColor="#166534"/>
          </linearGradient>
          {/* Stripe pattern on pitch */}
          <pattern id="stripes" x="0" y="0" width="24" height="1" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="12" height="1" fill="rgba(0,0,0,0.07)"/>
          </pattern>
        </defs>

        {/* ── Section paths ── */}
        {SECTIONS.map((s) => {
          const isHL  = highlight === s.zone;
          const isHov = hovered === s.id;
          const color = CAT_COLORS[s.cat];
          const showTxt = s.ring >= 1 || s.span > 9;
          const fs = s.ring === 2 ? 7.5 : s.ring === 1 ? 6.5 : 5.8;

          return (
            <g
              key={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <path
                d={s.path}
                fill={color}
                stroke={isHov ? "white" : "rgba(255,255,255,0.2)"}
                strokeWidth={isHov ? "1.2" : "0.6"}
                opacity={isHov ? 1 : isHL ? 0.95 : 0.68}
                filter={isHov ? "url(#glow-hov)" : (isHL ? "url(#glow-zone)" : undefined)}
                style={{ transition: "opacity 0.18s, stroke 0.15s" }}
              />
              {showTxt && (
                <text
                  x={s.mid[0]} y={s.mid[1]}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize={fs} fontWeight="800"
                  style={{ pointerEvents: "none" }}
                  opacity={isHov ? 1 : 0.9}
                >
                  {s.label}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Pitch (rendered ON TOP so it covers section overlaps) ── */}
        {/* Green background */}
        <rect x="264" y="204" width="272" height="128" rx="6" fill="url(#pitch-grad)"/>
        {/* Stripe overlay */}
        <rect x="264" y="204" width="272" height="128" rx="6" fill="url(#stripes)"/>
        {/* Pitch boundary lines */}
        <rect x="274" y="212" width="252" height="112" rx="2" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7"/>
        {/* Halfway line */}
        <line x1="400" y1="212" x2="400" y2="324" stroke="white" strokeWidth="1.2" opacity="0.7"/>
        {/* Center circle */}
        <circle cx="400" cy="268" r="22" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="400" cy="268" r="2.5" fill="white" opacity="0.85"/>
        {/* Left penalty area */}
        <rect x="274" y="242" width="44" height="52" fill="none" stroke="white" strokeWidth="1" opacity="0.6"/>
        {/* Right penalty area */}
        <rect x="482" y="242" width="44" height="52" fill="none" stroke="white" strokeWidth="1" opacity="0.6"/>
        {/* Left goal area */}
        <rect x="274" y="254" width="20" height="28" fill="none" stroke="white" strokeWidth="0.9" opacity="0.6"/>
        {/* Right goal area */}
        <rect x="506" y="254" width="20" height="28" fill="none" stroke="white" strokeWidth="0.9" opacity="0.6"/>
        {/* Left penalty spot */}
        <circle cx="308" cy="268" r="1.5" fill="white" opacity="0.7"/>
        {/* Right penalty spot */}
        <circle cx="492" cy="268" r="1.5" fill="white" opacity="0.7"/>
        {/* Left penalty arc */}
        <path d="M 318 248 A 22 22 0 0 0 318 288" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
        {/* Right penalty arc */}
        <path d="M 482 248 A 22 22 0 0 1 482 288" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
        {/* Left goal (post) */}
        <rect x="258" y="258" width="16" height="20" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
        {/* Right goal */}
        <rect x="526" y="258" width="16" height="20" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
        {/* Corner arcs */}
        <path d="M274 212 A6 6 0 0 1 280 206" fill="none" stroke="white" strokeWidth="0.9" opacity="0.5"/>
        <path d="M526 206 A6 6 0 0 1 526 212" fill="none" stroke="white" strokeWidth="0.9" opacity="0.5"/>
        <path d="M274 324 A6 6 0 0 0 280 330" fill="none" stroke="white" strokeWidth="0.9" opacity="0.5"/>
        <path d="M526 330 A6 6 0 0 0 526 324" fill="none" stroke="white" strokeWidth="0.9" opacity="0.5"/>

        {/* FC Bayern crest on pitch */}
        <circle cx="400" cy="268" r="13" fill="#dc052d" opacity="0.85"/>
        <text x="400" y="272" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="7" fontWeight="900" letterSpacing="0.4"
          style={{ pointerEvents:"none" }}>
          FCB
        </text>

        {/* ── Stand name labels ── */}
        <text x="400" y="34" textAnchor="middle" fill="rgba(255,255,255,0.65)"
          fontSize="12" fontWeight="800" letterSpacing="4">NORDKURVE</text>
        <text x="400" y="510" textAnchor="middle" fill="rgba(255,255,255,0.65)"
          fontSize="12" fontWeight="800" letterSpacing="4">SÜDKURVE</text>
        <text x="26" y="268" textAnchor="middle" fill="rgba(255,255,255,0.65)"
          fontSize="10" fontWeight="800" letterSpacing="2"
          transform="rotate(-90 26 268)">WESTTRIBÜNE</text>
        <text x="774" y="268" textAnchor="middle" fill="rgba(255,255,255,0.65)"
          fontSize="10" fontWeight="800" letterSpacing="2"
          transform="rotate(90 774 268)">OSTTRIBÜNE</text>

        {/* ── Hover tooltip ── */}
        {hovSec && (() => {
          const [tx, ty] = hovSec.mid;
          const catLbl = CAT_LABELS[hovSec.cat] || "";
          const bw = 74, bh = 22;
          return (
            <g style={{ pointerEvents: "none" }}>
              <rect x={tx - bw/2} y={ty - bh - 6} width={bw} height={bh}
                rx="5" fill="rgba(0,0,0,0.82)"
              />
              <polygon
                points={`${tx-5},${ty-6} ${tx+5},${ty-6} ${tx},${ty-2}`}
                fill="rgba(0,0,0,0.82)"
              />
              <text x={tx} y={ty - bh/2 - 6 + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="8.5" fontWeight="700">
                Block {hovSec.label} · {catLbl}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* ── Legend ── */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "6px 16px",
        padding: "8px 2px 4px", justifyContent: "center",
      }}>
        {Object.entries(CAT_LABELS).map(([k, lbl]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 11, height: 11, borderRadius: 3,
              background: CAT_COLORS[k], flexShrink: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,.3)",
            }}/>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Selected section name */}
      {sectionName && (
        <p style={{ color: "white", textAlign: "center", margin: "6px 0 2px", fontSize: 13, opacity: 0.92 }}>
          Your section: <strong>{sectionName}</strong>
        </p>
      )}
    </div>
  );
}

// ── sectionToSide ─────────────────────────────────────────────────
export function sectionToSide(name = "") {
  const n = name.toLowerCase();
  if (n.includes("nord")) return "NORTH";
  if (n.includes("süd") || n.includes("sud")) return "SOUTH";
  if (n.includes("west")) return "WEST";
  if (n.includes("ost") || n.includes("east")) return "EAST";
  if (n.includes("auswärt")) return "SOUTH";
  return null;
}
