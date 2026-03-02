import { NavLink, Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!token;
  const isAdmin = user?.role === "ADMIN";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="topbar">
      <div className="container">
        <div className="topbar-inner">
          <Link to={isLoggedIn ? "/schedule" : "/login"} className="brand">
            <span className="brandDot" />
            <span>KOVACS FANTASY</span>
          </Link>

          {isLoggedIn && (
            <nav className="nav">
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

              {/* ✅ nincs Profile a navban */}
              {/* ✅ nincs ADMIN dropdown a navban */}
              {isAdmin && (
                <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
                  Admin
                </NavLink>
              )}
            </nav>
          )}

          <div className="topbarRight">
            {isLoggedIn && (
              <>
                {/* ✅ kattintás: Profile (csak innen érhető el) */}
                <button
                  type="button"
                  className="userBadge"
                  onClick={() => navigate("/profile")}
                  title="Profile"
                >
                  <span className={`userDot ${isAdmin ? "admin" : ""}`} />
                  <span style={{ fontWeight: 800 }}>
                    {user?.username || "User"} · {user?.role || "USER"}
                  </span>
                </button>

                {/* ✅ Logout jobbra */}
                <button className="btn ghost" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}