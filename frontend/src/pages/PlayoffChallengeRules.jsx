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

export default function PlayoffChallengeRules() {
  const { t } = useLanguage();
  const rounds = t("playoffChallengeRules.rounds");
  const multiplierRows = t("playoffChallengeRules.multiplierRows");

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">{t("playoffChallengeRules.badge")}</span>
          <span>Playoff Challenge</span>
        </div>
        <h1 className="h1">{t("playoffChallengeRules.title")}</h1>
        <p className="sub">{t("playoffChallengeRules.subtitle")}</p>
      </div>

      <div style={{ marginTop: 18 }}>
        <Section title={t("playoffChallengeRules.roundsTitle")}>
          <p>{t("playoffChallengeRules.roundsIntro")}</p>
          <ul>
            {rounds.map((r) => (
              <li key={r}>
                <strong>{r}</strong>
              </li>
            ))}
          </ul>
          <p>{t("playoffChallengeRules.roundsOutro")}</p>
        </Section>

        <Section title={t("playoffChallengeRules.multiplierTitle")}>
          <p>{t("playoffChallengeRules.multiplierIntro")}</p>
          <ul>
            {multiplierRows.map((row) => (
              <li key={row.label}>
                {row.label}: <strong>{row.value}</strong>
              </li>
            ))}
          </ul>
          <p>
            {t("playoffChallengeRules.multiplierBreakPart1")}{" "}
            <strong>{t("playoffChallengeRules.multiplierBreakBold1")}</strong>{" "}
            {t("playoffChallengeRules.multiplierBreakPart2")}{" "}
            <strong>{t("playoffChallengeRules.multiplierBreakBold2")}</strong>{" "}
            - {t("playoffChallengeRules.multiplierBreakPart3")}
          </p>
        </Section>

        <Section title={t("playoffChallengeRules.scoringTitle")}>
          <p>{t("playoffChallengeRules.scoringInfo")}</p>
        </Section>

        <Section title={t("playoffChallengeRules.lockingTitle")}>
          <p>{t("playoffChallengeRules.lockingInfo")}</p>
        </Section>
      </div>

      <Link to="/fantasy/playoff-challenge" className="btn" style={{ marginTop: 4 }}>
        {t("playoffChallengeRules.backLink")}
      </Link>
    </div>
  );
}