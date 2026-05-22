document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;
    const container = document.getElementById("reports-container");

    if (!studentId) {
        container.innerHTML = "<p>Error: no se encontró el ID del alumno.</p>";
        return;
    }

    try {
        const reports = await Api.getStudentSkillEvaluationHistory(studentId);

        if (!Array.isArray(reports) || reports.length === 0) {
            container.innerHTML = "<p>No hay reportes escritos.</p>";
            return;
        }

        container.innerHTML = reports.map(ev => {

            const teacher = ev.teacher_profile?.user;
            const teacherName = teacher
                ? `${teacher.name} ${teacher.surname1 ?? ""} ${teacher.surname2 ?? ""}`.trim()
                : "Desconocido";

            const date = ev.class_session?.session_date ?? "Sin fecha";
            const time = ev.class_session?.start_time ?? "Sin hora";

            const notes = ev.notes?.trim() || "Sin reporte";

            return `
                <div class="card card-body mb-3">
                    <h4>Clase del ${date} — ${time}</h4>
                    <p><strong>Profesor:</strong> ${teacherName}</p>
                    <p><strong>Reporte:</strong></p>
                    <p>${notes}</p>
                </div>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error cargando los reportes.</p>";
    }
});
