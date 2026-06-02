import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../api/config";
import Toast from "../../components/Toast";

export default function KioskUSBPreview() {
  const navigate = useNavigate();
  const files = JSON.parse(localStorage.getItem("selected_files") || "[]");
  const qrJob = JSON.parse(localStorage.getItem("selected_qr_job") || "null");
  const [active, setActive] = useState<any>(files[0] || null);
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState("color");
  const [paid, setPaid] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });

  const previewSrc = active?.browserFile
    ? active.path
    : `${API_URL}/users/kiosk/usb/preview?path=${encodeURIComponent(active?.path || "")}`;

  const estimatedCost = files.reduce((sum: number, file: any) => sum + (file.pages || 1), 0) * copies * (color === "color" ? 3 : 1.5);

  const handlePrint = async (forcePaid = false) => {
    if (!paid && !forcePaid) {
      setConfirmingPayment(true);
      return;
    }
    setPaid(true);

    try {
      if (qrJob?.file_group_id) {
      const createResponse = await fetch(
        `${API_URL}/print-jobs/?file_group_id=${encodeURIComponent(qrJob.file_group_id)}&copies=${copies}&color=${encodeURIComponent(color)}&qr_token=${encodeURIComponent(qrJob.qr_token || "")}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );
      const created = await createResponse.json();
      if (!createResponse.ok) throw new Error(created.detail || "No se pudo crear el trabajo");

      const executeResponse = await fetch(`${API_URL}/print-jobs/print/${created.job_id}/execute`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const executed = await executeResponse.json();
      if (!executeResponse.ok) throw new Error(executed.detail || "No se pudo registrar impresión");
      } else {
      for (const file of files) {
        if (file.browserFile || !file.path) continue;
        await fetch(`${API_URL}/users/kiosk/usb/print`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: file.path, copies, color }),
        });
      }
      }

      localStorage.removeItem("selected_files");
      localStorage.removeItem("selected_qr_job");
      setToast({ show: true, message: "Trabajo enviado a impresión y registrado en historial.", type: "success" });
      navigate("/kiosk");
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "No se pudo imprimir", type: "error" });
    }
  };

  if (!active) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="printia-card p-4 text-center">
          <h1 className="section-title">No hay archivos seleccionados</h1>
          <button className="btn printia-button" onClick={() => navigate("/kiosk/usb")}>
            Elegir archivos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 p-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="section-title mb-0">Previsualización e impresión</h1>
          <button className="btn printia-button secondary" onClick={() => navigate(qrJob ? "/kiosk/scan" : "/kiosk/usb/files")}>
            Regresar a imprimir
          </button>
        </div>

        <div className="row g-4">
          <div className="col-xl-8">
            <div className="printia-card p-3 mb-3">
              {!active.path ? (
                <div className="p-5 text-center">
                  <h2 className="h4 text-white">{active.name}</h2>
                  <p className="text-muted-custom">
                    Archivo encontrado por QR. El trabajo se registrará con código, archivos y costo al imprimir.
                  </p>
                </div>
              ) : active.name?.toLowerCase().endsWith(".pdf") || active.type === "application/pdf" ? (
                <iframe title={active.name} src={previewSrc} width="100%" height="620" style={{ border: 0, borderRadius: 8 }} />
              ) : (
                <img src={previewSrc} alt={active.name} className="img-fluid rounded d-block mx-auto" style={{ maxHeight: 620 }} />
              )}
            </div>

            <div className="d-flex gap-2 flex-wrap">
              {files.map((file: any) => (
                <button
                  key={file.path}
                  className="btn printia-button secondary"
                  style={{ borderColor: active.path === file.path ? "var(--accent)" : undefined }}
                  onClick={() => setActive(file)}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>

          <div className="col-xl-4">
            <div className="printia-card p-4 position-sticky" style={{ top: 20 }}>
              <div className="section-kicker">Configuración</div>
              <h2 className="h3 text-white">Parámetros básicos</h2>

              <label className="form-label text-muted-custom mt-3">Color</label>
              <select className="form-select printia-input" value={color} onChange={(event) => setColor(event.target.value)}>
                <option value="color">Color</option>
                <option value="bw">Blanco y negro</option>
              </select>

              <label className="form-label text-muted-custom mt-3">Copias</label>
              <input
                type="number"
                min={1}
                max={99}
                className="form-control printia-input"
                value={copies}
                onChange={(event) => setCopies(Number(event.target.value))}
              />

              <div className="interactive-card p-3 mt-4">
                <strong className="text-white d-block">Pago requerido</strong>
                <span className="text-muted-custom small">
                  La integración GPIO del tragamonedas debe marcar el pago antes de iniciar impresión.
                </span>
                <span className="text-white d-block mt-2">Total estimado: ${estimatedCost.toFixed(2)}</span>
                {qrJob?.qr_token && <span className="text-muted-custom small d-block">QR: {qrJob.qr_token}</span>}
                {qrJob?.owner?.email && <span className="text-muted-custom small d-block">Usuario: {qrJob.owner.email}</span>}
                <label className="d-flex align-items-center gap-2 mt-3 text-white">
                  <input type="checkbox" checked={paid} onChange={(event) => setPaid(event.target.checked)} />
                  Pago confirmado
                </label>
              </div>

              <button className="btn printia-button w-100 mt-4" onClick={() => handlePrint()}>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
      {confirmingPayment && (
        <div className="printia-modal-backdrop">
          <div className="printia-modal">
            <div className="section-kicker">Confirmar pago</div>
            <h2 className="h4 text-white mt-2">Pago recibido</h2>
            <p className="text-muted-custom">Confirma que el tragamonedas recibió el pago correcto antes de imprimir.</p>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn printia-button secondary" onClick={() => setConfirmingPayment(false)}>
                Cancelar
              </button>
              <button
                className="btn printia-button"
                onClick={() => {
                  setPaid(true);
                  setConfirmingPayment(false);
                  handlePrint(true);
                }}
              >
                Confirmar e imprimir
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </div>
  );
}
