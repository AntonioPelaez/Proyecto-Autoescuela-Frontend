document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle-select");
    const classSelect = document.getElementById("class-select");
    const expenseRows = document.getElementById("expense-rows");
    const saveBtn = document.getElementById("save-expenses");

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
    }

    //
    // 2. Cargar clases según vehículo (solo clases sin gastos)
    //
    vehicleSelect.addEventListener("change", async () => {

        const vehicleId = vehicleSelect.value;

        classSelect.innerHTML = `<option disabled selected>Cargando clases...</option>`;
        classSelect.disabled = true;

        try {
            // Obtener clases
            const classesResponse = await Api.getAdminClasses();
            const classes = Array.isArray(classesResponse)
                ? classesResponse
                : classesResponse.data || [];

            // Obtener gastos del vehículo
            const expensesResponse = await Api.getVehicleExpenses({ vehicle_id: vehicleId });
            const expenses = expensesResponse.expenses || [];

            // Filtrar clases SIN gastos
            const classesSinGastos = classes.filter(c => {
                const gastosDeLaClase = expenses.filter(e => e.class_session_id == c.id);
                return gastosDeLaClase.length === 0;
            });

            classSelect.innerHTML = `<option disabled selected>Selecciona clase</option>`;

            classesSinGastos.forEach(c => {
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
    // 3. Generar filas de gastos
    //
    expenseTypes.forEach((name, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${name}</td>
            <td>
                <input type="number" step="0.01" class="form-control" data-type-id="${index + 1}">
            </td>
            <td>
                <input type="text" class="form-control" data-desc-id="${index + 1}">
            </td>
        `;

        expenseRows.appendChild(row);
    });

    //
    // 4. Guardar (simulado, sin popups)
    //
    saveBtn.addEventListener("click", async () => {

    const vehicleId = vehicleSelect.value;
    const classSessionId = classSelect.value;

    if (!vehicleId || !classSessionId) {
        alert("Selecciona vehículo y clase antes de guardar.");
        return;
    }

    const gastos = [];

    document.querySelectorAll("input[data-type-id]").forEach(input => {
        const typeId = input.dataset.typeId;
        const amount = input.value;
        const desc = document.querySelector(`input[data-desc-id="${typeId}"]`).value;

        if (amount && amount > 0) {
            gastos.push({
                vehicle_id: vehicleId,
                class_session_id: classSessionId,
                expense_type_id: typeId,
                amount: amount,
                description: desc
            });
        }
    });

    // Enviar cada gasto al backend
    for (const gasto of gastos) {
        try {
            await Api.createVehicleExpense(gasto);
        } catch (err) {
            console.error("Error guardando gasto:", err);
        }
    }

    // Redirigir
    window.location.href = "/admin/expenses";
});


});
