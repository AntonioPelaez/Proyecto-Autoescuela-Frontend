
console.log("admin-slots.js cargado");
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
    const apiStatusBox = document.getElementById("slots-api-status");
    const tableBody = document.getElementById(TABLE_BODY_ID);
    const messageBox = document.getElementById("slots-message");
    const selectedTimes = new Set();
    let slotsCache = [];
    const slotsCanCreate = true;
    const slotsCanMutateRows = false;

    if (!form || !tableBody) {
        return;
    }

    function syncSelectedTimesInput() {
        slotTimeInput.value = Array.from(selectedTimes)
            .sort((left, right) => left.localeCompare(right))
            .join(',');
    }

    function clearSelectedTimes() {
        selectedTimes.clear();
        syncSelectedTimesInput();
    }

    function setApiSyncState(state, details = "") {
        if (!apiStatusBox) {
            return;
        }

        apiStatusBox.classList.remove('is-ok', 'is-error');
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const timeLabel = `${hh}:${mm}`;

        if (state === 'ok') {
            apiStatusBox.classList.add('is-ok');
            apiStatusBox.textContent = `Conectado a API. Ultima sincronizacion ${timeLabel}.${details ? ` ${details}` : ''}`;
            return;
        }

        if (state === 'error') {
            apiStatusBox.classList.add('is-error');
            apiStatusBox.textContent = `Error de API ${timeLabel}.${details ? ` ${details}` : ''}`;
            return;
        }

        if (state === 'idle') {
            apiStatusBox.textContent = details || 'Selecciona poblacion y fecha para consultar huecos.';
            return;
        }

        apiStatusBox.textContent = 'Sincronizando con API...';
    }

    function resolveSlotApiErrorMessage(error, fallbackMessage) {
        if (error?.status === 401 || String(error?.message || '').toLowerCase().includes('unauthenticated')) {
            return 'Sesion no autenticada para crear/modificar huecos. Inicia sesion de nuevo y vuelve a intentarlo.';
        }

        if (error?.status === 405) {
            return 'El backend no permite crear o modificar huecos ofertados en /api/availability-slots. Ahora mismo esa ruta solo admite lectura.';
        }

        return error?.message || fallbackMessage;
    }

    function updateSelectedHourUI(grid) {
        if (!grid) {
            return;
        }

        grid.querySelectorAll('.hour-btn').forEach((button) => {
            const value = String(button.textContent || "").trim();
            const isSelected = selectedTimes.has(value);
            button.classList.toggle('selected', isSelected);
            button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });
    }

    function toggleSelectedHour(value, grid) {
        if (!grid) {
            return;
        }

        const selectedButton = Array.from(grid.querySelectorAll('.hour-btn')).find(
            (button) => String(button.textContent || "").trim() === value,
        );

        if (!selectedButton || selectedButton.disabled || selectedButton.classList.contains('hour-booked')) {
            return;
        }

        if (selectedTimes.has(value)) {
            selectedTimes.delete(value);
        } else {
            selectedTimes.add(value);
        }

        syncSelectedTimesInput();
        updateSelectedHourUI(grid);
    }

    // --- Handler para cambio de profesor ---
    function onProfessorChange() {
        autocompleteVehicle();
        // Si hay fecha seleccionada, renderiza cuadrícula y bloquea horas ocupadas
        if (slotDateInput.value && slotTownInput.value) {
            renderHourGrid();
            updateHourGridWithBookings();
            loadSlots();
        } else {
            // Si no hay fecha, solo muestra la cuadrícula vacía
            renderHourGrid();
        }
    }

    // --- Marcar horas ocupadas en la cuadrícula ---
    async function updateHourGridWithBookings() {
        const grid = document.getElementById('slot-time-grid');
        if (!grid || !slotProfessorInput.value || !slotDateInput.value || !slotTownInput.value) return;
        // Obtener huecos del profesor y fecha seleccionados
        try {
            const slotsResponse = await Api.getAvailabilitySlots({
                town_id: slotTownInput.value,
                date: slotDateInput.value,
            });
            const slots = adaptBackendSlots(slotsResponse, slotTownInput.value, slotDateInput.value);

            const selectedProfessorId = String(slotProfessorInput.value);
            const normalizeTime = (raw) => {
                if (!raw) return "";
                const str = String(raw);
                if (str.length >= 5) return str.slice(0, 5);
                return str;
            };

            const occupiedTimes = new Set(
                slots
                    .filter((slot) => {
                        const professorId = String(
                            slot.professorId ??
                            slot.professor_id ??
                            slot.teacher_profile_id ??
                            "",
                        );
                        return professorId === selectedProfessorId;
                    })
                    .map((slot) =>
                        normalizeTime(
                            slot.time ??
                            slot.slot_starts_at ??
                            slot.starts_at ??
                            slot.start,
                        ),
                    )
                    .filter(Boolean),
            );

            // Marcar los botones de hora ocupados
            grid.querySelectorAll('.hour-btn').forEach(btn => {
                const value = String(btn.textContent || "").trim();
                const ocupado = occupiedTimes.has(value);
                if (ocupado) {
                    btn.disabled = true;
                    btn.classList.add('hour-booked');
                    btn.title = 'Hora ocupada por este profesor';
                } else {
                    btn.disabled = false;
                    btn.classList.remove('hour-booked');
                    btn.title = '';
                }
            });

            occupiedTimes.forEach((time) => {
                if (selectedTimes.has(time)) {
                    selectedTimes.delete(time);
                }
            });

            syncSelectedTimesInput();
            updateSelectedHourUI(grid);
        } catch (error) {
            // No bloquear nada si hay error
        }
    }

    if (slotDateInput) {
        slotDateInput.addEventListener('change', () => {
            renderHourGrid();
            updateHourGridWithBookings();
            clearSelectedTimes();
            loadSlots();
        });
    }

    if (slotTownInput) {
        slotTownInput.addEventListener('change', () => {
            renderHourGrid();
            updateHourGridWithBookings();
            clearSelectedTimes();
            loadSlots();
        });
    }

    void initializePage();

    async function initializePage() {
        await loadSelectors();
        await bootstrap();
    }

    async function bootstrap() {
        const loadedRecent = await preloadLatestSlots();
        if (!loadedRecent) {
            await loadSlots();
        }
    }

    function formatDateYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async function preloadLatestSlots() {
        const townOptions = Array.from(slotTownInput?.options || [])
            .map((option) => String(option.value || '').trim())
            .filter(Boolean);

        if (townOptions.length === 0) {
            return false;
        }

        setApiSyncState('loading');

        // Intenta encontrar huecos recientes (hoy hacia atras) sin exigir al usuario filtros iniciales.
        const maxDaysBack = 30;
        for (let offset = 0; offset <= maxDaysBack; offset += 1) {
            const candidate = new Date();
            candidate.setDate(candidate.getDate() - offset);
            const candidateDate = formatDateYYYYMMDD(candidate);

            for (const townId of townOptions) {
                try {
                    const response = await Api.getAvailabilitySlots({
                        town_id: townId,
                        date: candidateDate,
                    });

                    const slots = adaptBackendSlots(response, townId, candidateDate);
                    if (slots.length > 0) {
                        slotTownInput.value = String(townId);
                        slotDateInput.value = candidateDate;
                        slotsCache = slots;
                        const filteredSlots = applyClientFilters(slotsCache);
                        renderSlots(filteredSlots);
                        setApiSyncState('ok', `Mostrando ${filteredSlots.length} huecos recientes (${candidateDate}).`);
                        return true;
                    }
                } catch (error) {
                    // Si falla una combinacion, probamos la siguiente.
                }
            }
        }

        setApiSyncState('idle', 'No se encontraron huecos recientes. Usa los filtros para buscar.');
        renderEmptyRow('No se encontraron huecos recientes. Usa poblacion y fecha para buscar.');
        return false;
    }

    function toStatusLabel(status) {
        switch (status) {
            case 'booked':
                return 'Reservada';
            case 'pending':
                return 'Pendiente';
            default:
                return 'Pendiente';
        }
    }

    function extractHour(startValue) {
        const raw = String(startValue || '');
        return raw.length >= 16 ? raw.slice(11, 16) : '';
    }

    function getTownNameById(townId) {
        const option = Array.from(slotTownInput?.options || []).find((item) => Number(item.value) === Number(townId));
        return option?.textContent || '—';
    }

    function getProfessorById(professorId) {
        return professorsList.find((item) => Number(item.id) === Number(professorId));
    }

    function resolveVehicleLabel(professor, vehicleId) {
        if (!professor || !Array.isArray(professor.vehicles)) {
            return vehicleId ? `Vehiculo #${vehicleId}` : '—';
        }

        const vehicle = professor.vehicles.find((item) => Number(item.id) === Number(vehicleId));
        if (!vehicle) {
            return vehicleId ? `Vehiculo #${vehicleId}` : '—';
        }

        return `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || `Vehiculo #${vehicleId}`;
    }

    function adaptBackendSlots(apiResponse, townId, date) {
        if (!apiResponse || !Array.isArray(apiResponse.slots)) {
            return [];
        }

        const result = [];
        const effectiveDate = date || apiResponse.date || '';
        const townName = getTownNameById(townId);

        apiResponse.slots.forEach((teacherBlock) => {
            const teacherId = teacherBlock?.teacher_id;
            const teacher = getProfessorById(teacherId);
            const teacherName = teacher?.name || `Profesor #${teacherId || 'N/A'}`;
            const vehicleId = teacherBlock?.vehicle_id;
            const vehicleLabel = resolveVehicleLabel(teacher, vehicleId);
            const groupedSlots = Array.isArray(teacherBlock?.slots) ? teacherBlock.slots : [];

            groupedSlots.forEach((slot) => {
                const status = slot?.reserved ? 'booked' : 'pending';
                const start = slot?.start;
                const displayId =
                    slot?.id ??
                    slot?.slot_id ??
                    slot?.availability_slot_id ??
                    null;

                result.push({
                    id: displayId,
                    rowKey: `${teacherId || 'na'}-${vehicleId || 'na'}-${start || Math.random().toString(16).slice(2)}`,
                    townId: Number(townId),
                    townName,
                    date: effectiveDate,
                    time: extractHour(start),
                    professorId: Number(teacherId),
                    professorName: teacherName,
                    vehicle: vehicleLabel,
                    status,
                    statusLabel: toStatusLabel(status),
                });
            });
        });

        return result;
    }

    function applyClientFilters(slots) {
        const selectedProfessor = String(slotProfessorInput?.value || '').trim();
        const selectedVehicle = String(slotVehicleInput?.value || '').trim().toLowerCase();
        const selectedHours = new Set(Array.from(selectedTimes));

        return slots.filter((slot) => {
            if (selectedProfessor && String(slot.professorId) !== selectedProfessor) {
                return false;
            }

            if (selectedVehicle) {
                const vehicleText = String(slot.vehicle || '').toLowerCase();
                if (!vehicleText.includes(selectedVehicle)) {
                    return false;
                }
            }

            if (selectedHours.size > 0 && !selectedHours.has(String(slot.time || '').trim())) {
                return false;
            }

            return true;
        });
    }


    async function loadSlots() {
        if (!slotTownInput?.value || !slotDateInput?.value) {
            renderEmptyRow('Selecciona poblacion y fecha para consultar huecos.');
            setApiSyncState('idle', 'Selecciona poblacion y fecha para consultar huecos.');
            return;
        }

        setApiSyncState('loading');
        const filters = {};

        if (slotTownInput?.value) {
            filters.town_id = slotTownInput.value;
        }

        if (slotDateInput?.value) {
            filters.date = slotDateInput.value;
        }

        try {
            const response = await Api.getAvailabilitySlots(filters);
            slotsCache = adaptBackendSlots(response, filters.town_id, filters.date);
            const filteredSlots = applyClientFilters(slotsCache);
            renderSlots(filteredSlots);
            setApiSyncState('ok', `Registros: ${filteredSlots.length} de ${slotsCache.length}.`);
        } catch (error) {
            setApiSyncState('error', 'No se pudo leer el listado.');
            showState(
                "error",
                error?.message || "No se pudo cargar el listado de huecos.",
            );
        }
    }

    function renderEmptyRow(message) {
        tableBody.replaceChildren();
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" style="text-align:center; color:#6b7280;">${escapeHtml(message)}</td>`;
        tableBody.appendChild(emptyRow);
    }

    function renderSlots(slots) {
        if (slots.length === 0) {
            renderEmptyRow('No hay huecos ofertados para los filtros seleccionados.');
            return;
        }

        tableBody.replaceChildren();

        slots.forEach((slot) => {
            const row = document.createElement('tr');
            const statusLabel = slot.statusLabel || slot.status || '—';
            const actionButtons = resolveSlotActionButtons(slot);
            const rowKey = slot.rowKey || slot.id || Math.random().toString(16).slice(2);
            row.dataset.rowKey = String(rowKey);

            row.innerHTML = `
                <td>${escapeHtml(slot.townName || '—')}</td>
                <td>${escapeHtml(slot.date || '—')}</td>
                <td>${escapeHtml(slot.time || '—')}</td>
                <td>${escapeHtml(slot.professorName || '—')}</td>
                <td>${escapeHtml(slot.vehicle || '—')}</td>
                <td><span class="slot-status slot-status--${slot.status || 'unknown'}">${escapeHtml(statusLabel)}</span></td>
                <td>${actionButtons}</td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Devuelve los botones de acción según el estado actual del hueco.
    // pending     → Editar · Desactivar · Cancelar
    // booked      → Cancelar (no se puede editar un hueco ya reservado)
    // deactivated → Editar · Activar
    // cancelled   → Restaurar
    function resolveSlotActionButtons(slot) {
        if (!slotsCanMutateRows) {
            return '<span style="color:#6b7280; font-size:0.85rem;">No editable desde listado</span>';
        }

        const id = slot.id;
        const editBtn     = `<button type="button" class="btn btn-outline btn-sm"    data-action="edit"       data-id="${id}">Editar</button>`;
        const deactBtn    = `<button type="button" class="btn btn-secondary btn-sm"  data-action="deactivate" data-id="${id}">Desactivar</button>`;
        const cancelBtn   = `<button type="button" class="btn btn-danger btn-sm"     data-action="cancel"     data-id="${id}">Cancelar</button>`;
        const activateBtn = `<button type="button" class="btn btn-success btn-sm"    data-action="activate"   data-id="${id}">Activar</button>`;
        const restoreBtn  = `<button type="button" class="btn btn-outline btn-sm"    data-action="restore"    data-id="${id}">Restaurar</button>`;

        switch (slot.status) {
            case 'pending':     return editBtn + deactBtn + cancelBtn;
            case 'booked':      return cancelBtn;
            case 'deactivated': return editBtn + activateBtn;
            case 'cancelled':   return restoreBtn;
            default:            return editBtn;
        }
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!slotTownInput.value || !slotDateInput.value) {
            showState("error", "Para filtrar debes seleccionar poblacion y fecha.");
            return;
        }

        try {
            showState("", "");
            await loadSlots();
            await updateHourGridWithBookings();
            showState("success", "Listado filtrado correctamente.");
        } catch (error) {
            console.error('Error filtrando huecos ofertados', error);
            showState("error", error?.message || "No se pudo aplicar el filtro.");
        }
    });

    cancelButton.addEventListener("click", () => {
        resetForm();
        showState("", "");
    });

    if (createButton) {
        createButton.addEventListener("click", () => {
            if (!slotsCanCreate) {
                showState("error", "La creacion de huecos esta desactivada en esta pantalla.");
                return;
            }

            resetForm();
            slotTownInput.focus();
        });
    }

    tableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }

        const { action, id } = button.dataset;

        if (!slotsCanMutateRows) {
            showState("error", "Las acciones de modificacion por fila estan desactivadas en este modo.");
            return;
        }

        try {
            showState("", "");

            if (action === "edit") {
                const slot = await Api.getAvailabilitySlot(id);

                if (!slot) {
                    showState("error", "El hueco no existe.");
                    return;
                }

                slotIdInput.value = String(slot.id);
                slotTownInput.value = String(slot.townId);
                slotDateInput.value = slot.date;
                clearSelectedTimes();
                selectedTimes.add(slot.time);
                syncSelectedTimesInput();
                slotProfessorInput.value = String(slot.professorId);
                slotVehicleInput.value = slot.vehicle;
                formTitle.textContent = "Editar hueco";
                cancelButton.classList.remove("hidden");
                renderHourGrid();
                await updateHourGridWithBookings();
                slotTownInput.focus();
                return;
            }

            // Mapa de acciones → estado destino en la API
            const statusTransitions = {
                deactivate: 'deactivated',
                cancel:     'cancelled',
                activate:   'pending',
                restore:    'pending',
                book:       'booked',
            };

            if (action in statusTransitions) {
                await Api.updateSlotStatus(id, statusTransitions[action]);
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
        // Generar intervalos de 45 minutos de 8:00 a 21:45
        const startHour = 8, endHour = 21, interval = 45;
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
                btn.setAttribute('aria-pressed', 'false');
                btn.style.minWidth = '54px';
                btn.style.marginBottom = '2px';
                btn.onclick = () => {
                    toggleSelectedHour(value, grid);
                };
                grid.appendChild(btn);
            }
        }

        updateSelectedHourUI(grid);
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
        clearSelectedTimes();
        formTitle.textContent = "Crear hueco";
        cancelButton.classList.add("hidden");
        renderHourGrid();
    }

    if (!slotsCanCreate) {
        if (formTitle) {
            formTitle.textContent = 'Consulta de huecos';
        }
        if (createButton) {
            createButton.classList.add('hidden');
        }
        if (cancelButton) {
            cancelButton.classList.add('hidden');
        }
    }

    const submitButton = document.getElementById('slot-submit');
    if (submitButton) {
        submitButton.disabled = !slotsCanCreate;
        submitButton.title = slotsCanCreate ? '' : 'Desactivado: creacion deshabilitada';
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
