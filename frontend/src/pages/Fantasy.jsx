import { Link } from "react-router-dom";

function FeaturePill({ children }) {
  return (
    <span
      className="pill"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      <span className="dot" />
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
        ...styles,
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: ".02em",
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
        position: "relative",
        overflow: "hidden",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 22,
        border:
          featured
            ? "1px solid rgba(59,130,246,.34)"
            : "1px solid rgba(255,255,255,.08)",
        background: featured
          ? "linear-gradient(180deg, rgba(18,32,72,.96), rgba(7,16,38,.96))"
          : "linear-gradient(180deg, rgba(11,22,48,.92), rgba(7,13,30,.92))",
        boxShadow: featured
          ? "0 10px 34px rgba(0,0,0,.28), inset 0 0 0 1px rgba(59,130,246,.08)"
          : "0 10px 28px rgba(0,0,0,.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: featured
            ? "radial-gradient(circle at top right, rgba(96,165,250,.18), transparent 34%)"
            : "radial-gradient(circle at top right, rgba(255,255,255,.06), transparent 30%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                color: "rgba(255,255,255,.58)",
                marginBottom: 8,
              }}
            >
              {subtitle}
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: featured ? 30 : 24,
                lineHeight: 1.08,
                fontWeight: 900,
              }}
            >
              {title}
            </h3>
          </div>

          <StatusBadge tone={statusTone}>{status}</StatusBadge>
        </div>

        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.55,
            maxWidth: 540,
          }}
        >
          {description}
        </p>

        {!!features.length && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 18,
            }}
          >
            {features.map((item) => (
              <FeaturePill key={item}>{item}</FeaturePill>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 24,
        }}
      >
        <div
          className="muted"
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          {featured
            ? "Aktív fantasy játék"
            : disabled
            ? "Fejlesztés alatt"
            : "Elérhető játék"}
        </div>

        {disabled ? (
          <button
            className="btn"
            disabled
            style={{
              opacity: 0.72,
              minWidth: 132,
            }}
          >
            {cta}
          </button>
        ) : (
          <Link
            to={href}
            className={`btn ${featured ? "primary" : ""}`}
            style={{ minWidth: 132, textAlign: "center" }}
          >
            {cta}
          </Link>
        )}
      </div>
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

        <p className="sub" style={{ maxWidth: 760 }}>
          Válassz egy fantasy játékmódot. A Weekly Pick&apos;Em már használható,
          a többi mód későbbi bővítésként érkezik.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 16,
          }}
        >
          <FeaturePill>Weekly picks</FeaturePill>
          <FeaturePill>Leaderboard</FeaturePill>
          <FeaturePill>Hidden picks before kickoff</FeaturePill>
          <FeaturePill>Admin-ready expansion</FeaturePill>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, .9fr) minmax(0, .9fr)",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        <GameCard
          featured
          title="Weekly Pick'Em"
          subtitle="Available now"
          description="Tippeld meg minden heti NFL meccs győztesét, kövesd a heti és szezon leaderboardot, és nézd meg más játékosok pickjeit kickoff után."
          status="Live"
          statusTone="primary"
          href="/fantasy/weekly-pickem"
          cta="Open game"
          features={[
            "Weekly picks",
            "Leaderboard",
            "User picks view",
            "Kickoff lock",
          ]}
        />

        <GameCard
          title="Perfect Challenge"
          subtitle="Future mode"
          description="Egy magasabb kockázatú játékmód, ahol a cél a tökéletes heti tippsor összeállítása extra jutalmazással."
          status="Coming soon"
          href="#"
          cta="Coming soon"
          disabled
          features={[
            "Perfect week target",
            "Bonus scoring",
            "Future expansion",
          ]}
        />

        <GameCard
          title="Playoff Challenge"
          subtitle="Future mode"
          description="Külön fantasy élmény a rájátszásra szabva, dedikált playoff bracket és speciális pontozási logikával."
          status="Coming soon"
          href="#"
          cta="Coming soon"
          disabled
          features={[
            "Playoff bracket",
            "Special scoring",
            "Postseason mode",
          ]}
        />
      </div>
    </div>
  );
}