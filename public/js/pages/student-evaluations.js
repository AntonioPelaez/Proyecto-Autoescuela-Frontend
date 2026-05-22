document.addEventListener("DOMContentLoaded", async () => {

    const tbody = document.getElementById("students-table-body");

    try {
        console.log("Cargando alumnos...");
        const students = await Api.getStudents(); // ✔ ESTA FUNCIÓN SÍ EXISTE
        console.log("Respuesta API:", students);

        if (!students || !students.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4">No hay alumnos registrados.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = students.map(s => {

            const fullName =
                (s.user?.name ?? s.name ?? "Sin nombre") + " " +
                (s.user?.surname ?? s.surname ?? "");

            return `
                <tr>
                    <td>${fullName}</td>
                    <td>${s.total_classes ?? 0}</td>
                    <td>
                        <span class="badge ${s.ready_for_exam ? 'bg-success' : 'bg-danger'}">
                            ${s.ready_for_exam ? 'Sí' : 'No'}
                        </span>
                    </td>
                    <td>
                        <a href="/teacher/student-evaluations/${s.id}" class="btn btn-primary btn-sm">
                            Ver progreso
                        </a>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("ERROR AL CARGAR ALUMNOS:", err);

        tbody.innerHTML = `
            <tr>
                <td colspan="4">Error cargando alumnos.</td>
            </tr>
        `;
    }
});
