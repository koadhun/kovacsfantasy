import { Link } from "react-router-dom";

function FeaturePill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.05)",
        color: "rgba(255,255,255,.85)",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ children, tone = "default" }) {
  const styles =
    tone === "primary"
      ? {
          border: "1px solid rgba(59,130,246,.35)",
          background: "rgba(37,99,235,.18)",
          color: "#dbeafe",
        }
      : {
          border: "1px solid rgba(255,255,255,.10)",
          background: "rgba(255,255,255,.05)",
          color: "rgba(255,255,255,.82)",
        };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        ...styles,
      }}
    >
      {children}
    </span>
  );
}

function GameCard({
  title,
  subtitle,
  description,
  status,
  statusTone = "default",
  href,
  cta,
  disabled = false,
  featured = false,
  features = [],
}) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 260,
        border:
          featured
            ? "1px solid rgba(59,130,246,.28)"
            : "1px solid rgba(255,255,255,.08)",
        background:
          featured
            ? "linear-gradient(180deg, rgba(16,32,74,.96), rgba(9,18,42,.96))"
            : "linear-gradient(180deg, rgba(14,20,36,.96), rgba(9,14,26,.96))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div className="muted" style={{ fontSize: 12, fontWeight: 800 }}>
            {subtitle}
          </div>
          <h3 style={{ margin: "8px 0 0 0" }}>{title}</h3>
        </div>

        <StatusBadge tone={statusTone}>{status}</StatusBadge>
      </div>

      <div className="muted" style={{ lineHeight: 1.6 }}>
        {description}
      </div>

      {!!features.length && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {features.map((item) => (
            <FeaturePill key={item}>{item}</FeaturePill>
          ))}
        </div>
      )}

      <div className="muted" style={{ marginTop: "auto", fontSize: 12, fontWeight: 800 }}>
        {featured ? "Aktív fantasy játék" : disabled ? "Fejlesztés alatt" : "Elérhető játék"}
      </div>

      {disabled ? (
        <button className="btn" disabled>
          {cta}
        </button>
      ) : (
        <Link className={`btn ${featured ? "primary" : ""}`} to={href}>
          {cta}
        </Link>
      )}
    </div>
  );
}

export default function Fantasy() {
  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Games</span>
        </div>

        <h1 className="h1">Fantasy Game Center</h1>

        <p className="sub" style={{ maxWidth: 900 }}>
          Válassz egy fantasy játékmódot. A Weekly Pick&apos;Em és a Perfect Challenge
          már tesztelhető UI/DB alapon, a Playoff Challenge pedig most külön playoff
          körös szorzólogikával indul.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          marginTop: 18,
        }}
      >
        <GameCard
          title="Weekly Pick'Em"
          subtitle="NFL Regular Season"
          description="Tippeld meg minden meccs győztesét, nézd a leaderboardot, és hasonlítsd össze a választásaidat más játékosokkal."
          status="Live"
          statusTone="primary"
          href="/fantasy/weekly-pickem"
          cta="Open"
          featured
          features={["Weekly picks", "Leaderboard", "User picks"]}
        />

        <GameCard
          title="Perfect Challenge"
          subtitle="Weekly roster game"
          description="Válassz heti 8 játékost fix pozíciókra bontva. Kártyás roster nézet, selector modal és detailed stat / fantasy breakdown."
          status="Live"
          statusTone="primary"
          href="/fantasy/perfect-challenge"
          cta="Open"
          features={["Perfect lineup", "Leaderboard", "Card flip stats"]}
        />

        <GameCard
          title="Playoff Challenge"
          subtitle="NFL Playoffs"
          description="A Perfect Challenge playoff változata. Ugyanazt a játékost egymást követő playoff körökben megtartva növekvő szorzót kapsz."
          status="Live"
          statusTone="primary"
          href="/fantasy/playoff-challenge"
          cta="Open"
          features={["Wildcard", "Divisional", "Conference", "Super Bowl multipliers"]}
        />
      </div>
    </div>
  );
}