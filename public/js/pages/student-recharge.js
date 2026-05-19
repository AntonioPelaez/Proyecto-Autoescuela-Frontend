import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const messageBox = document.getElementById("message-state");
    const balanceAmount = document.getElementById("balance-amount");
    const startRechargeBtn = document.getElementById("start-recharge-btn"); // ← ID correcto
    const withdrawBtn = document.getElementById("withdraw-balance-btn");

    async function loadBalance() {
        try {
            const student = await Api.getMe();

            const balance =
                parseFloat(student.student_profile?.wallet?.balance) ??
                parseFloat(student.wallet_balance) ??
                parseFloat(student.balance) ??
                0;

            balanceAmount.textContent = `€${balance.toFixed(2)}`;
            return balance;

        } catch (err) {
            console.error("Error cargando saldo:", err);
            showState(messageBox, "error", "Error al cargar el saldo.");
            return 0;
        }
    }

    // Cargar saldo al iniciar
    let currentBalance = await loadBalance();

    // Botón para recargar
    if (startRechargeBtn) {
        startRechargeBtn.addEventListener("click", () => {
            window.location.href = "/student/recharge-form";
        });
    }

    // Botón para retirar saldo
    if (withdrawBtn) {
        withdrawBtn.addEventListener("click", async () => {

            currentBalance = await loadBalance(); // ← saldo REAL

            if (currentBalance <= 0) {
                showState(messageBox, "warning", "No tienes saldo disponible para retirar.");
                return;
            }

            const confirmed = confirm(`¿Confirmas que deseas retirar €${currentBalance.toFixed(2)}?`);
            if (!confirmed) return;

            withdrawBtn.disabled = true;
            showState(messageBox, "info", "Procesando retiro...");

            try {
                await Api.withdrawWallet(currentBalance);

                showState(messageBox, "success", "¡Retiro completado!");

                await loadBalance(); // ← actualizar saldo real

            } catch (err) {
                console.error("Error al retirar saldo:", err);
                showState(messageBox, "error", err.message || "Error al procesar el retiro.");
            } finally {
                withdrawBtn.disabled = false;
            }
        });
    }
});
