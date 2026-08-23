import { useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../components/PasswordIcons";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

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

export default function Login() {
  const { t } = useLanguage();
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

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/schedule");
    } catch (err) {
      setError(err?.response?.data?.error || t("login.genericError"));
    }
  }

  return (
        <div className="container">
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 0 0" }}>
        <LanguageSwitcher />
      </div>

      <div className="form-shell">
        <div className="hero">
          <div className="kicker">
            <span className="tag">{t("login.badge")}</span>
            <span>{t("login.kicker")}</span>
          </div>
          <h1 className="h1">{t("login.title")}</h1>
          <p className="sub">{t("login.subtitle")}</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <form onSubmit={handleLogin}>
            <div className="field">
              <input
                className="input"
                placeholder={t("login.usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input
                className="input"
                placeholder={t("login.passwordPlaceholder")}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 54 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={eyeButtonStyle}
                aria-label={t("login.passwordPlaceholder")}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="field" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link className="muted" to="/forgot-password">{t("login.forgotPassword")}</Link>
              <Link className="muted" to="/register">{t("login.registerLink")}</Link>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="btn primary" style={{ width: "100%" }} type="submit">
              {t("login.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}