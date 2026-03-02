import { useEffect, useState } from "react";
import { api } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr("");
    setMsg("");
    const res = await api.get("/admin/users");
    setUsers(res.data.users);
  }

  useEffect(() => {
    load().catch((e) => {
      setErr(e?.response?.data?.error || "Nem sikerült betölteni a felhasználókat. (Admin kell)");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setRole(userId, role) {
    setErr("");
    setMsg("");
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setMsg("Szerepkör frissítve.");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Nem sikerült módosítani a role-t.");
    }
  }

  async function removeUser(userId, username) {
    setErr("");
    setMsg("");
    const ok = window.confirm(`Biztosan törlöd a felhasználót? (${username})`);
    if (!ok) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setMsg("Felhasználó törölve.");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Nem sikerült törölni a felhasználót.");
    }
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Users</h1>
          <p>Felhasználók kezelése (role váltás, törlés).</p>
        </div>
        <div className="admin-badges">
          <span className="pill">
            <span className="dot admin" />
            ADMIN
          </span>
        </div>
      </div>

      <div className="card">
        {err && <p className="error">{err}</p>}
        {msg && <p className="success">{msg}</p>}

        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className="pill">
                    <span className={`dot ${u.role === "ADMIN" ? "admin" : ""}`} />
                    {u.role}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    {u.role !== "ADMIN" ? (
                      <button className="btn primary" onClick={() => setRole(u.id, "ADMIN")}>
                        Make ADMIN
                      </button>
                    ) : (
                      <button className="btn" onClick={() => setRole(u.id, "USER")}>
                        Make USER
                      </button>
                    )}
                    <button className="btn danger" onClick={() => removeUser(u.id, u.username)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="muted">
                  Nincs megjeleníthető user.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="muted" style={{ marginTop: 12 }}>
          Tipp: saját magad törlése/role módosítása backendben tiltva van.
        </p>
      </div>
    </div>
  );
}