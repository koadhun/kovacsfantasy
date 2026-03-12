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
  const statusDotGlow = isAdmin
    ? "rgba(239,68,68,.18)"
    : "rgba(59,130,246,.18)";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="brand">
            <span className="brand-mark" />
            <span className="brand-text">KOVACS FANTASY</span>
          </Link>

          {isLoggedIn && (
            <nav className="nav-links">
              <NavLink
                to="/schedule"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Schedule
              </NavLink>

              <NavLink
                to="/standings"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Standings
              </NavLink>

              <NavLink
                to="/stats"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Stats
              </NavLink>

              <NavLink
                to="/fantasy"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Fantasy
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Admin
                </NavLink>
              )}
            </nav>
          )}
        </div>

        {isLoggedIn && (
          <div className="navbar-right">
            <button
              type="button"
              className="profile-chip"
              onClick={() => navigate("/profile")}
              title="Profile"
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
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}