import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const messageBox = document.getElementById("message-state");
    const balanceAmount = document.getElementById("balance-amount");
    const startRechargeBtn = document.getElementById("start-recharge-btn");

    // Cargar saldo del estudiante
    try {
        const student = await Api.getMe();
        const balance = parseFloat(student.balance ?? student.wallet_balance ?? 0);
        if (balanceAmount) {
            balanceAmount.textContent = `€${balance.toFixed(2)}`;
        }
    } catch (err) {
        console.error("Error cargando saldo:", err);
        showState(messageBox, "error", "Error al cargar el saldo. Por favor intenta de nuevo.");
    }

    // Botón para comenzar recarga
    if (startRechargeBtn) {
        startRechargeBtn.addEventListener("click", () => {
            window.location.href = "/student/recharge-form";
        });
    }
});
