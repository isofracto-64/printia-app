import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "user").toLowerCase();

  const menuItems = [
    { path: "/dashboard/home", label: "Inicio", icon: "bi-house-door", roles: ["user", "admin"] },
    { path: "/dashboard/upload", label: "Subir archivos", icon: "bi-cloud-arrow-up", roles: ["user", "admin"] },
    { path: "/dashboard/history", label: "Historial QR", icon: "bi-qr-code", roles: ["user", "admin"] },
    { path: "/credits", label: "Créditos", icon: "bi-credit-card", roles: ["user", "admin"] },
    { path: "/location", label: "Ubicación", icon: "bi-geo-alt", roles: ["user", "admin"] },
    { path: "/support", label: "Soporte", icon: "bi-headset", roles: ["user", "admin"] },
    { path: "/admin", label: "Admin", icon: "bi-sliders", roles: ["admin"] },
    { path: "/admin/users", label: "Clientes y alumnos", icon: "bi-people", roles: ["admin"] },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      style={{
        width: "236px",
        height: "100vh",
        background: "rgba(21, 16, 13, 0.96)",
        padding: "22px 14px",
        position: "fixed",
        left: 0,
        top: 0,
        borderRight: "1px solid rgba(247, 234, 216, 0.14)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1100,
      }}
    >
      <Link to="/dashboard/home" className="d-flex align-items-center gap-2 px-2 mb-4 text-decoration-none">
        <img src="/printia-logo.svg" alt="Printia" style={{ width: 44, height: 44 }} />
        <strong className="fs-4 text-white">Printia</strong>
      </Link>

      <small className="section-kicker px-2 mb-2">Menú</small>
      <div className="d-flex flex-column gap-2 flex-grow-1">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="sidebar-link"
              style={{
                textDecoration: "none",
                color: isActive(item.path) ? "var(--pure-white)" : "var(--muted-gray)",
                backgroundColor: isActive(item.path) ? "var(--accent-soft)" : "transparent",
                padding: "12px 14px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `1px solid ${isActive(item.path) ? "rgba(215, 155, 98, 0.55)" : "transparent"}`,
              }}
            >
              <i className={`bi ${item.icon}`} style={{ color: isActive(item.path) ? "var(--accent)" : "inherit" }} />
              <span className="fw-semibold">{item.label}</span>
            </Link>
          ))}
      </div>

      <div className="interactive-card p-3">
        <span className="small text-muted-custom d-block">Rol activo</span>
        <strong className="text-white text-uppercase">{role}</strong>
      </div>

      <style>{`
        .sidebar-link:hover {
          background-color: rgba(215, 155, 98, 0.12) !important;
          color: var(--pure-white) !important;
        }
      `}</style>
    </aside>
  );
}
