import { useEffect } from "react";

interface Props {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: "error" | "info" | "success"; // Opcional: para cambiar el color del borde
}

export default function Toast({
  message,
  show,
  onClose,
  type = "error",
}: Props) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const colors = {
    pureWhite: "var(--pure-white)",
    mutedGray: "var(--muted-gray)",
    accent: "var(--accent)",
    danger: "var(--danger)",
  };

  const borderColor = type === "error" ? colors.danger : colors.accent;

  return (
    <div
      className="animate__animated animate__fadeInRight"
      style={{
        ...styles.container,
        backgroundColor: "var(--card-bg)",
        borderColor: borderColor,
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 10px ${borderColor}44`,
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <i
          className={`bi ${type === "error" ? "bi-exclamation-circle-fill" : "bi-info-circle-fill"}`}
          style={{ color: borderColor, fontSize: "1.2rem" }}
        ></i>

        <span
          style={{
            color: colors.pureWhite,
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          {message}
        </span>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: colors.mutedGray,
            cursor: "pointer",
            padding: "0 0 0 10px",
            fontSize: "1.1rem",
          }}
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed" as const,
    top: "30px",
    right: "30px",
    padding: "16px 20px",
    borderRadius: "14px",
    border: "1px solid",
    backdropFilter: "blur(12px)",
    zIndex: 10000,
    minWidth: "300px",
    maxWidth: "450px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
  },
};
