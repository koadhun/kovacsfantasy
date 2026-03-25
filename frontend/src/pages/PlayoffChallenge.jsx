import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
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
        }}
      >
        {value}
      </div>

      {sub ? (
        <div className="muted" style={{ fontSize: 13 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

function RoundDropdown({ value, options, onChange }) {
  return (
    <label
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span
        className="muted"
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}
      >
        Round
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minWidth: 240,
          height: 44,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(9,18,42,.94)",
          color: "#fff",
          padding: "0 14px",
          fontSize: 14,
          fontWeight: 700,
          outline: "none",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function PlayoffChallenge() {
  const [rounds, setRounds] = useState([]);
  const [round, setRound] = useState("WILDCARD");
  const [roundLabel, setRoundLabel] = useState("Wildcard Weekend");
  const [slots, setSlots] = useState([]);
  const [poolByPosition, setPoolByPosition] = useState({});
  const [summary, setSummary] = useState({
    roundPoints: 0,
    playoffTotal: 0,
    selectedCount: 0,
  });
  const [multiplierDetails, setMultiplierDetails] = useState([]);
  const [modalSlot, setModalSlot] = useState(null);
  const [err, setErr] = useState("");

  async function loadRounds() {
    const res = await api.get("/playoff-challenge/rounds");
    const items = res.data?.rounds || [];
    setRounds(items);

    if (items.length && !items.some((item) => item.value === round)) {
      setRound(items[0].value);
    }
  }

  async function loadRoundData(targetRound) {
    setErr("");

    const res = await api.get("/playoff-challenge/round", {
      params: { season: SEASON, round: targetRound },
    });

    setRoundLabel(res.data?.roundLabel || targetRound);
    setSlots(res.data?.slots || []);
    setPoolByPosition(res.data?.poolByPosition || {});
    setSummary(
      res.data?.summary || {
        roundPoints: 0,
        playoffTotal: 0,
        selectedCount: 0,
      }
    );
    setMultiplierDetails(res.data?.multiplierDetails || []);
  }

  useEffect(() => {
    loadRounds().catch(() =>
      setErr("Nem sikerült betölteni a playoff köröket.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!round) return;

    loadRoundData(round).catch(() =>
      setErr("Nem sikerült betölteni a Playoff Challenge adatokat.")
    );
  }, [round]);

  async function pickPlayer(playerId) {
    if (!modalSlot) return;

    try {
      await api.put("/playoff-challenge/slot", {
        season: SEASON,
        round,
        slot: modalSlot.slot,
        playerId,
      });

      setModalSlot(null);
      await loadRoundData(round);
    } catch (e) {
      setErr(
        e?.response?.data?.error || "Nem sikerült frissíteni a playoff slotot."
      );
    }
  }

  const modalPlayers = modalSlot
    ? poolByPosition[SLOT_TO_POOL_KEY[modalSlot.slot]] || []
    : [];

  const filledCount = useMemo(
    () => slots.filter((slot) => !!slot.player).length,
    [slots]
  );

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
              <span>Playoff Challenge</span>
            </div>

            <h1 className="h1">Playoff Challenge</h1>

            <p className="sub" style={{ maxWidth: 900 }}>
              Válassz 8 játékost playoff körönként. Az alap pontszámítás megegyezik a
              Perfect Challenge-ével, viszont ugyanazt a játékost egymást követő
              playoff körökben megtartva növekvő szorzót kapsz.
            </p>

            <div
              className="muted"
              style={{
                marginTop: 10,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              Wildcard: x1 • Divisional: ugyanazt megtartva x2 • Conference:
              ugyanazt végig megtartva x3 • Super Bowl: végig megtartva x4
            </div>
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
              title="Round points"
              value={formatScore(summary.roundPoints)}
              sub={roundLabel}
            />

            <ScoreCard
              title="Playoff total"
              value={formatScore(summary.playoffTotal)}
              sub={`${summary.selectedCount}/8 selected`}
            />
          </div>
        </div>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <RoundDropdown value={round} options={rounds} onChange={setRound} />

          <div className="filters-spacer" />

          <span className="pill">
            <span className="dot" />
            {filledCount}/8 selected
          </span>
        </div>
      </div>

      {err ? (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      ) : null}

      {!!multiplierDetails.length && (
        <div className="card" style={{ marginTop: 16, padding: 16 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              marginBottom: 10,
              color: "#f8fbff",
            }}
          >
            Current multipliers
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {multiplierDetails.map((item) => (
              <span
                key={`${item.slot}-${item.playerId}`}
                className="pill"
                style={{ fontWeight: 800 }}
              >
                {item.slot}: {item.displayName} ×{item.multiplier} (
                {formatScore(item.multipliedScore)})
              </span>
            ))}
          </div>
        </div>
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