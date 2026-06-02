import { Link } from "react-router-dom";
import PrintiaAssistant from "../components/PrintiaAssistant";

const features = [
  {
    title: "Sube archivos",
    text: "Carga PDF, PNG o JPG desde tu cuenta y genera un QR activo durante 48 horas.",
  },
  {
    title: "Imprime en kiosco",
    text: "Escanea tu QR o selecciona archivos locales, revisa vista previa y configura copias.",
  },
  {
    title: "Trámites guiados",
    text: "Accede a CURP, acta de nacimiento, CFE y agua desde accesos oficiales.",
  },
  {
    title: "Administración",
    text: "Administra usuarios, estado del kiosco, ubicación, soporte y operación.",
  },
];

export default function Landing() {
  return (
    <div className="printia-shell">
      <nav className="container py-4 d-flex justify-content-between align-items-center">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <img src="/printia-logo.svg" alt="Printia" style={{ width: 46, height: 46 }} />
          <strong className="fs-4 text-white">Printia</strong>
        </Link>
        <div className="d-flex gap-2">
          <Link className="btn printia-button secondary" to="/login">
            Iniciar sesión
          </Link>
          <Link className="btn printia-button" to="/register">
            Registrarse
          </Link>
        </div>
      </nav>

      <header className="container py-5" style={{ minHeight: "76vh" }}>
        <div className="row align-items-end g-5 h-100">
          <div className="col-lg-7">
            <div className="section-kicker mb-3">Impresión automatizada para campus y servicios</div>
            <h1 className="display-1 section-title mb-4">
              Documentos listos, QR seguro y kioscos de impresión.
            </h1>
            <p className="fs-5 text-muted-custom mb-4" style={{ maxWidth: 720 }}>
              Printia conecta usuarios, administradores y máquinas de impresión
              en una sola plataforma. Sube tus archivos, genera un QR y usa el
              kiosco para imprimir, consultar trámites o pagar servicios.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/register" className="btn printia-button btn-lg">
                Crear cuenta
              </Link>
              <Link to="/login" className="btn printia-button secondary btn-lg">
                Entrar
              </Link>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="printia-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="section-kicker">Flujo Printia</span>
                <span className="badge rounded-pill text-bg-dark border border-secondary">48 h</span>
              </div>
              {["Subir archivo", "Generar QR", "Escanear en kiosco", "Confirmar pago", "Imprimir"].map(
                (step, index) => (
                  <div key={step} className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <strong className="text-white d-block">{step}</strong>
                      <span className="small text-muted-custom">Proceso preparado para kiosco Raspberry Pi.</span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="motion-strip">
        <div className="motion-strip-track">
          {Array.from({ length: 2 }).flatMap((_, groupIndex) =>
            ["QR", "Kiosco", "Créditos", "Trámites", "Soporte", "Admin", "Ollama", "Retell"].map((item) => (
              <span key={`${item}-${groupIndex}`}>{item}</span>
            )),
          )}
        </div>
      </div>

      <main className="container py-5">
        <section className="row g-4 mb-5">
          {features.map((feature) => (
            <div className="col-md-6 col-xl-3" key={feature.title}>
              <div className="interactive-card h-100 p-4">
                <h3 className="h5 text-white">{feature.title}</h3>
                <p className="text-muted-custom mb-0">{feature.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="printia-card p-4 p-lg-5 mb-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <div className="section-kicker mb-2">Roles de operación</div>
              <h2 className="section-title mb-3">Usuario, admin y kiosco separados por permisos.</h2>
              <p className="text-muted-custom mb-0">
                El usuario gestiona archivos, QRs, créditos simulados, ubicación
                y soporte. El admin agrega control de clientes, estado del kiosco
                y ubicación. El kiosco opera impresión, trámites, escaneo QR y
                confirmación de pago.
              </p>
            </div>
            <div className="col-lg-4 d-flex gap-2 flex-wrap justify-content-lg-end">
              <span className="badge px-3 py-2" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                user
              </span>
              <span className="badge px-3 py-2" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                admin
              </span>
              <span className="badge px-3 py-2" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                kiosk
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="container py-4 text-muted-custom">
        Printia · Universidad Tecnológica de Nuevo Laredo · IMBIS
      </footer>
      <PrintiaAssistant />
    </div>
  );
}
