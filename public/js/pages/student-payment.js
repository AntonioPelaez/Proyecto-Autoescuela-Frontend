import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const messageBox = document.getElementById("message-state");
    const classInfo = document.getElementById("class-info");
    const paymentForm = document.getElementById("payment-form");
    const cancelBtn = document.getElementById("cancel-payment");

    const cardHolder = document.getElementById("card-holder");
    const cardNumber = document.getElementById("card-number");
    const cardExpiry = document.getElementById("card-expiry");
    const cardCvv = document.getElementById("card-cvv");

    let bookingData = null;

    // ============================
    // 1) Cargar datos de la reserva
    // ============================
    try {
        const storedData = sessionStorage.getItem("pendingBooking");
        console.log("Datos en sessionStorage:", storedData);
        
        if (!storedData) {
            showState(messageBox, "error", "No se encontraron datos de la reserva. Por favor, intenta de nuevo.");
            paymentForm.style.display = "none";
            return; // Detener ejecución, no redirigir
        }

        bookingData = JSON.parse(storedData);
        console.log("Datos de la reserva parseados:", bookingData);

        // Mostrar los datos de la clase
        const [year, month, day] = bookingData.date.split("-");
        const fecha = `${day}/${month}/${year}`;
        const hora = bookingData.start.slice(11, 16);

        classInfo.innerHTML = `
            <p>
                <strong>Alumno:</strong> ${bookingData.studentName}
            </p>
            <p>
                <strong>Profesor:</strong> ${bookingData.teacherName}
            </p>
            <p>
                <strong>Población:</strong> ${bookingData.townName}
            </p>
            <p>
                <strong>Fecha:</strong> ${fecha}
            </p>
            <p>
                <strong>Hora:</strong> ${hora}
            </p>
            <p>
                <strong>Vehículo:</strong> ${bookingData.vehicleName}
            </p>
            <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <strong style="font-size: 18px; color: #28a745;">Precio: ${bookingData.price} €</strong>
            </p>
        `;
    } catch (err) {
        console.error("Error cargando datos de la reserva:", err);
        showState(messageBox, "error", "Error al procesar los datos de la reserva.");
        classInfo.innerHTML = `<p style="color: red;">Error cargando datos de la reserva.</p>`;
        paymentForm.style.display = "none";
        return; // Detener ejecución, no redirigir
    }

    // ============================
    // 2) Validar y formatear número de tarjeta
    // ============================
    cardNumber.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s+/g, "");
        if (!/^\d*$/.test(value)) {
            e.target.value = value.replace(/\D/g, "");
            return;
        }

        // Formatear con espacios cada 4 dígitos
        value = value.match(/.{1,4}/g)?.join(" ") || value;
        e.target.value = value;
    });

    // ============================
    // 3) Formatear vencimiento
    // ============================
    cardExpiry.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }

        e.target.value = value;
    });

    // ============================
    // 4) Validar CVV (solo números)
    // ============================
    cardCvv.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "");
    });

    // ============================
    // 5) Validar formulario
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

            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const fullYear = 2000 + añoNum;

            if (fullYear < currentYear || (fullYear === currentYear && mesNum < currentMonth)) {
                errors.push("La tarjeta ha expirado.");
            }
        }

        const cvv = cardCvv.value;
        if (!cvv || !cvv.match(/^\d{3,4}$/)) {
            errors.push("El CVV debe tener 3 o 4 dígitos.");
        }

        return errors;
    }

    // ============================
    // 6) Confirmar pago
    // ============================
    paymentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const errors = validatePaymentForm();

        if (errors.length > 0) {
            showState(messageBox, "error", errors.join(" "));
            return;
        }

        // Mostrar estado de procesamiento
        showState(messageBox, "info", "Procesando pago...");
        paymentForm.querySelector("button[type='submit']").disabled = true;

        try {
            // 1) Crear la clase en estado "pending"
            const classPayload = {
                teacher_id: bookingData.teacherId,
                student_id: bookingData.studentId,
                town_id: bookingData.townId,
                vehicle_id: bookingData.vehicleId,
                date: bookingData.date,
                start: bookingData.start,
                end: bookingData.end,
                status: "pending",
            };

            const classResponse = await Api.createClassSession(classPayload);
            const classSessionId = classResponse.id || classResponse.class_session_id;

            if (!classSessionId) {
                throw new Error("No se pudo crear la clase");
            }

            // 2) Simular procesamiento de pago
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // 3) Crear payment intent (guardar datos de pago en la tabla)
            const paymentPayload = {
                class_session_id: classSessionId,
                amount: bookingData.price,
                currency: "EUR",
                card_holder: cardHolder.value.trim(),
            };

            const paymentResponse = await Api.createPaymentIntent(paymentPayload);
            const paymentIntentId = paymentResponse.id;

            if (!paymentIntentId) {
                throw new Error("No se pudo crear el payment intent");
            }

            // 4) Confirmar el pago
            await Api.confirmPaymentIntent(paymentIntentId);

            // Limpiar datos de sesión
            sessionStorage.removeItem("pendingBooking");

            showState(messageBox, "success", "¡Pago confirmado! Tu clase ha sido reservada.");

            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = "/student/availability";
            }, 2000);
        } catch (err) {
            console.error("Error al procesar el pago:", err);
            showState(
                messageBox,
                "error",
                err.message || "Error al procesar el pago. Por favor, intenta de nuevo."
            );
        } finally {
            paymentForm.querySelector("button[type='submit']").disabled = false;
        }
    });

    // ============================
    // 7) Cancelar pago
    // ============================
    cancelBtn.addEventListener("click", () => {
        if (confirm("¿Seguro que deseas cancelar esta reserva?")) {
            sessionStorage.removeItem("pendingBooking");
            showState(messageBox, "info", "Reserva cancelada.");
            
            setTimeout(() => {
                window.location.href = "/student/availability";
            }, 1500);
        }
    });
});
