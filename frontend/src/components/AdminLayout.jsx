import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AdminDropdown from "./AdminDropdown";

export default function AdminLayout() {
  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "24px",
          gap: "24px",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: "250px",
          }}
        >
          <AdminDropdown />
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}