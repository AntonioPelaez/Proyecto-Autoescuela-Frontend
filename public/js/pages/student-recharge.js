import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const messageBox = document.getElementById("message-state");
    const balanceAmount = document.getElementById("balance-amount");
    const startRechargeBtn = document.getElementById("start-recharge-btn");
    const withdrawBtn = document.getElementById("withdraw-balance-btn");

    // Cargar saldo del estudiante
    try {
        const student = await Api.getMe();
        const balance = parseFloat(student.student_profile?.wallet?.balance ?? student.balance ?? student.wallet_balance ?? 0);
        
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

    // Botón para retirar saldo
    if (withdrawBtn) {
        withdrawBtn.addEventListener("click", async () => {
            const currentBalance = parseFloat(balanceAmount.textContent.replace('€', ''));
            
            if (currentBalance <= 0) {
                showState(messageBox, "warning", "No tienes saldo disponible para retirar.");
                return;
            }

            const confirmed = confirm(`¿Confirmas que deseas retirar €${currentBalance.toFixed(2)} de tu cuenta?`);
            
            if (!confirmed) {
                return;
            }

            withdrawBtn.disabled = true;
            showState(messageBox, "info", "Procesando retiro...");

            try {
                await Api.withdrawBalance(currentBalance);
                showState(messageBox, "success", "¡Retiro completado! El dinero será transferido a tu cuenta bancaria.");
                
                // Actualizar el saldo en pantalla
                balanceAmount.textContent = "€0.00";
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (err) {
                console.error("Error al retirar saldo:", err);
                showState(messageBox, "error", err.message || "Error al procesar el retiro. Por favor intenta de nuevo.");
                withdrawBtn.disabled = false;
            }
        });
    }
});

