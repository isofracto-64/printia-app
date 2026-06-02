import { useState } from "react";
import Layout from "../../components/Layout";
import { createSupportTicket } from "../../api/support";
import Toast from "../../components/Toast";

const parseCollaborators = () => {
  try {
    return JSON.parse(import.meta.env.VITE_SUPPORT_COLLABORATORS || "[]") as Array<{ name: string; email: string }>;
  } catch {
    return [];
  }
};

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com";
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });
  const collaborators = parseCollaborators();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createSupportTicket(subject, message);
      setSubject("");
      setMessage("");
      setToast({ show: true, message: "Ticket generado y enviado al panel admin.", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "No se pudo crear el ticket", type: "error" });
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="section-kicker">Soporte</div>
        <h1 className="section-title mb-3">Contactos y tickets</h1>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="printia-card p-4 h-100">
              <h2 className="h4 text-white">Contacto directo</h2>
              <p className="text-muted-custom">
                Correo principal:{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-white fw-bold"
                >
                  {supportEmail}
                </a>
              </p>
              <h3 className="h6 text-white mt-4">Colaboradores</h3>
              <div className="d-flex flex-column gap-2">
                {collaborators.map((person) => (
                  <a
                    key={person.email}
                    className="interactive-card p-3 text-decoration-none"
                    href={`mailto:${person.email}`}
                  >
                    <strong className="text-white d-block">
                      {person.name}
                    </strong>
                    <span className="text-muted-custom small">
                      {person.email}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <form className="printia-card p-4" onSubmit={submit}>
              <h2 className="h4 text-white">Crear ticket</h2>
              <label className="form-label text-muted-custom mt-3">
                Asunto
              </label>
              <input
                className="form-control printia-input"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
              />
              <label className="form-label text-muted-custom mt-3">
                Mensaje
              </label>
              <textarea
                className="form-control printia-input"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
              <button className="btn printia-button mt-3" type="submit">
                Enviar ticket
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </Layout>
  );
}
