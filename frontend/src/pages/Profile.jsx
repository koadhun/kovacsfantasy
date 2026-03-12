import { useEffect, useState } from "react";
import { api } from "../api";

function ProfileCard({ title, subtitle, children }) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        minHeight: 220,
        background:
          "linear-gradient(180deg, rgba(12,24,54,.96), rgba(7,14,32,.96))",
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
    load().catch(() => setEmailErr("Nem sikerült betölteni a profilt."));
  }, []);

  async function saveEmail() {
    setEmailMsg("");
    setEmailErr("");

    try {
      const res = await api.put("/users/me", { email });
      setUser(res.data.user);
      setEmailMsg("Email cím sikeresen frissítve.");
    } catch (e) {
      setEmailErr(e?.response?.data?.error || "Hiba történt.");
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

      setPasswordMsg(res.data.message || "Jelszó sikeresen módosítva.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPasswordErr(e?.response?.data?.error || "Hiba történt.");
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

        <p className="sub">
          Itt módosíthatod az email címedet és a jelszavadat.
        </p>
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
        <ProfileCard title="Account" subtitle="Felhasználói adatok">
          {!user ? (
            <div className="muted">Betöltés…</div>
          ) : (
            <>
              <InfoRow label="Username" value={user.username} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow
                label="Created"
                value={new Date(user.createdAt).toLocaleString()}
              />
            </>
          )}
        </ProfileCard>

        <ProfileCard
          title="Update Email"
          subtitle="Adj meg egy új email címet és mentsd."
        >
          <div style={{ display: "grid", gap: 12 }}>
            <input
              className="input-dark"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Új email cím"
            />

            <button className="btn primary" onClick={saveEmail}>
              Mentés
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
          title="Change Password"
          subtitle="Itt biztonságosan módosíthatod a jelszavadat."
        >
          <div style={{ display: "grid", gap: 12 }}>
            <input
              className="input-dark"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Jelenlegi jelszó"
            />

            <input
              className="input-dark"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Új jelszó"
            />

            <input
              className="input-dark"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Új jelszó megerősítése"
            />

            <button className="btn primary" onClick={changePassword}>
              Jelszó módosítása
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
    </div>
  );
}