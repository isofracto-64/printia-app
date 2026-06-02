import { Link } from "react-router-dom";
import Layout from "../../components/Layout";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <Layout>
      <div className="container py-4">
        <div className="printia-card p-4 p-lg-5 mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="section-kicker">Dashboard</div>
              <h1 className="display-5 section-title">
                Hola {user.username || "usuario"}, prepara tus documentos para el kiosco.
              </h1>
              <p className="text-muted-custom fs-5 mb-4">
                Printia te permite subir archivos, generar QR temporales, revisar
                historial, consultar ubicación y abrir tickets de soporte.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/dashboard/upload" className="btn printia-button">
                  Subir archivos
                </Link>
                <Link to="/dashboard/history" className="btn printia-button secondary">
                  Ver historial
                </Link>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <img src="/printia-logo.svg" alt="Printia" style={{ width: "min(260px, 70%)" }} />
            </div>
          </div>
        </div>

        <div className="row g-4">
          {[
            ["QR activos", "Caducan 48 horas después de generarse.", "/dashboard/history"],
            ["Kiosco", "Escanea QR o imprime desde archivos locales.", "/location"],
            ["Créditos", "Módulo demostrativo listo para integración bancaria.", "/credits"],
          ].map(([title, text, path]) => (
            <div className="col-md-4" key={title}>
              <Link to={path} className="interactive-card p-4 h-100 d-block text-decoration-none">
                <h2 className="h5 text-white">{title}</h2>
                <p className="text-muted-custom mb-0">{text}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
