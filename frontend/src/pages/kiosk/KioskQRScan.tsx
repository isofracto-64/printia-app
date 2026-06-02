import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../api/config";

export default function KioskQRScan() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const scan = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const cleanToken = token.trim().split("/").pop() || token.trim();

    try {
      const response = await fetch(`${API_URL}/users/qr/${cleanToken}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "QR no encontrado");
      localStorage.setItem(
        "selected_files",
        JSON.stringify(
          (data.files || []).map((file: any) => ({
            name: file.name,
            path: file.path || "",
            type: file.type,
            pages: file.pages,
            qrFile: true,
          })),
        ),
      );
      localStorage.setItem(
        "selected_qr_job",
        JSON.stringify({
          file_group_id: data.file_group_id,
          qr_token: data.qr_token || cleanToken,
          owner: data.owner,
        }),
      );
      navigate("/kiosk/usb/preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar QR");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <form className="printia-card p-5" style={{ width: "min(620px, 100%)" }} onSubmit={scan}>
        <div className="section-kicker">Escaneo QR</div>
        <h1 className="section-title">Buscar archivos del usuario</h1>
        <p className="text-muted-custom">
          Escanea con lector físico o pega el código/URL generado por el usuario.
        </p>
        <input
          className="form-control printia-input mb-3"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Token o URL del QR"
          autoFocus
          required
        />
        {error && <div className="alert alert-warning">{error}</div>}
        <div className="d-flex gap-2">
          <button className="btn printia-button" type="submit">
            Buscar
          </button>
          <button className="btn printia-button secondary" type="button" onClick={() => navigate("/kiosk")}>
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
