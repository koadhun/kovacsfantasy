import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message || "Email elküldve.");

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
            <span>Jelszó visszaállítás</span>
          </div>
          <h1 className="h1">Elfelejtett jelszó</h1>
          <p className="sub">Add meg a regisztrált email címed, küldünk egy visszaállító linket.</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <form onSubmit={submit}>
            <div className="field">
              <input
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {err && <p className="error">{err}</p>}
            {msg && <p className="success">{msg}</p>}

            <button className="btn primary" style={{ width: "100%" }} type="submit">
              Elküld
            </button>

            <p className="muted" style={{ marginTop: 12 }}>
              <Link to="/">Vissza a bejelentkezéshez</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}