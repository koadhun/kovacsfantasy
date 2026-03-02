import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSearchParams, Link } from "react-router-dom";


export default function ResetPassword() {
const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");

    if (pw !== pw2) {
      setErr("Az új jelszó és a jelszó megerősítése nem egyezik.");
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        password: pw,
        confirmPassword: pw2
      });
      setMsg(res.data.message || "Jelszó frissítve.");

	setTimeout(() => {
  navigate("/");
}, 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Hiba történt.");
    }
  }

  return (
    <div className="container">
      <div className="form-shell">
        <div className="hero">
          <div className="kicker">
            <span className="tag">RESET</span>
            <span>Új jelszó beállítása</span>
          </div>
          <h1 className="h1">Jelszó visszaállítás</h1>
          <p className="sub">A link megnyitásával az alábbi modalban tudsz új jelszót beállítani.</p>
        </div>

        {/* Modal */}
        <div className="card" style={{ marginTop: 14 }}>
          <h3 className="card-title">Új jelszó beállítása</h3>

          {!token && (
            <p className="error">
              Hiányzó token. Nyisd meg a linket az emailből újra.
            </p>
          )}

          <form onSubmit={submit}>
            <div className="field" style={{ position: "relative" }}>
              <input
                className="input"
                placeholder="Új jelszó"
                type={show1 ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                style={{ paddingRight: 54 }}
                disabled={!token}
              />
              <button
                type="button"
                className="btn"
                onClick={() => setShow1((s) => !s)}
                style={{ position: "absolute", right: 8, top: 8, padding: "8px 10px" }}
              >
                {show1 ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input
                className="input"
                placeholder="Új jelszó megerősítése"
                type={show2 ? "text" : "password"}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                style={{ paddingRight: 54 }}
                disabled={!token}
              />
              <button
                type="button"
                className="btn"
                onClick={() => setShow2((s) => !s)}
                style={{ position: "absolute", right: 8, top: 8, padding: "8px 10px" }}
              >
                {show2 ? "🙈" : "👁️"}
              </button>
            </div>

            {err && <p className="error">{err}</p>}
            {msg && (
              <p className="success">
                {msg} <Link to="/">Bejelentkezés</Link>
              </p>
            )}

            <button className="btn primary" style={{ width: "100%" }} type="submit" disabled={!token}>
              Megerősítés
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}