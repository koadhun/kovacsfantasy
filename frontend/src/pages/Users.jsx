import { useEffect, useState } from "react";
import { api } from "../api";
import { useLanguage } from "../i18n/LanguageContext";

export default function Users() {
  const { t } = useLanguage();
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
      setErr(e?.response?.data?.error || t("admin.loadUsersError"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setRole(userId, role) {
    setErr("");
    setMsg("");
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setMsg(t("admin.roleUpdated"));
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || t("admin.roleUpdateError"));
    }
  }

  async function removeUser(userId, username) {
    setErr("");
    setMsg("");
    const ok = window.confirm(`${t("admin.confirmDelete")} (${username})`);
    if (!ok) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setMsg(t("admin.userDeleted"));
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || t("admin.userDeleteError"));
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>{t("admin.title")}</h1>
          <p>{t("admin.subtitle")}</p>
        </div>
      </div>

      {err && <p className="error">{err}</p>}
      {msg && <p className="success">{msg}</p>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.colUsername")}</th>
              <th>{t("admin.colEmail")}</th>
              <th>{t("admin.colRole")}</th>
              <th>{t("admin.colActions")}</th>
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
                    {u.role !== "ADMIN" && (
                      <button className="btn primary" onClick={() => setRole(u.id, "ADMIN")}>
                        {t("admin.makeAdmin")}
                      </button>
                    )}

                    {u.role !== "VIP" && (
                      <button
                        className="btn"
                        onClick={() => setRole(u.id, "VIP")}
                        style={{
                          background: "linear-gradient(135deg, #fde68a, #f5b301 60%, #d99400)",
                          color: "#1a1206",
                          fontWeight: 800,
                          border: "none",
                        }}
                      >
                        {t("admin.makeVip")}
                      </button>
                    )}

                    {u.role !== "USER" && (
                      <button className="btn" onClick={() => setRole(u.id, "USER")}>
                        {t("admin.makeUser")}
                      </button>
                    )}

                    <button className="btn danger" onClick={() => removeUser(u.id, u.username)}>
                      {t("admin.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="muted">
                  {t("admin.noUsers")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="muted" style={{ marginTop: 12 }}>
          {t("admin.selfActionHint")}
        </p>
      </div>
    </>
  );
}