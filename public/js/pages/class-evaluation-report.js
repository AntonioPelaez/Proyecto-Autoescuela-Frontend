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

        // 🔥 AHORA SÍ: leemos TODO lo guardado
        const { scores, km_start, km_end } = JSON.parse(stored);

        // Validación de kilómetros
        if (!km_start || !km_end) {
            UI.showToast("Faltan los kilómetros de inicio o fin.", "error");
            return;
        }

        if (km_end < km_start) {
            UI.showToast("Los kilómetros finales no pueden ser menores que los iniciales.", "error");
            return;
        }

        const readyForExam = readyCheckbox.checked ? true : false;

        UI.setLoading(true);

        try {
            await Api.createStudentSkillEvaluation({
                id: classId,
                ready_for_exam: readyForExam,
                notes: reportText,

                // 🔥 NOMBRES EXACTOS QUE ESPERA TU BACKEND
                start_km: km_start,
                end_km: km_end,

                skills: scores.map(s => ({
                    driving_skill_id: s.skill_id,
                    score: s.score
                }))
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
