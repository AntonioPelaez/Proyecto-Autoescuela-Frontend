document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle-select");
    const classSelect = document.getElementById("class-select");
    const expensesContainer = document.getElementById("vehicle-expenses-container");

    let filteredClasses = [];

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

        expensesContainer.innerHTML = `<p class="text-muted">Selecciona una clase.</p>`;

        try {
            const classesResponse = await Api.getAdminClasses();
            const classes = Array.isArray(classesResponse)
                ? classesResponse
                : classesResponse.data || [];

            filteredClasses = classes.filter(c => c.vehicle_id == vehicleId);

            classSelect.innerHTML = `<option disabled selected>Selecciona clase</option>`;

            filteredClasses.forEach(c => {
                const fecha = c.session_date || "Sin fecha";
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
    // 3. Cuando se elige clase → mostrar gastos estilo “poblaciones”
    //
    classSelect.addEventListener("change", () => {
        const classId = classSelect.value;

        const selectedClass = filteredClasses.find(c => c.id == classId);

        const fecha = selectedClass.session_date;
        const horaInicio = selectedClass.start_time;
        const horaFin = selectedClass.end_time;

        //
        // Tipos de gasto reales de tu tabla expense_types
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

        //
        // Construir filas estilo “poblaciones”
        //
        const rows = expenseTypes.map((name, index) => `
            <tr>
                <td>${name}</td>
                <td>0.00 €</td>
                <td class="text-end">
                    <a href="/admin/expenses/${index + 1}/edit" class="btn btn-sm btn-secondary">
                        Editar
                    </a>
                </td>
            </tr>
        `).join("");

        //
        // Render final
        //
        expensesContainer.innerHTML = `
            <div class="card card-body">
                <h5>Gastos de la clase del ${fecha} (${horaInicio} – ${horaFin})</h5>

                <div class="table-responsive mt-3">
                    <table class="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Nombre del gasto</th>
                                <th>Total gastado</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

});
