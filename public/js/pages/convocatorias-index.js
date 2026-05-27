document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#convocatorias-table tbody");

    try {
        const response = await api.get("/exam-calls"); // tu endpoint real
        const convocatorias = response.data;

        tableBody.innerHTML = "";

        if (convocatorias.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay convocatorias creadas</td>
                </tr>
            `;
            return;
        }

        convocatorias.forEach(call => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${call.date_time}</td>
                <td>${call.town.name}</td>
                <td>${call.teacher.user.name}</td>
                <td>${call.vehicle.plate}</td>
                <td>${call.students_count}</td>
                <td>${call.status.name}</td>
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
