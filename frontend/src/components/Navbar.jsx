import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const token = localStorage.getItem("token");
  const user = readStoredUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "ADMIN";
  const isVip = user?.role === "VIP";

  function closeMenu() {
    setMenuOpen(false);
  }

  function logout() {
    closeMenu();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function goProfile() {
    closeMenu();
    navigate("/profile");
  }

  const statusDotColor = isAdmin ? "#ef4444" : isVip ? "#f5b301" : "#3b82f6";
  const statusDotGlow = isAdmin
    ? "rgba(239,68,68,.18)"
    : isVip
    ? "rgba(245,179,1,.22)"
    : "rgba(59,130,246,.18)";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="brand-text">KOVACS FANTASY</span>
          </Link>
        </div>

        {isLoggedIn && (
          <button
            type="button"
            className="navbar-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}

        {isLoggedIn && (
          <div className={`navbar-collapsible${menuOpen ? " open" : ""}`}>
            <nav className="nav-links">
              <NavLink
                to="/schedule"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {t("nav.schedule")}
              </NavLink>

              <NavLink
                to="/standings"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {t("nav.standings")}
              </NavLink>

              <NavLink
                to="/stats"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {t("nav.stats")}
              </NavLink>

              <NavLink
                to="/fantasy"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {t("nav.fantasy")}
              </NavLink>

              <NavLink
                to="/hall-of-fame"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Hall of Fame
              </NavLink>

              {(isVip || isAdmin) && (
                <NavLink
                  to="/injuries"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {t("nav.injuries")}
                </NavLink>
              )}

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {t("nav.admin")}
                </NavLink>
              )}
            </nav>

            <div className="navbar-right">
              <LanguageSwitcher />

              {!isAdmin && !isVip && (
                <Link
                  to="/become-vip"
                  onClick={closeMenu}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: ".02em",
                    textDecoration: "none",
                    color: "#1a1206",
                    background: "linear-gradient(135deg, #fde68a, #f5b301 60%, #d99400)",
                    boxShadow: "0 0 0 1px rgba(245,179,1,.4), 0 4px 14px rgba(245,179,1,.28)",
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: 14 }}>
                    ✦
                  </span>
                  {t("nav.becomeVip")}
                </Link>
              )}

              <button
                type="button"
                className="profile-chip"
                onClick={goProfile}
                title={t("nav.profile")}
              >
                <span
                  className="profile-chip-dot"
                  style={{
                    background: statusDotColor,
                    boxShadow: `0 0 0 3px ${statusDotGlow}`,
                  }}
                />
                <span className="profile-chip-text">
                  {user?.username || "User"} · {user?.role || "USER"}
                </span>
              </button>

              <button type="button" className="btn" onClick={logout}>
                {t("nav.logout")}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}