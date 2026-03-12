import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
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

export default function PerfectChallenge() {
  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState(1);
  const [slots, setSlots] = useState([]);
  const [poolByPosition, setPoolByPosition] = useState({});
  const [err, setErr] = useState("");
  const [modalSlot, setModalSlot] = useState(null);

  async function loadWeeks() {
    const res = await api.get("/perfect-challenge/weeks");
    const ws = res.data?.weeks || [];
    setWeeks(ws);
    if (ws.length) setWeek((prev) => (ws.includes(prev) ? prev : ws[0]));
  }

  async function loadWeekData(targetWeek) {
    setErr("");
    const res = await api.get("/perfect-challenge/week", {
      params: { season: SEASON, week: targetWeek },
    });
    setSlots(res.data?.slots || []);
    setPoolByPosition(res.data?.poolByPosition || {});
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr("Nem sikerült betölteni a heteket."));
  }, []);

  useEffect(() => {
    if (!week) return;
    loadWeekData(week).catch(() =>
      setErr("Nem sikerült betölteni a Perfect Challenge adatokat.")
    );
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
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Perfect Challenge</span>
        </div>

        <h1 className="h1">Perfect Challenge</h1>

        <p className="sub" style={{ maxWidth: 840 }}>
          Válassz 8 játékost fix pozíciókra bontva. A front oldalon a játékos
          pontszáma látszik, a hátoldalon az OVERALL STATS. Ez az első körös
          UI/DB implementáció dummy adatokkal.
        </p>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <WeekDropdown
            value={week}
            options={weeks}
            onChange={setWeek}
            label="WEEK"
            width={170}
          />

          <div className="filters-spacer" />

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