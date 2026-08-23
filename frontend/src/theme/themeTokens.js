export function getThemeTokens(theme) {
  const isLight = theme === "light";

  return {
    isLight,
    panelBg: isLight
      ? "linear-gradient(180deg, rgba(255,255,255,.96), rgba(244,246,251,.94))"
      : "linear-gradient(180deg, rgba(15,30,68,.96), rgba(9,18,42,.96))",
    panelBgSoft: isLight ? "rgba(255,255,255,.85)" : "rgba(16,26,51,.70)",
    panelBorder: isLight ? "rgba(16,24,40,.14)" : "rgba(59,130,246,.22)",
    panelBorderSoft: isLight ? "rgba(16,24,40,.10)" : "rgba(255,255,255,.08)",
    shadow: isLight ? "0 10px 26px rgba(16,24,40,.08)" : "0 12px 28px rgba(0,0,0,.22)",
    textPrimary: isLight ? "#101828" : "#f8fbff",
    textMuted: isLight ? "#5b6478" : "rgba(255,255,255,.72)",
    inputBg: isLight ? "#ffffff" : "rgba(255,255,255,.04)",
    inputBorder: isLight ? "rgba(16,24,40,.16)" : "rgba(255,255,255,.10)",
    hoverBg: isLight ? "rgba(16,24,40,.05)" : "rgba(255,255,255,.06)",
    successText: isLight ? "#15803d" : "#86efac",
  };
}