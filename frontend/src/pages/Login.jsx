import { useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { username, password });

      // ✅ token
      localStorage.setItem("token", res.data.token);

      // ✅ user (username, role, email, id...)
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        // ha valamiért nincs user a válaszban
        localStorage.removeItem("user");
      }

      navigate("/schedule");
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba történt.");
    }
  }

  return (
    <div className="container">
      <div className="form-shell">
        <div className="hero">
          <div className="kicker">
            <span className="tag">NFL THEME</span>
            <span>Bejelentkezés a KovacsFantasy oldalra</span>
          </div>
          <h1 className="h1">Welcome back</h1>
          <p className="sub">Jelentkezz be és nézd a schedule-t, statokat, fantasy-t.</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <form onSubmit={handleLogin}>
            <div className="field">
              <input
                className="input"
                placeholder="Felhasználónév"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input
                className="input"
                placeholder="Jelszó"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 54 }}
              />
              <button
                type="button"
                className="btn"
                onClick={() => setShowPw((s) => !s)}
                style={{ position: "absolute", right: 8, top: 8, padding: "8px 10px" }}
                aria-label="Jelszó megjelenítése"
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>

            <div
              className="field"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <Link className="muted" to="/forgot-password">
                Elfelejtett jelszó
              </Link>

              <Link className="muted" to="/register">
                Regisztráció
              </Link>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="btn primary" style={{ width: "100%" }} type="submit">
              Bejelentkezés
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}