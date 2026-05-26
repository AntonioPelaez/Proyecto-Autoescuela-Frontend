console.log("admin-slots.js cargado");

document.addEventListener("DOMContentLoaded", () => {

Router.init();

const TABLE_BODY_ID = "slots-table-body";
const tableBody = document.getElementById(TABLE_BODY_ID);

const slotTownInput = document.getElementById("slot-town");
const slotDateInput = document.getElementById("slot-date");
const slotProfessorInput = document.getElementById("slot-professor");

const messageBox = document.getElementById("slots-message");
const apiStatusBox = document.getElementById("slots-api-status");

// FORMULARIO DE CREACIÓN / EDICIÓN
const availabilityForm = document.getElementById("availability-form");
const availabilityProfessor = document.getElementById("availability-professor");
const availabilityTown = document.getElementById("availability-town");
const availabilityDay = document.getElementById("availability-day");
const availabilityStart = document.getElementById("availability-start-time");
const availabilityEnd = document.getElementById("availability-end-time");
const availabilityType = document.getElementById("availability-type");
const availabilityReason = document.getElementById("availability-reason");
const availabilityReasonWrapper = document.getElementById("availability-reason-wrapper");
const availabilityBlockType = document.getElementById("availability-block-type");
const availabilityDate = document.getElementById("availability-date");
const availabilityDateWrapper = document.getElementById("availability-date-wrapper");
const availabilityDayWrapper = document.getElementById("availability-day-wrapper");
const availabilityCreateBtn = document.getElementById("availability-create");

let PROFESSOR_NAMES = {};
let TOWN_NAMES = {};

const DAY_NAMES = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
};

// ------------------------------------------------------------
// UTILIDADES
// ------------------------------------------------------------

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES");
}

function setApiSyncState(state, details = "") {
    if (!apiStatusBox) return;

    apiStatusBox.classList.remove("is-ok", "is-error");

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const timeLabel = `${hh}:${mm}`;

    if (state === "ok") {
        apiStatusBox.classList.add("is-ok");
        apiStatusBox.textContent = `Conectado a API. Última sincronización ${timeLabel}. ${details}`;
        return;
    }

    if (state === "error") {
        apiStatusBox.classList.add("is-error");
        apiStatusBox.textContent = `Error de API ${timeLabel}. ${details}`;
        return;
    }

    if (state === "idle") {
        apiStatusBox.textContent = details || "Selecciona población y fecha para consultar.";
        return;
    }
}
// ------------------------------------------------------------
// CARGAR SELECTORES
// ------------------------------------------------------------

async function loadSelectors() {
    try {
        const [towns, professors] = await Promise.all([
            Api.getTowns(),
            Api.getTeachers(),
        ]);

        PROFESSOR_NAMES = {};
        professors.forEach((p) => (PROFESSOR_NAMES[p.id] = p.name));

        TOWN_NAMES = {};
        towns.forEach((t) => (TOWN_NAMES[t.id] = t.name));

        // Poblar select de profesores (filtro)
        slotProfessorInput.replaceChildren();
        const defProf = document.createElement("option");
        defProf.value = "";
        defProf.textContent = "Selecciona un profesor";
        slotProfessorInput.appendChild(defProf);

        professors.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name;
            slotProfessorInput.appendChild(opt);
        });

        // Poblar select de poblaciones (filtro)
        slotTownInput.replaceChildren();
        const defTown = document.createElement("option");
        defTown.value = "";
        defTown.textContent = "Selecciona una población";
        slotTownInput.appendChild(defTown);

        towns.forEach((t) => {
            const opt = document.createElement("option");
            opt.value = t.id;
            opt.textContent = t.name;
            slotTownInput.appendChild(opt);
        });

        // Poblar select de creación
        availabilityProfessor.replaceChildren();
        const defProf2 = document.createElement("option");
        defProf2.value = "";
        defProf2.textContent = "Selecciona un profesor";
        availabilityProfessor.appendChild(defProf2);

        professors.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name;
            availabilityProfessor.appendChild(opt);
        });

        availabilityTown.replaceChildren();
        const defTown2 = document.createElement("option");
        defTown2.value = "";
        defTown2.textContent = "Selecciona una población";
        availabilityTown.appendChild(defTown2);

        towns.forEach((t) => {
            const opt = document.createElement("option");
            opt.value = t.id;
            opt.textContent = t.name;
            availabilityTown.appendChild(opt);
        });

    } catch (error) {
        console.error(error);
        showState("error", "No se pudieron cargar los selectores.");
    }
}

// ------------------------------------------------------------
// CARGAR DISPONIBILIDADES (NORMALES + ESPECIALES)
// ------------------------------------------------------------

async function autoCleanExpiredSpecials(specials) {
    const now = new Date();

    for (const slot of specials) {
        const endDateTime = new Date(`${slot.exception_date}T${slot.end_time}`);
        if (endDateTime < now) {
            try {
                await Api.deleteTeacherAvailabilityException(slot.id);
            } catch (e) {
                console.warn("No se pudo eliminar especial caducada:", slot.id);
            }
        }
    }
}

async function loadSlots() {
    tableBody.innerHTML = `
<tr>
    <td colspan="9" style="text-align:center; padding:20px;">
        <div class="loader loader-inline loader-sm">Cargando…</div>
    </td>
</tr>`;

    setApiSyncState("loading");

    try {
        const filters = {};

        if (slotProfessorInput.value) {
            filters.teacher_profile_id = slotProfessorInput.value;
        }

        if (slotTownInput.value) {
            filters.town_id = slotTownInput.value;
        }

        let dayOfWeek = null;
        if (slotDateInput.value) {
            const date = new Date(slotDateInput.value);
            dayOfWeek = date.getDay();
            filters.day_of_week = dayOfWeek;
        }

        // 1) Cargar normales
        const respNormal = await Api.getWeeklyAvailabilities(filters);
        const normals = respNormal.data || [];

        // 2) Cargar especiales
        const respSpecial = await Api.getTeacherAvailabilityExceptions();

        let specials = [];

        if (Array.isArray(respSpecial)) specials = respSpecial;
        else if (Array.isArray(respSpecial.data)) specials = respSpecial.data;
        else if (respSpecial.data) specials = [respSpecial.data];

        // Filtrado normal
        specials = specials.filter((s) => {
            if (filters.teacher_profile_id && String(s.teacher_profile_id) !== String(filters.teacher_profile_id)) return false;
            if (filters.town_id && String(s.town_id) !== String(filters.town_id)) return false;
            if (slotDateInput.value && s.exception_date !== slotDateInput.value) return false;
            return true;
        });

        // Eliminar caducadas
        await autoCleanExpiredSpecials(specials);

        // Recargar especiales tras limpieza
        const respSpecial2 = await Api.getTeacherAvailabilityExceptions();
        specials = [];

        if (Array.isArray(respSpecial2)) specials = respSpecial2;
        else if (Array.isArray(respSpecial2.data)) specials = respSpecial2.data;
        else if (respSpecial2.data) specials = [respSpecial2.data];

        specials = specials.filter((s) => {
            if (filters.teacher_profile_id && String(s.teacher_profile_id) !== String(filters.teacher_profile_id)) return false;
            if (filters.town_id && String(s.town_id) !== String(filters.town_id)) return false;
            if (slotDateInput.value && s.exception_date !== slotDateInput.value) return false;
            return true;
        });

        // Unir normales + especiales
        const allSlots = [...normals, ...specials];

        renderWeeklyAvailabilities(allSlots);

        setApiSyncState("ok", `Registros: ${allSlots.length}.`);

    } catch (error) {
        console.error(error);
        setApiSyncState("error", "No se pudo leer el listado.");
        renderEmptyRow("Error cargando disponibilidades.");
    }
}

// ------------------------------------------------------------
// RENDERIZAR TABLA
// ------------------------------------------------------------

function renderWeeklyAvailabilities(slots) {
    tableBody.replaceChildren();

    if (!slots.length) {
        renderEmptyRow("No hay disponibilidades para los filtros seleccionados.");
        return;
    }

    slots.forEach((slot) => {
        const row = document.createElement("tr");

        const isSpecial = slot.type === "especial";

        const dayOrDate = isSpecial
            ? formatDate(slot.exception_date)
            : DAY_NAMES[slot.day_of_week];

        let minutes;
        if (slot.slot_minutes) {
            minutes = slot.slot_minutes;
        } else {
            const start = new Date(`2000-01-01T${slot.starts_time}`);
            const end = new Date(`2000-01-01T${slot.end_time}`);
            minutes = Math.round((end - start) / 60000);
        }

        const activeText = isSpecial ? "" : (slot.is_active ? "Sí" : "No");

        const toggleBtn = isSpecial
            ? ""
            : `
                <button class="btn btn-sm ${slot.is_active ? "btn-warning" : "btn-success"} toggle-btn"
                    data-id="${slot.id}"
                    data-type="normal"
                    data-active="${slot.is_active}">
                    ${slot.is_active ? "Desactivar" : "Activar"}
                </button>
            `;

        row.innerHTML = `
            <td>${PROFESSOR_NAMES[slot.teacher_profile_id] || slot.teacher_profile_id}</td>
            <td>${TOWN_NAMES[slot.town_id] || slot.town_id}</td>
            <td>${dayOrDate}</td>
            <td>${slot.starts_time}</td>
            <td>${slot.end_time}</td>
            <td>${minutes}</td>
            <td>${slot.type === "especial" ? "Especial" : "Normal"}</td>
            <td>${activeText}</td>

            <td class="text-center align-middle">
                <div class="availability-actions">

                    ${toggleBtn}

                    <button class="btn btn-sm btn-primary edit-btn"
                        data-id="${slot.id}"
                        data-type="${slot.type}">
                        Editar
                    </button>

                    <button class="btn btn-sm btn-danger delete-btn"
                        data-id="${slot.id}"
                        data-type="${slot.type}">
                        Eliminar
                    </button>

                </div>
            </td>
        `;

        tableBody.appendChild(row);

        if (!isSpecial) {
            row.querySelector(".toggle-btn").addEventListener("click", async () => {
                await toggleAvailability(slot);
            });
        }

        row.querySelector(".edit-btn").addEventListener("click", () => {
            openEditModal(slot);
        });

        row.querySelector(".delete-btn").addEventListener("click", async () => {
            await deleteAvailability(slot.id, slot.type);
        });
    });
}

function renderEmptyRow(message) {
    tableBody.replaceChildren();
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="9" style="text-align:center; color:#6b7280;">${escapeHtml(message)}</td>`;
    tableBody.appendChild(emptyRow);
}
// ------------------------------------------------------------
// ACCIONES
// ------------------------------------------------------------

async function toggleAvailability(slot) {
    try {
        await Api.toggleWeeklyAvailability(slot.id);
        await loadSlots();
    } catch (error) {
        console.error(error);
        showState("error", "No se pudo cambiar el estado.");
    }
}

async function deleteAvailability(id, type) {
    if (!confirm("¿Seguro que deseas eliminar esta disponibilidad?")) return;

    try {
        if (type === "especial") {
            await Api.deleteTeacherAvailabilityException(id);
        } else {
            await Api.deleteWeeklyAvailability(id);
        }
        await loadSlots();
    } catch (error) {
        console.error(error);
        showState("error", "No se pudo eliminar la disponibilidad.");
    }
}

// ------------------------------------------------------------
// EDITAR
// ------------------------------------------------------------

function openEditModal(slot) {
    availabilityProfessor.value = slot.teacher_profile_id;
    availabilityTown.value = slot.town_id;
    availabilityStart.value = slot.starts_time.substring(0, 5);
    availabilityEnd.value = slot.end_time.substring(0, 5);
    availabilityType.value = slot.type;
    availabilityBlockType.value = slot.block_type || "block";

    availabilityCreateBtn.dataset.editId = slot.id;
    availabilityCreateBtn.dataset.editType = slot.type;
    availabilityCreateBtn.textContent = "Actualizar disponibilidad";

    if (slot.type === "normal") {
        availabilityDayWrapper.classList.remove("hidden");
        availabilityDateWrapper.classList.add("hidden");
        availabilityReasonWrapper.classList.add("hidden");

        availabilityDay.value = slot.day_of_week;
        availabilityDate.value = "";
        availabilityReason.value = "";
    } else {
        availabilityDayWrapper.classList.add("hidden");
        availabilityDateWrapper.classList.remove("hidden");
        availabilityReasonWrapper.classList.remove("hidden");

        availabilityDay.value = "";
        availabilityDate.value = slot.exception_date;
        availabilityReason.value = slot.reason || "";
    }

    availabilityForm.scrollIntoView({ behavior: "smooth" });
}

// ------------------------------------------------------------
// CREAR / ACTUALIZAR
// ------------------------------------------------------------

availabilityCreateBtn.addEventListener("click", async () => {
    const editId = availabilityCreateBtn.dataset.editId || null;
    const editType = availabilityCreateBtn.dataset.editType || null;

    const teacherId = availabilityProfessor.value;
    const townId = availabilityTown.value;
    const start = availabilityStart.value;
    const end = availabilityEnd.value;
    const type = availabilityType.value;
    const blockType = availabilityBlockType.value;

    if (!teacherId || !townId || !start || !end || !blockType) {
        showState("error", "Completa todos los campos obligatorios.");
        return;
    }

    if (start >= end) {
        showState("error", "La hora de inicio debe ser menor que la hora de fin.");
        return;
    }

    const payload = {
        teacher_profile_id: teacherId,
        town_id: townId,
        starts_time: start + ":00",
        end_time: end + ":00",
        slot_minutes: 60,
        is_active: true,
        type,
        block_type: blockType,
    };

    if (type === "normal") {
        payload.day_of_week = Number(availabilityDay.value);
    } else {
        payload.exception_date = availabilityDate.value;
        payload.reason = availabilityReason.value;
    }

    try {
        if (editId) {
            if (editType === "especial") {
                await Api.updateTeacherAvailabilityException(editId, payload);
            } else {
                await Api.updateWeeklyAvailability(editId, payload);
            }
            showState("success", "Disponibilidad actualizada correctamente.");
        } else {
            await Api.createWeeklyAvailability(payload);
            showState("success", "Disponibilidad creada correctamente.");
        }

        delete availabilityCreateBtn.dataset.editId;
        delete availabilityCreateBtn.dataset.editType;
        availabilityCreateBtn.textContent = "Crear disponibilidad";

        await loadSlots();

    } catch (error) {
        console.error(error);
        showState("error", "No se pudo guardar la disponibilidad.");
    }
});
// ------------------------------------------------------------
// SISTEMA DE MENSAJES
// ------------------------------------------------------------

function showState(type, message) {
    if (!message) {
        messageBox.textContent = "";
        messageBox.className = "hidden";
        return;
    }

    messageBox.textContent = message;

    if (type === "error") {
        messageBox.className = "card card-body input-error state-message state-error";
    } else {
        messageBox.className = "card card-body state-message state-success";
    }

    messageBox.style.opacity = 0;
    setTimeout(() => (messageBox.style.opacity = 1), 10);

    if (type !== "error") {
        setTimeout(() => {
            messageBox.style.opacity = 0;
            setTimeout(() => {
                messageBox.textContent = "";
                messageBox.className = "hidden";
            }, 350);
        }, 3500);
    }
}

// ------------------------------------------------------------
// EVENTOS
// ------------------------------------------------------------

slotTownInput.addEventListener("change", loadSlots);
slotDateInput.addEventListener("change", loadSlots);
slotProfessorInput.addEventListener("change", loadSlots);

availabilityType.addEventListener("change", () => {
    if (availabilityType.value === "especial") {
        availabilityDayWrapper.classList.add("hidden");
        availabilityDateWrapper.classList.remove("hidden");
        availabilityReasonWrapper.classList.remove("hidden");
    } else {
        availabilityDayWrapper.classList.remove("hidden");
        availabilityDateWrapper.classList.add("hidden");
        availabilityReasonWrapper.classList.add("hidden");
    }
});

// ------------------------------------------------------------
// INICIALIZACIÓN
// ------------------------------------------------------------

(async function initializePage() {
    await loadSelectors();
    await loadSlots();
})();
});
