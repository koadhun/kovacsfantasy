export function getThemeTokens(theme) {
  const isLight = theme === "light";

  return {
    isLight,
    panelBg: isLight
      ? "#ffffff"
      : "linear-gradient(180deg, rgba(15,30,68,.96), rgba(9,18,42,.96))",
    panelBgSoft: isLight ? "#ffffff" : "rgba(16,26,51,.70)",
    panelBorder: isLight ? "rgba(16,24,40,.10)" : "rgba(59,130,246,.22)",
    panelBorderSoft: isLight ? "rgba(16,24,40,.08)" : "rgba(255,255,255,.08)",
    shadow: isLight ? "0 8px 20px rgba(16,24,40,.06)" : "0 12px 28px rgba(0,0,0,.22)",
    textPrimary: isLight ? "#101828" : "#f8fbff",
    textMuted: isLight ? "#5b6478" : "rgba(255,255,255,.72)",
    inputBg: isLight ? "#ffffff" : "rgba(255,255,255,.04)",
    inputBorder: isLight ? "rgba(16,24,40,.14)" : "rgba(255,255,255,.10)",
    hoverBg: isLight ? "rgba(16,24,40,.05)" : "rgba(255,255,255,.06)",
    successText: isLight ? "#15803d" : "#86efac",
    winnerBg: isLight
      ? "linear-gradient(180deg, rgba(16,24,40,.06), rgba(16,24,40,.02))"
      : "linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.03))",
    highlightedBg: isLight ? "rgba(43,108,255,.05)" : "rgba(20,40,90,.14)",
    neutralRowBg: isLight ? "rgba(16,24,40,.02)" : "rgba(255,255,255,.015)",
  };
}