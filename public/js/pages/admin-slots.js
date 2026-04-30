document.addEventListener("DOMContentLoaded", () => {
    Router.init();

    const TABLE_BODY_ID = "slots-table-body";
    const form = document.getElementById("slot-form");
    const slotIdInput = document.getElementById("slot-id");
    const slotTownInput = document.getElementById("slot-town");
    const slotDateInput = document.getElementById("slot-date");
    const slotTimeInput = document.getElementById("slot-time");
    const slotProfessorInput = document.getElementById("slot-professor");
    const slotVehicleInput = document.getElementById("slot-vehicle");
    const formTitle = document.getElementById("slot-form-title");
    const cancelButton = document.getElementById("slot-cancel");
    const createButton = document.getElementById("slot-create");
    const tableBody = document.getElementById(TABLE_BODY_ID);
    const messageBox = document.getElementById("slots-message");

    if (!form || !tableBody) {
        return;
    }

    void bootstrap();

    async function bootstrap() {
        await Promise.all([loadSelectors(), loadSlots()]);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = slotIdInput.value;
        const payload = {
            townId: Number(slotTownInput.value),
            date: slotDateInput.value,
            time: slotTimeInput.value,
            professorId: Number(slotProfessorInput.value),
            vehicle: slotVehicleInput.value.trim(),
        };

        if (
            !payload.townId ||
            !payload.date ||
            !payload.time ||
            !payload.professorId ||
            !payload.vehicle
        ) {
            showState("error", "Todos los campos son obligatorios.");
            return;
        }

        try {
            showState("", "");

            if (id) {
                await Api.updateAvailabilitySlot(id, payload);
                showState("success", "Hueco actualizado correctamente.");
            } else {
                await Api.createAvailabilitySlot(payload);
                showState("success", "Hueco creado correctamente.");
            }

            resetForm();
            await loadSlots();
        } catch (error) {
            showState("error", error.message || "No se pudo guardar el hueco.");
        }
    });

    cancelButton.addEventListener("click", () => {
        resetForm();
        showState("", "");
    });

    createButton.addEventListener("click", () => {
        resetForm();
        slotTownInput.focus();
    });

    tableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }

        const { action, id } = button.dataset;

        try {
            showState("", "");

            if (action === "edit") {
                const slots = await Api.getAvailabilitySlots({
                    town_id: slotTownInput.value,
                    date: slotDateInput.value,
                });

                const slot = slots.find((item) => item.id === Number(id));

                if (!slot) {
                    showState("error", "El hueco no existe.");
                    return;
                }

                slotIdInput.value = String(slot.id);
                slotTownInput.value = String(slot.townId);
                slotDateInput.value = slot.date;
                slotTimeInput.value = slot.time;
                slotProfessorInput.value = String(slot.professorId);
                slotVehicleInput.value = slot.vehicle;
                formTitle.textContent = "Editar hueco";
                cancelButton.classList.remove("hidden");
                slotTownInput.focus();
                return;
            }

            if (action === "toggle") {
                await Api.toggleOfferedSlot(id);
                showState("success", "Estado del hueco actualizado.");
                await loadSlots();
            }
        } catch (error) {
            showState(
                "error",
                error.message || "No se pudo completar la acción.",
            );
        }
    });

    async function loadSelectors() {
        try {
            const [towns, professors] = await Promise.all([
                Api.getTowns(),
                Api.getTeachers(),
            ]);

            renderTownOptions(towns);
            renderProfessorOptions(professors);
        } catch (error) {
            showState(
                "error",
                error.message || "No se pudieron cargar los selectores.",
            );
        }
    }

    function renderTownOptions(towns) {
        slotTownInput.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona una población";
        slotTownInput.appendChild(defaultOption);

        towns.forEach((town) => {
            const option = document.createElement("option");
            option.value = String(town.id);
            option.textContent = town.name;
            slotTownInput.appendChild(option);
        });
    }

    function renderProfessorOptions(professors) {
        slotProfessorInput.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona un profesor";
        slotProfessorInput.appendChild(defaultOption);

        professors.forEach((professor) => {
            const option = document.createElement("option");
            option.value = String(professor.id);
            option.textContent = professor.full_name;
            slotProfessorInput.appendChild(option);
        });
    }

    async function loadSlots() {
        UI.setLoading(TABLE_BODY_ID, true);

        const townId = slotTownInput.value;
        const date = slotDateInput.value;

        if (!townId || !date) {
            renderSlots([]); // tabla vacía
            UI.setLoading(TABLE_BODY_ID, false);
            return;
        }

        try {
            const slots = await Api.getAvailabilitySlots({
                town_id: townId,
                date: date,
            });
            renderSlots(slots);
        } catch (error) {
            showState(
                "error",
                error.message || "No se pudo cargar el listado.",
            );
        } finally {
            UI.setLoading(TABLE_BODY_ID, false);
        }
    }

    function renderSlots(slots) {
        tableBody.replaceChildren();

        if (!slots.length) {
            const row = document.createElement("tr");
            row.className = "table-empty";
            const cell = document.createElement("td");
            cell.colSpan = 8;
            cell.textContent = "No hay huecos ofertados.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        slots.forEach((slot) => {
            const row = document.createElement("tr");
            const status = slot.active ? "Activo" : "Inactivo";
            const toggleLabel = slot.active ? "Desactivar" : "Activar";

            const idCell = createCell(String(slot.id));
            const townCell = createCell(slot.townName);
            const dateCell = createCell(slot.date);
            const timeCell = createCell(slot.time);
            const professorCell = createCell(slot.professorName);
            const vehicleCell = createCell(
                slot.vehicle || "Sin vehículo asignado",
            );
            const statusCell = createCell(status);

            const actionsCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-outline btn-sm";
            editButton.dataset.action = "edit";
            editButton.dataset.id = String(slot.id);
            editButton.textContent = "Editar";

            const toggleButton = document.createElement("button");
            toggleButton.type = "button";
            toggleButton.className = "btn btn-secondary btn-sm";
            toggleButton.dataset.action = "toggle";
            toggleButton.dataset.id = String(slot.id);
            toggleButton.textContent = toggleLabel;

            actionsCell.append(
                editButton,
                document.createTextNode(" "),
                toggleButton,
            );
            row.append(
                idCell,
                townCell,
                dateCell,
                timeCell,
                professorCell,
                vehicleCell,
                statusCell,
                actionsCell,
            );
            tableBody.appendChild(row);
        });
    }

    function createCell(text) {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
    }

    function resetForm() {
        form.reset();
        slotIdInput.value = "";
        formTitle.textContent = "Crear hueco";
        cancelButton.classList.add("hidden");
    }

    function showState(type, message) {
        if (!message) {
            messageBox.textContent = "";
            messageBox.className = "hidden";
            messageBox.removeAttribute('role');
            return;
        }

        messageBox.textContent = message;
        if (type === 'error') {
            messageBox.className = 'card card-body input-error state-message state-error';
            messageBox.setAttribute('role', 'alert');
        } else {
            messageBox.className = 'card card-body state-message state-success';
            messageBox.setAttribute('role', 'status');
        }
        messageBox.setAttribute('aria-live', 'assertive');

        // Animación de aparición
        messageBox.style.opacity = 0;
        messageBox.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            messageBox.style.opacity = 1;
        }, 10);

        // Auto-ocultar después de 3.5s si es éxito
        if (type !== 'error') {
            setTimeout(() => {
                messageBox.style.opacity = 0;
                setTimeout(() => {
                    messageBox.textContent = '';
                    messageBox.className = 'hidden';
                    messageBox.removeAttribute('role');
                }, 350);
            }, 3500);
        }

        if (typeof UI !== "undefined" && UI.showToast) {
            UI.showToast(message, type === "error" ? "error" : "success");
        }
    }
});
