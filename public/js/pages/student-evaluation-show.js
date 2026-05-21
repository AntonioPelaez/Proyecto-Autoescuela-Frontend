document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;

    // Elementos del DOM
    const nameEl = document.getElementById("student-name");
    const latestAvgEl = document.getElementById("latest-average");
    const globalAvgEl = document.getElementById("global-average");
    const reportsBtn = document.getElementById("reports-button");
    const historyBtn = document.getElementById("history-button");
    const summaryEl = document.getElementById("skills-summary");
    const weakEl = document.getElementById("weak-areas");
    const readyEl = document.getElementById("ready-status");

    try {
        // 1. Obtener datos del alumno
        const student = await Api.getStudent(studentId);

        // Nombre seguro
        const fullName =
            (student.user?.name ?? student.name ?? "Sin nombre") + " " +
            (student.user?.surname ?? student.surname ?? "");

        nameEl.innerHTML = fullName;

        // Enlaces
        reportsBtn.href = `/teacher/student-evaluations/${studentId}/reports`;
        historyBtn.href = `/teacher/student-evaluations/${studentId}/history`;

        // 2. Resumen de habilidades
        const summary = await Api.getStudentSkillEvaluationSummary(studentId);

        // Media global
        const globalAvg = summary.skills_summary.length
            ? (
                summary.skills_summary.reduce((acc, s) => acc + (s.average ?? 0), 0)
                / summary.skills_summary.length
            ).toFixed(2)
            : "—";

        globalAvgEl.innerHTML = globalAvg;

        // 3. Histórico para media de última clase
        const history = await Api.getStudentSkillEvaluationHistory(studentId);

        if (history.length > 0) {
            const last = history[0];
            const lastAvg = last.skill_evaluations.length
                ? (
                    last.skill_evaluations.reduce((acc, s) => acc + (s.score ?? 0), 0)
                    / last.skill_evaluations.length
                ).toFixed(2)
                : "—";

            latestAvgEl.innerHTML = lastAvg;
        } else {
            latestAvgEl.innerHTML = "—";
        }

        // 4. Resumen habilidades
        summaryEl.innerHTML = summary.skills_summary.length
            ? summary.skills_summary.map(s => `
                <div class="mb-2">
                    <strong>${s.skill}</strong>:
                    media ${s.average}, evaluaciones ${s.times_evaluated}
                </div>
            `).join("")
            : "<p>No hay evaluaciones.</p>";

        // 5. Áreas débiles
        weakEl.innerHTML = summary.weak_areas.length
            ? summary.weak_areas.map(w => `
                <div class="mb-2">
                    <strong>${w.skill}</strong>: media ${w.average}
                </div>
            `).join("")
            : "<p>No hay áreas débiles.</p>";

        // 6. Preparación
        readyEl.innerHTML = `
            <p><strong>Estado:</strong>
            <span class="badge ${summary.ready_for_exam ? 'badge-success' : 'badge-danger'}">
                ${summary.ready_for_exam ? 'Preparado' : 'No preparado'}
            </span></p>
        `;

    } catch (err) {
        console.error(err);
        nameEl.innerHTML = "Error cargando datos del alumno";
    }
});
