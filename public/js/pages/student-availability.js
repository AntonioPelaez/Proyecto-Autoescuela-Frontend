import { showState } from '../ui-feedback.js';

document.addEventListener('DOMContentLoaded', async () => {

    Router.init();

    const townSelect = document.getElementById('town-select');
    const dateSelect = document.getElementById('date-select');
    const messageBox = document.getElementById('message-state');
    const form = document.getElementById('selection-form');

    const slotsSection = document.getElementById('time-slots-section');
    const slotsGrid = document.getElementById('time-slots-grid');

    const summaryBox = document.getElementById('booking-summary');
    const summaryDetails = document.getElementById('summary-details');
    const confirmForm = document.getElementById('confirm-form');
    const cancelBtn = document.getElementById('cancel-booking');

    const pendingBox = document.getElementById('pending-classes');
    const confirmedBox = document.getElementById('bookings-container');

    // Paso 3 — mismo estilo que Paso 2
    const teacherSection = document.createElement('div');
    teacherSection.id = 'teacher-selector-section';
    teacherSection.className = 'table-section';
    teacherSection.style.display = 'none';
    slotsSection.insertAdjacentElement('afterend', teacherSection);

    let weeklyAvailabilities = [];
    let teachersById = {};
    let allTeachers = [];
    let selectedSlot = null;
    let selectedTeacher = null;
    let myClasses = [];

    let student = null;
    window.allVehicles = [];

    // OCULTAR PASO 2 AL INICIO
    slotsSection.style.display = 'none';

    // ============================
    // 0) Cargar alumno + vehículos
    // ============================
    try {
        const me = await Api.getMe();
        student = {
            full_name: `${me.name} ${me.surname1 ?? ''} ${me.surname2 ?? ''}`.trim(),
            profile_id:
                me.student_profile_id ??
                me.studentProfile?.id ??
                me.student_profile?.id
        };

        const vehiclesResult = await Api.getVehicles();
        window.allVehicles = Array.isArray(vehiclesResult)
            ? vehiclesResult
            : (vehiclesResult.data || vehiclesResult.vehicles || []);
    } catch (err) {
        console.error('Error cargando datos iniciales:', err);
    }

    // ============================
    // 1) Cargar poblaciones
    // ============================
    loadTowns();

    async function loadTowns() {
        try {
            const result = await Api.getTowns();
            const towns = Array.isArray(result) ? result : (result.data || result.towns || []);

            townSelect.innerHTML = '<option value="">Selecciona población</option>';

            towns.forEach(town => {
                if (!town.is_active) return;
                const opt = document.createElement('option');
                opt.value = town.id;
                opt.textContent = town.name;
                townSelect.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            showState(messageBox, 'error', 'No se pudieron cargar las poblaciones.');
        }
    }

    // ============================
    // 2) Cargar clases pendientes/confirmadas
    // ============================
    async function loadMyClasses() {
        try {
            const result = await Api.getMyClasses();
            const classes = Array.isArray(result) ? result : (result.data || []);
            myClasses = classes;

            const pending = classes.filter(c => c.status === 'pending');
            const confirmed = classes.filter(c => c.status === 'confirmed');

            // PENDIENTES
            pendingBox.innerHTML = pending.length
                ? pending.map(c => `
                    <div class="pending-item">
                        <strong>${c.session_date}</strong> — ${c.start_time}<br>
                        Profesor: ${c.teacher_name} ${c.teacher_surname1 ?? ''} ${c.teacher_surname2 ?? ''}
                        <br>
                        <button class="btn btn-success btn-sm btn-confirm-class" data-id="${c.id}">Confirmar</button>
                        <button class="btn btn-danger btn-sm btn-cancel-class" data-id="${c.id}">Cancelar</button>
                    </div>
                `).join('')
                : `<p style="color:#999;">No tienes clases pendientes.</p>`;

            // CONFIRMADAS
            confirmedBox.innerHTML = confirmed.length
                ? confirmed.map(c => `
                    <div class="confirmed-item">
                        <strong>${c.session_date}</strong> — ${c.start_time}<br>
                        Profesor: ${c.teacher_name} ${c.teacher_surname1 ?? ''} ${c.teacher_surname2 ?? ''}
                    </div>
                `).join('')
                : `<p style="color:#999;">No tienes clases confirmadas.</p>`;

            // EVENTOS CONFIRMAR / CANCELAR
            document.querySelectorAll('.btn-confirm-class').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await Api.confirmClassSession({ id: btn.dataset.id });
                    await loadMyClasses();
                });
            });

            document.querySelectorAll('.btn-cancel-class').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await Api.cancelClassSession({ id: btn.dataset.id });
                    await loadMyClasses();
                });
            });

        } catch (err) {
            console.error(err);
            pendingBox.innerHTML = `<p style="color:red;">Error cargando clases.</p>`;
            confirmedBox.innerHTML = `<p style="color:red;">Error cargando clases.</p>`;
        }
    }

    await loadMyClasses();

    // ============================
    // 3) Buscar horarios
    // ============================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar que se hayan seleccionado población y fecha
        if (!townSelect.value) {
            showState(messageBox, 'error', 'Por favor, selecciona una población.');
            return;
        }

        if (!dateSelect.value) {
            showState(messageBox, 'error', 'Por favor, selecciona una fecha.');
            return;
        }

        await loadSlots(townSelect.value, dateSelect.value);
    });

    function isSlotReserved(slot) {
        const slotDate = slot.start.slice(0, 10);
        const slotStartTime = slot.start.slice(11, 19);
        const slotEndTime = slot.end.slice(11, 19);

        return myClasses.some(c =>
            ((c.status === 'pending' || c.status === 'confirmed' || c.status === 'completed')) &&
            c.session_date === slotDate &&
            c.start_time < slotEndTime &&
            c.end_time > slotStartTime
        );
    }

    // ============================
    // 4) Cargar horarios + profesores
    // ============================
    async function loadSlots(townId, date) {
        try {
            showState(messageBox, 'info', 'Buscando horarios...');

            // MOSTRAR PASO 2 SOLO AHORA
            slotsSection.style.display = 'block';

            const jsDay = new Date(date).getDay();
            const day_of_week = jsDay === 0 ? 7 : jsDay;

            const [slotsResult, weeklyResult, teachersResult] = await Promise.all([
                Api.getAvailabilitySlots({ town_id: townId, date }),
                Api.getWeeklyAvailabilities({ town_id: townId, day_of_week, is_active: 1 }),
                Api.getTeachers()
            ]);

            let slots = [];
            if (Array.isArray(slotsResult?.slots)) {
                slots = slotsResult.slots[0]?.slots || [];
            } else if (Array.isArray(slotsResult?.slots?.slots)) {
                slots = slotsResult.slots.slots;
            } else if (Array.isArray(slotsResult)) {
                slots = slotsResult;
            }

            weeklyAvailabilities =
                Array.isArray(weeklyResult)
                    ? weeklyResult
                    : (weeklyResult.data || weeklyResult.weekly_availabilities || []);

            allTeachers = Array.isArray(teachersResult)
                ? teachersResult
                : (teachersResult.data || []);

            teachersById = {};
            allTeachers.forEach(t => { teachersById[t.id] = t; });

            slotsGrid.innerHTML = '';
            teacherSection.style.display = 'none';
            summaryBox.style.display = 'none';
            selectedSlot = null;
            selectedTeacher = null;

            if (!slots.length) {
                slotsGrid.innerHTML = `<p style="color:#999;">No hay horarios disponibles.</p>`;
                return;
            }

            slots.forEach(slot => {
                const hora = slot.start.slice(11, 16);
                const startTime = slot.start.slice(11, 19);

                const availableTeacherIds = weeklyAvailabilities
                    .filter(w => w.starts_time <= startTime && w.end_time > startTime)
                    .map(w => w.teacher_profile_id);

                slot._availableTeacherIds = availableTeacherIds;

                const reserved = isSlotReserved(slot);

                const btn = document.createElement('button');
                btn.className = 'time-slot-btn';

                if (reserved) {
                    btn.classList.add('reserved');
                    btn.disabled = true;
                    btn.innerHTML = `<span>${hora}</span><span class="prof-count" style="color:#d9534f;">Ocupada</span>`;
                } else {
                    btn.innerHTML = `<span>${hora}</span><span class="prof-count">${availableTeacherIds.length} prof.</span>`;
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');

                        selectedSlot = slot;
                        selectedTeacher = null;

                        renderTeacherSelector(slot);
                        clearSummary();
                    });
                }

                slotsGrid.appendChild(btn);
            });

            showState(messageBox, 'success', 'Horarios cargados correctamente.');
        } catch (err) {
            console.error(err);
            showState(messageBox, 'error', 'Error cargando horarios.');
        }
    }

    // ============================
    // 5) Paso 3 — SELECT de profesor
    // ============================
    async function renderTeacherSelector(slot) {
        const availableIds = new Set(slot._availableTeacherIds || []);

        teacherSection.innerHTML = `
            <h3>👨‍🏫 Paso 3: Elige Profesor</h3>
            <div class="teacher-select-box-inner">
                <label for="teacher-select"><strong>Selecciona profesor:</strong></label>
                <select id="teacher-select" class="form-control" style="max-width: 320px;">
                    <option value="">Elige profesor</option>
                </select>
                <div id="teacher-stats" class="teacher-stats" style="margin-top:10px;"></div>
            </div>
        `;

        const teacherSelect = document.getElementById('teacher-select');
        const statsBox = document.getElementById('teacher-stats');

        for (const t of allTeachers) {
            let fullName = t.name;
            let statsData = { impartidas: 0 };

            try {
                const stats = await Api.getTeacherStats(t.id);
                fullName = stats.full_name || fullName;
                statsData = stats.stats || statsData;
            } catch (e) {
                console.error('Error stats profesor', t.id, e);
            }

            teachersById[t.id].full_name = fullName;
            teachersById[t.id].stats = statsData;

            const isAvailable = availableIds.has(t.id);

            const option = document.createElement('option');
            option.value = t.id;
            option.disabled = !isAvailable;
            option.textContent = isAvailable
                ? `${fullName} (${statsData.impartidas} clases)`
                : `${fullName} (no disponible en esta hora)`;

            teacherSelect.appendChild(option);
        }

        teacherSection.style.display = 'block';

        teacherSelect.addEventListener('change', () => {
            const teacherId = parseInt(teacherSelect.value);
            if (!teacherId) {
                selectedTeacher = null;
                statsBox.innerHTML = '';
                clearSummary();
                return;
            }

            selectedTeacher = teachersById[teacherId];

            statsBox.innerHTML = `
                <p><strong>Clases impartidas:</strong> ${selectedTeacher.stats.impartidas}</p>
            `;

            renderSummary();
        });
    }

    // ============================
    // 6) Resumen
    // ============================
    function clearSummary() {
        summaryDetails.innerHTML = '';
        summaryBox.style.display = 'none';
    }

    function renderSummary() {
        if (!selectedSlot || !selectedTeacher || !student) return;

        const hora = selectedSlot.start.slice(11, 16);
        const fecha = selectedSlot.start.slice(0, 10);

        const vehicle = window.allVehicles.find(v => v.id === selectedSlot.vehicle_id);
        const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : selectedSlot.vehicle_id;

        const townName = townSelect.options[townSelect.selectedIndex]?.textContent || '';

        summaryDetails.innerHTML = `
            <p><strong>Alumno:</strong> ${student.full_name}</p>
            <p><strong>Profesor:</strong> ${selectedTeacher.full_name}</p>
            <p><strong>Población:</strong> ${townName}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Hora:</strong> ${hora}</p>
            <p><strong>Vehículo:</strong> ${vehicleName}</p>
        `;

        summaryBox.style.display = 'block';
    }

    // ============================
    // 7) Confirmar reserva
    // ============================
    confirmForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedSlot || !selectedTeacher || !student) {
            showState(messageBox, 'error', 'Debes seleccionar hora y profesor.');
            return;
        }

        try {
            const payload = {
                teacher_id: selectedTeacher.id,
                student_id: student.profile_id,
                town_id: parseInt(townSelect.value),
                vehicle_id: selectedSlot.vehicle_id,
                date: selectedSlot.start.slice(0, 10),
                start: selectedSlot.start,
                end: selectedSlot.end
            };

            await Api.createClassSession(payload);

            showState(messageBox, 'success', 'Reserva creada correctamente.');
            clearSummary();
            teacherSection.style.display = 'none';
            selectedSlot = null;
            selectedTeacher = null;
            document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));

            await loadMyClasses();
            if (dateSelect.value && townSelect.value) {
                await loadSlots(townSelect.value, dateSelect.value);
            }
        } catch (err) {
            console.error(err);
            showState(messageBox, 'error', err.message || 'Error al crear la reserva.');
        }
    });

    // ============================
    // 8) Cancelar selección
    // ============================
    cancelBtn.addEventListener('click', () => {
        clearSummary();
        teacherSection.style.display = 'none';
        selectedSlot = null;
        selectedTeacher = null;
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
    });
});
