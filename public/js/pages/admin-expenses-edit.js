document.addEventListener("DOMContentLoaded", async () => {

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
    // 1. Generar filas
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
    // 2. Guardar cambios (simulado)
    //
    saveBtn.addEventListener("click", () => {

        const gastos = [];

        document.querySelectorAll("input[data-type-id]").forEach(input => {
            const typeId = input.dataset.typeId;
            const amount = input.value;
            const desc = document.querySelector(`input[data-desc-id="${typeId}"]`).value;

            if (amount && amount > 0) {
                gastos.push({
                    expense_type_id: typeId,
                    amount: amount,
                    description: desc
                });
            }
        });

        console.log("Gastos EDITADOS que se enviarían al backend:", gastos);

        alert("Cambios guardados (simulado). Redirigiendo...");

        window.location.href = "/admin/expenses";
    });

});
