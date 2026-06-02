import { useNavigate } from "react-router-dom";
import { useState } from "react";

const services = [
  { title: "CURP", url: "https://www.gob.mx/curp/" },
  { title: "Acta de nacimiento", url: "https://www.gob.mx/ActaNacimiento/" },
  { title: "Pagar luz CFE", url: "https://app.cfe.mx/Aplicaciones/CCFE/Recibos/Consulta/login.aspx" },
  { title: "Pagar agua", url: "https://pagaenlinea.comapanuevolaredo.gob.mx/" },
];

export default function KioskProcedures() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");

  const openService = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setNotice("Cuando el sitio oficial descargue el PDF, vuelve aquí para seleccionarlo e imprimirlo.");
    navigate("/kiosk/usb");
  };

  return (
    <div className="min-vh-100 p-4">
      <div className="container">
        <button className="btn printia-button secondary mb-4" onClick={() => navigate("/kiosk")}>
          Volver
        </button>
        <button className="btn printia-button secondary mb-4 ms-2" onClick={() => navigate("/kiosk/usb")}>
          Regresar a imprimir
        </button>
        <div className="printia-card p-5 mb-4">
          <div className="section-kicker">Trámites y pagos</div>
          <h1 className="section-title">Selecciona un servicio oficial</h1>
          <p className="text-muted-custom mb-0">
            Se abrirá la página oficial. Al descargar el documento, Printia te regresará al flujo de impresión.
          </p>
        </div>
        {notice && <div className="interactive-card p-3 mb-4 text-muted-custom">{notice}</div>}
        <div className="row g-4">
          {services.map((service) => (
            <div className="col-md-6" key={service.title}>
              <button className="interactive-card p-4 w-100 text-start" onClick={() => openService(service.url)}>
                <h2 className="h4 text-white">{service.title}</h2>
                <p className="text-muted-custom mb-0">Abrir portal y preparar impresión posterior.</p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
