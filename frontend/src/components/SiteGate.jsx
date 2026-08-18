import { useState } from "react";

const SITE_PASSWORD = "almafa1234"; // <-- ide írd a saját jelszavadat
const STORAGE_KEY = "kf_site_unlocked";

export default function SiteGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "yes"
  );
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (unlocked) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "yes");
      setUnlocked(true);
    } else {
      setErr("Hibás jelszó.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#05080f",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 16,
          padding: 32,
          width: 340,
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#fff", marginTop: 0 }}>KovacsFantasy</h2>
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>
          Az oldal jelenleg fejlesztés alatt áll.
        </p>

        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Jelszó"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.05)",
            color: "#fff",
            marginTop: 16,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        {err && <p style={{ color: "#f87171", fontSize: 13 }}>{err}</p>}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Tovább
        </button>
      </form>
    </div>
  );
}