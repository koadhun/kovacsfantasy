import { useEffect, useState } from "react";
import { api } from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const res = await api.get("/users/me");
    setUser(res.data.user);
    setEmail(res.data.user.email);
  }

  useEffect(() => {
    load().catch(() => setErr("Nem sikerült betölteni a profilt."));
  }, []);

  async function save() {
    setMsg("");
    setErr("");
    try {
      const res = await api.put("/users/me", { email });
      setUser(res.data.user);
      setMsg("Profil frissítve.");
    } catch (e) {
      setErr(e?.response?.data?.error || "Hiba történt.");
    }
  }

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">PROFILE</span>
          <span>Saját adatok kezelése</span>
        </div>
        <h1 className="h1">Profile</h1>
        <p className="sub">Itt módosíthatod az email címedet.</p>
      </div>

      <div className="grid">
        <div className="col-4 card">
          <h3 className="card-title">Account</h3>
          {!user ? (
            <p className="muted">Betöltés…</p>
          ) : (
            <>
              <p className="muted" style={{ margin: "8px 0 0" }}><b>Username:</b> {user.username}</p>
              <p className="muted" style={{ margin: "8px 0 0" }}><b>Role:</b> {user.role}</p>
              <p className="muted" style={{ margin: "8px 0 0" }}><b>Created:</b> {new Date(user.createdAt).toLocaleString()}</p>
            </>
          )}
        </div>

        <div className="col-8 card">
          <h3 className="card-title">Update Email</h3>
          <p className="muted" style={{ marginTop: 0 }}>Adj meg egy új email címet és mentsd.</p>

          <div className="field">
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <button className="btn primary" onClick={save}>Mentés</button>

          {err && <p className="error">{err}</p>}
          {msg && <p className="success">{msg}</p>}
        </div>
      </div>
    </div>
  );
}