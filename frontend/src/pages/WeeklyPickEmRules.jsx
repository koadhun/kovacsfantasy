import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 14 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function WeeklyPickEmRules() {
  const { t } = useLanguage();
  const scoringRows = t("pickemRules.scoringRows");

  return (
    <div className="container page">
      <div className="hero">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <div className="kicker">
              <span className="tag">{t("pickemRules.badge")}</span>
              <span>Weekly Pick'Em</span>
            </div>
            <h1 className="h1">{t("pickemRules.title")}</h1>
            <p className="sub">{t("pickemRules.subtitle")}</p>
          </div>

          <Link to="/fantasy/weekly-pickem" className="btn">
            {t("pickemRules.backLink")}
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Section title={t("pickemRules.howToTitle")}>
          <p>{t("pickemRules.howToInfo1")}</p>
          <p>{t("pickemRules.howToInfo2")}</p>
        </Section>

        <Section title={t("pickemRules.scoringTitle")}>
          <ul>
            {scoringRows.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
        </Section>

        <Section title={t("pickemRules.leaderboardTitle")}>
          <p>{t("pickemRules.leaderboardInfo1")}</p>
          <p>
            {t("pickemRules.leaderboardInfo2Part1")}{" "}
            <strong style={{ color: "#4ade80" }}>{t("pickemRules.leaderboardGreen")}</strong>{" "}
            {t("pickemRules.leaderboardInfo2Part2")}{" "}
            <strong style={{ color: "#f87171" }}>{t("pickemRules.leaderboardRed")}</strong>,{" "}
            {t("pickemRules.leaderboardInfo2Part3")}
          </p>
        </Section>

        <Section title={t("pickemRules.scoresTitle")}>
          <p>{t("pickemRules.scoresInfo")}</p>
        </Section>
      </div>

      <Link to="/fantasy/weekly-pickem" className="btn" style={{ marginTop: 4 }}>
        {t("pickemRules.backLink")}
      </Link>
    </div>
  );
}