import { Navigate, useLocation } from "react-router-dom";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = readStoredUser();

  if (!token) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user?.role || "USER";

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/fantasy" replace />;
  }

  return children;
}