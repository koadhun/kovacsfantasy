import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PerfectChallengeCard from "../components/perfect/PerfectChallengeCard";
import { useLanguage } from "../i18n/LanguageContext";

const SEASON = 2026;

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

export default function PerfectChallengeUserRoster() {
  const { t, language } = useLanguage();
  const { userId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const week = Number(sp.get("week") || 1);

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);

    try {
      const res = await api.get(`/perfect-challenge/user/${userId}/roster`, {
        params: { season: SEASON, week },
      });

      setData(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch((e) =>
      setErr(
        e?.response?.data?.error ||
          t("perfectChallengeUserRoster.loadError")
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, week]);

  const slots = data?.slots || [];
  const username = data?.user?.username || "Unknown";

  const selectedCount = useMemo(
    () => slots.filter((slot) => !!slot.player).length,
    [slots]
  );

  function goMyChallenge() {
    navigate(`/fantasy/perfect-challenge?week=${week}`);
  }

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>{t("perfectChallengeUserRoster.badge")}</span>
        </div>

        <h1 className="h1">
          {language === "hu"
            ? `${username} választásai · Perfect Challenge`
            : `${username}'s picks · Perfect Challenge`}
        </h1>

        <p className="sub">{t("perfectChallengeUserRoster.subtitle")}</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <span className="pill">
            <span className="dot" />
            {t("perfectChallengeUserRoster.viewing")}
            <b style={{ marginLeft: 6 }}>{username}</b>
          </span>

          <span className="pill">
            <span className="dot" />
            {t("perfectChallengeUserRoster.weekPoints")} {formatScore(data?.summary?.weeklyPoints)}
          </span>

          <span className="pill">
            <span className="dot" />
            {t("perfectChallengeUserRoster.selected")} {selectedCount}/8
          </span>

          <div className="filters-spacer" />

          <button className="btn" onClick={goMyChallenge}>
            {t("perfectChallengeUserRoster.myPerfectChallenge")}
          </button>

          <Link
            to={`/fantasy/perfect-challenge/leaderboard?week=${week}`}
            className="btn primary"
          >
            {t("perfectChallengeUserRoster.backToLeaderboard")}
          </Link>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      {loading && !slots.length && !err && (
        <p className="muted" style={{ marginTop: 14 }}>
          {t("perfectChallengeUserRoster.loading")}
        </p>
      )}

      <div className="pc-grid" style={{ marginTop: 18 }}>
        {slots.map((slot) => (
          <PerfectChallengeCard
            key={slot.slot}
            slot={slot.slot}
            player={slot.player}
            readOnly
          />
        ))}
      </div>
    </div>
  );
}