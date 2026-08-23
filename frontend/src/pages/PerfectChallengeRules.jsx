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

function ScoreList({ rows }) {
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.label}>
          {row.label}: <strong>{row.value}</strong>
        </li>
      ))}
    </ul>
  );
}

export default function PerfectChallengeRules() {
  const { t } = useLanguage();
  const positions = t("perfectChallengeRules.positions");
  const qbRows = t("perfectChallengeRules.qbRows");
  const rbRows = t("perfectChallengeRules.rbRows");
  const wrRows = t("perfectChallengeRules.wrRows");
  const kRows = t("perfectChallengeRules.kRows");
  const defRows = t("perfectChallengeRules.defRows");
  const defPenaltyRows = t("perfectChallengeRules.defPenaltyRows");

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
              <span className="tag">{t("perfectChallengeRules.badge")}</span>
              <span>Perfect Challenge</span>
            </div>
            <h1 className="h1">{t("perfectChallengeRules.title")}</h1>
            <p className="sub">{t("perfectChallengeRules.subtitle")}</p>
          </div>

          <Link to="/fantasy/perfect-challenge" className="btn">
            {t("perfectChallengeRules.backLink")}
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Section title={t("perfectChallengeRules.rosterTitle")}>
          <p>{t("perfectChallengeRules.rosterIntro")}</p>
          <ul>
            {positions.map((p) => (
              <li key={p.abbr}>
                <strong>{p.abbr}</strong> - {p.desc}
              </li>
            ))}
          </ul>
          <p>
            {t("perfectChallengeRules.lockInfoPart1")}{" "}
            <strong>{t("perfectChallengeRules.lockInfoBold1")}</strong>
            {t("perfectChallengeRules.lockInfoPart2")}{" "}
            <strong>{t("perfectChallengeRules.lockInfoBold2")}</strong>{" "}
            - {t("perfectChallengeRules.lockInfoPart3")}
          </p>
        </Section>

        <Section title={t("perfectChallengeRules.qbTitle")}>
          <ScoreList rows={qbRows} />
        </Section>

        <Section title={t("perfectChallengeRules.rbTitle")}>
          <ScoreList rows={rbRows} />
        </Section>

        <Section title={t("perfectChallengeRules.wrTitle")}>
          <ScoreList rows={wrRows} />
        </Section>

        <Section title={t("perfectChallengeRules.kTitle")}>
          <ScoreList rows={kRows} />
        </Section>

        <Section title={t("perfectChallengeRules.defTitle")}>
          <ul>
            {defRows.map((row) => (
              <li key={row.label}>
                {row.label}: <strong>{row.value}</strong>
              </li>
            ))}
            <li>
              {t("perfectChallengeRules.defPenaltyIntro")}
              <ul>
                {defPenaltyRows.map((row) => (
                  <li key={row.label}>
                    {row.label}: <strong>{row.value}</strong>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </Section>

        <Section title={t("perfectChallengeRules.liveTitle")}>
          <p>{t("perfectChallengeRules.liveInfo")}</p>
        </Section>
      </div>

      <Link to="/fantasy/perfect-challenge" className="btn" style={{ marginTop: 4 }}>
        {t("perfectChallengeRules.backLink")}
      </Link>
    </div>
  );
}