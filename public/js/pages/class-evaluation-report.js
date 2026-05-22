document.addEventListener("DOMContentLoaded", async () => {

    const classId = window.CLASS_SESSION_ID;
    const form = document.getElementById("report-form");
    const reportTextEl = document.getElementById("report-text");
    const readyCheckbox = document.getElementById("ready-checkbox");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const reportText = reportTextEl.value.trim();
        if (!reportText) {
            UI.showToast("El reporte no puede estar vacío", "error");
            return;
        }

        const stored = sessionStorage.getItem(`class_eval_${classId}`);
        if (!stored) {
            UI.showToast("No se encontraron las puntuaciones de habilidades.", "error");
            return;
        }

        const { scores } = JSON.parse(stored);

        const readyForExam = readyCheckbox.checked ? 1 : 0;

        UI.setLoading(true);

        try {
            await Api.createStudentSkillEvaluation({
                class_session_id: classId,
                report_text: reportText,
                ready_for_exam: readyForExam,
                evaluations: scores
            });

            sessionStorage.removeItem(`class_eval_${classId}`);

            UI.showToast("Evaluación guardada correctamente", "info");
            window.location.href = "/teacher/classes";

        } catch (err) {
            console.error(err);
            UI.showToast(err.message || "Error guardando evaluación", "error");
        } finally {
            UI.setLoading(false);
        }
    });
});
