import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { API_URL } from "../api/config";

const universityMap: Record<string, string> = {
  "Universidad Tecnológica de Nuevo Laredo": "UT",
  "Instituto Tecnológico de Nuevo Laredo": "TECNM",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirm_password: "",
    country_code: "+52",
    phone_number: "",
    birth: "",
    sex: "MALE",
    is_student: false,
    university_id: "Universidad Tecnológica de Nuevo Laredo",
    matricula: "",
  });
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return year && month && day ? `${day}-${month}-${year}` : date;
  };

  const fail = (message: string) => {
    setError(message);
    setShowToast(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const requiredFields = [
      ["Usuario", form.username],
      ["Email", form.email],
      ["Nombre completo", form.name],
      ["Contraseña", form.password],
      ["Confirmar contraseña", form.confirm_password],
      ["Teléfono", form.phone_number],
      ["Nacimiento", form.birth],
    ];

    const missing = requiredFields.find(([, value]) => !String(value || "").trim());
    if (missing) {
      fail(`Completa el campo ${missing[0]}.`);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      fail("Ingresa un correo válido.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone_number.replace(/\D/g, ""))) {
      fail("Ingresa un teléfono de 10 dígitos.");
      return;
    }

    if (form.password !== form.confirm_password) {
      fail("Las contraseñas no coinciden.");
      return;
    }

    if (form.password.length < 6) {
      fail("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.is_student && !form.matricula.trim()) {
      fail("La matrícula es obligatoria para estudiantes.");
      return;
    }

    const { confirm_password, country_code, phone_number, university_id, ...rest } = form;
    const payload = {
      ...rest,
      phone_number: `${country_code.replace("+", "")}${phone_number}`,
      university_id: universityMap[university_id] || "UT",
      birth: formatDate(form.birth),
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Error en el registro");
      navigate("/verify");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center py-5 px-3">
      <div className="printia-card p-4" style={{ width: "min(720px, 100%)" }}>
        <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4">
          <img src="/printia-logo.svg" alt="Printia" style={{ width: 44 }} />
          <strong className="fs-3 text-white">Printia</strong>
        </Link>

        <h1 className="h3 section-title">Crear cuenta</h1>
        <p className="text-muted-custom mb-4">
          Verificaremos tu correo antes de permitir el acceso a la plataforma.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted-custom">Usuario</label>
              <input name="username" className="form-control printia-input" onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted-custom">Email</label>
              <input name="email" type="email" className="form-control printia-input" onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label text-muted-custom">Nombre completo</label>
              <input name="name" className="form-control printia-input" onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted-custom">Contraseña</label>
              <input name="password" type="password" className="form-control printia-input" onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted-custom">Confirmar</label>
              <input name="confirm_password" type="password" className="form-control printia-input" onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted-custom">Lada</label>
              <select name="country_code" className="form-select printia-input" value={form.country_code} onChange={handleChange}>
                <option value="+52">MX +52</option>
                <option value="+1">US +1</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label text-muted-custom">Teléfono</label>
              <input name="phone_number" className="form-control printia-input" onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted-custom">Nacimiento</label>
              <input name="birth" type="date" className="form-control printia-input" onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted-custom">Género</label>
              <select name="sex" className="form-select printia-input" onChange={handleChange}>
                <option value="MALE">Hombre</option>
                <option value="FEMALE">Mujer</option>
              </select>
            </div>
          </div>

          <label className="interactive-card p-3 d-flex gap-3 align-items-center mt-3">
            <input type="checkbox" name="is_student" checked={form.is_student} onChange={handleChange} />
            <span>
              <strong className="text-white d-block">Soy estudiante</strong>
              <span className="small text-muted-custom">Activa universidad y matrícula para validar beneficios.</span>
            </span>
          </label>

          {form.is_student && (
            <div className="row g-3 mt-1">
              <div className="col-md-7">
                <label className="form-label text-muted-custom">Universidad</label>
                <select name="university_id" className="form-select printia-input" value={form.university_id} onChange={handleChange}>
                  <option value="Universidad Tecnológica de Nuevo Laredo">UTNL</option>
                  <option value="Instituto Tecnológico de Nuevo Laredo">ITNL</option>
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label text-muted-custom">Matrícula</label>
                <input name="matricula" className="form-control printia-input" onChange={handleChange} />
              </div>
            </div>
          )}

          <button type="submit" className="btn printia-button w-100 mt-4" disabled={submitting}>
            {submitting ? "Validando..." : "Registrarse"}
          </button>
        </form>

        <Link to="/login" className="d-block text-center text-muted-custom mt-3">
          Ya tengo cuenta
        </Link>
      </div>
      <Toast message={error} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}
