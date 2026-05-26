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
    const reasonWrapper = document.getElementById("availability-reason-wrapper");
    const slotMinutesInput = document.getElementById("availability-slot-minutes");
    const reasonInput = document.getElementById("availability-reason");
    const blockTypeSelect = document.getElementById("availability-block-type");
    const createBtn = document.getElementById("availability-create");
    const messageBox = document.getElementById("availability-message");
    const weeklyBody = document.getElementById("teacher-availability-body");

    let currentTeacherId = null;

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
            const teacherName = me.name || me.teacher_profile?.name || "Profesor";

            professorSelect.replaceChildren();
            const opt = document.createElement("option");
            opt.value = currentTeacherId;
            opt.textContent = teacherName;
            professorSelect.appendChild(opt);

            const townsResp = await Api.getTowns();
            const towns = Array.isArray(townsResp) ? townsResp : townsResp.data;

            const teacherTowns = me.teacher_profile?.towns || me.towns || [];
            const useTowns = teacherTowns.length ? teacherTowns : towns;

            townSelect.replaceChildren();
            const defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "Selecciona una población";
            townSelect.appendChild(defaultOpt);

            useTowns.forEach((t) => {
                const option = document.createElement("option");
                option.value = t.id;
                option.textContent = t.name;
                townSelect.appendChild(option);
            });

            PROFESSOR_NAMES[currentTeacherId] = teacherName;

            TOWN_NAMES = {};
            townSelect.querySelectorAll("option").forEach((opt) => {
                if (opt.value) TOWN_NAMES[opt.value] = opt.textContent;
            });

            if (useTowns.length === 1) {
                townSelect.value = useTowns[0].id;
                townGroup.style.display = "none";
            }

            await loadWeeklyAvailabilities();
        } catch (error) {
            console.error("Error inicializando disponibilidad:", error);
            showMessage("error", "No se pudo cargar datos iniciales.");
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString("es-ES");
    }

    async function autoCleanExpiredSpecials(slots) {
        const now = new Date();

        for (const slot of slots) {
            if (slot.type !== "especial") continue;

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

    async function loadWeeklyAvailabilities() {
        try {
            const resp = await Api.getWeeklyAvailabilities({
                teacher_profile_id: currentTeacherId,
            });

            let slots = resp.data || [];

            await autoCleanExpiredSpecials(slots);

            const resp2 = await Api.getWeeklyAvailabilities({
                teacher_profile_id: currentTeacherId,
            });
            slots = resp2.data || [];

            weeklyBody.replaceChildren();

            if (!slots.length) {
                const tr = document.createElement("tr");
                tr.innerHTML =
                    '<td colspan="9" style="text-align:center; color:#6b7280;">No hay disponibilidades registradas.</td>';
                weeklyBody.appendChild(tr);
                return;
            }

            slots.forEach((slot) => {
                const row = document.createElement("tr");

                const typeBadge =
                    slot.type === "especial"
                        ? `<span class="badge bg-warning text-dark">Especial</span>`
                        : `<span class="badge bg-success">Normal</span>`;

                const dayOrDate =
                    slot.type === "especial"
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

                const activeText = slot.type === "especial" ? "" : (slot.is_active ? "Sí" : "No");
                const toggleText = slot.is_active ? "Desactivar" : "Activar";
                const toggleClass = slot.is_active ? "btn-warning" : "btn-success";

                row.innerHTML = `
                    <td>${PROFESSOR_NAMES[slot.teacher_profile_id] || "-"}</td>
                    <td>${TOWN_NAMES[slot.town_id] || "-"}</td>
                    <td>${dayOrDate}</td>
                    <td>${slot.starts_time}</td>
                    <td>${slot.end_time}</td>
                    <td>${minutes}</td>
                    <td>${activeText}</td>

                    <td class="text-center align-middle">
                        <div class="availability-actions">

                            ${slot.type === "especial" ? "" : `
                                <button
                                    class="btn btn-sm ${toggleClass} toggle-btn"
                                    data-id="${slot.id}"
                                    data-type="${slot.type}"
                                    data-active="${slot.is_active}"
                                >
                                    ${toggleText}
                                </button>
                            `}

                            <button
                                class="btn btn-sm btn-primary edit-btn"
                                data-id="${slot.id}"
                                data-type="${slot.type}"
                            >
                                Editar
                            </button>

                            <button
                                class="btn btn-sm btn-danger delete-btn"
                                data-id="${slot.id}"
                                data-type="${slot.type}"
                            >
                                Eliminar
                            </button>

                        </div>
                    </td>
                `;

                weeklyBody.appendChild(row);

                if (slot.type !== "especial") {
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

            UI.setLoading('teacher-availability-body', false);
        } catch (error) {
            console.error("Error cargando disponibilidades:", error);
        }
    }

    async function toggleAvailability(slot) {
        try {
            UI.setLoading(true);

            await Api.toggleWeeklyAvailability(slot.id);

            showMessage("success", "Estado actualizado correctamente.");
            await loadWeeklyAvailabilities();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            showMessage("error", "No se pudo cambiar el estado.");
        } finally {
            UI.setLoading(false);
        }
    }

    async function deleteAvailability(id, type) {
        if (!confirm("¿Seguro que deseas eliminar esta disponibilidad?")) return;

        try {
            UI.setLoading(true);

            if (type === "especial") {
                await Api.deleteTeacherAvailabilityException(id);
            } else {
                await Api.deleteWeeklyAvailability(id);
            }

            showMessage("success", "Disponibilidad eliminada correctamente.");
            await loadWeeklyAvailabilities();
        } catch (error) {
            console.error("Error eliminando disponibilidad:", error);
            showMessage("error", "No se pudo eliminar la disponibilidad.");
        } finally {
            UI.setLoading(false);
        }
    }

    function openEditModal(slot) {
        typeSelect.value = slot.type;
        townSelect.value = slot.town_id;
        startTimeInput.value = slot.starts_time.substring(0, 5);
        endTimeInput.value = slot.end_time.substring(0, 5);
        slotMinutesInput.value = slot.slot_minutes || 60;

        if (slot.type === "normal") {
            dayWrapper.classList.remove("hidden");
            dateWrapper.classList.add("hidden");
            reasonWrapper.classList.add("hidden");

            daySelect.value = slot.day_of_week;
            dateInput.value = "";
            reasonInput.value = "";
        } else {
            dayWrapper.classList.add("hidden");
            dateWrapper.classList.remove("hidden");
            reasonWrapper.classList.remove("hidden");

            daySelect.value = "";
            dateInput.value = slot.exception_date;
            reasonInput.value = slot.reason || "";
        }

        createBtn.dataset.editId = slot.id;
        createBtn.dataset.editType = slot.type;

        createBtn.textContent = "Actualizar disponibilidad";
    }

    createBtn.addEventListener("click", async () => {
        const editId = createBtn.dataset.editId || null;
        const editType = createBtn.dataset.editType || null;

        const teacherId = currentTeacherId;
        const townId = townSelect.value || null;
        const start = startTimeInput.value;
        const end = endTimeInput.value;
        const type = typeSelect.value;
        const blockType = blockTypeSelect.value;
        const slotMinutes = parseInt(slotMinutesInput.value, 10) || 60;

        if (!teacherId || !type || !start || !end || !blockType || !slotMinutes) {
            showMessage("error", "Completa los campos obligatorios.");
            return;
        }

        if (start >= end) {
            showMessage("error", "La hora de inicio debe ser menor que la hora de fin.");
            return;
        }

        let day, date, reason;

        const payload = {
            teacher_profile_id: teacherId,
            town_id: townId,
            starts_time: start + ":00",
            end_time: end + ":00",
            slot_minutes: slotMinutes,
            is_active: true,
            type: type,
            block_type: blockType,
        };

        if (type === "normal") {
            day = daySelect.value;
            if (!day) {
                showMessage("error", "Debes seleccionar un día.");
                return;
            }
            payload.day_of_week = Number(day);
        } else {
            date = dateInput.value;
            reason = reasonInput.value;
            if (!date) {
                showMessage("error", "Debes seleccionar una fecha.");
                return;
            }
            payload.exception_date = date;
            payload.reason = reason;
        }

        try {
            UI.setLoading(true);

            if (editId) {
                if (editType === "especial") {
                    await Api.updateTeacherAvailabilityException(editId, payload);
                } else {
                    await Api.updateWeeklyAvailability(editId, payload);
                }
                showMessage("success", "Disponibilidad actualizada correctamente.");
            } else {
                await Api.createWeeklyAvailability(payload);
                showMessage("success", "Disponibilidad creada correctamente.");
            }

            delete createBtn.dataset.editId;
            delete createBtn.dataset.editType;
            createBtn.textContent = "Crear disponibilidad";

            await loadWeeklyAvailabilities();
        } catch (error) {
            console.error("Error:", error);
            showMessage("error", "No se pudo guardar la disponibilidad.");
        } finally {
            UI.setLoading(false);
        }
    });

    typeSelect.addEventListener("change", () => {
        if (typeSelect.value === "normal") {
            dayWrapper.classList.remove("hidden");
            dateWrapper.classList.add("hidden");
            reasonWrapper.classList.add("hidden");
        } else if (typeSelect.value === "especial") {
            dayWrapper.classList.add("hidden");
            dateWrapper.classList.remove("hidden");
            reasonWrapper.classList.remove("hidden");
        } else {
            dayWrapper.classList.add("hidden");
            dateWrapper.classList.add("hidden");
            reasonWrapper.classList.add("hidden");
        }
    });

    loadInitialData();
});
