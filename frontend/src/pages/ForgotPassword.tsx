import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem("printia_reset_email", email);
    setSent(true);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="printia-card p-4" style={{ width: "min(440px, 100%)" }}>
        <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4">
          <img src="/printia-logo.svg" alt="Printia" style={{ width: 42 }} />
          <strong className="text-white fs-4">Printia</strong>
        </Link>

        <h1 className="h3 section-title">Recuperar contraseña</h1>
        <p className="text-muted-custom">
          Escribe tu Gmail registrado. En producción se enviará un enlace único;
          por ahora se deja listo el flujo local para cambiar contraseña.
        </p>

        {sent ? (
          <div>
            <div className="interactive-card p-3 mb-3">
              <strong className="text-white d-block">Enlace generado</strong>
              <span className="text-muted-custom small">
                Revisa tu correo o continúa con la pantalla de restablecimiento.
              </span>
            </div>
            <Link className="btn printia-button w-100" to="/reset-password?token=demo">
              Cambiar contraseña
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="form-label text-muted-custom">Correo</label>
            <input
              type="email"
              className="form-control printia-input mb-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="btn printia-button w-100" type="submit">
              Enviar enlace
            </button>
          </form>
        )}

        <Link to="/login" className="d-block text-center text-muted-custom mt-3">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
