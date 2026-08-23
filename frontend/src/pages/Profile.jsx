import { useEffect, useState } from "react";
import { api } from "../api";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";
import { getThemeTokens } from "../theme/themeTokens";

function ProfileCard({ title, subtitle, children, tokens }) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        minHeight: 220,
        background: tokens.panelBg,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
      {subtitle && (
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div className="muted" style={{ fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

export default function Profile() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const tokens = getThemeTokens(theme);
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  async function load() {
    setEmailErr("");
    const res = await api.get("/users/me");
    setUser(res.data.user);
    setEmail(res.data.user.email);
  }

  useEffect(() => {
    load().catch(() => setEmailErr(t("profile.loadError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveEmail() {
    setEmailMsg("");
    setEmailErr("");

    try {
      const res = await api.put("/users/me", { email });
      setUser(res.data.user);
      setEmailMsg(t("profile.emailUpdated"));
    } catch (e) {
      setEmailErr(e?.response?.data?.error || t("profile.genericError"));
    }
  }

  async function changePassword() {
    setPasswordMsg("");
    setPasswordErr("");

    try {
      const res = await api.put("/users/me/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordMsg(res.data.message || t("profile.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPasswordErr(e?.response?.data?.error || t("profile.genericError"));
    }
  }

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">PROFILE</span>
          <span>{t("profile.kicker")}</span>
        </div>

        <h1 className="h1">{t("profile.title")}</h1>

        <p className="sub">{t("profile.subtitle")}</p>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <ProfileCard title={t("profile.accountTitle")} subtitle={t("profile.accountSubtitle")} tokens={tokens}>
          {!user ? (
            <div className="muted">{t("profile.loading")}</div>
          ) : (
            <>
              <InfoRow label={t("profile.usernameLabel")} value={user.username} />
              <InfoRow label={t("profile.roleLabel")} value={user.role} />
              <InfoRow label={t("profile.emailLabel")} value={user.email} />
              <InfoRow
                label={t("profile.createdLabel")}
                value={new Date(user.createdAt).toLocaleString()}
              />
            </>
          )}
        </ProfileCard>

        <ProfileCard
          title={t("profile.updateEmailTitle")}
          subtitle={t("profile.updateEmailSubtitle")}
          tokens={tokens}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <input
              className="input-dark"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("profile.newEmailPlaceholder")}
            />

            <button className="btn primary" onClick={saveEmail}>
              {t("profile.save")}
            </button>

            {emailErr && <div className="error">{emailErr}</div>}
            {emailMsg && (
              <div className="muted" style={{ color: "#86efac" }}>
                {emailMsg}
              </div>
            )}
          </div>
        </ProfileCard>

        <ProfileCard
          title={t("profile.changePasswordTitle")}
          subtitle={t("profile.changePasswordSubtitle")}
          tokens={tokens}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <input
              className="input-dark"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("profile.currentPasswordPlaceholder")}
            />

            <input
              className="input-dark"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("profile.newPasswordPlaceholder")}
            />

            <input
              className="input-dark"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("profile.confirmPasswordPlaceholder")}
            />

            <button className="btn primary" onClick={changePassword}>
              {t("profile.changePasswordButton")}
            </button>

            {passwordErr && <div className="error">{passwordErr}</div>}
            {passwordMsg && (
              <div className="muted" style={{ color: "#86efac" }}>
                {passwordMsg}
              </div>
            )}
          </div>
        </ProfileCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ProfileCard
          title={t("profile.appearanceTitle")}
          subtitle={t("profile.appearanceSubtitle")}
          tokens={tokens}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="muted" style={{ fontWeight: 700 }}>
              {t("profile.darkMode")}
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("profile.toggleTheme")}
              style={{
                position: "relative",
                width: 52,
                height: 28,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.14)",
                background:
                  theme === "light"
                    ? "rgba(245,179,1,.35)"
                    : "rgba(59,130,246,.35)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: theme === "light" ? 26 : 2,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .18s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,.3)",
                }}
              />
            </button>

            <span className="muted" style={{ fontWeight: 700 }}>
              {t("profile.lightMode")}
            </span>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}