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

export default function Register() {
  const { t } = useLanguage();
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
      alert(t("register.successAlert"));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || t("register.genericError"));
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
            <span className="tag">{t("register.badge")}</span>
            <span>{t("register.kicker")}</span>
          </div>
          <h1 className="h1">{t("register.title")}</h1>
          <p className="sub">{t("register.subtitle")}</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <form onSubmit={handleRegister}>
            <div className="field">
              <input className="input" placeholder={t("register.usernamePlaceholder")} value={form.username}
                onChange={(e) => setField("username", e.target.value)} />
            </div>

            <div className="field">
              <input className="input" placeholder={t("register.emailPlaceholder")} value={form.email}
                onChange={(e) => setField("email", e.target.value)} />
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input className="input" placeholder={t("register.passwordPlaceholder")} type={showPw ? "text" : "password"} value={form.password}
                onChange={(e) => setField("password", e.target.value)} style={{ paddingRight: 54 }} />
              <button type="button" onClick={() => setShowPw((s) => !s)} style={eyeButtonStyle} aria-label={t("register.passwordPlaceholder")}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input className="input" placeholder={t("register.confirmPasswordPlaceholder")} type={showConfirmPw ? "text" : "password"} value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)} style={{ paddingRight: 54 }} />
              <button type="button" onClick={() => setShowConfirmPw((s) => !s)} style={eyeButtonStyle} aria-label={t("register.confirmPasswordPlaceholder")}>
                {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="btn primary" style={{ width: "100%" }} type="submit">
              {t("register.submit")}
            </button>

            <p className="muted" style={{ marginTop: 12 }}>
              <Link to="/">{t("register.backToLogin")}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}