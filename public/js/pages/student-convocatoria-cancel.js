// student-convocatoria-cancel.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cancel-form");
    const reasonInput = document.getElementById("reason");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const examCallId = form.dataset.examCallId;
        const reason = reasonInput.value.trim();

        if (!reason) {
            alert("Debes indicar un motivo para cancelar.");
            return;
        }

        try {
            await Api.unconfirmExamCall(examCallId, null, { reason });

            window.location.href = "/student/convocatorias";
        } catch (err) {
            console.error(err);
            alert("Error al cancelar la inscripción.");
        }
    });
});
