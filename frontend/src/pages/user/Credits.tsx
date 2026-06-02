import { useState } from "react";
import Layout from "../../components/Layout";
import Toast from "../../components/Toast";
import { simulateCreditRecharge } from "../../api/credits";
import { getUserProfile } from "../api/user";

const quickAmounts = [20, 50, 100, 200];

export default function Credits() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [amount, setAmount] = useState(50);
  const [balance, setBalance] = useState(Number(storedUser.balance || 0));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "error" | "info" | "success" });

  const recharge = async () => {
    if (!amount || amount <= 0) {
      setToast({ show: true, message: "Ingresa un monto mayor a cero.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      const result = await simulateCreditRecharge(amount);
      setBalance(Number(result.balance || 0));
      const profile = await getUserProfile();
      const nextUser = { ...storedUser, ...profile.result, profile_image: profile.result.profile };
      localStorage.setItem("user", JSON.stringify(nextUser));
      setToast({ show: true, message: "Créditos actualizados en tu perfil.", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err instanceof Error ? err.message : "No se pudo simular la recarga", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="section-kicker">Créditos</div>
        <h1 className="section-title">Saldo Printia</h1>
        <p className="text-muted-custom">Simulación conectada al saldo real de tu perfil.</p>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="printia-card p-4 h-100">
              <span className="text-muted-custom">Balance disponible</span>
              <strong className="display-4 text-white d-block">${balance.toFixed(2)}</strong>
              <div className="interactive-card p-3 mt-4">
                <span className="text-muted-custom small">Usuario</span>
                <strong className="text-white d-block">{storedUser.name || storedUser.username || "Cuenta Printia"}</strong>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="printia-card p-4">
              <h2 className="h4 text-white">Simular recarga</h2>
              <div className="d-flex flex-wrap gap-2 my-3">
                {quickAmounts.map((value) => (
                  <button key={value} className="btn printia-button secondary" type="button" onClick={() => setAmount(value)}>
                    ${value}
                  </button>
                ))}
              </div>
              <label className="form-label text-muted-custom">Monto</label>
              <input
                type="number"
                min={1}
                step="1"
                className="form-control printia-input"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
              <button className="btn printia-button mt-3" type="button" onClick={recharge} disabled={saving}>
                {saving ? "Actualizando..." : "Actualizar créditos"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast((current) => ({ ...current, show: false }))} />
    </Layout>
  );
}
