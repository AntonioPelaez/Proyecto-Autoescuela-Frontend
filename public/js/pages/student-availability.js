import { showState } from "../ui-feedback.js";

document.addEventListener("DOMContentLoaded", async () => {
    Router.init();

    const townSelect = document.getElementById("town-select");
    const dateSelect = document.getElementById("date-select");
    const messageBox = document.getElementById("message-state");
    const form = document.getElementById("selection-form");

    const slotsSection = document.getElementById("time-slots-section");
    const slotsGrid = document.getElementById("time-slots-grid");

    const teacherSection = document.getElementById("teacher-selector-section");

    const summaryBox = document.getElementById("booking-summary");
    const summaryDetails = document.getElementById("summary-details");
    const confirmForm = document.getElementById("confirm-form");
    const cancelBtn = document.getElementById("cancel-booking");

    const confirmedBox = document.getElementById("bookings-container");

    const popup = document.getElementById("confirm-popup");
    const popupYes = document.getElementById("popup-yes");
    const popupNo = document.getElementById("popup-no");

    let weeklyAvailabilities = [];
    let teachersById = {};
    let allTeachers = [];
    let selectedSlot = null;
    let selectedTeacher = null;
    let myClasses = [];
    let student = null;

    const teacherStatsCache = new Map();

    slotsSection.style.display = "none";
    teacherSection.style.display = "none";
    summaryBox.style.display = "none";

    // ============================
    // 0) Cargar alumno
    // ============================
    try {
        const me = await Api.getMe();
        student = {
            full_name: `${me.name} ${me.surname1 ?? ""} ${me.surname2 ?? ""}`.trim(),
            profile_id: me.student_profile_id ?? me.studentProfile?.id ?? me.student_profile?.id,
        };
    } catch (err) {
        console.error("Error cargando datos iniciales:", err);
    }

    // ============================
    // 1) Cargar poblaciones
    // ============================
    loadTowns();

    async function loadTowns() {
        try {
            const result = await Api.getTowns();
            const towns = Array.isArray(result) ? result : result.data || result.towns || [];

            const fragment = document.createDocumentFragment();
            const defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "Selecciona población";
            fragment.appendChild(defaultOpt);

            for (const town of towns) {
                if (!town.is_active) continue;
                const opt = document.createElement("option");
                opt.value = town.id;
                opt.textContent = town.name;
                fragment.appendChild(opt);
            }

            townSelect.innerHTML = "";
            townSelect.appendChild(fragment);
        } catch (err) {
            console.error(err);
            showState(messageBox, "error", "No se pudieron cargar las poblaciones.");
        }
    }

    // ============================
    // 2) Cargar clases confirmadas
    // ============================
    async function loadMyClasses() {
        try {
            const result = await Api.getMyClasses();
            const classes = Array.isArray(result) ? result : result.data || [];
            myClasses = classes;

            const confirmed = classes.filter((c) => c.status === "confirmed");

            if (!confirmed.length) {
                confirmedBox.innerHTML = `<p style="color:#999;">No tienes clases confirmadas.</p>`;
                return;
            }

            const fragment = document.createDocumentFragment();
            confirmedBox.innerHTML = "";

            for (const c of confirmed) {
                const [y, m, d] = c.session_date.split("-");
                const fecha = `${d}/${m}/${y}`;

                const div = document.createElement("div");
                div.className = "confirmed-item";
                div.innerHTML = `
                    <strong>${fecha}</strong> — ${c.start_time}<br>
                    Profesor: ${c.teacher_name} ${c.teacher_surname1 ?? ""} ${c.teacher_surname2 ?? ""}
                `;
                fragment.appendChild(div);
            }

            confirmedBox.appendChild(fragment);
        } catch (err) {
            console.error(err);
            confirmedBox.innerHTML = `<p style="color:red;">Error cargando clases.</p>`;
        }
    }

    await loadMyClasses();

    // ============================
    // 3) Buscar horarios
    // ============================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!townSelect.value) {
            showState(messageBox, "error", "Por favor, selecciona una población.");
            return;
        }

        if (!dateSelect.value) {
            showState(messageBox, "error", "Por favor, selecciona una fecha.");
            return;
        }

        await loadSlots(townSelect.value, dateSelect.value);
    });

    // ============================
    // FUNCIÓN CLAVE: PROFESORES LIBRES POR SLOT
    // ============================
    function getFreeTeacherIdsForSlot(slot) {
    return slot.free_teacher_ids || [];
}


    // ============================
    // 4) Cargar horarios + profesores
    // ============================
    async function loadSlots(townId, date) {
        try {
            showState(messageBox, "info", "Buscando horarios...");
            slotsSection.style.display = "block";

            const jsDay = new Date(date).getDay();
            const day_of_week = jsDay === 0 ? 7 : jsDay;

            const [slotsResult, weeklyResult, teachersResult] = await Promise.all([
                Api.getAvailabilitySlots({ town_id: townId, date }),
                Api.getWeeklyAvailabilities({ town_id: townId, day_of_week, is_active: 1 }),
                Api.getTeachers(),
            ]);

            weeklyAvailabilities = Array.isArray(weeklyResult)
                ? weeklyResult
                : weeklyResult.data || weeklyResult.weekly_availabilities || [];

            let rawSlots = [];
            if (Array.isArray(slotsResult?.slots)) {
                rawSlots = slotsResult.slots.flatMap((t) =>
                    t.slots.map((s) => ({
                        ...s,
                        teacher_profile_id: t.teacher_id,
                    }))
                );
            }

           // 🔥 Agrupar por hora de inicio
const grouped = {};

for (const s of rawSlots) {
    const key = s.start; // solo la hora, sin profesor

    if (!grouped[key]) {
        grouped[key] = {
            start: s.start,
            end: s.end,
            teacher_ids: [],
            free_teacher_ids: [],
        };
    }

    grouped[key].teacher_ids.push(s.teacher_profile_id);

    if (!s.reserved) {
        grouped[key].free_teacher_ids.push(s.teacher_profile_id);
    }
}

// 🔥 Convertir a array ordenado
const slots = Object.values(grouped).sort((a, b) => a.start.localeCompare(b.start));

            allTeachers = Array.isArray(teachersResult)
                ? teachersResult
                : teachersResult.data || [];

            allTeachers = allTeachers.filter((t) => t.name && t.surname1);

            teachersById = {};
            for (const t of allTeachers) {
                teachersById[t.id] = {
                    id: t.id,
                    user_id: t.user_id,
                    name: t.name,
                    surname1: t.surname1,
                    surname2: t.surname2,
                    email: t.email,
                    dni: t.dni,
                    is_active_for_booking: t.is_active_for_booking,
                    license_number: t.license_number,
                    notes: t.notes,
                    vehicles: t.vehicles || [],
                    full_name: `${t.name} ${t.surname1 ?? ""} ${t.surname2 ?? ""}`.trim(),
                };
            }

            slotsGrid.innerHTML = "";
            teacherSection.style.display = "none";
            summaryBox.style.display = "none";
            selectedSlot = null;
            selectedTeacher = null;

            if (!slots.length) {
                slotsGrid.innerHTML = `<p style="color:#999;">No hay horarios disponibles.</p>`;
                showState(messageBox, "success", "Horarios cargados correctamente.");
                return;
            }

            const fragment = document.createDocumentFragment();

            for (const slot of slots) {
                const hora = slot.start.slice(11, 16);
                const freeTeacherIds = getFreeTeacherIdsForSlot(slot);
                slot._availableTeacherIds = freeTeacherIds;

                const btn = document.createElement("button");
                btn.className = "time-slot-btn";

                if (freeTeacherIds.length === 0) {
                    btn.classList.add("reserved");
                    btn.disabled = true;
                    btn.innerHTML = `<span>${hora}</span><span class="prof-count" style="color:#d9534f;">Ocupada</span>`;
                } else {
                    btn.innerHTML = `<span>${hora}</span><span class="prof-count">${freeTeacherIds.length} prof.</span>`;
                    btn.addEventListener("click", () => handleSlotClick(btn, slot));
                }

                fragment.appendChild(btn);
            }

            slotsGrid.appendChild(fragment);
            showState(messageBox, "success", "Horarios cargados correctamente.");
        } catch (err) {
            console.error(err);
            showState(messageBox, "error", "Error cargando horarios.");
        }
    }

    function handleSlotClick(btn, slot) {
        document.querySelectorAll(".time-slot-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        clearSummary();
        selectedSlot = slot;

        const freeTeacherIds = slot._availableTeacherIds || [];

        if (freeTeacherIds.length === 1) {
            selectedTeacher = teachersById[freeTeacherIds[0]];
            teacherSection.style.display = "none";
            renderSummary();
        } else {
            selectedTeacher = null;
            renderTeacherSelector(slot);
        }
    }

    // ============================
    // 5) Paso 3 — SELECT de profesor
    // ============================
    async function getTeacherStatsCached(teacherId) {
        if (teacherStatsCache.has(teacherId)) {
            return teacherStatsCache.get(teacherId);
        }
        try {
            const stats = await Api.getTeacherStats(teacherId);
            teacherStatsCache.set(teacherId, stats);
            return stats;
        } catch (e) {
            console.error("Error stats profesor", teacherId, e);
            const fallback = { full_name: "", stats: { impartidas: 0 } };
            teacherStatsCache.set(teacherId, fallback);
            return fallback;
        }
    }

    async function renderTeacherSelector(slot) {
        const availableIds = new Set(slot._availableTeacherIds || []);

        teacherSection.innerHTML = `
            <h3>👨‍🏫 Paso 3: Elige Profesor</h3>
            <div class="teacher-select-box-inner">
                <label><strong>Selecciona profesor:</strong></label>
                <select id="teacher-select" class="form-select">
                    <option value="">Selecciona un profesor</option>
                </select>
            </div>
        `;

        const select = document.getElementById("teacher-select");

        const idsArray = [...availableIds];
        const statsPromises = idsArray.map((id) => getTeacherStatsCached(id));
        const statsResults = await Promise.all(statsPromises);

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < idsArray.length; i++) {
            const id = idsArray[i];
            const t = teachersById[id];
            if (!t) continue;

            const stats = statsResults[i] || {};
            const fullName = stats.full_name || t.full_name;
            const impartidas = stats.stats?.impartidas ?? 0;

            t.full_name = fullName;
            t.stats = stats.stats || { impartidas: 0 };

            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = `${fullName} (${impartidas} clases)`;

            fragment.appendChild(opt);
        }

        select.appendChild(fragment);

        select.addEventListener("change", () => {
            const id = parseInt(select.value);
            selectedTeacher = teachersById[id] || null;

            if (selectedTeacher) {
                renderSummary();
            } else {
                summaryBox.style.display = "none";
            }
        });

        teacherSection.style.display = "block";
    }

    // ============================
    // 6) Resumen
    // ============================
    function clearSummary() {
        summaryDetails.innerHTML = "";
        summaryBox.style.display = "none";
    }

    function renderSummary() {
        if (!selectedSlot || !selectedTeacher || !student) return;

        const hora = selectedSlot.start.slice(11, 16);

        const rawDate = selectedSlot.start.slice(0, 10);
        const [year, month, day] = rawDate.split("-");
        const fecha = `${day}/${month}/${year}`;

        const vehicle = selectedTeacher.vehicles?.[0];
        const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : "Sin vehículo asignado";

        const townName = townSelect.options[townSelect.selectedIndex]?.textContent || "";

        const price = window.AUTOESCUELA_PRICE ?? "25.00";

        summaryDetails.innerHTML = `
            <p><strong>Alumno:</strong> ${student.full_name}</p>
            <p><strong>Profesor:</strong> ${selectedTeacher.full_name}</p>
            <p><strong>Población:</strong> ${townName}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Hora:</strong> ${hora}</p>
            <p><strong>Vehículo:</strong> ${vehicleName}</p>
            <p><strong>Precio:</strong> ${price} €</p>
        `;

        summaryBox.style.display = "block";
    }

    // ============================
    // 7) Confirmar reserva
    // ============================
    confirmForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!selectedSlot || !selectedTeacher) {
            showState(messageBox, "error", "Debes seleccionar hora y profesor.");
            return;
        }

        popup.classList.remove("hidden");
    });

    popupYes.addEventListener("click", async () => {
        const bookingData = {
            teacher_id: selectedTeacher.id,
            teacherId: selectedTeacher.id,
            student_id: student.profile_id,
            studentId: student.profile_id,
            studentName: student.full_name,
            town_id: parseInt(townSelect.value),
            townId: parseInt(townSelect.value),
            townName: townSelect.options[townSelect.selectedIndex]?.textContent || "",
            vehicle_id: selectedTeacher.vehicles?.[0]?.id,
            vehicleId: selectedTeacher.vehicles?.[0]?.id,
            date: selectedSlot.start.slice(0, 10),
            start: selectedSlot.start,
            end: selectedSlot.end,
            status: "pending",
            teacherName: selectedTeacher.full_name,
            vehicleName: selectedTeacher.vehicles?.[0]
                ? `${selectedTeacher.vehicles[0].brand} ${selectedTeacher.vehicles[0].model}`
                : "Sin vehículo asignado",
            price: window.AUTOESCUELA_PRICE ?? "25.00",
        };

        try {
            popup.classList.add("hidden");
            showState(messageBox, "info", "Verificando saldo...");

            // Obtener saldo del estudiante
            const studentData = await Api.getMe();
            const studentBalance = parseFloat(studentData.student_profile?.wallet?.balance ?? 0);
            const classPrice = parseFloat(bookingData.price);



            // Guardar datos en sessionStorage
            sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));

            // Verificar saldo
            if (studentBalance >= classPrice) {
                // Hay saldo suficiente, ir a confirmación
                window.location.href = "/student/confirm-booking";
            } else {
                // No hay saldo suficiente, ir a recarga
                sessionStorage.setItem("redirectAfterRecharge", "/student/confirm-booking");
                window.location.href = "/student/recharge";
            }
        } catch (err) {
            console.error(err);
            showState(messageBox, "error", "Error al procesar la reserva.");
        }
    });

    popupNo.addEventListener("click", () => {
        popup.classList.add("hidden");

        selectedSlot = null;
        selectedTeacher = null;
        document.querySelectorAll(".time-slot-btn").forEach((b) => b.classList.remove("selected"));
        teacherSection.style.display = "none";
        summaryBox.style.display = "none";
    });

    // ============================
    // 8) Cancelar selección
    // ============================
    cancelBtn.addEventListener("click", () => {
        selectedSlot = null;
        selectedTeacher = null;
        teacherSection.style.display = "none";
        summaryBox.style.display = "none";
        document.querySelectorAll(".time-slot-btn").forEach((b) => b.classList.remove("selected"));
    });
});