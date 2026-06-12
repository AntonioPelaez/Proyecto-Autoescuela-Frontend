document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle_id");
    const saveBtn = document.getElementById("save-expense");

    // Cargar vehículos
    try {
        const vehicles = await Api.getVehicles();

        vehicles.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = `${v.brand} ${v.model} — ${v.plate_number}`;
            vehicleSelect.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando vehículos:", err);
        alert("Error cargando vehículos");
    }

    // Guardar gasto
    saveBtn.addEventListener("click", async () => {

        const data = {
            vehicle_id: vehicleSelect.value,
            amount: Number(document.getElementById("amount").value),
            description: document.getElementById("description").value,
            created_at: document.getElementById("date").value
        };

        if (!data.vehicle_id || !data.amount || !data.created_at) {
            alert("Todos los campos son obligatorios");
            return;
        }

        try {
            await Api.createVehicleExpense(data);
            alert("Gasto creado correctamente");
            window.location.href = "/admin/expenses";

        } catch (err) {
            console.error("Error creando gasto:", err);
            alert("Error creando gasto");
        }
    });

});
