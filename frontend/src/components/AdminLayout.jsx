import { NavLink, Outlet, Navigate } from "react-router-dom";

export default function AdminLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return <Navigate to="/schedule" replace />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-side-title">ADMIN</div>
        <p className="admin-side-sub">Kezelő felületek</p>

        <nav className="admin-nav">
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="admin-icon">👥</span>
            Users
          </NavLink>

          {/* ✅ FONTOS: ez /admin/standings legyen, nem /standings */}
          <NavLink to="/admin/standings" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="admin-icon">🏈</span>
            Standings Admin
          </NavLink>

          <NavLink to="/admin/schedule-results" className={({ isActive }) => (isActive ? "active" : "")}>
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