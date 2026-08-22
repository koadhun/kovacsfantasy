import { Link } from "react-router-dom";

const BENEFITS = [
  {
    title: "Injury Report hozzáférés",
    description:
      "Teljes sérülés-jelentés minden NFL játékoshoz - Questionable, Doubtful, Out, I.L. státuszokkal és részletes leírással.",
  },
  {
    title: "Részletes játékos-elemzés",
    description:
      "Perfect Challenge és Playoff Challenge választásnál lásd az előző heti teljesítményt, az ellenfél védekezésének/támadásának átlagstatjait, és a sérülés-státuszt is minden játékosnál.",
  },
  {
    title: "Early access",
    description:
      "Elsőként próbáld ki az új funkciókat, még mielőtt azok mindenki számára elérhetővé válnának.",
  },
  {
    title: "VIP jelzés",
    description:
      "Egyedi, arany profil-jelzés a navigációs sávban, ami megkülönböztet a sima felhasználóktól.",
  },
];

function BenefitCard({ title, description }) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        background: "linear-gradient(180deg, rgba(38,28,4,.55), rgba(12,10,4,.4))",
        border: "1px solid rgba(245,179,1,.22)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "rgba(245,179,1,.16)",
          color: "#f5b301",
          fontSize: 16,
          fontWeight: 900,
          marginBottom: 12,
        }}
      >
        ✦
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: 17 }}>{title}</h3>
      <p className="muted" style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>
        {description}
      </p>
    </div>
  );
}

function PriceCard({ badge, price, period, note, highlighted }) {
  return (
    <div
      className="card"
      style={{
        padding: 26,
        textAlign: "center",
        position: "relative",
        border: highlighted
          ? "1px solid rgba(245,179,1,.55)"
          : "1px solid rgba(255,255,255,.08)",
        background: highlighted
          ? "linear-gradient(180deg, rgba(245,179,1,.14), rgba(20,16,6,.5))"
          : undefined,
        boxShadow: highlighted ? "0 0 0 1px rgba(245,179,1,.25)" : undefined,
      }}
    >
      {highlighted && (
        <span
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#f5b301",
            color: "#1a1206",
            fontSize: 11,
            fontWeight: 900,
            padding: "4px 12px",
            borderRadius: 999,
            letterSpacing: ".04em",
          }}
        >
          BEST VALUE
        </span>
      )}

      <div
        className="muted"
        style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}
      >
        {badge}
      </div>

      <div style={{ fontSize: 40, fontWeight: 900, margin: "10px 0 0" }}>
        {price}
        <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>
          {" "}/ {period}
        </span>
      </div>

      <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
        {note}
      </p>

      <button
        className={highlighted ? "btn primary" : "btn"}
        style={{ width: "100%", marginTop: 18 }}
        disabled
        title="Hamarosan elérhető"
      >
        Coming soon
      </button>
    </div>
  );
}

export default function BecomeVip() {
  return (
    <div className="container page">
      <div
        className="hero"
        style={{
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(45,32,4,.55), rgba(9,10,20,.9))",
          border: "1px solid rgba(245,179,1,.2)",
        }}
      >
        <div className="kicker" style={{ justifyContent: "center" }}>
          <span
            className="tag"
            style={{ background: "rgba(245,179,1,.16)", color: "#f5b301" }}
          >
            VIP
          </span>
          <span>KovacsFantasy VIP</span>
        </div>

        <h1 className="h1" style={{ marginTop: 10 }}>
          Hozd ki a maximumot a szezonból
        </h1>

        <p className="sub" style={{ maxWidth: 620, margin: "10px auto 0" }}>
          A VIP előfizetéssel részletes játékos-elemzést, teljes sérülés-jelentést és korai
          hozzáférést kapsz minden új funkcióhoz.
        </p>
      </div>

      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        {BENEFITS.map((b) => (
          <BenefitCard key={b.title} title={b.title} description={b.description} />
        ))}
      </div>

      <div style={{ marginTop: 34, marginBottom: 14, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Válassz csomagot</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Kezdd el most, és élvezd a teljes VIP élményt a szezon végéig.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        <PriceCard
          badge="Havi előfizetés"
          price="$1.99"
          period="hó"
          note="Rugalmas, bármikor lemondható"
        />

        <PriceCard
          badge="Szezonbérlet"
          price="$9.99"
          period="szezon"
          note="A legjobb ár-érték arány - kevesebb, mint egy havi ár fél szezonra"
          highlighted
        />
      </div>

      <div style={{ textAlign: "center", marginTop: 26 }}>
        <Link to="/fantasy" className="btn">
          ← Vissza a Fantasy oldalra
        </Link>
      </div>
    </div>
  );
}