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

if (!form || !tableBody) return;

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────

function syncSelectedTimesInput() {
    slotTimeInput.value = Array.from(selectedTimes)
        .sort((a, b) => a.localeCompare(b))
        .join(',');
}

function clearSelectedTimes() {
    selectedTimes.clear();
    syncSelectedTimesInput();
}

function setApiSyncState(state, details = "") {
    if (!apiStatusBox) return;

    apiStatusBox.classList.remove('is-ok', 'is-error');

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeLabel = `${hh}:${mm}`;

    if (state === 'ok') {
        apiStatusBox.classList.add('is-ok');
        apiStatusBox.textContent = `Conectado a API. Última sincronización ${timeLabel}. ${details}`;
        return;
    }

    if (state === 'error') {
        apiStatusBox.classList.add('is-error');
        apiStatusBox.textContent = `Error de API ${timeLabel}. ${details}`;
        return;
    }

    if (state === 'idle') {
        apiStatusBox.textContent = details || 'Selecciona población y fecha para consultar.';
        return;
    }

    apiStatusBox.textContent = 'Sincronizando con API...';
}

// ─────────────────────────────────────────────
// CUADRÍCULA DE HORAS BASADA EN availability-slots
// ─────────────────────────────────────────────

function renderHourGridFromSlots(slots) {
    const grid = document.getElementById("slot-time-grid");
    if (!grid) return;

    grid.replaceChildren();

    slots.forEach(slot => {
        const hour = slot.start.slice(11, 16); // "HH:MM"

        const btn = document.createElement("button");
        btn.className = "hour-btn";
        btn.textContent = hour;

        if (slot.reserved) {
            btn.classList.add("hour-booked");
            btn.disabled = true;
            btn.title = "Hora ocupada";
        }

        btn.addEventListener("click", () => {
            if (selectedTimes.has(hour)) {
                selectedTimes.delete(hour);
            } else {
                selectedTimes.add(hour);
            }
            syncSelectedTimesInput();
            updateSelectedHourUI(grid);
        });

        grid.appendChild(btn);
    });

    updateSelectedHourUI(grid);
}

function updateSelectedHourUI(grid) {
    grid.querySelectorAll(".hour-btn").forEach(btn => {
        const hour = btn.textContent.trim();
        btn.classList.toggle("selected", selectedTimes.has(hour));
    });
}

async function loadHourGrid() {
    if (!slotTownInput.value || !slotDateInput.value || !slotProfessorInput.value) return;

    try {
        const response = await Api.getAvailabilitySlots({
            town_id: slotTownInput.value,
            date: slotDateInput.value
        });

        const teacherId = slotProfessorInput.value;

        const teacherBlock = response.slots.find(
            block => String(block.teacher_id) === String(teacherId)
        );

        if (!teacherBlock) {
            renderHourGridFromSlots([]);
            return;
        }

        renderHourGridFromSlots(teacherBlock.slots);

    } catch (error) {
        console.error("Error cargando cuadrícula de horas", error);
    }
}

// ─────────────────────────────────────────────
// CARGAR DISPONIBILIDADES SEMANALES
// ─────────────────────────────────────────────

async function loadSlots() {
    setApiSyncState('loading');

    try {
        const filters = {};

        if (slotProfessorInput.value) {
            filters.teacher_profile_id = slotProfessorInput.value;
        }

        if (slotTownInput.value) {
            filters.town_id = slotTownInput.value;
        }

        if (slotDateInput.value) {
            const date = new Date(slotDateInput.value);
            filters.day_of_week = date.getDay(); // 0-6
        }

        const response = await Api.getWeeklyAvailabilities(filters);
        const slots = response.data || [];

        renderWeeklyAvailabilities(slots);

        setApiSyncState('ok', `Registros: ${slots.length}.`);
    } catch (error) {
        setApiSyncState('error', 'No se pudo leer el listado.');
        renderEmptyRow('Error cargando disponibilidades.');
    }
}

// ─────────────────────────────────────────────
// RENDERIZAR DISPONIBILIDADES SEMANALES
// ─────────────────────────────────────────────

function renderWeeklyAvailabilities(slots) {
    tableBody.replaceChildren();

    if (slots.length === 0) {
        renderEmptyRow('No hay disponibilidades para los filtros seleccionados.');
        return;
    }

    slots.forEach((slot) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${slot.teacher_profile_id}</td>
            <td>${slot.town_id}</td>
            <td>${slot.day_of_week}</td>
            <td>${slot.starts_time}</td>
            <td>${slot.end_time}</td>
            <td>${slot.slot_minutes}</td>
            <td>${slot.is_active ? 'Sí' : 'No'}</td>
        `;

        tableBody.appendChild(row);
    });
}

function renderEmptyRow(message) {
    tableBody.replaceChildren();
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="7" style="text-align:center; color:#6b7280;">${escapeHtml(message)}</td>`;
    tableBody.appendChild(emptyRow);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// ─────────────────────────────────────────────
// SELECTORES
// ─────────────────────────────────────────────

let professorsList = [];

async function loadSelectors() {
    try {
        const [towns, professors] = await Promise.all([
            Api.getTowns(),
            Api.getTeachers(),
        ]);

        renderTownOptions(towns);
        renderProfessorOptions(professors);
    } catch (error) {
        showState("error", error.message || "No se pudieron cargar los selectores.");
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
}

// ─────────────────────────────────────────────
// FORMULARIO
// ─────────────────────────────────────────────

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!slotTownInput.value || !slotDateInput.value) {
        showState("error", "Para filtrar debes seleccionar población y fecha.");
        return;
    }

    try {
        showState("", "");
        await loadSlots();
        showState("success", "Listado filtrado correctamente.");
    } catch (error) {
        showState("error", error?.message || "No se pudo aplicar el filtro.");
    }
});

// ─────────────────────────────────────────────
// EVENTOS PARA ACTUALIZAR CUADRÍCULA DE HORAS
// ─────────────────────────────────────────────

slotTownInput.addEventListener("change", loadHourGrid);
slotDateInput.addEventListener("change", loadHourGrid);
slotProfessorInput.addEventListener("change", loadHourGrid);
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

    messageBox.style.opacity = 0;
    messageBox.style.transition = 'opacity 0.3s';

    setTimeout(() => {
        messageBox.style.opacity = 1;
    }, 10);

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
}

// ─────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────

(async function initializePage() {
    await loadSelectors();
    await loadSlots();
})();
});