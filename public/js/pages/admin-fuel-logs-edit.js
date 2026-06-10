document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle-select");
    const saveBtn = document.getElementById("save-fuel");

    // 1. Cargar vehículos reales
    let vehicles = [];
    try {
        const response = await Api.getVehicles();
        vehicles = response.vehicles || [];

        vehicleSelect.innerHTML = `<option disabled selected>Selecciona vehículo</option>`;

        vehicles.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = `${v.brand} ${v.model} — ${v.plate_number}`;
            vehicleSelect.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando vehículos", err);
    }

    // 2. Cargar datos del registro
    let fuelLog = null;

    try {
        const response = await Api.getFuelLog(FUEL_LOG_ID);
        fuelLog = response.data;

        vehicleSelect.value = fuelLog.vehicle_id;
        document.getElementById("month").value = fuelLog.date.substring(0, 7);
        document.getElementById("liters").value = fuelLog.liters;
        document.getElementById("km").value = fuelLog.kilometers;
        document.getElementById("amount").value = fuelLog.amount;
        document.getElementById("notes").value = fuelLog.notes || "";

    } catch (err) {
        console.error("Error cargando registro", err);
    }

    // 3. Guardar cambios
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
            await Api.updateFuelLog(FUEL_LOG_ID, data);
            window.location.href = "/admin/fuel";
        } catch (err) {
            console.error("Error actualizando:", err);
            alert("Error actualizando el registro");
        }
    });

});
