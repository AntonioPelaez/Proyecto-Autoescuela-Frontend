document.addEventListener("DOMContentLoaded", async () => {

    const loader = document.getElementById("loader-expenses");
    const tableBody = document.getElementById("expenses-table-body");

    if (!loader || !tableBody) {
        console.warn("⚠️ admin-expenses-index.js cargado en una página sin tabla de gastos.");
        return;
    }

    loader.classList.remove("d-none");

    try {
        const response = await Api.getVehicleExpenses();

        console.log("RESPUESTA API:", response);

        const expenses = Array.isArray(response)
            ? response
            : (response.expenses || response.data || []);

        if (!expenses || expenses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-muted text-center">
                        No hay gastos registrados.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = expenses.map(exp => `
            <tr>
                <td>${exp.id}</td>
                <td>${exp.vehicle?.plate_number ?? "—"}</td>
                <td>${formatDate(exp.created_at)}</td>
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

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    Error cargando los gastos.
                </td>
            </tr>
        `;
    } finally {
        loader.classList.add("d-none");
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
