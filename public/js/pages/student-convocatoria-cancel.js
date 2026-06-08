document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("cancel-form");
    const reasonInput = document.getElementById("reason");

    // 🔥 Obtener el usuario autenticado desde la API
    const me = await Api.getMe();
    const studentId = me.student_profile_id;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const examCallId = form.dataset.examCallId;
        const reason = reasonInput.value.trim();

        if (!reason) {
            alert("Debes indicar un motivo para cancelar.");
            return;
        }

        try {
            await Api.unconfirmExamCall(examCallId, studentId, { motive: reason });

            window.location.href = "/student/convocatorias";
        } catch (err) {
            console.error(err);
            alert("Error al cancelar la inscripción.");
        }
    });
});
