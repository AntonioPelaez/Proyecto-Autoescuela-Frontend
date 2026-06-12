document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle-select");
    const saveBtn = document.getElementById("save-fuel");

    // 1. Cargar vehículos reales
    try {
        const response = await Api.getVehicles();
        const vehicles = response.vehicles || [];

        vehicles.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = `${v.brand} ${v.model} — ${v.plate_number}`;
            vehicleSelect.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando vehículos", err);
    }

    // 2. Guardar
    saveBtn.addEventListener("click", async () => {

        const data = {
            vehicle_id: vehicleSelect.value,
            date: document.getElementById("month").value + "-01",
            liters: document.getElementById("liters").value,
            kilometers: document.getElementById("km").value,
            amount: document.getElementById("amount").value,
            notes: document.getElementById("notes").value
        };

        try {
            await Api.createFuelLog(data);
            window.location.href = "/admin/fuel";
        } catch (err) {
            console.error("Error guardando:", err);
            alert("Error guardando el registro");
        }
    });

});
