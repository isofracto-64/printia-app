import { useState } from "react";
import { API_URL } from "../api/config";

type Message = {
  role: "assistant" | "user";
  text: string;
};

const cannedReply =
  "Puedo orientarte con registro, QR, impresión, trámites, créditos, ubicación y soporte. Dime qué intentas hacer y te doy los pasos.";

const localGuide = (text: string) => {
  const message = text.toLowerCase();
  if (message.includes("registr") || message.includes("correo") || message.includes("verificar")) {
    return "Para registrarte, completa todos los campos, confirma la contraseña y revisa tu correo. No podrás iniciar sesión hasta verificarlo desde el enlace enviado.";
  }
  if (message.includes("qr") || message.includes("codigo") || message.includes("código")) {
    return "Para usar QR: entra a Subir archivos, carga tus documentos, genera el QR y en el kiosco elige Escanear QR. El código caduca después de 48 horas.";
  }
  if (message.includes("credito") || message.includes("crédito") || message.includes("saldo")) {
    return "En Créditos puedes simular una recarga. Al terminar, el saldo se actualiza en Perfil. Un admin también puede ajustar saldo desde Clientes y alumnos.";
  }
  if (message.includes("ubicacion") || message.includes("ubicación") || message.includes("kiosco") || message.includes("kiosk")) {
    return "En Ubicación verás el estado y referencia del kiosco. Si eres admin, puedes cambiar dirección y estado desde Admin o desde Ubicación.";
  }
  if (message.includes("ticket") || message.includes("soporte") || message.includes("ayuda")) {
    return "Para soporte, abre Soporte, escribe asunto y mensaje. El admin puede revisar el ticket, responder por correo y cerrarlo al resolverlo.";
  }
  if (message.includes("imprimir") || message.includes("usb") || message.includes("archivo")) {
    return "Para imprimir en kiosco, elige Imprimir, conecta USB o escanea QR, selecciona archivos, revisa vista previa y confirma la impresión.";
  }
  if (message.includes("contraseña") || message.includes("password")) {
    return "Si olvidaste tu contraseña, usa Recuperar contraseña. Un administrador también puede asignarte una nueva desde Clientes y alumnos.";
  }
  return cannedReply;
};

export default function PrintiaAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hola, soy el asistente de Printia. Pregúntame cómo subir archivos, generar QR o usar el kiosco.",
    },
  ]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const speak = (text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = input.trim();
    if (!clean) return;

    setMessages((prev) => [...prev, { role: "user", text: clean }]);
    setInput("");

    try {
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean }),
      });

      if (!response.ok) throw new Error("Assistant unavailable");
      const data = await response.json();
      const reply = data.message || localGuide(clean);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply },
      ]);
      speak(reply);
    } catch {
      const reply = localGuide(clean);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      speak(reply);
    }
  };

  return (
    <div className="ai-assistant">
      {open && (
        <div className="ai-assistant-panel mb-2">
          <div className="p-3 d-flex justify-content-between align-items-center border-bottom border-secondary">
            <div>
              <strong className="text-white">Printia AI</strong>
              <div className="small text-muted-custom">Guía con voz</div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => setVoiceEnabled((value) => !value)}
            >
              {voiceEnabled ? "Voz ON" : "Voz OFF"}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>

          <div className="ai-assistant-messages p-3">
            {messages.map((message, index) => (
              <div key={index} className={`ai-message ${message.role}`}>
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-3 d-flex gap-2">
            <input
              className="form-control printia-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu duda"
            />
            <button className="printia-button" type="submit">
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="printia-button w-100"
        onClick={() => setOpen((value) => !value)}
      >
        Asistente Printia
      </button>
    </div>
  );
}
