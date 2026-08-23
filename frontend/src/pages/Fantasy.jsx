import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";

function buildGameModes(t, isLight) {
  return [
    {
      title: t("fantasy.weeklyPickem.title"),
      subtitle: t("fantasy.weeklyPickem.subtitle"),
      description: t("fantasy.weeklyPickem.description"),
      status: "Live",
      href: "/fantasy/weekly-pickem",
      cta: t("fantasy.open"),
      accent: {
        glow: isLight ? "rgba(43,108,255,.10)" : "rgba(43,108,255,.34)",
        border: isLight ? "rgba(59,130,246,.30)" : "rgba(59,130,246,.28)",
        dot: "#3b7bff",
        top: isLight ? "#ffffff" : "rgba(18,38,84,.96)",
        bottom: isLight ? "#f4f7ff" : "rgba(9,18,42,.96)",
        surface: isLight ? "rgba(59,130,246,.06)" : "rgba(11, 23, 52, .86)",
      },
      meta: [
        { label: t("fantasy.weeklyPickem.metaFlow"), value: t("fantasy.weeklyPickem.metaFlowValue") },
        { label: t("fantasy.weeklyPickem.metaViews"), value: t("fantasy.weeklyPickem.metaViewsValue") },
      ],
      features: [
        t("fantasy.weeklyPickem.featureWeeklyPicks"),
        t("fantasy.weeklyPickem.featureLeaderboard"),
        t("fantasy.weeklyPickem.featureUserPicks"),
      ],
      footer: t("fantasy.weeklyPickem.footer"),
    },
    {
      title: t("fantasy.perfectChallenge.title"),
      subtitle: t("fantasy.perfectChallenge.subtitle"),
      description: t("fantasy.perfectChallenge.description"),
      status: "Live",
      href: "/fantasy/perfect-challenge",
      cta: t("fantasy.open"),
      accent: {
        glow: isLight ? "rgba(118,86,255,.10)" : "rgba(118,86,255,.28)",
        border: isLight ? "rgba(129,140,248,.32)" : "rgba(129,140,248,.24)",
        dot: "#7c6dfb",
        top: isLight ? "#ffffff" : "rgba(20,24,64,.96)",
        bottom: isLight ? "#f6f5ff" : "rgba(11,15,38,.96)",
        surface: isLight ? "rgba(129,140,248,.07)" : "rgba(18, 21, 56, .84)",
      },
      meta: [
        { label: t("fantasy.perfectChallenge.metaRoster"), value: t("fantasy.perfectChallenge.metaRosterValue") },
        { label: t("fantasy.perfectChallenge.metaViews"), value: t("fantasy.perfectChallenge.metaViewsValue") },
      ],
      features: [
        t("fantasy.perfectChallenge.featurePerfectLineup"),
        t("fantasy.perfectChallenge.featureLeaderboard"),
        t("fantasy.perfectChallenge.featureCardStats"),
      ],
      footer: t("fantasy.perfectChallenge.footer"),
    },
    {
      title: t("fantasy.playoffChallenge.title"),
      subtitle: t("fantasy.playoffChallenge.subtitle"),
      description: t("fantasy.playoffChallenge.description"),
      status: "Live",
      href: "/fantasy/playoff-challenge",
      cta: t("fantasy.open"),
      accent: {
        glow: isLight ? "rgba(88,156,255,.10)" : "rgba(88,156,255,.26)",
        border: isLight ? "rgba(96,165,250,.32)" : "rgba(96,165,250,.24)",
        dot: "#4f9cff",
        top: isLight ? "#ffffff" : "rgba(16,28,60,.96)",
        bottom: isLight ? "#f2f8ff" : "rgba(8,16,36,.96)",
        surface: isLight ? "rgba(96,165,250,.07)" : "rgba(13, 24, 48, .84)",
      },
      meta: [
        { label: t("fantasy.playoffChallenge.metaRounds"), value: t("fantasy.playoffChallenge.metaRoundsValue") },
        { label: t("fantasy.playoffChallenge.metaBoost"), value: t("fantasy.playoffChallenge.metaBoostValue") },
      ],
      features: [
        t("fantasy.playoffChallenge.featureWildcard"),
        t("fantasy.playoffChallenge.featureDivisional"),
        t("fantasy.playoffChallenge.featureConference"),
        t("fantasy.playoffChallenge.featureSuperBowlChain"),
      ],
      footer: t("fantasy.playoffChallenge.footer"),
    },
  ];
}

function FeaturePill({ children, accentGlow, isLight }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 11px",
        borderRadius: 999,
        border: isLight ? "1px solid rgba(16,24,40,.12)" : "1px solid rgba(255,255,255,.10)",
        background: isLight ? "rgba(16,24,40,.04)" : "rgba(255,255,255,.05)",
        color: isLight ? "rgba(16,24,40,.82)" : "rgba(255,255,255,.88)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".01em",
        whiteSpace: "nowrap",
        boxShadow: isLight
          ? `0 0 0 1px ${accentGlow}`
          : `inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px ${accentGlow}`,
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

function StatusBadge({ children, isLight }) {
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
        border: isLight ? "1px solid rgba(37,99,235,.30)" : "1px solid rgba(59,130,246,.30)",
        background: isLight ? "rgba(37,99,235,.08)" : "rgba(37,99,235,.16)",
        color: isLight ? "#1d4ed8" : "#dbeafe",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: "#3b82f6",
          boxShadow: "0 0 0 5px rgba(96,165,250,.14)",
        }}
      />
      {children}
    </span>
  );
}

function MetaTile({ label, value, surface, isLight }) {
  return (
    <div
      style={{
        border: isLight ? "1px solid rgba(16,24,40,.08)" : "1px solid rgba(255,255,255,.08)",
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
      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45, color: isLight ? "#101828" : undefined }}>
        {value}
      </div>
    </div>
  );
}

function GameCard({ mode, availabilityLabel, availableNowLabel, isLight }) {
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
        boxShadow: isLight
          ? `0 12px 30px rgba(16,24,40,.08), 0 0 0 1px ${mode.accent.glow}`
          : `0 26px 60px rgba(0,0,0,.28), 0 0 0 1px ${mode.accent.glow}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: isLight
            ? `radial-gradient(260px 180px at 12% 0%, ${mode.accent.glow}, transparent 72%)`
            : `radial-gradient(260px 180px at 12% 0%, ${mode.accent.glow}, transparent 72%), radial-gradient(220px 160px at 88% 12%, rgba(255,255,255,.08), transparent 62%)`,
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
                color: isLight ? "#101828" : undefined,
              }}
            >
              {mode.title}
            </h3>
          </div>

          <StatusBadge isLight={isLight}>{mode.status}</StatusBadge>
        </div>

        <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.72 }}>
          {mode.description}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {mode.meta.map((item) => (
            <MetaTile key={item.label} label={item.label} value={item.value} surface={mode.accent.surface} isLight={isLight} />
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {mode.features.map((feature) => (
            <FeaturePill key={feature} accentGlow={mode.accent.glow} isLight={isLight}>
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
                {availabilityLabel}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isLight ? "#101828" : undefined }}>
                {availableNowLabel}
              </div>
            </div>

            <div
              style={{
                padding: "9px 12px",
                borderRadius: 999,
                border: isLight ? "1px solid rgba(16,24,40,.10)" : "1px solid rgba(255,255,255,.08)",
                background: isLight ? "rgba(16,24,40,.04)" : "rgba(255,255,255,.04)",
                fontSize: 12,
                fontWeight: 700,
                color: isLight ? "rgba(16,24,40,.72)" : "rgba(255,255,255,.82)",
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
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const gameModes = buildGameModes(t, isLight);

  return (
    <div className="container page">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
          alignItems: "stretch",
          marginTop: 24,
        }}
      >
        {gameModes.map((mode) => (
          <GameCard
            key={mode.title}
            mode={mode}
            availabilityLabel={t("fantasy.availability")}
            availableNowLabel={t("fantasy.availableNow")}
            isLight={isLight}
          />
        ))}
      </div>
    </div>
  );
}