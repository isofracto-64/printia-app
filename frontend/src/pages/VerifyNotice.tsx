//import { API_URL } from "../api/config";

export default function VerifyNotice() {
  const colors = {
    pureWhite: "#FFFFFF",
    lightGray: "#E1E1E6",
    mutedGray: "#9DA5B1",
    borderGray: "#3A3A42",
    cardBg: "#16161A",
    bodyBg: "#0B0B0D",
    accent: "#00d2ff",
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: colors.bodyBg }}
    >
      <div
        className="glass-card p-5 text-center shadow-lg animate__animated animate__zoomIn"
        style={{
          width: "450px",
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.borderGray}`,
          borderRadius: "24px",
        }}
      >
        <div
          className="mb-4 d-inline-flex justify-content-center align-items-center"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 210, 255, 0.1)",
            border: `1px solid ${colors.accent}`,
          }}
        >
          <i
            className="bi bi-envelope-check-fill fs-1"
            style={{ color: colors.accent }}
          ></i>
        </div>

        <h2 className="fw-bold mb-3" style={{ color: colors.pureWhite }}>
          Verifica tu correo
        </h2>

        <p
          className="fs-6 px-3"
          style={{ color: colors.lightGray, lineHeight: "1.6" }}
        >
          Hemos enviado un enlace de confirmación a tu bandeja de entrada. Por
          favor, haz clic en el enlace para activar tu cuenta.
        </p>

        <hr
          className="my-4"
          style={{ borderColor: colors.borderGray, opacity: 0.5 }}
        />

        <div className="d-flex flex-column gap-2">
          <small style={{ color: colors.mutedGray }}>
            <i className="bi bi-info-circle me-2"></i>
            ¿No recibiste nada? Revisa tu carpeta de <strong>spam</strong>.
          </small>

          <button
            className="btn btn-link mt-2 shadow-none"
            style={{
              color: colors.accent,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
            onClick={() => window.location.reload()}
          >
            Ya lo verifiqué, ir al login
          </button>
        </div>
      </div>
    </div>
  );
}
