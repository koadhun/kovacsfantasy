import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSearchParams, Link } from "react-router-dom";
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

export default function ResetPassword() {
  const { t } = useLanguage();
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
      setErr(t("resetPassword.mismatchError"));
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        password: pw,
        confirmPassword: pw2
      });
      setMsg(t("resetPassword.successMessage"));

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.error || t("resetPassword.genericError"));
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
            <span className="tag">{t("resetPassword.badge")}</span>
            <span>{t("resetPassword.kicker")}</span>
          </div>
          <h1 className="h1">{t("resetPassword.title")}</h1>
          <p className="sub">{t("resetPassword.subtitle")}</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <h3 className="card-title">{t("resetPassword.cardTitle")}</h3>

          {!token && (
            <p className="error">
              {t("resetPassword.missingToken")}
            </p>
          )}

          <form onSubmit={submit}>
            <div className="field" style={{ position: "relative" }}>
              <input
                className="input"
                placeholder={t("resetPassword.newPasswordPlaceholder")}
                type={show1 ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                style={{ paddingRight: 54 }}
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShow1((s) => !s)}
                style={eyeButtonStyle}
                aria-label={t("resetPassword.newPasswordPlaceholder")}
              >
                {show1 ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="field" style={{ position: "relative" }}>
              <input
                className="input"
                placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                type={show2 ? "text" : "password"}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                style={{ paddingRight: 54 }}
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShow2((s) => !s)}
                style={eyeButtonStyle}
                aria-label={t("resetPassword.confirmPasswordPlaceholder")}
              >
                {show2 ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {err && <p className="error">{err}</p>}
            {msg && (
              <p className="success">
                {msg} <Link to="/">{t("resetPassword.loginLink")}</Link>
              </p>
            )}

            <button className="btn primary" style={{ width: "100%" }} type="submit" disabled={!token}>
              {t("resetPassword.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}