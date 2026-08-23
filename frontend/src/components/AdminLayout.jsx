import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";


function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const { t } = useLanguage();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = readStoredUser();
  const isAdmin = !!token && user?.role === "ADMIN";

  if (!isAdmin) {
    return <Navigate to="/schedule" replace state={{ from: location }} />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-side-title">{t("admin.sidebarTitle")}</div>
        <p className="admin-side-sub">{t("admin.sidebarSubtitle")}</p>

        <nav className="admin-nav">
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="admin-icon">👥</span>
            {t("admin.navUsers")}
          </NavLink>

          <NavLink
            to="/admin/standings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
                        <span className="admin-icon">🏈</span>
            {t("admin.navStandings")}
          </NavLink>

          <NavLink
            to="/admin/schedule-results"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
                        <span className="admin-icon">📝</span>
            {t("admin.navScheduleResults")}
          </NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}