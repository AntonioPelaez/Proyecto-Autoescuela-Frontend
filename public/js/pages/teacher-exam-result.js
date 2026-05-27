document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#exam-result-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const payload = {
            result: formData.get("result"),
            notes: formData.get("notes"),
        };

        try {
            await Api.saveExamResult(studentId, payload); // endpoint nuevo
            ui.showToast("Resultado guardado", "success");
            router.go("/teacher/panel");
        } catch {
            ui.showToast("Error guardando resultado", "error");
        }
    });

});
