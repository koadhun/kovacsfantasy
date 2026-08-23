import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

function getFromDict(dict, path) {
  return path.split(".").reduce((node, key) => (node ? node[key] : undefined), dict);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("language") || "en"
  );

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  function setLanguage(lang) {
    if (lang === "en" || lang === "hu") setLanguageState(lang);
  }

  function t(key) {
    const value = getFromDict(translations[language], key);
    if (value !== undefined) return value;
    const fallback = getFromDict(translations.en, key);
    return fallback !== undefined ? fallback : key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}