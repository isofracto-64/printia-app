import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const rows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
  ["z", "x", "c", "v", "b", "n", "m", "@", ".", "_"],
];

type EditableElement = HTMLInputElement | HTMLTextAreaElement;

export default function KioskTouchKeyboard() {
  const location = useLocation();
  const [target, setTarget] = useState<EditableElement | null>(null);
  const [shift, setShift] = useState(false);
  const enabled = location.pathname.startsWith("/kiosk");

  useEffect(() => {
    if (!enabled) {
      setTarget(null);
      return;
    }

    const onFocusIn = (event: FocusEvent) => {
      const element = event.target;
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;
      if (element.readOnly || element.disabled) return;
      const blockedTypes = ["button", "checkbox", "file", "radio", "range", "submit"];
      if (element instanceof HTMLInputElement && blockedTypes.includes(element.type)) return;
      setTarget(element);
    };

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [enabled]);

  if (!enabled || !target) return null;

  const emitInput = (nextValue: string) => {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    target.value = `${target.value.slice(0, start)}${nextValue}${target.value.slice(end)}`;
    const cursor = start + nextValue.length;
    target.setSelectionRange(cursor, cursor);
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.focus();
  };

  const backspace = () => {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    if (start === 0 && end === 0) return;
    const from = start === end ? start - 1 : start;
    target.value = `${target.value.slice(0, from)}${target.value.slice(end)}`;
    target.setSelectionRange(from, from);
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.focus();
  };

  return (
    <div className="kiosk-keyboard" role="group" aria-label="Teclado tactil">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="small text-muted-custom">Teclado tactil</span>
        <button type="button" className="kiosk-key wide" onClick={() => setTarget(null)}>
          Ocultar
        </button>
      </div>
      {rows.map((row) => (
        <div className="kiosk-key-row" key={row.join("")}>
          {row.map((key) => (
            <button type="button" className="kiosk-key" key={key} onClick={() => emitInput(shift ? key.toUpperCase() : key)}>
              {shift ? key.toUpperCase() : key}
            </button>
          ))}
        </div>
      ))}
      <div className="kiosk-key-row">
        <button type="button" className="kiosk-key wide" onClick={() => setShift((value) => !value)}>
          Mayus
        </button>
        <button type="button" className="kiosk-key space" onClick={() => emitInput(" ")}>
          Espacio
        </button>
        <button type="button" className="kiosk-key wide" onClick={backspace}>
          Borrar
        </button>
      </div>
    </div>
  );
}
