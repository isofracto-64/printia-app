import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function KioskSessionGuard() {
  const location = useLocation();

  useEffect(() => {
    const clearKioskSession = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if ((user.role || "").toLowerCase() === "kiosk") localStorage.clear();
    };
    window.addEventListener("beforeunload", clearKioskSession);
    return () => window.removeEventListener("beforeunload", clearKioskSession);
  }, [location.pathname]);

  return null;
}
