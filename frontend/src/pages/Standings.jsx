import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import SeasonDropdown from "../components/SeasonDropdown";

const DEFAULT_SEASON = 2025;
const SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

function Pill({ text }) {
  return (
    <span className="pill" style={{ marginLeft: 8 }}>
      <span className="dot" />
      {text}
    </span>
  );
}

function DivisionTable({ title, rows }) {
  return (
    <div className="card">
      <h3 className="card-title" style={{ marginBottom: 12 }}>
        {title}
      </h3>

      <table className="table">
        <thead>
          <tr>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>T</th>
            <th>PCT</th>
            <th>PF</th>
            <th>PA</th>
            <th>NET</th>
            <th>Clinched</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.team}>
              <td style={{ fontWeight: 800 }}>{r.team}</td>
              <td>{r.w}</td>
              <td>{r.l}</td>
              <td>{r.t}</td>
              <td>{Number(r.pct || 0).toFixed(3)}</td>
              <td>{r.pf}</td>
              <td>{r.pa}</td>
              <td>{r.net}</td>
              <td className="muted">
                {r.clinched?.length ? r.clinched.join(" ") : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Standings() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [conf, setConf] = useState("AFC");
  const [division, setDivision] = useState("ALL");

  useEffect(() => {
    async function load() {
      setErr("");
      setLoading(true);

      try {
        const res = await api.get("/standings", { params: { season } });
        setData(res.data);
      } finally {
        setLoading(false);
      }
    }

    load().catch(() =>
      setErr("Nem sikerült betölteni a standings adatokat.")
    );
  }, [season]);

  useEffect(() => {
    setDivision("ALL");
  }, [conf]);

  const conferenceData = useMemo(() => {
    return data?.conferences?.[conf]?.divisions || {};
  }, [data, conf]);

  const divisions = useMemo(() => {
    return Object.keys(conferenceData);
  }, [conferenceData]);

  const allDivisionData = useMemo(() => {
    return divisions.map((d) => ({
      name: d,
      rows: conferenceData[d] || [],
    }));
  }, [conferenceData, divisions]);

  const singleRows = useMemo(() => {
    if (division === "ALL") return [];
    return conferenceData[division] || [];
  }, [conferenceData, division]);

  const hasAnyRows = useMemo(() => {
    return allDivisionData.some((d) => d.rows.length > 0);
  }, [allDivisionData]);

  const modeLabel =
    division === "ALL" ? "Conference View" : "Division View";

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">STANDINGS</span>
          <span>{modeLabel}</span>
        </div>

        <h1 className="h1">Standings</h1>

        <p className="sub" style={{ marginBottom: 0 }}>
          {division === "ALL"
            ? `Alapértelmezett: teljes ${conf}.`
            : `Szűrve: ${division}.`}{" "}
          {data?.season ? <Pill text={`Season ${data.season}`} /> : null}
        </p>

        <div className="filters-bar">
          <SeasonDropdown
            value={season}
            options={SEASONS}
            onChange={setSeason}
            label="SEASON"
            width={170}
          />

          <div className="filters-group">
            <span className="filters-label">CONFERENCE</span>
            <button
              className={`btn ${conf === "AFC" ? "primary" : ""}`}
              onClick={() => setConf("AFC")}
            >
              AFC
            </button>
            <button
              className={`btn ${conf === "NFC" ? "primary" : ""}`}
              onClick={() => setConf("NFC")}
            >
              NFC
            </button>
          </div>

          <div className="filters-group" style={{ minWidth: 320 }}>
            <span className="filters-label">DIVISION</span>
            <select
              className="select-dark"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              disabled={!divisions.length}
            >
              <option value="ALL">{conf} — ALL DIVISIONS</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="filters-spacer" />

          <div className="muted" style={{ fontSize: 12 }}>
            Legend: x playoff, y wild card, z division, * homefield
          </div>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      {loading && !err && (
        <p className="muted" style={{ marginTop: 14 }}>
          Betöltés…
        </p>
      )}

      {!loading && !err && data && !hasAnyRows && (
        <div className="card" style={{ marginTop: 14, padding: 14 }}>
          <div className="muted">
            Nincs standings adat a(z) {season} szezonhoz.
          </div>
        </div>
      )}

      {data && hasAnyRows && division === "ALL" && (
        <div className="standings-grid-2x2">
          {allDivisionData.map((d) => (
            <DivisionTable key={d.name} title={d.name} rows={d.rows} />
          ))}
        </div>
      )}

      {data && hasAnyRows && division !== "ALL" && (
        <div className="standings-full">
          <DivisionTable title={division} rows={singleRows} />
        </div>
      )}

      {data?.updatedAt && (
        <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
          Updated at: {new Date(data.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}