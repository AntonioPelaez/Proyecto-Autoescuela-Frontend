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
                (ev.class_session?.teacher?.user?.name ?? ev.class_session?.teacher?.name ?? "Desconocido") +
                " " +
                (ev.class_session?.teacher?.user?.surname ?? ev.class_session?.teacher?.surname ?? "");

            return `
                <div class="card card-body mb-3">
                    <h4>Clase del ${ev.class_session.session_date} — ${ev.class_session.start_time}</h4>
                    <p><strong>Profesor:</strong> ${teacherName}</p>
                    <p><strong>Reporte:</strong></p>
                    <p>${ev.report_text ?? 'Sin reporte'}</p>
                </div>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error cargando los reportes.</p>";
    }
});
