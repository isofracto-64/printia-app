import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../api/config";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = localStorage.getItem("printia_reset_email") || "";

    if (newPassword !== confirmPassword) {
      setStatus("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "No se pudo actualizar.");
      localStorage.removeItem("printia_reset_email");
      navigate("/login");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error inesperado.");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="printia-card p-4" style={{ width: "min(440px, 100%)" }}>
        <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4">
          <img src="/printia-logo.svg" alt="Printia" style={{ width: 42 }} />
          <strong className="text-white fs-4">Printia</strong>
        </Link>

        <h1 className="h3 section-title">Nueva contraseña</h1>
        <p className="text-muted-custom">
          Define una contraseña nueva para el correo registrado.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="form-label text-muted-custom">Contraseña nueva</label>
          <input
            type="password"
            className="form-control printia-input mb-3"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={6}
            required
          />
          <label className="form-label text-muted-custom">Confirmar contraseña</label>
          <input
            type="password"
            className="form-control printia-input mb-3"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
          />
          {status && <p className="small text-warning">{status}</p>}
          <button className="btn printia-button w-100" type="submit">
            Actualizar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
