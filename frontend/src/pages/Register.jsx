import { useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../components/PasswordIcons";

const eyeButtonStyle = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  borderRadius: 0,
  WebkitAppearance: "none",
  appearance: "none",
  padding: 4,
  display: "flex",
  alignItems: "center",
  lineHeight: 0,
  color: "#64748b",
  cursor: "pointer",
};

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const navigate = useNavigate();

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      alert("Sikeres regisztráció! Most be tudsz jelentkezni.");
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Hiba történt.");
    }
  }

  return (
    <div className="container">
      <div className="form-shell">
        <div className="hero">
          <div className="kicker">
            <span className="tag">CREATE ACCOUNT</span>
            <span>Új felhasználó létrehozása</span>
          </div>
          <h1 className="h1">Join the league</h1>
          <p className="sub">Regisztrálj és kezdd el építeni a fantasy élményt.</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <form onSubmit={handleRegister}>
            <div className="field">
              <input className="input" placeholder="Felhasználónév" value={form.username}
                onChange={(e) => setField("username", e.target.value)} />
            </div>

            <div className="field">
              <input className="input" placeholder="Email" value={form.email}
                onChange={(e) => setField("email", e.target.value)} />
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input className="input" placeholder="Jelszó" type={showPw ? "text" : "password"} value={form.password}
                onChange={(e) => setField("password", e.target.value)} style={{ paddingRight: 54 }} />
              <button type="button" onClick={() => setShowPw((s) => !s)} style={eyeButtonStyle} aria-label="Jelszó megjelenítése">
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input className="input" placeholder="Jelszó megerősítése" type={showConfirmPw ? "text" : "password"} value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)} style={{ paddingRight: 54 }} />
              <button type="button" onClick={() => setShowConfirmPw((s) => !s)} style={eyeButtonStyle} aria-label="Jelszó megjelenítése">
                {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="btn primary" style={{ width: "100%" }} type="submit">
              Regisztráció
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