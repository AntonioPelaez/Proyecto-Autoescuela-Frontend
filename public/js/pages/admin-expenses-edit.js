document.addEventListener("DOMContentLoaded", async () => {

    const expenseRows = document.getElementById("expense-rows");
    const saveBtn = document.getElementById("save-expenses");

    const classSessionId = window.classSessionId;

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

    // ---------------------------------------------------------
    // 1. Cargar gastos existentes desde el backend
    // ---------------------------------------------------------
    let existingExpenses = [];

    try {
        const response = await Api.getVehicleExpense(classSessionId);
existingExpenses = response.expenses || [];

    } catch (e) {
        console.error("Error cargando gastos existentes:", e);
    }

    // Convertimos a un mapa: { expense_type_id: {amount, description} }
  const expenseMap = {};
existingExpenses.forEach(exp => {
    expenseMap[exp.expense_type_id] = exp; // exp incluye el ID real
});


    // ---------------------------------------------------------
    // 2. Generar filas + rellenar datos existentes
    // ---------------------------------------------------------
    expenseTypes.forEach((name, index) => {

        const typeId = index + 1;

        const row = document.createElement("tr");

        const existing = expenseMap[typeId] || { amount: "", description: "" };

        row.innerHTML = `
            <td>${name}</td>
            <td>
                <input type="number" step="0.01" class="form-control"
                       data-type-id="${typeId}"
                       value="${existing.amount}">
            </td>
            <td>
                <input type="text" class="form-control"
                       data-desc-id="${typeId}"
                       value="${existing.description}">
            </td>
        `;

        expenseRows.appendChild(row);
    });

    // ---------------------------------------------------------
    // 3. Guardar cambios reales
    // ---------------------------------------------------------
    saveBtn.addEventListener("click", async () => {

    try {

        for (let input of document.querySelectorAll("input[data-type-id]")) {

            const typeId = Number(input.dataset.typeId);
            const amount = Number(input.value);
            const desc = document.querySelector(`input[data-desc-id="${typeId}"]`).value;

            // Si no hay cantidad → NO hacemos nada
            if (!amount || amount <= 0) continue;

            const existing = expenseMap[typeId];

            if (existing) {
                // 🔥 ACTUALIZAR
                await Api.updateVehicleExpense(existing.id, {
                    amount: amount,
                    description: desc
                });

            } else {
                // 🔥 CREAR
                await Api.createVehicleExpense({
                    class_session_id: classSessionId,
                    expense_type_id: typeId,
                    vehicle_id: existingExpenses[0]?.vehicle_id ?? 1, // o el que corresponda
                    amount: amount,
                    description: desc
                });
            }
        }

        alert("Gastos actualizados correctamente");
        window.location.href = "/admin/expenses";

    } catch (e) {
        console.error("Error guardando gastos:", e);
        alert("Error guardando los gastos");
    }
});


});
