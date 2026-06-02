import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const data = await loginRequest({ username, password });

      localStorage.setItem("token", data.result.access_token);
      localStorage.setItem("user", JSON.stringify(data.result.user));

      const role = data.result.user.role?.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "kiosk") navigate("/kiosk");
      else navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="printia-card p-4" style={{ width: "min(430px, 100%)" }}>
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4">
          <img src="/printia-logo.svg" alt="Printia" style={{ width: 48, height: 48 }} />
          <strong className="fs-3 text-white">Printia</strong>
        </Link>

        <h1 className="h3 section-title mb-2">Iniciar sesión</h1>
        <p className="text-muted-custom mb-4">
          Entra con tu usuario para administrar documentos, QR o kiosco.
        </p>

        <form onSubmit={handleLogin}>
          <label className="form-label text-muted-custom">Usuario</label>
          <input
            type="text"
            className="form-control printia-input mb-3"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label text-muted-custom">Contraseña</label>
            <Link to="/forgot-password" className="small text-muted-custom">
              ¿La olvidaste?
            </Link>
          </div>
          <div className="position-relative mb-3">
            <input
              type={showPass ? "text" : "password"}
              className="form-control printia-input pe-5"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-sm position-absolute top-50 translate-middle-y text-muted-custom"
              style={{ right: 6 }}
              onClick={() => setShowPass((value) => !value)}
              aria-label="Mostrar u ocultar contraseña"
            >
              {showPass ? "Ocultar" : "Ver"}
            </button>
          </div>

          {error && <div className="alert alert-warning py-2">{error}</div>}

          <button type="submit" className="btn printia-button w-100">
            Ingresar
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted-custom">¿No tienes cuenta? </span>
          <Link to="/register" className="text-white fw-bold">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
