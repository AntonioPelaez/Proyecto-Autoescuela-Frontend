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

            // Primer alumno (para obtener profesor y vehículo)
            const firstStudent = call.exam_students?.[0] ?? null;

            row.innerHTML = `
                <td>${call.exam_date} ${call.start_time}</td>
                <td>${call.town_id ?? '-'}</td>
                <td>${firstStudent?.teacher_id ?? '-'}</td>
                <td>${firstStudent?.vehicle_id ?? '-'}</td>
                <td>${call.exam_students?.length ?? 0}</td>
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
