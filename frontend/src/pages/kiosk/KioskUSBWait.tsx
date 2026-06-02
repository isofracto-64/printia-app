import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../api/config";

export default function KioskUSBWait() {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/users/kiosk/usb/status`);
        const data = await res.json();
        if (data.connected) {
          localStorage.setItem("usb_files", JSON.stringify(data.files));
          navigate("/kiosk/usb/files");
        }
      } catch {
        // El selector manual sigue funcionando si el backend USB no está activo.
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleManualFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const selected = Array.from(event.target.files).map((file) => ({
      name: file.name,
      path: URL.createObjectURL(file),
      browserFile: true,
      type: file.type,
    }));
    localStorage.setItem("usb_files", JSON.stringify(selected));
    navigate("/kiosk/usb/files");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div className="printia-card p-5 text-center" style={{ width: "min(720px, 100%)" }}>
        <img src="/printia-logo.svg" alt="Printia" style={{ width: 90 }} />
        <h1 className="section-title mt-3">Selecciona archivos imprimibles</h1>
        <p className="text-muted-custom">
          En Raspberry Pi se detectará la USB automáticamente. En navegador puedes abrir el explorador y seleccionar PDF, PNG o JPG.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
          <button className="btn printia-button secondary btn-lg" onClick={() => navigate("/kiosk")}>
            Volver
          </button>
          <label className="btn printia-button btn-lg">
            Abrir explorador
            <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" hidden onChange={handleManualFiles} />
          </label>
        </div>
      </div>
    </div>
  );
}
