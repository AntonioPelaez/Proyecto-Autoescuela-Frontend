document.addEventListener("DOMContentLoaded", async () => {

    const vehicleSelect = document.getElementById("vehicle-select");
    const classSelect = document.getElementById("class-select");
    const expenseTypeSelect = document.getElementById("expense-type");
    const amountInput = document.getElementById("amount");
    const notesInput = document.getElementById("notes");

    const expenseId = document.body.dataset.expenseId;

    //
    // 1. Cargar selects igual que en CREATE
    //
    // (copiar exactamente el mismo código del create.js)
    //

    //
    // 2. Cargar datos del gasto (cuando tengamos API real)
    //
    // const expense = await Api.getExpense(expenseId);
    //
    // vehicleSelect.value = expense.vehicle_id;
    // classSelect.value = expense.class_id;
    // expenseTypeSelect.value = expense.expense_type_id;
    // amountInput.value = expense.amount;
    // notesInput.value = expense.notes;

});
