import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const messageBox = document.getElementById("message-state");
    const balanceAmount = document.getElementById("balance-amount");

    try {
        const student = await Api.getMe();

        console.log("DEBUG /me:", student); // ← VERÁS EL WALLET AQUÍ

        const balance = parseFloat(student.student_profile?.wallet?.balance ?? 0);

        if (balanceAmount) {
            balanceAmount.textContent = `€${balance.toFixed(2)}`;
        } else {
            console.warn("⚠ No existe el elemento #balance-amount en el DOM");
        }

    } catch (err) {
        console.error("Error cargando saldo:", err);
        showState(messageBox, "error", "Error al cargar el saldo.");
    }
});

