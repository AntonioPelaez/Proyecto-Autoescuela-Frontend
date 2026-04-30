    // --- Handler para cambio de profesor ---
    function onProfessorChange() {
        autocompleteVehicle();
        // Si hay fecha seleccionada, renderiza cuadrícula y bloquea horas ocupadas
        if (slotDateInput.value) {
            renderHourGrid();
            updateHourGridWithBookings();
        } else {
            // Si no hay fecha, solo muestra la cuadrícula vacía
            renderHourGrid();
        }
    }

    slotDateInput.addEventListener('change', () => {
        renderHourGrid();
        updateHourGridWithBookings();
    });
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


    // --- Declaraciones necesarias arriba ---
    let professorsList = [];
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

    function renderProfessorOptions(professors) {
        professorsList = professors;
        slotProfessorInput.replaceChildren();
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona un profesor";
        slotProfessorInput.appendChild(defaultOption);
        professors.forEach((professor) => {
            const option = document.createElement("option");
            option.value = String(professor.id);
            option.textContent = professor.name;
            slotProfessorInput.appendChild(option);
        });
        slotProfessorInput.removeEventListener('change', onProfessorChange);
        slotProfessorInput.addEventListener('change', onProfessorChange);
        // Inicializa cuadrícula y vehículo si ya hay valor (edición)
        setTimeout(() => {
            renderHourGrid();
            autocompleteVehicle();
        }, 0);
    }

    // --- FIN FUNCIONES GLOBALES ---

    // --- CUADRÍCULA DE HORAS ---
    function renderHourGrid() {
        const grid = document.getElementById('slot-time-grid');
        if (!grid) return;
        grid.innerHTML = '';
        // Solo mostrar si hay profesor seleccionado
        if (!slotProfessorInput.value) {
            grid.style.display = 'none';
            return;
        }
        grid.style.display = 'flex';
        // Generar intervalos de 15 minutos de 8:00 a 21:45
        const startHour = 8, endHour = 21, interval = 15;
        for (let h = startHour; h <= endHour; h++) {
            for (let m = 0; m < 60; m += interval) {
                const hour = String(h).padStart(2, '0');
                const min = String(m).padStart(2, '0');
                const value = `${hour}:${min}`;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-light btn-sm hour-btn';
                btn.textContent = value;
                btn.tabIndex = 0;
                btn.style.minWidth = '54px';
                btn.style.marginBottom = '2px';
                btn.onclick = () => {
                    slotTimeInput.value = value;
                    // Resalta el botón seleccionado
                    grid.querySelectorAll('.hour-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                };
                grid.appendChild(btn);
            }
        }
    }
    // --- FIN CUADRÍCULA DE HORAS ---

    function autocompleteVehicle() {
        const profId = Number(slotProfessorInput.value);
        const prof = professorsList.find(p => Number(p.id) === profId);
        if (prof && prof.vehicles && prof.vehicles.length > 0) {
            // Selecciona el primer vehículo asignado
            slotVehicleInput.value = prof.vehicles[0].brand + ' ' + prof.vehicles[0].model;
        }
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
