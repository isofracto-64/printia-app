import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import KioskMap from "../components/KioskMap";
import { getKioskConfig, listAdminUsers, listTickets, saveKioskConfig, updateTicket } from "../api/admin";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user: { username: string; email: string; name: string };
};

type KioskConfig = {
  status: string;
  address: string;
  latitude: number;
  longitude: number;
  esp32_cam_url?: string;
};

export default function Admin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [config, setConfig] = useState<KioskConfig>({
    status: "Disponible",
    address: "Universidad Tecnológica de Nuevo Laredo",
    latitude: 27.4864,
    longitude: -99.5104,
    esp32_cam_url: "",
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });

  const load = async () => {
    const [ticketsData, usersData, configData] = await Promise.all([
      listTickets(),
      listAdminUsers(),
      getKioskConfig(),
    ]);
    setTickets(ticketsData);
    setUserCount(usersData.length);
    setConfig(configData);
  };

  useEffect(() => {
    load().catch((err) => setToast({ show: true, message: err instanceof Error ? err.message : "Error al cargar admin", type: "error" }));
  }, []);

  const saveKiosk = async () => {
    try {
      const saved = await saveKioskConfig({ status: config.status, address: config.address, esp32_cam_url: config.esp32_cam_url });
      setConfig((current) => ({ ...current, ...saved }));
      setToast({ show: true, message: "Configuración del kiosco guardada.", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "No se pudo guardar el kiosco", type: "error" });
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="section-kicker">Administración</div>
        <h1 className="section-title">Control de operación Printia</h1>
        <p className="text-muted-custom">
          Panel operativo para tickets, kiosco, ubicación manual y monitoreo ESP32 CAM.
        </p>

        <div className="row g-4 mb-4">
          {[
            ["Usuarios registrados", userCount],
            ["Tickets abiertos", tickets.filter((ticket) => ticket.status !== "cerrado").length],
            ["Kioscos activos", 1],
            ["Estado", config.status],
          ].map(([label, value]) => (
            <div className="col-md-6 col-xl-3" key={label}>
              <div className="interactive-card p-4 h-100">
                <span className="text-muted-custom">{label}</span>
                <strong className="display-6 text-white d-block">{value}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-xl-5">
            <div className="printia-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center gap-3">
                <h2 className="h4 text-white mb-0">Kiosco</h2>
                <Link to="/admin/users" className="btn printia-button secondary">
                  Clientes y alumnos
                </Link>
              </div>
              <label className="form-label text-muted-custom mt-3">Estado</label>
              <select className="form-select printia-input" value={config.status} onChange={(event) => setConfig({ ...config, status: event.target.value })}>
                <option>Disponible</option>
                <option>En mantenimiento</option>
                <option>Fuera de servicio</option>
              </select>
              <label className="form-label text-muted-custom mt-3">Dirección o referencia</label>
              <input className="form-control printia-input" value={config.address} onChange={(event) => setConfig({ ...config, address: event.target.value })} />
              <div className="mt-4">
                <KioskMap address={config.address} status={config.status} height={300} />
              </div>

              <button className="btn printia-button mt-3" onClick={saveKiosk}>
                Guardar ubicación
              </button>
            </div>

            <div className="printia-card p-4">
              <h2 className="h4 text-white">ESP32 CAM</h2>
              <input
                className="form-control printia-input my-3"
                value={config.esp32_cam_url || ""}
                onChange={(event) => setConfig({ ...config, esp32_cam_url: event.target.value })}
                placeholder="http://192.168.1.50:81/stream"
              />
              {config.esp32_cam_url ? (
                <iframe title="ESP32 CAM" src={config.esp32_cam_url} width="100%" height="260" style={{ border: 0, borderRadius: 8, background: "var(--body-bg)" }} />
              ) : (
                <div className="interactive-card p-4 text-muted-custom">Configura la URL del stream para ver video en tiempo real.</div>
              )}
            </div>
          </div>

          <div className="col-xl-7">
            <div className="printia-card p-4">
              <h2 className="h4 text-white">Tickets</h2>
              {tickets.length === 0 ? (
                <p className="text-muted-custom mb-0">No hay tickets registrados.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tickets.map((ticket) => (
                    <div className="interactive-card p-3" key={ticket.id}>
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <strong className="text-white d-block">{ticket.subject}</strong>
                          <span className="text-muted-custom small">
                            Enviado por {ticket.user.name || ticket.user.username} · {ticket.user.email}
                          </span>
                        </div>
                        <select
                          className="form-select printia-input"
                          style={{ width: 150 }}
                          value={ticket.status}
                          onChange={async (event) => {
                            await updateTicket(ticket.id, { status: event.target.value });
                            await load();
                          }}
                        >
                          <option value="abierto">abierto</option>
                          <option value="en_revision">en revisión</option>
                          <option value="cerrado">cerrado</option>
                        </select>
                        {ticket.status !== "cerrado" && (
                          <button
                            className="btn btn-sm printia-button secondary"
                            onClick={async () => {
                              await updateTicket(ticket.id, { status: "cerrado" });
                              await load();
                            }}
                          >
                            Cerrar
                          </button>
                        )}
                      </div>
                      <p className="text-muted-custom mt-3 mb-0">{ticket.message}</p>
                      <a className="btn btn-sm printia-button secondary mt-3" href={`mailto:${ticket.user.email}?subject=Printia ticket: ${encodeURIComponent(ticket.subject)}`}>
                        Responder por correo
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </Layout>
  );
}
