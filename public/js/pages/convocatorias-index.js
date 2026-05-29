document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#convocatorias-table tbody");
    const loader = document.getElementById("convocatorias-loader");

    if (loader) loader.style.display = "block";

    try {
        const convocatorias = await Api.getExamCalls(); // devuelve un array directo

        if (loader) loader.style.display = "none";
        tableBody.innerHTML = "";

        if (!Array.isArray(convocatorias) || convocatorias.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay convocatorias creadas</td>
                </tr>
            `;
            return;
        }

        // 🔥 ELIMINAR DUPLICADOS EN LA VISTA
        const unique = {};
        convocatorias.forEach(call => {
            const key = `${call.exam_date}-${call.start_time}-${call.town_id}`;
            if (!unique[key]) {
                unique[key] = call;
            }
        });

        const listaFinal = Object.values(unique);

        listaFinal.forEach(call => {
            const row = document.createElement("tr");

            // Fecha y hora
            const fechaHora = call.exam_date && call.start_time
                ? `${call.exam_date} ${call.start_time}`
                : '-';

            // Pueblo
            const townName = call.town?.name ?? '-';

            // Profesores y vehículos únicos
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
                    <button class="btn btn-sm btn-primary" data-id="${call.id}" data-action="edit">Editar</button>

                    ${
                        call.exam_call_status?.name === "cancelada"
                            ? `<button class="btn btn-sm btn-warning" data-id="${call.id}" data-action="reactivate">Reactivar</button>`
                            : `<button class="btn btn-sm btn-danger" data-id="${call.id}" data-action="cancel">Cancelar</button>`
                    }

                    <button class="btn btn-sm btn-success" data-id="${call.id}" data-action="complete">Completar</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Delegación de eventos
        tableBody.addEventListener("click", async function (e) {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;

            const id = btn.getAttribute("data-id");
            const action = btn.getAttribute("data-action");

            if (action === "edit") {
                window.location.href = `/admin/convocatorias/${id}/editar`;
                return;
            }

            if (action === "cancel") {
                await Api.cancelExamCall(id);
                location.reload();
                return;
            }

            if (action === "complete") {
                await Api.completeExamCall(id);
                location.reload();
                return;
            }

            if (action === "reactivate") {
                await Api.toggleConvocation(id);
                location.reload();
                return;
            }
        });

    } catch (error) {
        if (loader) loader.style.display = "none";
        console.error("Error cargando convocatorias:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Error cargando convocatorias</td>
            </tr>
        `;
    }
});
