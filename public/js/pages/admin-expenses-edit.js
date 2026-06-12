document.addEventListener("DOMContentLoaded", async () => {

    const expenseId = document.getElementById("expense_id").value;
    const vehicleSelect = document.getElementById("vehicle_id");

    // Cargar vehículos
    const vehicles = await Api.getVehicles();
    vehicles.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = `${v.brand} ${v.model} — ${v.plate_number}`;
        vehicleSelect.appendChild(opt);
    });

    // Cargar datos del gasto
    try {
        const exp = await Api.getVehicleExpense(expenseId);

        document.getElementById("amount").value = exp.amount;
        document.getElementById("description").value = exp.description ?? "";
        document.getElementById("date").value = exp.created_at.substring(0, 10);
        vehicleSelect.value = exp.vehicle_id;

    } catch (err) {
        console.error("Error cargando gasto:", err);
        alert("Error cargando datos del gasto");
    }

    // Guardar cambios
    document.getElementById("update-expense").addEventListener("click", async () => {

        const data = {
            vehicle_id: vehicleSelect.value,
            amount: Number(document.getElementById("amount").value),
            description: document.getElementById("description").value,
            created_at: document.getElementById("date").value
        };

        try {
            await Api.updateVehicleExpense(expenseId, data);
            alert("Gasto actualizado correctamente");
            window.location.href = "/admin/expenses";

        } catch (err) {
            console.error("Error actualizando gasto:", err);
            alert("Error actualizando gasto");
        }
    });

});
