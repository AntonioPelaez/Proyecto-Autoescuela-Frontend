import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const messageBox = document.getElementById("message-state");
    const amountSelection = document.getElementById("amount-selection");
    const paymentSection = document.getElementById("payment-section");

    const amountBtns = document.querySelectorAll(".amount-btn");
    const customAmountInput = document.getElementById("custom-amount");
    const customAmountBtn = document.getElementById("custom-amount-btn");
    const cancelRechargeBtn = document.getElementById("cancel-recharge");

    const rechargeForm = document.getElementById("recharge-form");
    const backToAmountBtn = document.getElementById("back-to-amount");
    const summaryAmount = document.getElementById("summary-amount");

    const cardHolder = document.getElementById("recharge-card-holder");
    const cardNumber = document.getElementById("recharge-card-number");
    const cardExpiry = document.getElementById("recharge-card-expiry");
    const cardCvv = document.getElementById("recharge-card-cvv");

    let selectedAmount = null;

    // ============================
    // 1) Seleccionar cantidad predefinida
    // ============================
    amountBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            amountBtns.forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedAmount = parseFloat(btn.getAttribute("data-amount"));
            customAmountInput.value = "";
            showPaymentSection();
        });
    });

    // ============================
    // 2) Seleccionar cantidad personalizada
    // ============================
    customAmountBtn.addEventListener("click", () => {
        const value = parseFloat(customAmountInput.value);

        if (!value || value < 1) {
            showState(messageBox, "error", "Por favor, introduce una cantidad válida (mínimo €1.00).");
            return;
        }

        amountBtns.forEach((b) => b.classList.remove("selected"));
        selectedAmount = value;
        showPaymentSection();
    });

    // ============================
    // 3) Mostrar sección de pago
    // ============================
    function showPaymentSection() {
        amountSelection.style.display = "none";
        paymentSection.style.display = "block";
        summaryAmount.textContent = `€${selectedAmount.toFixed(2)}`;
        messageBox.style.display = "none";
    }

    // ============================
    // 4) Volver a seleccionar cantidad
    // ============================
    backToAmountBtn.addEventListener("click", () => {
        paymentSection.style.display = "none";
        amountSelection.style.display = "block";
        rechargeForm.reset();
        messageBox.style.display = "none";
    });

    // ============================
    // 5) Cancelar recarga
    // ============================
    cancelRechargeBtn.addEventListener("click", () => {
        window.location.href = "/student/recharge";
    });

    // ============================
    // 6) Validar y formatear número de tarjeta
    // ============================
    cardNumber.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s+/g, "");
        if (!/^\d*$/.test(value)) {
            e.target.value = value.replace(/\D/g, "");
            return;
        }

        value = value.match(/.{1,4}/g)?.join(" ") || value;
        e.target.value = value;
    });

    // ============================
    // 7) Formatear vencimiento
    // ============================
    cardExpiry.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }

        e.target.value = value;
    });

    // ============================
    // 8) Validar CVV (solo números)
    // ============================
    cardCvv.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "");
    });

    // ============================
    // 9) Validar formulario
    // ============================
    function validatePaymentForm() {
        const errors = [];

        if (!cardHolder.value.trim()) {
            errors.push("El titular de la tarjeta es obligatorio.");
        }

        const cardNum = cardNumber.value.replace(/\s/g, "");
        if (!cardNum || cardNum.length !== 16 || !/^\d+$/.test(cardNum)) {
            errors.push("El número de tarjeta debe tener 16 dígitos.");
        }

        const expiry = cardExpiry.value;
        if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
            errors.push("El vencimiento debe estar en formato MM/YY.");
        } else {
            const [mes, año] = expiry.split("/");
            const mesNum = parseInt(mes);
            const añoNum = parseInt(año);

            if (mesNum < 1 || mesNum > 12) {
                errors.push("El mes del vencimiento debe estar entre 01 y 12.");
            }

            // Para desarrollo/pruebas: aceptar cualquier año a partir de 2020
            const fullYear = 2000 + añoNum;
            if (fullYear < 2020) {
                errors.push("Por favor, usa un año válido (2020 o posterior).");
            }
        }

        const cvv = cardCvv.value;
        if (!cvv || !cvv.match(/^\d{3,4}$/)) {
            errors.push("El CVV debe tener 3 o 4 dígitos.");
        }

        return errors;
    }

    // ============================
    // 10) Confirmar recarga
    // ============================
    rechargeForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const errors = validatePaymentForm();

        if (errors.length > 0) {
            showState(messageBox, "error", errors.join(" "));
            return;
        }

        showState(messageBox, "info", "Procesando recarga...");
        rechargeForm.querySelector("button[type='submit']").disabled = true;

        try {
            // Simular procesamiento de pago
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Aquí iría la llamada a API para registrar la recarga
            // Por ahora, simularemos que funciona
            console.log("Recarga completada:", {
                amount: selectedAmount,
                cardHolder: cardHolder.value,
            });

            // Guardar saldo en sessionStorage para la siguiente página
            sessionStorage.setItem("rechargeAmount", selectedAmount.toString());

            showState(messageBox, "success", "¡Recarga completada! Redirigiendo...");

            // Redirigir a la página de confirmación de reserva o al panel
            setTimeout(() => {
                const redirectUrl = sessionStorage.getItem("redirectAfterRecharge");
                if (redirectUrl) {
                    sessionStorage.removeItem("redirectAfterRecharge");
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = "/student/recharge";
                }
            }, 2000);
        } catch (err) {
            console.error("Error al procesar la recarga:", err);
            showState(
                messageBox,
                "error",
                err.message || "Error al procesar la recarga. Por favor, intenta de nuevo."
            );
        } finally {
            rechargeForm.querySelector("button[type='submit']").disabled = false;
        }
    });
});
