document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;
    const tableBody = document.getElementById("exam-history-body");

    try {
        // 1. Obtener historial de exámenes del alumno
        const exams = await Api.getStudentExamHistory(studentId);

        // 2. Filtrar solo los finalizados
        const finalizadas = exams.filter(e => e.status === "finalizada");

        if (!finalizadas.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-3">
                        No hay exámenes finalizados.
                    </td>
                </tr>
            `;
            return;
        }

        // 3. Pintar tabla
        tableBody.innerHTML = finalizadas.map(exam => `
            <tr>
                <td>${exam.date ?? "—"}</td>
                <td>${exam.result ?? "—"}</td>
                <td>${exam.notes ?? "—"}</td>
            </tr>
        `).join("");

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger py-3">
                    Error cargando historial de exámenes.
                </td>
            </tr>
        `;
    }
});
