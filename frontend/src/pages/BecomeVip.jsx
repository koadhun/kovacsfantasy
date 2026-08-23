import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

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
        {"\u2726"}
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: 17 }}>{title}</h3>
      <p className="muted" style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>
        {description}
      </p>
    </div>
  );
}

function PriceCard({ badge, price, period, note, highlighted, comingSoon, comingSoonHint, bestValueLabel }) {
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
          {bestValueLabel}
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
        title={comingSoonHint}
      >
        {comingSoon}
      </button>
    </div>
  );
}

export default function BecomeVip() {
  const { t } = useLanguage();

  const benefits = [
    { title: t("becomeVip.benefit1Title"), description: t("becomeVip.benefit1Desc") },
    { title: t("becomeVip.benefit2Title"), description: t("becomeVip.benefit2Desc") },
    { title: t("becomeVip.benefit3Title"), description: t("becomeVip.benefit3Desc") },
    { title: t("becomeVip.benefit4Title"), description: t("becomeVip.benefit4Desc") },
  ];

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
          <span>{t("becomeVip.kicker")}</span>
        </div>

        <h1 className="h1" style={{ marginTop: 10 }}>
          {t("becomeVip.title")}
        </h1>

        <p className="sub" style={{ maxWidth: 620, margin: "10px auto 0" }}>
          {t("becomeVip.subtitle")}
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
        {benefits.map((b) => (
          <BenefitCard key={b.title} title={b.title} description={b.description} />
        ))}
      </div>

      <div style={{ marginTop: 34, marginBottom: 14, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{t("becomeVip.choosePlanTitle")}</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          {t("becomeVip.choosePlanSubtitle")}
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
          badge={t("becomeVip.monthlyBadge")}
          price="$1.99"
          period={t("becomeVip.monthlyPeriod")}
          note={t("becomeVip.monthlyNote")}
          comingSoon={t("becomeVip.comingSoon")}
          comingSoonHint={t("becomeVip.comingSoonHint")}
          bestValueLabel={t("becomeVip.bestValue")}
        />

        <PriceCard
          badge={t("becomeVip.seasonBadge")}
          price="$9.99"
          period={t("becomeVip.seasonPeriod")}
          note={t("becomeVip.seasonNote")}
          highlighted
          comingSoon={t("becomeVip.comingSoon")}
          comingSoonHint={t("becomeVip.comingSoonHint")}
          bestValueLabel={t("becomeVip.bestValue")}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: 26 }}>
        <Link to="/fantasy" className="btn">
          {t("becomeVip.backLink")}
        </Link>
      </div>
    </div>
  );
}