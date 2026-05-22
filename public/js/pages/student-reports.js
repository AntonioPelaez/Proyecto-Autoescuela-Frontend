document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;
    const container = document.getElementById("reports-container");

    try {
        const reports = await Api.getStudentSkillEvaluationHistory(studentId);

        if (!reports.length) {
            container.innerHTML = "<p>No hay reportes escritos.</p>";
            return;
        }

        container.innerHTML = reports.map(ev => {

            const teacherName =
                (ev.teacher_profile?.user?.name ?? "Desconocido") + " " +
                ((ev.teacher_profile?.user?.surname1 ?? "") + " " +
                (ev.teacher_profile?.user?.surname2 ?? "")).trim();

            // AHORA el reporte está en ev.notes, no en skill_evaluations
            const reportText = ev.notes?.trim() || "Sin reporte";

            return `
                <div class="card card-body mb-3">
                    <h4>Clase del ${ev.class_session.session_date} — ${ev.class_session.start_time}</h4>
                    <p><strong>Profesor:</strong> ${teacherName}</p>
                    <p><strong>Reporte:</strong></p>
                    <p>${reportText}</p>
                </div>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error cargando los reportes.</p>";
    }
});
