import { useNavigate } from "react-router-dom";

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "#0B0B0D",
        color: "white",
      }}
    >
      <div
        className="text-center p-5"
        style={{
          background: "#16161A",
          border: "1px solid #3A3A42",
          borderRadius: "20px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 0 25px rgba(0,0,0,0.6)",
        }}
      >
        <h2 className="display-5 mb-4 fw-bold" style={{ color: "#00d2ff" }}>
          {title}
        </h2>

        <p className="text-secondary fs-5">
          Este módulo estará disponible próximamente.
          <br />
          Estamos configurando los servicios del sistema.
        </p>

        <button
          className="btn btn-outline-light mt-5 px-5 py-3 rounded-pill fw-bold"
          style={{ transition: "0.3s" }}
          onClick={() => navigate("/kiosk")}
        >
          ⬅ Volver
        </button>
      </div>
    </div>
  );
}
