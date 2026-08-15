import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PerfectChallengeCard from "../components/perfect/PerfectChallengeCard";

const SEASON = 2026;

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

export default function PerfectChallengeUserRoster() {
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
          "Nem sikerült betölteni a felhasználó Perfect Challenge rosterét."
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
          <span>User Roster</span>
        </div>

        <h1 className="h1">Perfect Challenge · Week {week}</h1>

        <p className="sub">A kiválasztott felhasználó heti Perfect Challenge rosterének megtekintése.</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <span className="pill">
            <span className="dot" />
            Viewing:
            <b style={{ marginLeft: 6 }}>{username}</b>
          </span>

          <span className="pill">
            <span className="dot" />
            Week points: {formatScore(data?.summary?.weeklyPoints)}
          </span>

          <span className="pill">
            <span className="dot" />
            Selected: {selectedCount}/8
          </span>

          <div className="filters-spacer" />

          <button className="btn" onClick={goMyChallenge}>
            My Perfect Challenge
          </button>

          <Link
            to={`/fantasy/perfect-challenge/leaderboard?week=${week}`}
            className="btn primary"
          >
            Back to leaderboard
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
          Betöltés…
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