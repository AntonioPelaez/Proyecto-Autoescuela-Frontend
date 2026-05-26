import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const messageBox = document.getElementById("message-state");
    const classInfo = document.getElementById("class-info");
    const classPrice = document.getElementById("class-price");
    const currentBalance = document.getElementById("current-balance");
    const balanceAfter = document.getElementById("balance-after");
    const confirmBtn = document.getElementById("confirm-booking");
    const cancelBtn = document.getElementById("cancel-booking");

    let bookingData = null;
    let studentBalance = 0;

    // ============================
    // Convertir timestamp → Y-m-d H:i:s
    // ============================
    function toDateTimeString(ts) {
        const d = new Date(ts);
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    // ============================
    // 1) Cargar datos de la reserva y saldo
    // ============================
    try {
        const storedData = sessionStorage.getItem("pendingBooking");
        if (!storedData) {
            showState(messageBox, "error", "No se encontraron datos de la reserva. Por favor, intenta de nuevo.");
            confirmBtn.disabled = true;
            return;
        }

        bookingData = JSON.parse(storedData);
        console.log("Datos de la reserva:", bookingData);

        // Obtener saldo del estudiante
        const student = await Api.getMe();
        studentBalance = parseFloat(student.student_profile?.wallet?.balance ?? 0);

        // Mostrar los datos de la clase
        const [year, month, day] = bookingData.date.split("-");
        const fecha = `${day}/${month}/${year}`;
        const hora = toDateTimeString(bookingData.start).slice(11, 16);
        const price = parseFloat(bookingData.price);

        classInfo.innerHTML = `
            <p><strong>Alumno:</strong> ${bookingData.studentName}</p>
            <p><strong>Profesor:</strong> ${bookingData.teacherName}</p>
            <p><strong>Población:</strong> ${bookingData.townName}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Hora:</strong> ${hora}</p>
            <p><strong>Vehículo:</strong> ${bookingData.vehicleName}</p>
        `;

        classPrice.textContent = `€${price.toFixed(2)}`;
        currentBalance.textContent = `€${studentBalance.toFixed(2)}`;
        balanceAfter.textContent = `€${(studentBalance - price).toFixed(2)}`;

        if (studentBalance < price) {
            showState(messageBox, "warning", "No tienes suficiente saldo. Por favor, recarga tu cuenta.");
            confirmBtn.disabled = true;
        }
    } catch (err) {
        console.error("Error cargando datos:", err);
        showState(messageBox, "error", "Error al cargar los datos de la reserva.");
        confirmBtn.disabled = true;
    }

    // ============================
    // 2) Confirmar reserva
    // ============================
    confirmBtn.addEventListener("click", async () => {
        if (!bookingData) {
            showState(messageBox, "error", "Datos inválidos. Por favor, intenta de nuevo.");
            return;
        }

        const price = parseFloat(bookingData.price);
        if (studentBalance < price) {
            showState(messageBox, "error", "Saldo insuficiente.");
            return;
        }

        showState(messageBox, "info", "Procesando reserva...");
        confirmBtn.disabled = true;

        try {
            // Convertir timestamps a formato válido
            const startFormatted = toDateTimeString(bookingData.start);
            const endFormatted = toDateTimeString(bookingData.end);

            // Crear clase
            const classPayload = {
                teacher_id: bookingData.teacherId,
                student_id: bookingData.studentId,
                town_id: bookingData.townId,
                vehicle_id: bookingData.vehicleId,
                date: bookingData.date,
                start: startFormatted,
                end: endFormatted
            };

            console.log("Payload enviado:", classPayload);

            const classResponse = await Api.createClassSession(classPayload);
            const classSessionId = classResponse.session?.id;

            if (!classSessionId) {
                throw new Error("No se pudo crear la clase");
            }

            // ============================
            // 🔥 3) PAGAR CON MONEDERO
            // ============================
           const payment = await Api.payWithWallet({
    class_session_id: classSessionId
});

console.log("Pago realizado:", payment);

// ============================
// 🔥 DESCARGAR TICKET PDF
// ============================
try {
    await downloadTicketPDF(payment.payment_intent_id);
} catch (err) {
    console.error("Error descargando ticket:", err);
    showState(messageBox, "warning", "La reserva se pagó, pero no se pudo descargar el ticket.");
}


            // Limpiar reserva temporal
            sessionStorage.removeItem("pendingBooking");

            showState(messageBox, "success", "¡Reserva confirmada y pagada con éxito!");

            setTimeout(() => {
                window.location.href = "/student/availability";
            }, 2000);

        } catch (err) {
            console.error("Error al confirmar la reserva:", err);
            showState(messageBox, "error", err.message || "Error al confirmar la reserva.");
        } finally {
            confirmBtn.disabled = false;
        }
    });

    // ============================
    // 3) Cancelar reserva
    // ============================
    cancelBtn.addEventListener("click", () => {
        if (confirm("¿Seguro que deseas cancelar esta reserva?")) {
            sessionStorage.removeItem("pendingBooking");
            window.location.href = "/student/availability";
        }
    });
});
