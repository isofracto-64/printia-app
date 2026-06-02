import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { deleteAdminUser, listAdminUsers, updateAdminUser } from "../api/admin";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  balance: number;
  matricula?: string;
  password?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });

  const filteredUsers = useMemo(() => users, [users]);

  const loadUsers = async (q = query) => {
    try {
      setError("");
      setUsers(await listAdminUsers(q));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => loadUsers(query), 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const save = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      await updateAdminUser(selected.id, {
        username: selected.username,
        email: selected.email,
        name: selected.name,
        role: selected.role,
        balance: Number(selected.balance || 0),
        password: selected.password?.trim() || undefined,
        matricula: selected.matricula || "",
      });
      await loadUsers();
      setToast({ show: true, message: "Usuario actualizado.", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "No se pudo guardar", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await deleteAdminUser(selected.username);
      setSelected(null);
      setConfirmingDelete(false);
      await loadUsers();
      setToast({ show: true, message: "Usuario eliminado.", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "No se pudo eliminar", type: "error" });
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="section-kicker">Administración</div>
        <h1 className="section-title">Clientes y alumnos</h1>
        <p className="text-muted-custom">
          Consulta usuarios reales, filtra por nombre, correo o nickname y modifica datos permitidos.
        </p>

        <div className="row g-4">
          <div className="col-xl-7">
            <div className="printia-card p-4">
              <input
                className="form-control printia-input mb-3"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nickname, correo o nombre"
              />
              {error && <div className="alert alert-warning py-2">{error}</div>}
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nickname</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Créditos</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.username}</strong>
                          {user.matricula && <span className="d-block small text-muted-custom">{user.matricula}</span>}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>${Number(user.balance || 0).toFixed(2)}</td>
                        <td>
                          <button className="btn btn-sm printia-button secondary" onClick={() => setSelected(user)}>
                            Modificar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted-custom py-4">
                          Sin resultados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-xl-5">
            <div className="printia-card p-4 position-sticky" style={{ top: 92 }}>
              <h2 className="h4 text-white">Edición admin</h2>
              {!selected ? (
                <p className="text-muted-custom mb-0">Selecciona un usuario para modificar nickname, rol o créditos.</p>
              ) : (
                <>
                  <label className="form-label text-muted-custom mt-3">Nombre</label>
                  <input className="form-control printia-input" value={selected.name || ""} onChange={(e) => setSelected({ ...selected, name: e.target.value })} />
                  <label className="form-label text-muted-custom mt-3">Nickname</label>
                  <input className="form-control printia-input" value={selected.username} onChange={(e) => setSelected({ ...selected, username: e.target.value })} />
                  <label className="form-label text-muted-custom mt-3">Correo</label>
                  <input className="form-control printia-input" value={selected.email} onChange={(e) => setSelected({ ...selected, email: e.target.value })} />
                  <label className="form-label text-muted-custom mt-3">Rol</label>
                  <select className="form-select printia-input" value={selected.role} onChange={(e) => setSelected({ ...selected, role: e.target.value })}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="kiosk">kiosk</option>
                  </select>
                  <label className="form-label text-muted-custom mt-3">Créditos</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-control printia-input"
                    value={selected.balance}
                    onChange={(e) => setSelected({ ...selected, balance: Number(e.target.value) })}
                  />
                  <label className="form-label text-muted-custom mt-3">Matrícula</label>
                  <input className="form-control printia-input" value={selected.matricula || ""} onChange={(e) => setSelected({ ...selected, matricula: e.target.value })} />
                  <label className="form-label text-muted-custom mt-3">Nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control printia-input"
                    value={selected.password || ""}
                    onChange={(e) => setSelected({ ...selected, password: e.target.value })}
                    placeholder="Dejar vacío para no cambiar"
                  />
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn printia-button" onClick={save} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => setConfirmingDelete(true)}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {confirmingDelete && selected && (
        <div className="printia-modal-backdrop">
          <div className="printia-modal">
            <div className="section-kicker">Confirmar eliminación</div>
            <h2 className="h4 text-white mt-2">Eliminar a {selected.username}</h2>
            <p className="text-muted-custom">
              Se eliminará su perfil, roles, créditos, matrícula, archivos, QR e historial relacionado.
            </p>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn printia-button secondary" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </button>
              <button className="btn btn-outline-danger" onClick={remove}>
                Eliminar usuario
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </Layout>
  );
}
