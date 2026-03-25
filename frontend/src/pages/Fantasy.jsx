import { Link } from "react-router-dom";

const GAME_MODES = [
  {
    title: "Weekly Pick'Em",
    subtitle: "NFL Regular Season",
    description:
      "Tippeld meg minden meccs győztesét, kövesd a heti és összesített pontokat, majd hasonlítsd össze a választásaidat más játékosokkal.",
    status: "Live",
    href: "/fantasy/weekly-pickem",
    cta: "Open",
    accent: {
      glow: "rgba(43,108,255,.34)",
      border: "rgba(59,130,246,.28)",
      dot: "#66a3ff",
      top: "rgba(18,38,84,.96)",
      bottom: "rgba(9,18,42,.96)",
      surface: "rgba(11, 23, 52, .86)",
    },
    meta: [
      { label: "Flow", value: "Weekly picks" },
      { label: "Views", value: "Leaderboard + user picks" },
    ],
    features: ["Weekly picks", "Leaderboard", "User picks"],
    footer: "Regular season tracker",
  },
  {
    title: "Perfect Challenge",
    subtitle: "Weekly roster challenge",
    description:
      "Állíts össze 8 fős heti rostert fix pozíciókra bontva, majd nézd meg a részletes weekly statokat, fantasy pontokat és a roster leaderboardot.",
    status: "Live",
    href: "/fantasy/perfect-challenge",
    cta: "Open",
    accent: {
      glow: "rgba(118,86,255,.28)",
      border: "rgba(129,140,248,.24)",
      dot: "#9aa5ff",
      top: "rgba(20,24,64,.96)",
      bottom: "rgba(11,15,38,.96)",
      surface: "rgba(18, 21, 56, .84)",
    },
    meta: [
      { label: "Roster", value: "QB / RB / WR / TE / K / DEF" },
      { label: "Views", value: "Cards + selector modal" },
    ],
    features: ["Perfect lineup", "Leaderboard", "Card flip stats"],
    footer: "Weekly roster builder",
  },
  {
    title: "Playoff Challenge",
    subtitle: "NFL Playoffs",
    description:
      "A playoff roster mód, ahol ugyanazt a játékost egymást követő körökben megtartva egyre nagyobb szorzóval számol a rendszer.",
    status: "Live",
    href: "/fantasy/playoff-challenge",
    cta: "Open",
    accent: {
      glow: "rgba(88,156,255,.26)",
      border: "rgba(96,165,250,.24)",
      dot: "#7dc2ff",
      top: "rgba(16,28,60,.96)",
      bottom: "rgba(8,16,36,.96)",
      surface: "rgba(13, 24, 48, .84)",
    },
    meta: [
      { label: "Rounds", value: "Wildcard to Super Bowl" },
      { label: "Boost", value: "Consecutive pick multipliers" },
    ],
    features: ["Wildcard", "Divisional", "Conference", "Super Bowl chain"],
    footer: "Playoff multiplier mode",
  },
];

function FeaturePill({ children, accentGlow }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 11px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.05)",
        color: "rgba(255,255,255,.88)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".01em",
        whiteSpace: "nowrap",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px ${accentGlow}`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "currentColor",
          opacity: 0.9,
        }}
      />
      {children}
    </span>
  );
}

function StatusBadge({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        padding: "7px 12px",
        fontSize: 12,
        fontWeight: 800,
        border: "1px solid rgba(59,130,246,.30)",
        background: "rgba(37,99,235,.16)",
        color: "#dbeafe",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: "#60a5fa",
          boxShadow: "0 0 0 5px rgba(96,165,250,.14)",
        }}
      />
      {children}
    </span>
  );
}

function HeroStat({ value, label }) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 96,
        background: "linear-gradient(180deg, rgba(18,30,58,.86), rgba(12,18,38,.78))",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: ".02em" }}>{value}</div>
      <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
        {label}
      </div>
    </div>
  );
}

function MetaTile({ label, value, surface }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        padding: 14,
        background: surface,
        minHeight: 78,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: ".10em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45 }}>{value}</div>
    </div>
  );
}

function GameCard({ mode }) {
  return (
    <div
      className="card"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: 0,
        minHeight: 420,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${mode.accent.border}`,
        background: `linear-gradient(180deg, ${mode.accent.top}, ${mode.accent.bottom})`,
        boxShadow: `0 26px 60px rgba(0,0,0,.28), 0 0 0 1px ${mode.accent.glow}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(260px 180px at 12% 0%, ${mode.accent.glow}, transparent 72%), radial-gradient(220px 160px at 88% 12%, rgba(255,255,255,.08), transparent 62%)`,
          opacity: 0.95,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: 24,
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 999,
                  background: mode.accent.dot,
                  boxShadow: `0 0 0 6px ${mode.accent.glow}`,
                }}
              />
              <span
                className="muted"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                }}
              >
                {mode.subtitle}
              </span>
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 31,
                lineHeight: 1.08,
                letterSpacing: "-.02em",
              }}
            >
              {mode.title}
            </h3>
          </div>

          <StatusBadge>{mode.status}</StatusBadge>
        </div>

        <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.72 }}>
          {mode.description}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {mode.meta.map((item) => (
            <MetaTile key={item.label} label={item.label} value={item.value} surface={mode.accent.surface} />
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {mode.features.map((feature) => (
            <FeaturePill key={feature} accentGlow={mode.accent.glow}>
              {feature}
            </FeaturePill>
          ))}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              paddingTop: 4,
            }}
          >
            <div>
              <div
                className="muted"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".10em",
                  marginBottom: 6,
                }}
              >
                Availability
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Elérhető játék</div>
            </div>

            <div
              style={{
                padding: "9px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.04)",
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,.82)",
                whiteSpace: "nowrap",
              }}
            >
              {mode.footer}
            </div>
          </div>

          <Link
            className="btn primary"
            to={mode.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "14px 16px",
              borderRadius: 16,
              textDecoration: "none",
              fontWeight: 800,
              letterSpacing: ".01em",
            }}
          >
            <span>{mode.cta}</span>
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Fantasy() {
  return (
    <div className="container page">
      <div className="hero" style={{ padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 18,
              minWidth: 0,
            }}
          >
            <div>
              <div className="kicker">
                <span className="tag">FANTASY</span>
                <span>Game Center</span>
              </div>

              <h1 className="h1" style={{ marginBottom: 10, fontSize: 34 }}>
                Fantasy Game Center
              </h1>

              <p className="sub" style={{ maxWidth: 720, lineHeight: 1.72, fontSize: 15 }}>
                A fantasy főoldal ismét egységes, szellős és kártya-központú lett: a Weekly
                Pick&apos;Em, a Perfect Challenge és a Playoff Challenge most azonos vizuális
                rendszerben, kiegyensúlyozott arányokkal és tiszta CTA-hierarchiával jelenik meg.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <FeaturePill accentGlow="rgba(43,108,255,.18)">Unified card system</FeaturePill>
              <FeaturePill accentGlow="rgba(43,108,255,.18)">Balanced CTAs</FeaturePill>
              <FeaturePill accentGlow="rgba(43,108,255,.18)">Premium spacing</FeaturePill>
            </div>
          </div>

          <div
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: 20,
              background: "linear-gradient(180deg, rgba(18,30,58,.82), rgba(11,18,36,.78))",
            }}
          >
            <div>
              <div
                className="muted"
                style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".10em", textTransform: "uppercase" }}
              >
                Quick overview
              </div>
              <h2 style={{ margin: "10px 0 0", fontSize: 22 }}>Egységes fantasy hub</h2>
            </div>

            <p className="muted" style={{ margin: 0, lineHeight: 1.65, fontSize: 14 }}>
              A három játékmód most azonos magasságú, következetes szerkezetű kártyákban jelenik
              meg, így a főoldal vizuálisan nyugodtabb és jobban illeszkedik a meglévő design
              nyelvhez.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <HeroStat value="3" label="aktív fantasy mód egy közös center oldalon" />
              <HeroStat value="8" label="fős roster logika a roster-alapú challenge módokban" />
              <HeroStat value="x4" label="max playoff lánc-szorzó a végig megtartott pickekre" />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 16,
          margin: "22px 2px 14px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>
            <span className="tag">ACTIVE</span>
            <span>Fantasy modes</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Válassz játékmódot</h2>
        </div>

        <p className="muted" style={{ margin: 0, maxWidth: 640, lineHeight: 1.65, fontSize: 14 }}>
          Az összes kártya ugyanarra a struktúrára épül, így a státusz, a feature pill-ek, a meta
          blokkok és az Open CTA mindenhol azonos ritmusban jelenik meg.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        {GAME_MODES.map((mode) => (
          <GameCard key={mode.title} mode={mode} />
        ))}
      </div>
    </div>
  );
}