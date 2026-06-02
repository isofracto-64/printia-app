import { useNavigate } from "react-router-dom";
import PrintiaAssistant from "../../components/PrintiaAssistant";

export default function KioskHome() {
  const navigate = useNavigate();
  const kioskInfo = JSON.parse(localStorage.getItem("kiosk_info") || "{}");

  const options = [
    { title: "Imprimir", text: "USB, explorador local o archivos imprimibles.", path: "/kiosk/usb", icon: "bi-printer" },
    { title: "Trámites y pagos", text: "CURP, acta, CFE y agua con regreso a impresión.", path: "/kiosk/procedures", icon: "bi-file-earmark-text" },
    { title: "Créditos", text: "Próximamente en Printia.", path: "/kiosk/credits", icon: "bi-wallet2" },
    { title: "Escanear QR", text: "Busca archivos generados por usuarios.", path: "/kiosk/scan", icon: "bi-qr-code-scan" },
  ];

  return (
    <div className="min-vh-100 p-4" style={{ background: "var(--body-bg)" }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div className="d-flex align-items-center gap-3">
          <img src="/printia-logo.svg" alt="Printia" style={{ width: 70 }} />
          <div>
            <h1 className="section-title mb-0">Printia Kiosk</h1>
            <span className="text-muted-custom">ID: {kioskInfo.kiosk_id || "KIOSK-PR-01"}</span>
          </div>
        </div>
        <button className="btn printia-button secondary" onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}>
          Cambiar sesión
        </button>
      </div>

      <section className="printia-card p-4 p-lg-5 mb-4">
        <div className="section-kicker">Modo impresión</div>
        <h2 className="display-5 section-title">Selecciona el servicio que necesitas.</h2>
        <p className="text-muted-custom fs-5 mb-0">
          Esta pantalla está pensada para Raspberry Pi 4 con Raspberry Pi OS,
          tragamonedas por GPIO y una impresora Canon configurada por CUPS.
        </p>
      </section>

      <div className="row g-4">
        {options.map((option) => (
          <div className="col-md-6 col-xl-3" key={option.title}>
            <button className="interactive-card p-4 h-100 w-100 text-start" onClick={() => navigate(option.path)}>
              <i className={`bi ${option.icon} display-4 d-block mb-4`} style={{ color: "var(--accent)" }} />
              <h3 className="h4 text-white">{option.title}</h3>
              <p className="text-muted-custom mb-0">{option.text}</p>
            </button>
          </div>
        ))}
      </div>
      <PrintiaAssistant />
    </div>
  );
}
