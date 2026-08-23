import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        border: isLight ? "1px solid rgba(16,24,40,.14)" : "1px solid rgba(255,255,255,.12)",
        background: isLight ? "rgba(16,24,40,.03)" : "rgba(255,255,255,.04)",
        padding: 3,
        gap: 2,
      }}
    >
      {["en", "hu"].map((code) => {
        const active = language === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "6px 11px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".03em",
              background: active ? "rgba(59,130,246,.9)" : "transparent",
              color: active ? "#fff" : isLight ? "rgba(16,24,40,.55)" : "rgba(255,255,255,.6)",
              transition: "background .15s ease, color .15s ease",
            }}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}