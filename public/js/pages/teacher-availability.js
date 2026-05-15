// teacher-availability.js — Gestión de disponibilidades para profesor

document.addEventListener('DOMContentLoaded', () => {

    Router.init();

    const availabilityForm = document.getElementById('availability-form');
    const professorSelect = document.getElementById('availability-professor');
    const townGroup = document.getElementById('availability-town-group');
    const townSelect = document.getElementById('availability-town');
    const daySelect = document.getElementById('availability-day');
    const startTimeInput = document.getElementById('availability-start-time');
    const endTimeInput = document.getElementById('availability-end-time');
    const typeSelect = document.getElementById('availability-type');
    const reasonWrapper = document.getElementById('availability-reason-wrapper');
    const reasonInput = document.getElementById('availability-reason');
    const blockTypeSelect = document.getElementById('availability-block-type');
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
        6: "Sábado"
    };

    let PROFESSOR_NAMES = {};
    let TOWN_NAMES = {};

    function showMessage(type, text) {
        if (!messageBox) return;

        if (!text) {
            messageBox.textContent = '';
            messageBox.className = 'hidden';
            return;
        }

        messageBox.textContent = text;
        messageBox.className = type === 'error'
            ? 'card card-body input-error'
            : 'card card-body state-message state-success';

        messageBox.setAttribute('role', type === 'error' ? 'alert' : 'status');

        messageBox.style.opacity = 0;
        setTimeout(() => messageBox.style.opacity = 1, 10);

        if (type !== 'error') {
            setTimeout(() => {
                messageBox.style.opacity = 0;
                setTimeout(() => {
                    messageBox.textContent = '';
                    messageBox.className = 'hidden';
                }, 350);
            }, 3000);
        }
    }

    async function loadInitialData() {
        try {
            const meResp = await Api.getMe();
            const me = meResp.data || meResp;

            currentTeacherId = me.teacher_profile?.id || me.teacher_profile_id;
            const teacherName = me.name || me.teacher_profile?.name || 'Profesor';

            professorSelect.replaceChildren();
            const opt = document.createElement('option');
            opt.value = currentTeacherId || '';
            opt.textContent = teacherName;
            professorSelect.appendChild(opt);

            const townsResp = await Api.getTowns();
            const towns = Array.isArray(townsResp) ? townsResp : (townsResp.data || townsResp);

            teacherTowns = me.teacher_profile?.towns || me.towns || [];
            const useTowns = teacherTowns.length ? teacherTowns : towns;

            townSelect.replaceChildren();
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = 'Selecciona una población';
            townSelect.appendChild(defaultOpt);

            useTowns.forEach(t => {
                const option = document.createElement('option');
                option.value = String(t.id || t);
                option.textContent = t.name || t;
                townSelect.appendChild(option);
            });

            PROFESSOR_NAMES[currentTeacherId] = teacherName;

            TOWN_NAMES = {};
            townSelect.querySelectorAll("option").forEach(opt => {
                if (opt.value) TOWN_NAMES[opt.value] = opt.textContent;
            });

            if (useTowns.length === 1) {
                townSelect.value = String(useTowns[0].id || useTowns[0]);
                townGroup.style.display = 'none';
            }

            await loadWeeklyAvailabilities();

        } catch (error) {
            console.error('Error inicializando disponibilidad:', error);
            showMessage('error', 'No se pudo cargar datos iniciales.');
        }
    }

    async function loadWeeklyAvailabilities() {
        try {
            const resp = await Api.getWeeklyAvailabilities({ teacher_profile_id: currentTeacherId });
            const slots = resp.data || resp || [];

            weeklyBody.replaceChildren();

            if (!slots.length) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="7" style="text-align:center; color:#6b7280;">No hay disponibilidades registradas.</td>';
                weeklyBody.appendChild(tr);
                return;
            }

            slots.forEach(slot => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${PROFESSOR_NAMES[slot.teacher_profile_id] || slot.teacher_profile_id}</td>
                    <td>${TOWN_NAMES[slot.town_id] || slot.town_id || '-'}</td>
                    <td>${DAY_NAMES[slot.day_of_week] || slot.day_of_week}</td>
                    <td>${slot.starts_time}</td>
                    <td>${slot.end_time}</td>
                    <td>${slot.slot_minutes}</td>
                    <td>${slot.is_active ? 'Sí' : 'No'}</td>
                `;
                weeklyBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error cargando disponibilidades semanales:', error);
        }
    }

    typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'especial') {
            reasonWrapper.classList.remove('hidden');
        } else {
            reasonWrapper.classList.add('hidden');
        }
    });

    createBtn.addEventListener('click', async () => {
        const teacherId = currentTeacherId;
        const townId = townSelect.value || null;
        const day = daySelect.value;
        const start = startTimeInput.value;
        const end = endTimeInput.value;
        const type = typeSelect.value;
        const reason = reasonInput.value;
        const blockType = blockTypeSelect.value;

        if (!teacherId || !day || !start || !end || !blockType) {
            showMessage('error', 'Completa los campos obligatorios: día, horario y tipo de bloque.');
            return;
        }

        if (start >= end) {
            showMessage('error', 'La hora de inicio debe ser menor que la hora de fin.');
            return;
        }

        const payload = {
            teacher_profile_id: teacherId,
            town_id: townId,
            day_of_week: Number(day),
            starts_time: start + ':00',
            end_time: end + ':00',
            slot_minutes: 60,
            is_active: true,
            type: type,
            block_type: blockType
        };

        if (type === 'especial' && reason) {
            payload.reason = reason;
        }

        try {
            UI.setLoading(true);

            await Api.createWeeklyAvailability(payload);

            showMessage('success', 'Disponibilidad creada correctamente.');

            // Limpiar formulario
            startTimeInput.value = '';
            endTimeInput.value = '';
            daySelect.value = '';

            await loadWeeklyAvailabilities();

        } catch (error) {
            console.error('Error creando disponibilidad:', error);
            showMessage('error', 'No se pudo crear la disponibilidad.');
        } finally {
            UI.setLoading(false);
        }
    });

    loadInitialData();
});