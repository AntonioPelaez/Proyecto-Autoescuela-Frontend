document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle-select");
    const classSelect = document.getElementById("class-select");
    const expensesContainer = document.getElementById("vehicle-expenses-container");

    let filteredClasses = [];

    // ---------------------------------------------------------
    // 1. Cargar vehículos
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // Función: obtener gastos reales del backend
    // ---------------------------------------------------------
    async function getExpensesForClass(vehicleId, classSessionId) {
        const response = await Api.getVehicleExpenses({ vehicle_id: vehicleId });
        const expenses = response.expenses || [];

        return expenses.filter(e => e.class_session_id == classSessionId);
    }

    function formatDate(dateStr) {
		if (!dateStr) return '-';
		try {
			const date = new Date(dateStr);
			const day = String(date.getDate()).padStart(2, '0');
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const year = date.getFullYear();
			return `${day}/${month}/${year}`;
		} catch (_) {
			return dateStr;
		}
	}

    // ---------------------------------------------------------
    // 2. Cargar clases según vehículo
    // ---------------------------------------------------------
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
                opt.textContent = `${formatDate(fecha)} — ${c.start_time} a ${c.end_time}`;
                classSelect.appendChild(opt);
            });

            classSelect.disabled = false;

        } catch (err) {
            console.error(err);
            classSelect.innerHTML = `<option>Error cargando clases</option>`;
        }
    });

    // ---------------------------------------------------------
    // 3. Mostrar gastos reales de la clase seleccionada
    // ---------------------------------------------------------
    classSelect.addEventListener("change", async () => {

        const classId = classSelect.value;
        const vehicleId = vehicleSelect.value;

        const selectedClass = filteredClasses.find(c => c.id == classId);

        const fecha = selectedClass.session_date;
        const horaInicio = selectedClass.start_time;
        const horaFin = selectedClass.end_time;

        // Obtener gastos reales del backend
        const expenses = await getExpensesForClass(vehicleId, classId);

        // Agrupar totales por tipo de gasto
        const totals = {};
        expenses.forEach(e => {
            if (!totals[e.expense_type_id]) totals[e.expense_type_id] = 0;
            totals[e.expense_type_id] += parseFloat(e.amount);
        });

        // Lista de tipos de gasto
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

        // Construir filas con totales reales
        const rows = expenseTypes.map((name, index) => {
            const typeId = index + 1;
            const total = totals[typeId] ? totals[typeId].toFixed(2) : "0.00";

            return `
                <tr>
                    <td>${name}</td>
                    <td>${total} €</td>
                    <td class="text-end">
                        <a href="/admin/expenses/${typeId}/edit" class="btn btn-sm btn-secondary">
                            Editar
                        </a>
                    </td>
                </tr>
            `;
        }).join("");

        // Pintar tabla
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
