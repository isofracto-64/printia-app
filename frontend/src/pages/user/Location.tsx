import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getKioskConfig, saveKioskConfig } from "../../api/admin";
import Toast from "../../components/Toast";
import KioskMap from "../../components/KioskMap";

export default function Location() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = (user.role || "").toLowerCase() === "admin";
  const [status, setStatus] = useState("Disponible");
  const [address, setAddress] = useState("Universidad Tecnológica de Nuevo Laredo");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });

  useEffect(() => {
    getKioskConfig()
      .then((config) => {
        setStatus(config.status);
        setAddress(config.address);
      })
      .catch(() => undefined);
  }, []);

  const save = async () => {
    try {
      await saveKioskConfig({ status, address });
      const nextConfig = await getKioskConfig();
      setStatus(nextConfig.status || status);
      setAddress(nextConfig.address || address);
      setToast({ show: true, message: "Ubicación y estado actualizados.", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "No se pudo guardar la ubicación", type: "error" });
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <div className="section-kicker">Ubicación</div>
            <h1 className="section-title">Máquina Printia</h1>
            <p className="text-muted-custom">
              Consulta el estado y la ubicación del kiosco disponible.
            </p>
          </div>
          <span className="badge px-3 py-2" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            {status}
          </span>
        </div>

        {isAdmin && (
          <div className="printia-card p-4 mb-4">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label text-muted-custom">Dirección o referencia</label>
                <input className="form-control printia-input" value={address} onChange={(event) => setAddress(event.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted-custom">Estado</label>
                <select className="form-select printia-input" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option>Disponible</option>
                  <option>En mantenimiento</option>
                  <option>Fuera de servicio</option>
                </select>
              </div>
              <div className="col-12">
                <button className="btn printia-button" onClick={save}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="printia-card p-3">
          <KioskMap address={address} status={`Estado actual: ${status}`} height={480} />
        </div>
      </div>
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </Layout>
  );
}
