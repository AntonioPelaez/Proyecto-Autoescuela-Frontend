console.log("🔥 JS CORRECTO CARGADO");

document.addEventListener("DOMContentLoaded", async () => {

    const title = document.getElementById("edit-title");

    const vehicleSelect = document.getElementById("vehicle-select");
    const monthInput = document.getElementById("month");
    const litersInput = document.getElementById("liters");
    const kmInput = document.getElementById("km");
    const amountInput = document.getElementById("amount");
    const notesInput = document.getElementById("notes");

    // Loaders
    const loaderVehicles = document.getElementById("loader-vehicles");
    const loaderLiters = document.getElementById("loader-liters");
    const loaderKm = document.getElementById("loader-km");
    const loaderAmount = document.getElementById("loader-amount");
    const loaderNotes = document.getElementById("loader-notes");

    // -------------------------------
    // MOSTRAR LOADERS
    // -------------------------------
    loaderVehicles.classList.remove("d-none");
    loaderLiters.classList.remove("d-none");
    loaderKm.classList.remove("d-none");
    loaderAmount.classList.remove("d-none");
    loaderNotes.classList.remove("d-none");

    litersInput.readOnly = true;
    kmInput.readOnly = true;
    amountInput.readOnly = true;
    notesInput.readOnly = true;

    let fuelLog = null;

    // -------------------------------
    // 1. CARGAR REGISTRO
    // -------------------------------
    try {
        const response = await Api.getFuelLog(FUEL_LOG_ID);
        fuelLog = response.data || response;

        const monthValue =
            fuelLog.month ||
            fuelLog.date?.substring(0, 7) ||
            "";
        monthInput.value = monthValue;

        litersInput.readOnly = false;
        litersInput.value = fuelLog.liters ?? "";

        kmInput.readOnly = false;
        kmInput.value = fuelLog.kilometers ?? "";

        amountInput.readOnly = false;
        amountInput.value = fuelLog.amount ?? "";

        notesInput.readOnly = false;
        notesInput.value = fuelLog.notes ?? "";

        loaderLiters.classList.add("d-none");
        loaderKm.classList.add("d-none");
        loaderAmount.classList.add("d-none");
        loaderNotes.classList.add("d-none");

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

        loaderVehicles.classList.add("d-none");

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
