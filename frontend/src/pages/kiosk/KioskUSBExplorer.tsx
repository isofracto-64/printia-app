import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function KioskUSBExplorer() {
  const navigate = useNavigate();
  const files = JSON.parse(localStorage.getItem("usb_files") || "[]");
  const [selected, setSelected] = useState<any[]>([]);

  const toggle = (file: any) => {
    setSelected((current) =>
      current.some((item) => item.path === file.path)
        ? current.filter((item) => item.path !== file.path)
        : [...current, file],
    );
  };

  const continuePreview = () => {
    localStorage.setItem("selected_files", JSON.stringify(selected));
    navigate("/kiosk/usb/preview");
  };

  return (
    <div className="min-vh-100 p-4">
      <div className="container">
        <button className="btn printia-button secondary mb-4" onClick={() => navigate("/kiosk")}>
          Volver
        </button>
        <div className="printia-card p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <div className="section-kicker">Archivos detectados</div>
              <h1 className="section-title">Selecciona lo que quieres imprimir</h1>
            </div>
            <button className="btn printia-button" disabled={selected.length === 0} onClick={continuePreview}>
              Continuar ({selected.length})
            </button>
          </div>

          <div className="row g-3">
            {files.map((file: any, index: number) => {
              const active = selected.some((item) => item.path === file.path);
              return (
                <div className="col-md-6 col-xl-4" key={`${file.name}-${index}`}>
                  <button
                    className="interactive-card p-3 w-100 text-start h-100"
                    onClick={() => toggle(file)}
                    style={{ borderColor: active ? "var(--accent)" : undefined }}
                  >
                    <div className="d-flex justify-content-between gap-3">
                      <div>
                        <strong className="text-white d-block">{file.name}</strong>
                        <span className="small text-muted-custom">{file.type || "Archivo imprimible"}</span>
                      </div>
                      <span className="badge" style={{ background: active ? "var(--accent)" : "var(--surface-warm)" }}>
                        {active ? "Listo" : "Elegir"}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
