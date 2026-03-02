import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminStandings() {
  const [season, setSeason] = useState(2025);
  const [jsonText, setJsonText] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setMsg("");
    const res = await api.get(`/standings?season=${season}`);
    setJsonText(JSON.stringify(res.data, null, 2));
  }

  useEffect(() => {
    load().catch(() => setErr("Nem sikerült betölteni a standings JSON-t."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setErr("");
    setMsg("");
    try {
      const payload = JSON.parse(jsonText);
      await api.put("/admin/standings", payload);
      setMsg("Standings frissítve DB-ben.");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Hiba történt.");
    }
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Standings Admin</h1>
          <p>Standing JSON betöltése és DB-be mentése.</p>
        </div>

        <div className="admin-badges">
          <span className="pill">
            <span className="dot admin" />
            ADMIN
          </span>
          <span className="pill">
            <span className="dot" />
            Season {season}
          </span>
        </div>
      </div>

      <div className="grid">
        <div className="col-4">
          <div className="card">
            <h3 className="card-title">Controls</h3>

            <div className="field">
              <div className="muted" style={{ marginBottom: 6 }}>
                Season
              </div>
              <input
                className="input"
                type="number"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => load().catch(() => setErr("Betöltés hiba."))}>
                Load JSON
              </button>
              <button className="btn primary" onClick={save}>
                Save to DB
              </button>
            </div>

            {err && <p className="error">{err}</p>}
            {msg && <p className="success">{msg}</p>}

            <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
              Tipp: később ide fogjuk bekötni az “Import from source” gombot is.
            </p>
          </div>
        </div>

        <div className="col-8">
          <div className="card">
            <h3 className="card-title">Standings JSON</h3>
            <textarea
              className="input"
              style={{
                minHeight: 520,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
            <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
              Figyelj a JSON érvényességére. Mentés előtt parse-oljuk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}