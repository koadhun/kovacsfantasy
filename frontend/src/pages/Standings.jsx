import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

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
      <h3 className="card-title" style={{ marginBottom: 12 }}>{title}</h3>

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
              <td>{Number(r.pct).toFixed(3)}</td>
              <td>{r.pf}</td>
              <td>{r.pa}</td>
              <td>{r.net}</td>
              <td className="muted">{r.clinched?.length ? r.clinched.join(" ") : "-"}</td>
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

  const [conf, setConf] = useState("AFC");
  const [division, setDivision] = useState("ALL"); // default: full conf

  useEffect(() => {
    async function load() {
      setErr("");
      const res = await api.get("/standings");
      setData(res.data);
    }
    load().catch(() => setErr("Nem sikerült betölteni a standings adatokat."));
  }, []);

  // konferencia váltáskor ALL nézet
  useEffect(() => {
    setDivision("ALL");
  }, [conf]);

  const divisions = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.conferences[conf].divisions);
  }, [data, conf]);

  const allDivisionData = useMemo(() => {
    if (!data) return [];
    return divisions.map((d) => ({
      name: d,
      rows: data.conferences[conf].divisions[d] || []
    }));
  }, [data, conf, divisions]);

  const singleRows = useMemo(() => {
    if (!data) return [];
    if (division === "ALL") return [];
    return data.conferences[conf].divisions[division] || [];
  }, [data, conf, division]);

  const modeLabel = division === "ALL" ? "Conference View" : "Division View";

  return (
    <div className="container page">
      {/* Header */}
      <div className="hero">
        <div className="kicker">
          <span className="tag">STANDINGS</span>
          <span>{modeLabel}</span>
        </div>

        <h1 className="h1">Standings</h1>

        <p className="sub" style={{ marginBottom: 0 }}>
          {division === "ALL"
            ? `Alapértelmezett: teljes ${conf}.`
            : `Szűrve: ${division}.`}
          {" "}
          {data?.season ? <Pill text={`Season ${data.season}`} /> : null}
        </p>

        {/* Filters in header (horizontal) */}
        <div className="filters-bar">
          <div className="filters-group">
            <span className="filters-label">CONFERENCE</span>
            <button className={`btn ${conf === "AFC" ? "primary" : ""}`} onClick={() => setConf("AFC")}>
              AFC
            </button>
            <button className={`btn ${conf === "NFC" ? "primary" : ""}`} onClick={() => setConf("NFC")}>
              NFC
            </button>
          </div>

          <div className="filters-group" style={{ minWidth: 320 }}>
            <span className="filters-label">DIVISION</span>
            <select className="select-dark" value={division} onChange={(e) => setDivision(e.target.value)}>
              <option value="ALL">{conf} — ALL DIVISIONS</option>
              {divisions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filters-spacer" />

          <div className="muted" style={{ fontSize: 12 }}>
            Legend: x playoff, y wild card, z division, * homefield
          </div>
        </div>
      </div>

      {/* Errors / Loading */}
      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}
      {!data && !err && <p className="muted" style={{ marginTop: 14 }}>Betöltés…</p>}

      {/* Content */}
      {data && division === "ALL" && (
        <div className="standings-grid-2x2">
          {allDivisionData.map((d) => (
            <DivisionTable key={d.name} title={d.name} rows={d.rows} />
          ))}
        </div>
      )}

      {data && division !== "ALL" && (
        <div className="standings-full">
          <DivisionTable title={division} rows={singleRows} />
        </div>
      )}

      {data?.updatedAt && (
        <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
          Data loaded from backend seed. UpdatedAt: {new Date(data.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}