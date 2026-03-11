import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function AdminLayout() {
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
        <div className="admin-side-title">ADMIN</div>
        <p className="admin-side-sub">Kezelő felületek</p>

        <nav className="admin-nav">
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="admin-icon">👥</span>
            Users
          </NavLink>

          <NavLink
            to="/admin/standings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="admin-icon">🏈</span>
            Standings Admin
          </NavLink>

          <NavLink
            to="/admin/schedule-results"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="admin-icon">📝</span>
            Schedule Results
          </NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}