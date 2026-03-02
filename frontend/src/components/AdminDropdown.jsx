import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminDropdown() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".admin-dropdown")) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="admin-dropdown">
      <button
        type="button"
        className="pill"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <span className="dot admin" />
        ADMIN ▾
      </button>

      {open && (
        <div className="admin-menu">
          <NavLink
            to="/admin/schedule-results"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Schedule Results Editor
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/standings"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Standings Admin
          </NavLink>
        </div>
      )}
    </div>
  );
}