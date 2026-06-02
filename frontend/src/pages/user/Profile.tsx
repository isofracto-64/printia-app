import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { API_URL } from "../../api/config";
import { updateProfileImage, getUserProfile } from "../api/user";
import Toast from "../../components/Toast";

interface ColorPalette {
  pureWhite: string;
  lightGray: string;
  mutedGray: string;
  borderGray: string;
  cardBg: string;
  bodyBg: string;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingImage, setLoadingImage] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });

  const colors: ColorPalette = {
    pureWhite: "var(--pure-white)",
    lightGray: "var(--light-gray)",
    mutedGray: "var(--muted-gray)",
    borderGray: "var(--border-gray)",
    cardBg: "var(--card-bg)",
    bodyBg: "var(--body-bg)",
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      setUser(res.result);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, ...res.result, profile_image: res.result.profile }),
      );
    } catch (err) {
      console.error("Error al cargar perfil", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!file) return;

    try {
      setLoadingImage(true);
      const res = await updateProfileImage(file);

      // Actualizar estado local
      setUser((prev: any) => ({
        ...prev,
        profile: res.profile,
      }));

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, profile: res.profile, profile_image: res.profile }),
      );
    } catch (err: any) {
      setToast({
        show: true,
        message: "Error al actualizar la imagen: " + (err.response?.data?.detail || "Intenta de nuevo"),
        type: "error",
      });
    } finally {
      setLoadingImage(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: colors.bodyBg }}
      >
        <div className="spinner-border text-light"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div
        className="py-5"
        style={{
          backgroundColor: colors.bodyBg,
          minHeight: "100vh",
          color: colors.lightGray,
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* HEADER CARD */}
              <div
                className="card mb-4 shadow-lg"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.borderGray}`,
                  borderRadius: "20px",
                }}
              >
                <div className="card-body p-5">
                  <div className="d-flex align-items-center flex-column flex-md-row text-center text-md-start">
                    {/* CONTENEDOR DE IMAGEN */}
                    <div className="position-relative">
                      <div
                        className="position-relative"
                        style={{ width: "150px", height: "150px" }}
                      >
                        <img
                          src={user?.profile || `${API_URL}/media/profile.png`}
                          className="rounded-circle shadow"
                          alt="Profile"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            border: `3px solid ${colors.borderGray}`,
                            filter: loadingImage ? "brightness(0.4)" : "none",
                            transition: "all 0.3s ease",
                          }}
                        />
                        {loadingImage && (
                          <div className="position-absolute top-50 start-50 translate-middle">
                            <div className="spinner-border spinner-border-sm text-light"></div>
                          </div>
                        )}
                      </div>

                      <label
                        className="btn btn-secondary btn-sm position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                        style={{
                          border: `2px solid ${colors.cardBg}`,
                          backgroundColor: colors.borderGray,
                          cursor: loadingImage ? "not-allowed" : "pointer",
                        }}
                      >
                        <i
                          className="bi bi-camera-fill"
                          style={{ color: colors.pureWhite }}
                        ></i>
                        <input
                          type="file"
                          hidden
                          accept="image/png, image/jpeg"
                          disabled={loadingImage}
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleUploadImage(e.target.files[0])
                          }
                        />
                      </label>
                    </div>

                    <div className="ms-md-5 mt-4 mt-md-0">
                      <h1
                        className="fw-bold mb-1"
                        style={{ color: colors.pureWhite }}
                      >
                        {user?.name || user?.username}
                      </h1>
                      <p
                        className="fs-5 mb-2"
                        style={{ color: colors.mutedGray }}
                      >
                        {user?.role}
                      </p>
                      <div className="d-flex gap-2 justify-content-center justify-content-md-start">
                        <span
                          className="badge border"
                          style={{
                            color: colors.lightGray,
                            borderColor: colors.borderGray,
                          }}
                        >
                          @{user?.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-7">
                  <div
                    className="card h-100 shadow-sm"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.borderGray}`,
                      borderRadius: "15px",
                    }}
                  >
                    <div
                      className="card-header bg-transparent py-3"
                      style={{ borderBottom: `1px solid ${colors.borderGray}` }}
                    >
                      <h5
                        className="mb-0 fw-bold"
                        style={{ color: colors.pureWhite }}
                      >
                        Detalles del Perfil
                      </h5>
                    </div>
                    <div className="card-body p-4">
                      <div className="row">
                        <DetailItem
                          label="Nombre Completo"
                          value={user?.name}
                          colors={colors}
                        />
                        <DetailItem
                          label="Correo Electrónico"
                          value={user?.email}
                          colors={colors}
                        />
                        <DetailItem
                          label="Fecha de Nacimiento"
                          value={user?.birth}
                          colors={colors}
                        />
                        <DetailItem
                          label="Género"
                          value={user?.sex}
                          colors={colors}
                        />
                        <DetailItem
                          label="Teléfono"
                          value={user?.phone_number}
                          colors={colors}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-5">
                  <div
                    className="card shadow-sm mb-4"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.borderGray}`,
                      borderRadius: "15px",
                    }}
                  >
                    <div className="card-body p-4 text-center">
                      <p
                        className="text-uppercase small fw-bold mb-1"
                        style={{
                          color: colors.mutedGray,
                          letterSpacing: "1px",
                        }}
                      >
                        Balance Disponible
                      </p>
                      <h2
                        className="display-5 fw-bold"
                        style={{ color: colors.pureWhite }}
                      >
                        ${user?.balance || "0.00"}
                      </h2>
                      <hr
                        style={{
                          backgroundColor: colors.borderGray,
                          opacity: 0.5,
                        }}
                      />
                      <p
                        className="mb-0 small"
                        style={{ color: colors.mutedGray }}
                      >
                        Matrícula:{" "}
                        <span style={{ color: colors.lightGray }}>
                          {user?.matricula || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-secondary w-100 py-3 rounded-3"
                    style={{
                      color: colors.mutedGray,
                      borderColor: colors.borderGray,
                    }}
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/";
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </Layout>
  );
}

interface DetailItemProps {
  label: string;
  value: string | number | undefined;
  colors: ColorPalette;
}

function DetailItem({ label, value, colors }: DetailItemProps) {
  return (
    <div className="col-12 mb-4">
      <label
        className="d-block small text-uppercase fw-bold mb-1"
        style={{
          color: colors.mutedGray,
          letterSpacing: "0.8px",
          fontSize: "0.7rem",
        }}
      >
        {label}
      </label>
      <div className="fs-6" style={{ color: colors.pureWhite }}>
        {value || "—"}
      </div>
    </div>
  );
}
