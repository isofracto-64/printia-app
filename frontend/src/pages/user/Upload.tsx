import { useMemo, useState } from "react";
import Layout from "../../components/Layout";
import { uploadFiles, generateQR } from "../api/files";
import { API_URL } from "../../api/config";
import Toast from "../../components/Toast";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [qr, setQr] = useState<{ image: string; code: string; expires_at?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<File | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });
  const previewUrl = useMemo(() => (preview ? URL.createObjectURL(preview) : ""), [preview]);

  const addFiles = (selected: File[]) => {
    const validFiles = selected.filter((file) => ALLOWED_TYPES.includes(file.type));
    if (validFiles.length !== selected.length) {
      setToast({ show: true, message: "Solo se permiten PDF, PNG y JPG.", type: "error" });
    }
    setFiles((prev) => [...prev, ...validFiles]);
    if (!preview && validFiles[0]) setPreview(validFiles[0]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setToast({ show: true, message: "No hay archivos seleccionados.", type: "error" });
      return;
    }

    try {
      setConfirming(false);
      setLoading(true);
      setQr(null);
      const res = await uploadFiles(files);
      if (!res?.file_group_id) throw new Error("El servidor no devolvió un grupo válido.");
      const qrRes = await generateQR(res.file_group_id);
      if (qrRes?.qr_image) {
        setQr({ image: qrRes.qr_image, code: qrRes.code || qrRes.qr_token, expires_at: qrRes.expires_at });
        setFiles([]);
        setPreview(null);
      }
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "Error al procesar la solicitud", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="section-kicker">Archivos</div>
        <h1 className="section-title">Subir y generar QR</h1>
        <p className="text-muted-custom">Carga documentos imprimibles y revisa una vista previa antes de confirmar.</p>

        <div className="row g-4">
          <div className="col-lg-5">
            <div
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                addFiles(Array.from(event.dataTransfer.files));
              }}
              className="interactive-card p-5 text-center h-100 d-flex flex-column justify-content-center"
              style={{ background: dragging ? "var(--accent-soft)" : undefined, cursor: "pointer" }}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <div className="display-4 mb-3">+</div>
              <h2 className="h4 text-white">Seleccionar archivos</h2>
              <p className="text-muted-custom">PDF, PNG o JPG. Puedes elegir uno o varios.</p>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(event) => event.target.files && addFiles(Array.from(event.target.files))}
                hidden
                id="fileInput"
              />
            </div>
          </div>

          <div className="col-lg-7">
            <div className="printia-card p-4 h-100">
              <h2 className="h4 text-white">Lista de archivos</h2>
              {files.length === 0 ? (
                <p className="text-muted-custom">Aún no hay archivos seleccionados.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="interactive-card p-3 d-flex justify-content-between align-items-center">
                      <button className="btn btn-link text-white text-start p-0 text-decoration-none" onClick={() => setPreview(file)}>
                        {file.name}
                        <span className="d-block small text-muted-custom">{Math.ceil(file.size / 1024)} KB</span>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}>
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {preview && (
                <div className="mt-4">
                  <h3 className="h6 text-white">Vista previa: {preview.name}</h3>
                  {preview.type === "application/pdf" ? (
                    <iframe title={preview.name} src={previewUrl} width="100%" height="360" style={{ border: 0, borderRadius: 8 }} />
                  ) : (
                    <img src={previewUrl} alt={preview.name} className="img-fluid rounded" style={{ maxHeight: 360, objectFit: "contain" }} />
                  )}
                </div>
              )}

              <button className="btn printia-button w-100 mt-4" onClick={() => setConfirming(true)} disabled={loading || files.length === 0}>
                {loading ? "Procesando..." : "Generar QR"}
              </button>
            </div>
          </div>
        </div>

        {qr && (
          <div className="printia-card mt-4 p-4 text-center">
            <h2 className="h4 text-white">QR listo para imprimir</h2>
            <div className="bg-white d-inline-block p-3 rounded">
              <img src={`${API_URL}${qr.image}`} alt="QR Code" style={{ maxWidth: 250 }} />
            </div>
            <div className="interactive-card p-3 mt-3 mx-auto" style={{ maxWidth: 560 }}>
              <span className="text-muted-custom small d-block">Código para kiosko</span>
              <code className="fs-5" style={{ color: "var(--accent)" }}>{qr.code}</code>
            </div>
            <p className="text-muted-custom mt-3 mb-0">
              Muéstralo en el kiosco Printia o captura el código manualmente.
            </p>
          </div>
        )}
      </div>
      {confirming && (
        <div className="printia-modal-backdrop">
          <div className="printia-modal">
            <div className="section-kicker">Confirmar QR</div>
            <h2 className="h4 text-white mt-2">Generar código temporal</h2>
            <p className="text-muted-custom">El QR estará activo 48 horas y quedará listo para usarlo en el kiosco.</p>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn printia-button secondary" onClick={() => setConfirming(false)}>
                Cancelar
              </button>
              <button className="btn printia-button" onClick={handleUpload}>
                Generar
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </Layout>
  );
}
