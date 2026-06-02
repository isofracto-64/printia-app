import { useNavigate } from "react-router-dom";

export default function KioskPrint() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleFinishSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/kiosk");
  };

  return (
    <div
      className="vh-100 d-flex flex-column"
      style={{ backgroundColor: "#0B0B0D", color: "white" }}
    >
      {/* Header de Sesión de Usuario */}
      <div
        className="p-4 d-flex justify-content-between align-items-center"
        style={{ borderBottom: "1px solid #3A3A42" }}
      >
        <div>
          <span className="text-muted small d-block">USUARIO ACTIVO</span>
          <h5 className="m-0 text-info">{user.name || "Invitado"}</h5>
        </div>
        <button
          className="btn btn-danger btn-lg rounded-pill px-4"
          onClick={handleFinishSession}
        >
          Terminar y Salir
        </button>
      </div>

      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h2 className="mb-5">¿Qué deseas hacer hoy?</h2>
        <div className="d-flex gap-4">
          <button
            className="btn-option"
            onClick={() => navigate("/kiosk")}
          >
            <i className="bi bi-arrow-left display-5 mb-2"></i>
            Volver
          </button>
          <button
            className="btn-option"
            onClick={() => navigate("/kiosk/files")}
          >
            <i className="bi bi-files display-5 mb-2"></i>
            Mis Documentos
          </button>
          <button className="btn-option">
            <i className="bi bi-credit-card display-5 mb-2"></i>
            Recargar Créditos
          </button>
          <button className="btn-option">
            <i className="bi bi-printer display-5 mb-2"></i>
            Ajustes Impresión
          </button>
        </div>
      </div>

      <style>{`
        .btn-option {
          width: 220px;
          height: 200px;
          background: #16161A;
          border: 1px solid #3A3A42;
          color: white;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: 0.2s;
        }
        .btn-option:hover {
          border-color: #00d2ff;
          background: #1c1c21;
        }
      `}</style>
    </div>
  );
}
