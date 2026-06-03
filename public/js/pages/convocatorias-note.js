document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#convocatoria-note-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const notes = document.querySelector("#notes").value.trim();

        const raw = sessionStorage.getItem("new_exam_call_data");
        if (!raw) {
            UI.showToast("No hay datos de convocatoria para crear", "error");
            return;
        }

        const payload = JSON.parse(raw);
        payload.notes = notes;

        try {
            await Api.createExamCall(payload);

            sessionStorage.removeItem("new_exam_call_data");

            UI.showToast("Convocatoria creada correctamente", "success");
            window.location.href = "/admin/convocatorias";

        } catch (err) {
            UI.showToast("Error al crear la convocatoria", "error");
        }
    });

});
