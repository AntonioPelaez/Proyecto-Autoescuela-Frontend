document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;

    const nameEl = document.getElementById("student-name");
    const latestAvgEl = document.getElementById("latest-average");
    const globalAvgEl = document.getElementById("global-average");
    const reportsBtn = document.getElementById("reports-button");
    const historyBtn = document.getElementById("history-button");
    const readyEl = document.getElementById("ready-status");

    const tableHead = document.getElementById("skills-table-head");
    const tableBody = document.getElementById("skills-table-body");

    try {
        // 1. Datos del alumno
        const student = await Api.getStudent(studentId);

        const fullName =
            (student.user?.name ?? student.name ?? "Sin nombre") + " " +
            (student.user?.surname ?? student.surname ?? "");

        nameEl.innerHTML = fullName;

        reportsBtn.href = `/teacher/student-evaluations/${studentId}/reports`;
        historyBtn.href = `/teacher/student-evaluations/${studentId}/history`;

        // 2. Resumen general
        const summary = await Api.getStudentSkillEvaluationSummary(studentId);

        const globalAvg = summary.skills_summary.length
            ? (
                summary.skills_summary.reduce((acc, s) => acc + (s.average ?? 0), 0)
                / summary.skills_summary.length
            ).toFixed(2)
            : "—";

        globalAvgEl.innerHTML = globalAvg;

        // Preparación
        readyEl.innerHTML = summary.ready_for_exam
            ? '<span class="badge bg-success">Preparado</span>'
            : '<span class="badge bg-danger">No preparado</span>';

        // 3. Histórico para tabla de skills
        const history = await Api.getStudentSkillEvaluationHistory(studentId);

        if (!history.length) {
            tableBody.innerHTML = `
                <tr><td colspan="20">No hay clases evaluadas.</td></tr>
            `;
            return;
        }

        // Obtener lista de skills dinámicamente
        const allSkills = history[0].skill_evaluations.map(s => s.driving_skill.name);

        // Construir cabecera
        tableHead.innerHTML = `
            <tr>
                <th>ID Clase</th>
                ${allSkills.map(skill => `<th>${skill}</th>`).join("")}
            </tr>
        `;

        // Construir filas
        tableBody.innerHTML = history.map(ev => `
            <tr>
                <td>${ev.class_session.id}</td>
                ${ev.skill_evaluations.map(s => `<td>${s.score}</td>`).join("")}
            </tr>
        `).join("");

        // 4. Media última clase
        const last = history[0];
        const lastAvg = last.skill_evaluations.length
            ? (
                last.skill_evaluations.reduce((acc, s) => acc + (s.score ?? 0), 0)
                / last.skill_evaluations.length
            ).toFixed(2)
            : "—";

        latestAvgEl.innerHTML = lastAvg;

    } catch (err) {
        console.error(err);
        nameEl.innerHTML = "Error cargando datos del alumno";
    }
});
