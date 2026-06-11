document.addEventListener("DOMContentLoaded", async () => {

    const title = document.getElementById("edit-title");

    const vehicleSelect = document.getElementById("vehicle-select");
    const monthInput = document.getElementById("month");
    const litersInput = document.getElementById("liters");
    const kmInput = document.getElementById("km");
    const amountInput = document.getElementById("amount");
    const notesInput = document.getElementById("notes");

    // -------------------------------
    // LOADERS IGUALES AL DE VEHÍCULOS
    // -------------------------------

    // SELECT → usa <option>
    vehicleSelect.innerHTML = `<option>Cargando vehículos...</option>`;

    // INPUTS → usan value + readOnly
    litersInput.value = "Cargando litros...";
    litersInput.readOnly = true;

    kmInput.value = "Cargando kilómetros...";
    kmInput.readOnly = true;

    amountInput.value = "Cargando monto...";
    amountInput.readOnly = true;

    // TEXTAREA → usa value + readOnly
    notesInput.value = "Cargando notas...";
    notesInput.readOnly = true;

    let fuelLog = null;

    // -------------------------------
    // 1. CARGAR REGISTRO
    // -------------------------------
    try {
        const response = await Api.getFuelLog(FUEL_LOG_ID);
        fuelLog = response.data || response;

        // Mes (NO lleva loader)
        const monthValue =
            fuelLog.month ||
            fuelLog.date?.substring(0, 7) ||
            "";
        monthInput.value = monthValue;

        // Litros
        litersInput.readOnly = false;
        litersInput.value = fuelLog.liters ?? "";

        // Km
        kmInput.readOnly = false;
        kmInput.value = fuelLog.kilometers ?? "";

        // Monto
        amountInput.readOnly = false;
        amountInput.value = fuelLog.amount ?? "";

        // Notas
        notesInput.readOnly = false;
        notesInput.value = fuelLog.notes ?? "";

    } catch (err) {
        console.error(err);
        alert("Error cargando el registro.");
        return;
    }

    // -------------------------------
    // 2. CARGAR VEHÍCULOS
    // -------------------------------
    try {
        let response = await Api.getVehicles();

        const vehicles =
            response.vehicles ||
            response.data ||
            response ||
            [];

        if (!Array.isArray(vehicles) || vehicles.length === 0) {
            vehicleSelect.innerHTML = `<option>No hay vehículos</option>`;
        } else {
            vehicleSelect.innerHTML = vehicles.map(v => `
                <option value="${v.id}">
                    ${v.brand} ${v.model} — ${v.plate_number}
                </option>
            `).join("");

            vehicleSelect.value = fuelLog.vehicle_id;
        }

        const selected = vehicles.find(v => v.id == fuelLog.vehicle_id);

        if (selected) {
            title.textContent =
                `Editar gasto — ${selected.brand} ${selected.model} (${monthInput.value})`;
        }

    } catch (err) {
        console.error(err);
        vehicleSelect.innerHTML = `<option>Error cargando vehículos</option>`;
    }

    // -------------------------------
    // 3. GUARDAR CAMBIOS
    // -------------------------------
    document.getElementById("save-fuel").addEventListener("click", async () => {

        const payload = {
            vehicle_id: vehicleSelect.value,
            month: monthInput.value,
            liters: litersInput.value,
            kilometers: kmInput.value,
            amount: amountInput.value,
            notes: notesInput.value
        };

        try {
            await Api.updateFuelLog(FUEL_LOG_ID, payload);
            alert("Registro actualizado correctamente.");
            window.location.href = "/admin/fuel";
        } catch (err) {
            console.error(err);
            alert("Error guardando cambios.");
        }
    });

});
