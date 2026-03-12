import { NavLink, Link, useNavigate } from "react-router-dom";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = readStoredUser();

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "ADMIN";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const statusDotColor = isAdmin ? "#ef4444" : "#3b82f6";

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          <span className="brand-text">KOVACS FANTASY</span>
        </Link>

        {isLoggedIn && (
          <div className="nav-links">
            <NavLink to="/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
              Schedule
            </NavLink>
            <NavLink to="/standings" className={({ isActive }) => (isActive ? "active" : "")}>
              Standings
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => (isActive ? "active" : "")}>
              Stats
            </NavLink>
            <NavLink to="/fantasy" className={({ isActive }) => (isActive ? "active" : "")}>
              Fantasy
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
                Admin
              </NavLink>
            )}
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="profile-chip"
            onClick={() => navigate("/profile")}
            title="Profile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(255,255,255,.04)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: statusDotColor,
                boxShadow: `0 0 0 3px ${isAdmin ? "rgba(239,68,68,.16)" : "rgba(59,130,246,.16)"}`,
                flexShrink: 0,
              }}
            />
            <span>
              {user?.username || "User"} · {user?.role || "USER"}
            </span>
          </button>

          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}