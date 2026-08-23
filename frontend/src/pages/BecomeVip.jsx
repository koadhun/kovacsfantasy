import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";

const GOLD = "#f5b301";
const GOLD_DARK = "#a97400";

function BenefitCard({ title, description, isLight }) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        background: isLight ? "#ffffff" : "linear-gradient(180deg, rgba(16,26,51,.85), rgba(10,16,34,.85))",
        border: isLight ? "1px solid rgba(16,24,40,.10)" : "1px solid rgba(245,179,1,.22)",
        boxShadow: isLight ? "0 8px 20px rgba(16,24,40,.06)" : undefined,
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
          background: isLight ? "rgba(245,179,1,.14)" : "rgba(245,179,1,.16)",
          color: isLight ? GOLD_DARK : GOLD,
          fontSize: 16,
          fontWeight: 900,
          marginBottom: 12,
        }}
      >
        {"\u2726"}
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: 17, color: isLight ? "#101828" : "#f5f7fb" }}>
        {title}
      </h3>
      <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14, color: isLight ? "#5b6478" : "rgba(245,247,251,.72)" }}>
        {description}
      </p>
    </div>
  );
}

function PriceCard({ badge, price, period, note, highlighted, comingSoon, comingSoonHint, bestValueLabel, isLight }) {
  const baseBg = isLight ? "#ffffff" : "linear-gradient(180deg, rgba(16,26,51,.85), rgba(10,16,34,.85))";
  const highlightedBg = isLight
    ? "linear-gradient(180deg, rgba(255,247,224,.95), #ffffff)"
    : "linear-gradient(180deg, rgba(245,179,1,.10), rgba(16,26,51,.85))";

  return (
    <div
      className="card"
      style={{
        padding: 26,
        textAlign: "center",
        position: "relative",
        border: highlighted
          ? "1px solid rgba(245,179,1,.55)"
          : isLight
          ? "1px solid rgba(16,24,40,.10)"
          : "1px solid rgba(255,255,255,.10)",
        background: highlighted ? highlightedBg : baseBg,
        boxShadow: highlighted
          ? isLight
            ? "0 10px 26px rgba(245,179,1,.16)"
            : "0 0 0 1px rgba(245,179,1,.25)"
          : isLight
          ? "0 8px 20px rgba(16,24,40,.06)"
          : undefined,
      }}
    >
      {highlighted && (
        <span
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: GOLD,
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
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: isLight ? "#5b6478" : "rgba(245,247,251,.72)",
        }}
      >
        {badge}
      </div>

      <div style={{ fontSize: 40, fontWeight: 900, margin: "10px 0 0", color: isLight ? "#101828" : "#f5f7fb" }}>
        {price}
        <span style={{ fontSize: 15, fontWeight: 700, color: isLight ? "#5b6478" : "rgba(245,247,251,.6)" }}>
          {" "}/ {period}
        </span>
      </div>

      <p style={{ marginTop: 8, fontSize: 13, color: isLight ? "#5b6478" : "rgba(245,247,251,.72)" }}>
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
  const { theme } = useTheme();
  const isLight = theme === "light";

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
          background: isLight
            ? "linear-gradient(180deg, #ffffff, #f8f4ea)"
            : "linear-gradient(180deg, rgba(16,26,51,.9), rgba(15,23,48,.75))",
          border: isLight ? "1px solid rgba(245,179,1,.30)" : "1px solid rgba(245,179,1,.22)",
          boxShadow: isLight ? "0 10px 26px rgba(16,24,40,.08)" : undefined,
        }}
      >
        <div className="kicker" style={{ justifyContent: "center" }}>
          <span
            className="tag"
            style={{
              background: isLight ? "rgba(245,179,1,.14)" : "rgba(245,179,1,.16)",
              color: isLight ? GOLD_DARK : GOLD,
            }}
          >
            VIP
          </span>
          <span>{t("becomeVip.kicker")}</span>
        </div>

        <h1 className="h1" style={{ marginTop: 10, color: isLight ? "#101828" : undefined }}>
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
          <BenefitCard key={b.title} title={b.title} description={b.description} isLight={isLight} />
        ))}
      </div>

      <div style={{ marginTop: 34, marginBottom: 14, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 22, color: isLight ? "#101828" : undefined }}>
          {t("becomeVip.choosePlanTitle")}
        </h2>
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
          isLight={isLight}
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
          isLight={isLight}
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