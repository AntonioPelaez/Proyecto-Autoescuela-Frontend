document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("expenses-table-container");

    try {
        const expenses = await Api.getVehicleExpenses(); // tu endpoint

        if (!expenses || expenses.length === 0) {
            container.innerHTML = `<p class="text-muted">No hay gastos registrados.</p>`;
            return;
        }

        const rows = expenses.map(exp => `
            <tr>
                <td>${exp.id}</td>
                <td>${exp.vehicle?.plate ?? "—"}</td>
                <td>${exp.type?.name ?? "—"}</td>
                <td>${formatDate(exp.date)}</td>
                <td>${Number(exp.amount).toFixed(2)} €</td>
                <td>${exp.description ?? "—"}</td>
                <td class="text-end">
                    <a href="/admin/expenses/${exp.id}/edit" class="btn btn-sm btn-secondary">Editar</a>
                    <button class="btn btn-sm btn-danger" onclick="deleteExpense(${exp.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join("");

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehículo</th>
                            <th>Tipo</th>
                            <th>Fecha</th>
                            <th>Importe</th>
                            <th>Descripción</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-danger">Error cargando los gastos.</p>`;
    }
});

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

async function deleteExpense(id) {
    if (!confirm("¿Eliminar gasto?")) return;

    try {
        await Api.deleteVehicleExpense(id);
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Error eliminando gasto.");
    }
}
