document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("students-list");

    if (!container) return;

    container.innerHTML = "<p>Cargando alumnos...</p>";

    try {
        // 1. Obtener todos los alumnos
        const students = await Api.getStudents();

        container.innerHTML = "";

        for (const student of students) {

            // 2. Obtener resumen del alumno
            const summary = await Api.getStudentSkillEvaluationSummary(student.id);

            const totalClasses = summary.skills_summary.reduce(
                (acc, s) => acc + s.times_evaluated,
                0
            );

            const ready = summary.ready_for_exam;

            // 3. Crear elemento visual
            const item = document.createElement("div");
            item.classList.add("student-item");

            item.innerHTML = `
                <div class="student-info">
                    <h3>${student.user.name} ${student.user.surname}</h3>

                    <p><strong>Clases evaluadas:</strong> ${totalClasses}</p>

                    <p>
                        <strong>Preparado para examen:</strong>
                        <span class="badge ${ready ? 'badge-success' : 'badge-danger'}">
                            ${ready ? 'Sí' : 'No'}
                        </span>
                    </p>
                </div>

                <div class="student-actions">
                    <a href="/teacher/student-evaluations/${student.id}" class="btn btn-primary">
                        Ver progreso
                    </a>
                </div>
            `;

            container.appendChild(item);
        }

    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Error cargando alumnos.</p>";
    }
});
