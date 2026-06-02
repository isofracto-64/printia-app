import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { API_URL } from "../api/config";
import PrintiaAssistant from "./PrintiaAssistant";
import { getUserProfile } from "../pages/api/user";

export default function Layout({ children }: any) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

  useEffect(() => {
    const role = (user.role || "").toLowerCase();
    if (!localStorage.getItem("token") || role === "kiosk") return;
    getUserProfile()
      .then((res) => {
        const nextUser = { ...user, ...res.result, profile_image: res.result.profile };
        localStorage.setItem("user", JSON.stringify(nextUser));
        setUser(nextUser);
      })
      .catch(() => undefined);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className="d-flex"
      style={{ backgroundColor: "var(--body-bg)", minHeight: "100vh" }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: "236px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <nav
          className="navbar navbar-dark px-4 py-3"
          style={{
            background: "rgba(21, 16, 13, 0.92)",
            borderBottom: "1px solid rgba(247, 234, 216, 0.14)",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <span
            className="navbar-brand fw-bold fs-4"
            style={{ color: "var(--pure-white)", letterSpacing: 0 }}
          >
            <span style={{ color: "var(--accent)" }}>P</span>rintia
          </span>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block me-2">
              <span
                className="d-block small fw-bold"
                style={{ color: "var(--pure-white)", fontSize: "0.85rem" }}
              >
                {user.name || "Usuario"}
              </span>
              <span
                className="d-block text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                {user.username ? `@${user.username}` : "Miembro"}
              </span>
            </div>

            <div className="position-relative">
              <img
                src={user.profile || user.profile_image || `${API_URL}/media/profile.png`}
                alt="profile"
                onClick={() => navigate("/profile")}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  objectFit: "cover",
                  border: "2px solid rgba(247, 234, 216, 0.16)",
                  transition: "border-color 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(247, 234, 216, 0.16)")
                }
              />
            </div>

            <button
              className="btn btn-sm px-3"
              onClick={handleLogout}
              style={{
                backgroundColor: "transparent",
                color: "var(--danger)",
                border: "1px solid var(--danger)",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--danger)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--danger)";
              }}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Salir
            </button>
          </div>
        </nav>

        <div
          className="p-4"
          style={{
            backgroundColor: "transparent",
            flexGrow: 1,
          }}
        >
          {children}
        </div>
      </div>
      <PrintiaAssistant />
    </div>
  );
}
