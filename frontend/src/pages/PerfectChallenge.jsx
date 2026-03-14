import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import WeekDropdown from "../components/WeekDropdown";
import PerfectChallengeCard from "../components/perfect/PerfectChallengeCard";
import PerfectChallengeSelectorModal from "../components/perfect/PerfectChallengeSelectorModal";

const SEASON = 2025;

const SLOT_TO_POOL_KEY = {
  QB: "QB",
  RB1: "RB",
  RB2: "RB",
  WR1: "WR",
  WR2: "WR",
  TE: "TE",
  K: "K",
  DEF: "DEF",
};

function ScoreCard({ title, value, sub }) {
  return (
    <div
      style={{
        minWidth: 180,
        padding: "14px 16px",
        borderRadius: 18,
        border: "1px solid rgba(59,130,246,.22)",
        background:
          "linear-gradient(180deg, rgba(15,30,68,.96), rgba(9,18,42,.96))",
        boxShadow: "0 12px 28px rgba(0,0,0,.22)",
        textAlign: "center",
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: sub ? 8 : 0,
          textAlign: "center",
        }}
      >
        {value}
      </div>

      {sub ? (
        <div className="muted" style={{ fontSize: 13, textAlign: "center" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

export default function PerfectChallenge() {
  const [sp, setSp] = useSearchParams();
  const requestedWeek = Number(sp.get("week") || 1);

  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState(requestedWeek);
  const [slots, setSlots] = useState([]);
  const [poolByPosition, setPoolByPosition] = useState({});
  const [summary, setSummary] = useState({
    weeklyPoints: 0,
    seasonPoints: 0,
    selectedCount: 0,
    seasonSelectedCount: 0,
  });
  const [err, setErr] = useState("");
  const [modalSlot, setModalSlot] = useState(null);

  async function loadWeeks() {
    const res = await api.get("/perfect-challenge/weeks");
    const ws = Array.isArray(res.data?.weeks) ? res.data.weeks : [];

    setWeeks(ws);

    if (!ws.length) {
      setWeek(1);
      return;
    }

    const safeWeek = ws.includes(requestedWeek) ? requestedWeek : ws[0];
    setWeek(safeWeek);
  }

  async function loadWeekData(targetWeek) {
    setErr("");

    const res = await api.get("/perfect-challenge/week", {
      params: { season: SEASON, week: targetWeek },
    });

    setSlots(res.data?.slots || []);
    setPoolByPosition(res.data?.poolByPosition || {});
    setSummary(
      res.data?.summary || {
        weeklyPoints: 0,
        seasonPoints: 0,
        selectedCount: 0,
        seasonSelectedCount: 0,
      }
    );
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr("Nem sikerült betölteni a heteket."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;

    const currentQueryWeek = Number(sp.get("week") || 0);
    if (currentQueryWeek !== week) {
      setSp({ week: String(week) }, { replace: true });
    }

    loadWeekData(week).catch(() =>
      setErr("Nem sikerült betölteni a Perfect Challenge adatokat.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  async function pickPlayer(playerId) {
    if (!modalSlot) return;

    try {
      await api.put("/perfect-challenge/slot", {
        season: SEASON,
        week,
        slot: modalSlot.slot,
        playerId,
      });

      setModalSlot(null);
      await loadWeekData(week);
    } catch (e) {
      setErr(e?.response?.data?.error || "Nem sikerült frissíteni a slotot.");
    }
  }

  const filledCount = useMemo(
    () => slots.filter((s) => !!s.player).length,
    [slots]
  );

  const modalPlayers = modalSlot
    ? poolByPosition[SLOT_TO_POOL_KEY[modalSlot.slot]] || []
    : [];

  return (
    <div className="container page">
      <div className="hero">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div>
            <div className="kicker">
              <span className="tag">FANTASY</span>
              <span>Perfect Challenge</span>
            </div>

            <h1 className="h1">Perfect Challenge</h1>

            <p className="sub" style={{ maxWidth: 840 }}>
              Válassz 8 játékost fix pozíciókra bontva. A front oldalon a játékos
              pontszáma látszik, a hátoldalon a heti statok és a fantasy pontok
              breakdown nézet is megtekinthető.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <ScoreCard
              title="Weekly points"
              value={formatScore(summary.weeklyPoints)}
            />

            <ScoreCard
              title="Season total"
              value={formatScore(summary.seasonPoints)}
            />
          </div>
        </div>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <WeekDropdown
            value={week}
            options={weeks}
            onChange={setWeek}
            label="WEEK"
            width={170}
          />

          <div className="filters-spacer" />

          <Link
            to={`/fantasy/perfect-challenge/leaderboard?week=${week}`}
            className="btn"
          >
            Leaderboard
          </Link>

          <span className="pill">
            <span className="dot" />
            {filledCount}/8 selected
          </span>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div className="pc-grid" style={{ marginTop: 18 }}>
        {slots.map((slot) => (
          <PerfectChallengeCard
            key={slot.slot}
            slot={slot.slot}
            player={slot.player}
            onSelect={() => setModalSlot(slot)}
          />
        ))}
      </div>

      <PerfectChallengeSelectorModal
        open={!!modalSlot}
        title={modalSlot ? `Select player for ${modalSlot.slot}` : ""}
        players={modalPlayers}
        onClose={() => setModalSlot(null)}
        onPick={pickPlayer}
      />
    </div>
  );
}