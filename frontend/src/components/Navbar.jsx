import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AdminDropdown from "./AdminDropdown";

export default function Navbar() {
  const navigate = useNavigate();

  const [openUserMenu, setOpenUserMenu] = useState(false);

  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, [token]);

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const onDocClick = (e) => {
      // zárjuk a user menüt, ha máshová kattintanak
      if (!e.target.closest?.(".userMenuWrap")) setOpenUserMenu(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpenUserMenu(false);
    navigate("/login");
  }

  return (
    <div className="topbar">
      <div className="topbarInner">
        {/* Brand */}
        <Link to={isLoggedIn ? "/schedule" : "/login"} className="brand">
          <span className="brandDot" />
          <span className="brandText">KOVACS FANTASY</span>
        </Link>

        {/* Main nav */}
        {isLoggedIn && (
          <nav className="nav">
            <NavLink to="/schedule" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Schedule
            </NavLink>

            <NavLink to="/standings" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Standings
            </NavLink>

            <NavLink to="/stats" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Stats
            </NavLink>

            <NavLink to="/fantasy" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Fantasy
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
              Profile
            </NavLink>
          </nav>
        )}

        <div className="topbarRight">
          {/* Admin dropdown only for admins */}
          {isLoggedIn && isAdmin && <AdminDropdown />}

          {/* Right side */}
          {isLoggedIn ? (
            <div className="userMenuWrap" style={{ position: "relative" }}>
              {/* clickable badge */}
              <button
                type="button"
                className="userBadge"
                onClick={() => setOpenUserMenu((v) => !v)}
                style={{ cursor: "pointer" }}
                aria-label="User menu"
              >
                <span className={`userDot ${isAdmin ? "admin" : ""}`} />
                <span className="userText">
                  {user?.username || "User"}
                  <span className="muted" style={{ margin: "0 6px" }}>
                    ·
                  </span>
                  <span className="role">{user?.role || "USER"}</span>
                </span>
                <span style={{ opacity: 0.7, marginLeft: 6 }}>▾</span>
              </button>

              {/* dropdown */}
              {openUserMenu && (
                <div className="userMenu">
                  <button className="userMenuItem" onClick={() => { setOpenUserMenu(false); navigate("/profile"); }}>
                    Profile
                  </button>
                  <button className="userMenuItem" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="btn ghost" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}