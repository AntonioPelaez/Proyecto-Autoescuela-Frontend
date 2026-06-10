document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle-select");
    const classSelect = document.getElementById("class-select");
    const expenseTypeSelect = document.getElementById("expense-type");

    //
    // 1. Cargar vehículos
    //
    try {
        const vehiclesResponse = await Api.getVehicles();
        const vehicles = vehiclesResponse.vehicles || [];

        vehicles.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = `${v.brand} ${v.model} — ${v.plate_number}`;
            vehicleSelect.appendChild(opt);
        });

    } catch (err) {
        console.error(err);
        vehicleSelect.innerHTML = `<option>Error cargando vehículos</option>`;
    }

    //
    // 2. Cuando se elige vehículo → cargar clases
    //
    vehicleSelect.addEventListener("change", async () => {

        const vehicleId = vehicleSelect.value;

        classSelect.innerHTML = `<option disabled selected>Cargando clases...</option>`;
        classSelect.disabled = true;

        try {
            const classesResponse = await Api.getAdminClasses();
            const classes = Array.isArray(classesResponse)
                ? classesResponse
                : classesResponse.data || [];

            const filtered = classes.filter(c => c.vehicle_id == vehicleId);

            classSelect.innerHTML = `<option disabled selected>Selecciona clase</option>`;

            filtered.forEach(c => {
                const fecha = c.session_date;
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.textContent = `${fecha} — ${c.start_time} a ${c.end_time}`;
                classSelect.appendChild(opt);
            });

            classSelect.disabled = false;

        } catch (err) {
            console.error(err);
            classSelect.innerHTML = `<option>Error cargando clases</option>`;
        }
    });

    //
    // 3. Cargar tipos de gasto
    //
    const expenseTypes = [
        "Lavado de coches",
        "Reparación del chasis",
        "Sustitución de la batería",
        "Arreglo de la correa de distribución",
        "Mantenimiento de cristales",
        "Mantenimiento de las luces",
        "Arreglo del panel de instrumentos",
        "Mantenimiento de asientos y cinturones de seguridad",
        "Sustitución de ruedas",
        "Mantenimiento de la suspensión del coche",
        "Mantenimiento de los frenos del coche",
        "Mantenimiento de los pedales del coche",
        "Mantenimiento del embrague y acelerador del coche",
        "Mantenimiento del motor del coche",
        "Revisión de líquidos (limpiaparabrisas y refrigerante)",
        "Sustitución del aceite del coche"
    ];

    expenseTypes.forEach((t, index) => {
        const opt = document.createElement("option");
        opt.value = index + 1; // ID temporal
        opt.textContent = t;
        expenseTypeSelect.appendChild(opt);
    });

});
