import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getFullHistory } from "../../api/history";
import { API_URL } from "../../api/config";

export default function History() {
  const [qrs, setQrs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<any | null>(null);

  const colors = {
    pureWhite: "var(--pure-white)",
    lightGray: "var(--light-gray)",
    mutedGray: "var(--muted-gray)",
    borderGray: "var(--border-gray)",
    cardBg: "var(--card-bg)",
    bodyBg: "var(--body-bg)",
    accent: "var(--accent)",
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getFullHistory();
      setQrs(res.result.qrs || []);
      setJobs(res.result.jobs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: colors.bodyBg }}
      >
        <div className="spinner-border text-light"></div>
      </div>
    );

  return (
    <Layout>
      <div
        className="py-5"
        style={{ backgroundColor: colors.bodyBg, minHeight: "100vh" }}
      >
        <div className="container">
          <h2
            className="fw-bold mb-5 text-center"
            style={{ color: colors.pureWhite }}
          >
            <i className="bi bi-clock-history me-3"></i>Historial de Actividad
          </h2>

          <div className="row g-4">
            <div className="col-lg-6">
              <div
                className="p-4 shadow-sm h-100"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.borderGray}`,
                  borderRadius: "20px",
                }}
              >
                <h4
                  className="mb-4 d-flex align-items-center"
                  style={{ color: colors.pureWhite }}
                >
                  <i className="bi bi-qr-code-scan me-2 text-info"></i> QRs
                  Generados
                </h4>

                <div
                  className="pe-2"
                  style={{ maxHeight: "600px", overflowY: "auto" }}
                >
                  {qrs.length === 0 ? (
                    <p style={{ color: colors.mutedGray }}>
                      No has generado QRs recientemente.
                    </p>
                  ) : (
                    qrs.map((qr, i) => (
                      <div
                        key={i}
                        className="card mb-3 p-3 transition-all"
                        style={{
                          backgroundColor:
                            selectedQR?.token === qr.token
                              ? "var(--surface-soft)"
                              : "transparent",
                          border: `1px solid ${selectedQR?.token === qr.token ? colors.accent : colors.borderGray}`,
                          cursor: "pointer",
                          borderRadius: "12px",
                          color: colors.lightGray,
                        }}
                        onClick={() => setSelectedQR(qr)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span
                              className="small d-block"
                              style={{ color: colors.mutedGray }}
                            >
                              Token ID
                            </span>
                            <code style={{ color: colors.accent }}>
                              {qr.token.slice(0, 12)}...
                            </code>
                          </div>
                          <i
                            className="bi bi-chevron-right"
                            style={{ color: colors.mutedGray }}
                          ></i>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              {selectedQR ? (
                <div
                  className="card p-4 animate__animated animate__fadeIn"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.accent}`,
                    borderRadius: "20px",
                  }}
                >
                  <h5
                    className="mb-4 fw-bold"
                    style={{ color: colors.pureWhite }}
                  >
                    Detalles del QR
                  </h5>

                  {/* IMAGEN DEL QR */}
                  <div className="text-center mb-4 p-3 bg-white rounded-3 d-inline-block mx-auto w-100">
                    <img
                      src={`${API_URL}/users/qr-image/${selectedQR.token}`}
                      alt="QR Code"
                      style={{
                        width: "180px",
                        height: "180px",
                        imageRendering: "pixelated",
                      }}
                    />
                  </div>

                  <div
                    className="mt-2 p-3 rounded-3"
                    style={{
                      backgroundColor: colors.bodyBg,
                      border: `1px solid ${colors.borderGray}`,
                    }}
                  >
                    <h6
                      className="small text-uppercase fw-bold mb-2"
                      style={{ color: colors.mutedGray, letterSpacing: "1px" }}
                    >
                      Código del QR
                    </h6>
                    <div className="interactive-card p-3 mb-3">
                      <code style={{ color: colors.accent, wordBreak: "break-all" }}>{selectedQR.token}</code>
                    </div>
                    <h6
                      className="small text-uppercase fw-bold mb-3"
                      style={{ color: colors.mutedGray, letterSpacing: "1px" }}
                    >
                      Archivos vinculados ({selectedQR.files?.length || 0})
                    </h6>

                    {selectedQR.files && selectedQR.files.length > 0 ? (
                      selectedQR.files.map((file: any, i: number) => (
                        <div
                          key={i}
                          className="d-flex justify-content-between align-items-center mb-2 p-2 rounded-2"
                          style={{ backgroundColor: colors.cardBg }}
                        >
                          <div className="d-flex align-items-center">
                            <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>
                            <div className="d-flex flex-column">
                              <span
                                style={{
                                  color: colors.lightGray,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {file.name}
                              </span>
                              <span
                                className="small text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Tipo: {file.type || "PDF"}
                              </span>
                            </div>
                          </div>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: colors.borderGray,
                              color: colors.mutedGray,
                            }}
                          >
                            {file.pages} pág.
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted small">
                        No hay archivos vinculados a este QR.
                      </p>
                    )}
                  </div>

                  <div className="mt-3 text-center">
                    <small style={{ color: colors.mutedGray }}>
                      Expira el:{" "}
                      {new Date(selectedQR.expires_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              ) : (
                <div
                  className="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-center"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px dashed ${colors.borderGray}`,
                    borderRadius: "20px",
                    color: colors.mutedGray,
                  }}
                >
                  <i className="bi bi-mouse2 fs-1 mb-3"></i>
                  <p>
                    Selecciona un QR de la lista para ver sus archivos y código.
                  </p>
                </div>
              )}
            </div>

            <div className="col-12 mt-4">
              <div
                className="p-4"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.borderGray}`,
                  borderRadius: "20px",
                }}
              >
                <h4 className="mb-4" style={{ color: colors.pureWhite }}>
                  <i className="bi bi-printer me-2 text-success"></i> Trabajos
                  de Impresión
                </h4>

                <div className="table-responsive">
                  <table
                    className="table table-dark table-hover mb-0"
                    style={{ backgroundColor: colors.cardBg }}
                  >
                    <thead
                      style={{ borderBottom: `2px solid ${colors.borderGray}` }}
                    >
                      <tr style={{ color: colors.mutedGray }}>
                        <th className="py-3 border-0">ID de Trabajo</th>
                        <th className="py-3 border-0">Estado</th>
                        <th className="py-3 border-0">Fecha</th>
                        <th className="py-3 border-0">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-4 text-muted"
                          >
                            No hay registros de impresión.
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: `1px solid ${colors.borderGray}`,
                            }}
                          >
                            <td className="py-3 text-info fw-mono">
                              # {job.id.toString().padStart(5, "0")}
                            </td>
                            <td className="py-3">
                              <span
                                className={`badge ${job.status === "completed" ? "bg-success" : "bg-warning"} bg-opacity-10 text-${job.status === "completed" ? "success" : "warning"} border border-${job.status === "completed" ? "success" : "warning"}`}
                              >
                                {job.status.toUpperCase()}
                              </span>
                            </td>
                            <td
                              className="py-3"
                              style={{ color: colors.lightGray }}
                            >
                              {job.created_at || "—"}
                            </td>
                            <td
                              className="py-3 fw-bold"
                              style={{ color: colors.pureWhite }}
                            >
                              $ {job.total_price || "0.00"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
