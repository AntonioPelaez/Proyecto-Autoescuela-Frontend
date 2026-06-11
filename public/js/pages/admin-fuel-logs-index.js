document.addEventListener("DOMContentLoaded", async () => {

    const monthSelect = document.getElementById("month-select");
    const tableBody = document.getElementById("fuel-logs-table");

    monthSelect.addEventListener("change", async () => {

        const month = monthSelect.value;
        if (!month) return;

        try {
            const response = await Api.getFuelLogs({ month });
            const logs = response.data || [];

            if (logs.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-muted">No hay registros este mes.</td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = logs.map(l => `
                <tr>
                    <td>${l.vehicle.brand} ${l.vehicle.model} — ${l.vehicle.plate_number}</td>
                    <td>${l.liters} L</td>
                    <td>${l.kilometers} km</td>
                    <td class="text-end">
                        <a href="/admin/fuel/${l.id}/edit" class="btn btn-sm btn-secondary">Editar</a>
                    </td>
                </tr>
            `).join("");

        } catch (err) {
            console.error(err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-danger">Error cargando datos.</td>
                </tr>
            `;
        }
    });

});
