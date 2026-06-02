from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(payload: ChatRequest):
    text = payload.message.lower()

    if "qr" in text or "codigo" in text or "código" in text:
        message = "Para imprimir con QR, sube tus archivos, genera el QR y usa el código visible en el kiosco desde Escanear QR."
    elif "credito" in text or "crédito" in text or "saldo" in text:
        message = "En Créditos puedes simular una recarga. Después revisa Perfil: el saldo se actualiza con el balance guardado en tu cuenta."
    elif "ubicacion" in text or "ubicación" in text:
        message = "En Ubicación verás el estado y referencia del kiosco. Si eres admin, puedes guardar cambios desde Admin o desde la misma pantalla."
    elif "contraseña" in text or "password" in text:
        message = "Si olvidaste tu contraseña, usa Recuperar contraseña o pide a un admin que asigne una nueva en Clientes y alumnos."
    elif "ticket" in text or "soporte" in text or "ayuda" in text:
        message = "En Soporte puedes crear un ticket. El administrador verá tu nombre, correo, asunto y mensaje para responderte."
    elif "kiosko" in text or "kiosk" in text or "imprimir" in text:
        message = "En el kiosko selecciona Imprimir para USB o Escanear QR para archivos ya cargados. Confirma el pago antes de imprimir."
    elif "agua" in text or "comapa" in text:
        message = "Para pagar agua, entra a Trámites y pagos y abre COMAPA. Al terminar, regresa al flujo de impresión."
    else:
        message = "Puedo guiarte con registro, QR, créditos, impresión en kiosko, pagos y tickets. Dime qué paso se te complica."

    return {"message": message}
