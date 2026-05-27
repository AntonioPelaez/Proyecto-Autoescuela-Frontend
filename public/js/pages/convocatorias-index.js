document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#convocatorias-table tbody");

    try {
        const convocatorias = await Api.getExamCalls(); // devuelve un array directo

        tableBody.innerHTML = "";

        if (!Array.isArray(convocatorias) || convocatorias.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay convocatorias creadas</td>
                </tr>
            `;
            return;
        }


        convocatorias.forEach(call => {
            const row = document.createElement("tr");

            // Formatear fecha y hora
            const fechaHora = call.exam_date && call.start_time
                ? `${call.exam_date} ${call.start_time}`
                : '-';

            // Nombre del pueblo
            const townName = call.town?.name ?? '-';

            // Contar profesores y vehículos únicos
            const teachersSet = new Set();
            const vehiclesSet = new Set();
            if (Array.isArray(call.exam_students)) {
                call.exam_students.forEach(s => {
                    if (s.teacher_id) teachersSet.add(s.teacher_id);
                    if (s.vehicle_id) vehiclesSet.add(s.vehicle_id);
                });
            }
            const teachersCount = teachersSet.size;
            const vehiclesCount = vehiclesSet.size;
            const studentsCount = call.exam_students?.length ?? 0;

            row.innerHTML = `
                <td>${fechaHora}</td>
                <td>${townName}</td>
                <td>${teachersCount}</td>
                <td>${vehiclesCount}</td>
                <td>${studentsCount}</td>
                <td>${call.exam_call_status?.label ?? call.exam_call_status?.name ?? '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" data-id="${call.id}" data-action="edit">Editar</button>
                    <button class="btn btn-sm btn-danger" data-id="${call.id}" data-action="cancel">Cancelar</button>
                    <button class="btn btn-sm btn-success" data-id="${call.id}" data-action="complete">Completar</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error cargando convocatorias:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Error cargando convocatorias</td>
            </tr>
        `;
    }
});
