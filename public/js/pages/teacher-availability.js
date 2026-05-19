// teacher-availability.js — Gestión de disponibilidades para profesor

document.addEventListener("DOMContentLoaded", () => {
    Router.init();

    const availabilityForm = document.getElementById("availability-form");
    const professorSelect = document.getElementById("availability-professor");
    const townGroup = document.getElementById("availability-town-group");
    const townSelect = document.getElementById("availability-town");
    const dayWrapper = document.getElementById("availability-day-wrapper");
    const daySelect = document.getElementById("availability-day");
    const startTimeInput = document.getElementById("availability-start-time");
    const endTimeInput = document.getElementById("availability-end-time");
    const typeSelect = document.getElementById("availability-type");
    const dateWrapper = document.getElementById("availability-date-wrapper");
    const dateInput = document.getElementById("availability-date");
    const reasonWrapper = document.getElementById(
        "availability-reason-wrapper",
    );
    const reasonInput = document.getElementById("availability-reason");
    const blockTypeSelect = document.getElementById("availability-block-type");
    const createBtn = document.getElementById("availability-create");
    const messageBox = document.getElementById("availability-message");
    const weeklyBody = document.getElementById("teacher-availability-body");
    const availabilityForm = document.getElementById('availability-form');
    const professorSelect = document.getElementById('availability-professor');
    const townGroup = document.getElementById('availability-town-group');
    const townSelect = document.getElementById('availability-town');
    const dayWrapper = document.getElementById('availability-day-wrapper');
    const daySelect = document.getElementById('availability-day');
    const startTimeInput = document.getElementById('availability-start-time');
    const endTimeInput = document.getElementById('availability-end-time');
    const typeSelect = document.getElementById('availability-type');
    const dateWrapper = document.getElementById('availability-date-wrapper');
    const dateInput = document.getElementById('availability-date');
    const reasonWrapper = document.getElementById('availability-reason-wrapper');
    const reasonInput = document.getElementById('availability-reason');
    const blockTypeSelect = document.getElementById('availability-block-type');
    const slotMinutesInput = document.getElementById('availability-slot-minutes');
    const createBtn = document.getElementById('availability-create');
    const messageBox = document.getElementById('availability-message');
    const weeklyBody = document.getElementById('teacher-availability-body');

    let currentTeacherId = null;
    let teacherTowns = [];

    const DAY_NAMES = {
        0: "Domingo",
        1: "Lunes",
        2: "Martes",
        3: "Miércoles",
        4: "Jueves",
        5: "Viernes",
        6: "Sábado",
    };

    let PROFESSOR_NAMES = {};
    let TOWN_NAMES = {};

    function showMessage(type, text) {
        if (!messageBox) return;

        if (!text) {
            messageBox.textContent = "";
            messageBox.className = "hidden";
            return;
        }

        messageBox.textContent = text;
        messageBox.className =
            type === "error"
                ? "card card-body input-error"
                : "card card-body state-message state-success";

        messageBox.setAttribute("role", type === "error" ? "alert" : "status");

        messageBox.style.opacity = 0;
        setTimeout(() => (messageBox.style.opacity = 1), 10);

        if (type !== "error") {
            setTimeout(() => {
                messageBox.style.opacity = 0;
                setTimeout(() => {
                    messageBox.textContent = "";
                    messageBox.className = "hidden";
                }, 350);
            }, 3000);
        }
    }

    async function loadInitialData() {
        try {
            const meResp = await Api.getMe();
            const me = meResp.data || meResp;

            currentTeacherId = me.teacher_profile?.id || me.teacher_profile_id;
            const teacherName =
                me.name || me.teacher_profile?.name || "Profesor";

            professorSelect.replaceChildren();
            const opt = document.createElement("option");
            opt.value = currentTeacherId || "";
            opt.textContent = teacherName;
            professorSelect.appendChild(opt);

            const townsResp = await Api.getTowns();
            const towns = Array.isArray(townsResp)
                ? townsResp
                : townsResp.data || townsResp;

            teacherTowns = me.teacher_profile?.towns || me.towns || [];
            const useTowns = teacherTowns.length ? teacherTowns : towns;

            townSelect.replaceChildren();
            const defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "Selecciona una población";
            townSelect.appendChild(defaultOpt);

            useTowns.forEach((t) => {
                const option = document.createElement("option");
                option.value = String(t.id || t);
                option.textContent = t.name || t;
                townSelect.appendChild(option);
            });

            PROFESSOR_NAMES[currentTeacherId] = teacherName;

            TOWN_NAMES = {};
            townSelect.querySelectorAll("option").forEach((opt) => {
                if (opt.value) TOWN_NAMES[opt.value] = opt.textContent;
            });

            if (useTowns.length === 1) {
                townSelect.value = String(useTowns[0].id || useTowns[0]);
                townGroup.style.display = "none";
            }

            await loadWeeklyAvailabilities();
        } catch (error) {
            console.error("Error inicializando disponibilidad:", error);
            showMessage("error", "No se pudo cargar datos iniciales.");
        }
    }

    async function loadWeeklyAvailabilities() {
        try {
            const resp = await Api.getWeeklyAvailabilities({
                teacher_profile_id: currentTeacherId,
            });
            const slots = resp.data || resp || [];

            weeklyBody.replaceChildren();

            if (!slots.length) {
                const tr = document.createElement("tr");
                tr.innerHTML =
                    '<td colspan="7" style="text-align:center; color:#6b7280;">No hay disponibilidades registradas.</td>';
                weeklyBody.appendChild(tr);
                return;
            }

            slots.forEach((slot) => {
                const row = document.createElement("tr");
                const toggleStatus = slot.is_active ? "Desactivar" : "Activar";
                row.innerHTML = `
                    <td>${PROFESSOR_NAMES[slot.teacher_profile_id] || slot.teacher_profile_id}</td>
                    <td>${TOWN_NAMES[slot.town_id] || slot.town_id || "-"}</td>
                    <td>${DAY_NAMES[slot.day_of_week] || slot.day_of_week}</td>
                    <td>${slot.starts_time}</td>
                    <td>${slot.end_time}</td>
                    <td>${slot.slot_minutes}</td>
                    <td>${slot.is_active ? "Sí" : "No"}</td>
                    <td>
                        <button class="btn btn-sm toggle-availability-btn" data-id="${slot.id}" data-active="${slot.is_active}">
                            ${toggleStatus}
                        </button>
                    </td>
                `;
                weeklyBody.appendChild(row);

                // Agregar evento al botón de toggle
                const toggleBtn = row.querySelector(".toggle-availability-btn");
                toggleBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const slotId = toggleBtn.dataset.id;
                    const isCurrentlyActive =
                        toggleBtn.dataset.active === "true";

                    try {
                        UI.setLoading(true);
                        await Api.toggleWeeklyAvailability(slotId, !isCurrentlyActive);
                        showMessage(
                            "success",
                            "Estado actualizado correctamente.",
                        );
                        await loadWeeklyAvailabilities();
                    } catch (error) {
                        console.error(
                            "Error actualizando disponibilidad:",
                            error,
                        );
                        showMessage(
                            "error",
                            "No se pudo actualizar el estado de la disponibilidad.",
                        );
                    } finally {
                        UI.setLoading(false);
                    }
                });
            });
        } catch (error) {
            console.error("Error cargando disponibilidades semanales:", error);
        }
    }

    typeSelect.addEventListener("change", () => {
        if (typeSelect.value === "normal") {
            // Mostrar día, ocultar fecha y razón
            dayWrapper.classList.remove("hidden");
            dateWrapper.classList.add("hidden");
            reasonWrapper.classList.add("hidden");
            dateInput.value = "";
            reasonInput.value = "";
        } else if (typeSelect.value === "especial") {
            // Mostrar fecha y razón, ocultar día
            dayWrapper.classList.add("hidden");
            dateWrapper.classList.remove("hidden");
            reasonWrapper.classList.remove("hidden");
            daySelect.value = "";
        } else {
            // Si está vacío, ocultar todo
            dayWrapper.classList.add("hidden");
            dateWrapper.classList.add("hidden");
            reasonWrapper.classList.add("hidden");
        }
    });

    createBtn.addEventListener("click", async () => {
        const teacherId = currentTeacherId;
        const townId = townSelect.value || null;
        const start = startTimeInput.value;
        const end = endTimeInput.value;
        const type = typeSelect.value;
        const blockType = blockTypeSelect.value;
        const slotMinutes = parseInt(slotMinutesInput.value, 10) || 60;

        // Validación básica
        if (!teacherId || !type || !start || !end || !blockType) {
            showMessage("error", "Completa los campos obligatorios.");
        if (!teacherId || !type || !start || !end || !blockType || !slotMinutes) {
            showMessage('error', 'Completa los campos obligatorios.');
            return;
        }

        if (start >= end) {
            showMessage(
                "error",
                "La hora de inicio debe ser menor que la hora de fin.",
            );
            return;
        }

        // Validación según tipo
        let day, date, reason;

        if (type === "normal") {
            day = daySelect.value;
            if (!day) {
                showMessage(
                    "error",
                    "Debes seleccionar un día de la semana para disponibilidades normales.",
                );
                return;
            }
        } else if (type === "especial") {
            date = dateInput.value;
            reason = reasonInput.value;
            if (!date) {
                showMessage(
                    "error",
                    "Debes seleccionar una fecha para disponibilidades especiales.",
                );
                return;
            }
        }

        const payload = {
            teacher_profile_id: teacherId,
            town_id: townId,
            starts_time: start + ":00",
            end_time: end + ":00",
            slot_minutes: 60,
            starts_time: start + ':00',
            end_time: end + ':00',
            slot_minutes: slotMinutes,
            is_active: true,
            type: type,
            block_type: blockType,
        };

        // Agregar día si es normal
        if (type === "normal" && day) {
            payload.day_of_week = Number(day);
        }

        // Agregar fecha y razón si es especial
        if (type === "especial") {
            if (date) payload.exception_date = date;
            if (reason) payload.reason = reason;
        }

        try {
            UI.setLoading(true);

            await Api.createWeeklyAvailability(payload);

            showMessage("success", "Disponibilidad creada correctamente.");

            // Limpiar formulario
            typeSelect.value = "";
            daySelect.value = "";
            dateInput.value = "";
            reasonInput.value = "";
            startTimeInput.value = "";
            endTimeInput.value = "";
            dayWrapper.classList.add("hidden");
            dateWrapper.classList.add("hidden");
            reasonWrapper.classList.add("hidden");

            await loadWeeklyAvailabilities();
        } catch (error) {
            console.error("Error creando disponibilidad:", error);
            showMessage(
                "error",
                error.message || "No se pudo crear la disponibilidad.",
            );
        } finally {
            UI.setLoading(false);
        }
    });

    loadInitialData();
});
