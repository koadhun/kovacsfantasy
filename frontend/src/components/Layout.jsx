import Navbar from "./Navbar";
import useInactivityLogout from "../hooks/useInactivityLogout";

export default function Layout({ children }) {
  useInactivityLogout();

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">{children}</div>
      </div>
    </>
  );
}