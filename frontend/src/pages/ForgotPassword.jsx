import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message || t("forgotPassword.successMessage"));

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.error || t("forgotPassword.genericError"));
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
            <span className="tag">{t("forgotPassword.badge")}</span>
            <span>{t("forgotPassword.kicker")}</span>
          </div>
          <h1 className="h1">{t("forgotPassword.title")}</h1>
          <p className="sub">{t("forgotPassword.subtitle")}</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <form onSubmit={submit}>
            <div className="field">
              <input
                className="input"
                placeholder={t("forgotPassword.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {err && <p className="error">{err}</p>}
            {msg && <p className="success">{msg}</p>}

            <button className="btn primary" style={{ width: "100%" }} type="submit">
              {t("forgotPassword.submit")}
            </button>

            <p className="muted" style={{ marginTop: 12 }}>
              <Link to="/">{t("forgotPassword.backToLogin")}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}