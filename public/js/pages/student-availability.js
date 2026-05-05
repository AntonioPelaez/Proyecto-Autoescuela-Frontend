// ─────────────────────────────────────────────
// student-availability.js — Reservar clases con horarios
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const selectionForm = document.getElementById('selection-form');
    const townSelect = document.getElementById('town-select');
    const dateSelect = document.getElementById('date-select');
    const timeSlotsSection = document.getElementById('time-slots-section');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    const professorsSection = document.getElementById('professors-section');
    const professorsContainer = document.getElementById('professors-container');
    const professorSelect = document.getElementById('professor-select');
    const professorHelp = document.getElementById('professor-help');
    const bookingSummary = document.getElementById('booking-summary');
    const summaryDetails = document.getElementById('summary-details');
    const confirmForm = document.getElementById('confirm-form');
    const cancelBooking = document.getElementById('cancel-booking');
    const bookingsContainer = document.getElementById('bookings-container');
    const messageBox = document.getElementById('message-state');

    let selectedTown = null;
    let selectedDate = null;
    let selectedTime = null;
    let selectedProfessor = null;
    let currentStudentProfileId = null;
    let slotsCache = [];
    let timeSlots = [];
    let teachersList = [];
    let vehiclesList = [];

    // Cargar datos iniciales
    await loadTowns();
    await loadMyBookings();
    await loadCurrentStudentProfile();
    await loadTeachersAndVehicles();

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateSelect.min = today;

    // Form submit para buscar horarios
    selectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const townId = townSelect.value;
        const date = dateSelect.value;

        if (!townId || !date) {
            showMessage('error', 'Debes seleccionar población y fecha.');
            return;
        }

        selectedTown = { id: townId, name: townSelect.options[townSelect.selectedIndex].text };
        selectedDate = date;
        selectedTime = null;
        selectedProfessor = null;

        try {
            await loadSlotsForSelection(selectedTown.id, selectedDate);
        } catch (error) {
            showMessage('error', error.message || 'Error al cargar horarios para la fecha seleccionada.');
            return;
        }

        renderProfessorSelector();
        professorsSection.style.display = 'block';
        timeSlotsSection.style.display = 'none';
        bookingSummary.style.display = 'none';
        professorsSection.scrollIntoView({ behavior: 'smooth' });
    });

    professorSelect.addEventListener('change', async () => {
        const professorId = professorSelect.value;
        selectedTime = null;
        bookingSummary.style.display = 'none';

        if (!professorId) {
            selectedProfessor = null;
            professorHelp.textContent = '';
            timeSlotsSection.style.display = 'none';
            return;
        }

        selectedProfessor = await buildProfessorSelection(professorId);
        loadTimeSlotsFromCache();
        renderTimeSlots();
        updateProfessorHelp();
        timeSlotsSection.style.display = 'block';
        timeSlotsSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Confirm final booking
    confirmForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedProfessor || !selectedTime) {
            showMessage('error', 'Por favor completa todos los pasos.');
            return;
        }

        const selectedSlot = getSelectedSlotForBooking();
        if (!selectedSlot) {
            showMessage('error', 'No se ha encontrado el hueco seleccionado para la reserva.');
            return;
        }

        const bookingPayload = buildBookingPayload(selectedSlot);

        UI.setLoading(true);
        try {
            let result;
            if (typeof Api.createBookingByTimeSlot === 'function') {
                result = await Api.createBookingByTimeSlot(selectedTown.id, selectedDate, selectedTime, selectedProfessor.id);
            } else {
                console.log('📤 booking payload:', bookingPayload);
                result = await Api.createClassSession(bookingPayload);
            }
            // Guardar vehicle_id del slot para poder mostrarlo en mis reservas
            const sessionId = result?.data?.id ?? result?.id ?? null;
            const vehicleId = bookingPayload.vehicle_id;
            const teacherIdForCache = bookingPayload.teacher_profile_id ?? bookingPayload.teacher_id ?? null;
            if (vehicleId) {
                try {
                    if (sessionId) {
                        const stored = JSON.parse(localStorage.getItem('session_vehicle_map') || '{}');
                        stored[sessionId] = vehicleId;
                        localStorage.setItem('session_vehicle_map', JSON.stringify(stored));
                    }
                    if (teacherIdForCache) {
                        const teacherMap = JSON.parse(localStorage.getItem('teacher_vehicle_cache') || '{}');
                        teacherMap[teacherIdForCache] = vehicleId;
                        localStorage.setItem('teacher_vehicle_cache', JSON.stringify(teacherMap));
                    }
                } catch (_) {}
            }
            showMessage('success', '¡Clase reservada correctamente!');
            bookingSummary.style.display = 'none';
            selectionForm.reset();
            timeSlotsSection.style.display = 'none';
            professorsSection.style.display = 'none';
            await loadMyBookings();
        } catch (error) {
            console.error('❌ booking error:', error?.raw || error, 'payload:', bookingPayload);
            showMessage('error', formatBookingError(error));
        } finally {
            UI.setLoading(false);
        }
    });

    cancelBooking.addEventListener('click', () => {
        bookingSummary.style.display = 'none';
        selectedTime = null;
        renderTimeSlotButtons();
    });

    // ─────────────────────────────────────────────
    // Funciones internas
    // ─────────────────────────────────────────────

    async function loadTowns() {
        try {
            const response = await Api.getTowns();
            const towns = response.data || response || [];
            townSelect.innerHTML = '<option value="">Selecciona población</option>';
            towns.filter(town => town.is_active).forEach(town => {
                const option = document.createElement('option');
                option.value = town.id;
                option.textContent = town.name;
                townSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading towns:', error);
        }
    }

    async function loadTeachersAndVehicles() {
        try {
            const [tRes, vRes] = await Promise.all([Api.getTeachers(), Api.getVehicles()]);
            const tRaw = tRes.data ?? tRes;
            const vRaw = vRes.data ?? vRes;
            teachersList = Array.isArray(tRaw) ? tRaw : [];
            vehiclesList = Array.isArray(vRaw) ? vRaw : [];
        } catch (e) {
            console.warn('No se pudieron precargar profesores/vehículos:', e);
        }
    }

    async function loadCurrentStudentProfile() {
        try {
            const response = await Api.getMe();
            const user = response?.data ?? response ?? null;
            currentStudentProfileId = user?.student_profile?.id ?? null;
        } catch (error) {
            console.warn('No se pudo obtener el perfil de alumno autenticado:', error);
        }
    }

    async function loadSlotsForSelection(townId, date) {
        const response = await Api.getAvailabilitySlots({
            town_id: townId,
            date: date,
        });

        slotsCache = adaptBackendSlots(response, townId, date);
        await resolveUnknownVehicles();
    }

    async function resolveUnknownVehicles() {
        // Recopilar pares únicos (teacherId, vehicleId) que aún no están resueltos
        const pairs = [];
        const seen = new Set();
        slotsCache.forEach(s => {
            const key = `${s.professorId}_${s.vehicleId}`;
            if (s.vehicleId && s.vehicle && s.vehicle.startsWith('Vehículo #') && !seen.has(key)) {
                seen.add(key);
                pairs.push({ teacherId: s.professorId, vehicleId: Number(s.vehicleId) });
            }
        });

        for (const { teacherId, vehicleId } of pairs) {
            try {
                const res = await Api.getTeacherVehicles(teacherId);
                const list = Array.isArray(res) ? res : (res?.vehicles ?? res?.data ?? []);
                const tv = list.find(v => Number(v.id) === vehicleId);
                if (tv) {
                    const label = `${tv.brand || ''} ${tv.model || ''}`.trim() || tv.plate_number || `Vehículo #${vehicleId}`;
                    slotsCache.forEach(slot => {
                        if (slot.vehicleId === vehicleId) slot.vehicle = label;
                    });
                }
            } catch (e) {
                console.warn('No se pudo obtener vehículo', vehicleId, e);
            }
        }
    }

    function loadTimeSlotsFromCache() {
        const available = slotsCache.filter(slot => {
            if (slot.status === 'booked') {
                return false;
            }

            if (!selectedProfessor) {
                return true;
            }

            return Number(slot.professorId) === Number(selectedProfessor.id);
        });
        const uniqueTimes = Array.from(new Set(available.map(slot => slot.time))).sort((a, b) => a.localeCompare(b));
        timeSlots = uniqueTimes.map(time => ({ time, display: time }));
    }

    async function renderTimeSlots() {
        timeSlotsGrid.innerHTML = '';

        if (!timeSlots.length) {
            timeSlotsGrid.innerHTML = '<p style="grid-column: 1/-1; color: #999;">No hay horarios disponibles.</p>';
            return;
        }

        for (const slot of timeSlots) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'time-slot-btn';
            btn.textContent = slot.display;
            btn.dataset.time = slot.time;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                selectedTime = slot.time;
                renderTimeSlotButtons();
                showBookingSummary();
            });

            timeSlotsGrid.appendChild(btn);
        }
    }

    function renderTimeSlotButtons() {
        const buttons = timeSlotsGrid.querySelectorAll('.time-slot-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.time === selectedTime) {
                btn.classList.add('selected');
            }
        });
    }

    function renderProfessorSelector() {
        professorSelect.innerHTML = '<option value="">Selecciona un profesor</option>';

        teachersList.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = [teacher.name, teacher.surname, teacher.surname1, teacher.surname2].filter(Boolean).join(' ');
            professorSelect.appendChild(option);
        });

        professorHelp.textContent = 'Elige un profesor para ver sus horas libres en la fecha seleccionada.';
    }

    async function buildProfessorSelection(professorId) {
        const teacher = resolveTeacher(professorId);
        const matchingSlot = slotsCache.find(slot => Number(slot.professorId) === Number(professorId));
        let vehicleLabel = matchingSlot?.vehicle || 'Por asignar';

        try {
            const res = await Api.getTeacherVehicles(professorId);
            const vehicles = Array.isArray(res) ? res : (res?.vehicles ?? res?.data ?? []);
            if (vehicles.length) {
                const preferredVehicle = matchingSlot
                    ? vehicles.find(v => Number(v.id) === Number(matchingSlot.vehicleId))
                    : vehicles[0];
                const vehicle = preferredVehicle || vehicles[0];
                if (vehicle) {
                    vehicleLabel = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || vehicle.plate_number || vehicleLabel;
                }
            }
        } catch (error) {
            console.warn('No se pudo obtener el vehículo del profesor', professorId, error);
        }

        return {
            id: Number(professorId),
            name: teacher ? [teacher.name, teacher.surname, teacher.surname1, teacher.surname2].filter(Boolean).join(' ') : `Profesor #${professorId}`,
            email: teacher?.email || 'No disponible',
            vehicle: vehicleLabel,
        };
    }

    function updateProfessorHelp() {
        if (!selectedProfessor) {
            professorHelp.textContent = '';
            return;
        }

        const availableCount = slotsCache.filter(slot => slot.status !== 'booked' && Number(slot.professorId) === Number(selectedProfessor.id)).length;
        if (availableCount > 0) {
            professorHelp.textContent = `${selectedProfessor.name} tiene ${availableCount} horario${availableCount === 1 ? '' : 's'} disponible${availableCount === 1 ? '' : 's'} este día.`;
            return;
        }

        professorHelp.textContent = `${selectedProfessor.name} no tiene horas disponibles ese día.`;
    }

    function showBookingSummary() {
        if (!selectedProfessor || !selectedTime || !selectedTown || !selectedDate) return;

        summaryDetails.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-m);">
                <div><strong>Población:</strong> ${selectedTown.name}</div>
                <div><strong>Fecha:</strong> ${selectedDate}</div>
                <div><strong>Hora:</strong> ${selectedTime}</div>
                <div><strong>Profesor:</strong> ${selectedProfessor.name}</div>
                <div><strong>Vehículo:</strong> ${selectedProfessor.vehicle || 'Por asignar'}</div>
            </div>
        `;

        document.getElementById('selected-professor-id').value = selectedProfessor.id;
        bookingSummary.style.display = 'block';
        bookingSummary.scrollIntoView({ behavior: 'smooth' });
    }

    function getSelectedSlotForBooking() {
        return slotsCache.find(slot => (
            slot.status !== 'booked' &&
            Number(slot.professorId) === Number(selectedProfessor?.id) &&
            String(slot.time) === String(selectedTime)
        )) || null;
    }

    function buildBookingPayload(slot) {
        const bookingReference = `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const teacherId = Number(slot.professorId);
        const studentId = currentStudentProfileId ? Number(currentStudentProfileId) : null;
        const startTime = slot.startTime || selectedTime;
        const endTime = slot.endTime || null;
        const slotStartsAt = slot.slotStartsAt || `${selectedDate} ${startTime}:00`;
        const slotEndsAt = slot.slotEndsAt || (endTime ? `${selectedDate} ${endTime}:00` : null);

        return {
            student_id: studentId,
            student_profile_id: studentId,
            town_id: Number(selectedTown.id),
            teacher_id: teacherId,
            teacher_profile_id: teacherId,
            vehicle_id: slot.vehicleId || null,
            availability_slot_id: slot.id || null,
            date: selectedDate,
            time: selectedTime,
            session_date: selectedDate,
            start: slotStartsAt,
            end: slotEndsAt,
            start_time: startTime,
            end_time: endTime,
            slot_starts_at: slotStartsAt,
            slot_ends_at: slotEndsAt,
            status: 'booked',
            payment_status: 'pending',
            booking_reference: bookingReference,
            student_comments: null,
        };
    }

    function formatBookingError(error) {
        if (error?.errors && typeof error.errors === 'object') {
            const messages = Object.values(error.errors).flat().filter(Boolean);
            if (messages.length) {
                return messages.join(' | ');
            }
        }

        return error?.message || 'Error al reservar.';
    }

    // Devuelve mapa session_id → label de vehículo
    async function buildTeacherVehicleMap(rawBookings) {
        const map = {};
        let storedMap = {};
        let teacherCache = {};
        try { storedMap = JSON.parse(localStorage.getItem('session_vehicle_map') || '{}'); } catch (_) {}
        try { teacherCache = JSON.parse(localStorage.getItem('teacher_vehicle_cache') || '{}'); } catch (_) {}

        const teacherIds = [...new Set(
            rawBookings.map(b => b?.teacher_profile_id ?? b?.teacher_id ?? null).filter(Boolean)
        )];
        const teacherVehicles = {};
        await Promise.all(teacherIds.map(async tid => {
            try {
                const res = await Api.getTeacherVehicles(tid);
                teacherVehicles[tid] = Array.isArray(res?.vehicles) ? res.vehicles : [];
            } catch (_) { teacherVehicles[tid] = []; }
        }));

        rawBookings.forEach(b => {
            const tid = b?.teacher_profile_id ?? b?.teacher_id ?? null;
            const sid = b?.id ?? null;
            const vehicles = teacherVehicles[tid] || [];
            if (!tid || !sid) return;

            const findLabel = vid => {
                const v = vehicles.find(x => Number(x.id) === Number(vid));
                return v ? `${v.brand || ''} ${v.model || ''}`.trim() || v.plate_number : null;
            };

            // 1) vehicle_id exacto de esta sesión (guardado al reservar)
            const savedVid = storedMap[sid];
            if (savedVid) { const l = findLabel(savedVid); if (l) { map[sid] = l; return; } }

            // 2) Último vehículo conocido para este profesor (guardado al reservar)
            const cachedVid = teacherCache[tid];
            if (cachedVid) { const l = findLabel(cachedVid); if (l) { map[sid] = l; return; } }

            // 3) Profesor con exactamente 1 vehículo activo
            const active = vehicles.filter(v => v.is_active);
            if (active.length === 1) {
                map[sid] = `${active[0].brand || ''} ${active[0].model || ''}`.trim() || active[0].plate_number;
                return;
            }

            // 4) Sin dato disponible
            map[sid] = 'Ver con tu profesor';
        });
        return map;
    }

    async function loadMyBookings() {
        try {
            const response = await Api.getMyClasses();
            const rawBookings = response.data || response || [];
            const teacherVehicleMap = await buildTeacherVehicleMap(Array.isArray(rawBookings) ? rawBookings : []);
            const bookings = Array.isArray(rawBookings) ? rawBookings.map(b => {
                const nb = normalizeBookingRecord(b);
                const sid = b?.id ?? null;
                if (sid && teacherVehicleMap[sid]) nb.vehicle = teacherVehicleMap[sid];
                return nb;
            }) : [];

            if (bookings.length === 0) {
                bookingsContainer.innerHTML = '<p style="color: #999;">Aún no tienes clases reservadas.</p>';
                return;
            }

            bookingsContainer.innerHTML = bookings.map(b => {
                const statusLabel = { confirmada: 'Confirmada', pendiente: 'Pendiente', cancelada: 'Cancelada', en_curso: 'En curso', completada: 'Completada' }[b.status] || b.status;
                const badgeClass = (b.status === 'cancelada') ? 'badge-red' : 'badge-green';
                return `
                <div class="booking-card">
                    <div class="booking-info">
                        <div><strong>📅 Fecha:</strong> ${b.date}</div>
                        <div><strong>⏰ Hora:</strong> ${b.time}</div>
                        <div><strong>👨‍🏫 Profesor:</strong> ${b.professorName}</div>
                        <div><strong>🚗 Vehículo:</strong> ${b.vehicle || 'Por asignar'}</div>
                    </div>
                    <div class="booking-actions">
                        <span class="badge-inline ${badgeClass}">${statusLabel}</span>
                    </div>
                </div>`;
            }).join('');
        } catch (error) {
            console.error('Error loading bookings:', error);
            bookingsContainer.innerHTML = '<p style="color: #d32f2f;">Error al cargar reservas.</p>';
        }
    }

    function getTownNameById(townId) {
        if (!townId) {
            return 'N/A';
        }

        const option = Array.from(townSelect.options || []).find(item => Number(item.value) === Number(townId));
        return option?.textContent || `Población #${townId}`;
    }

    function formatBookingTime(value) {
        return extractHour(value) || String(value || '').slice(0, 5) || '—';
    }

    function _normalizeStatus(raw) {
        const s = String(raw || '').toLowerCase();
        if (s === 'confirmada' || s === 'confirmed' || s === 'booked') return 'confirmada';
        if (s === 'cancelada' || s === 'cancelled' || s === 'canceled') return 'cancelada';
        if (s === 'en_curso' || s === 'in_progress') return 'en_curso';
        if (s === 'completada' || s === 'completed') return 'completada';
        if (s === 'pending') return 'confirmada';
        return s || 'confirmada';
    }

    function normalizeBookingRecord(booking) {
        const teacherId = booking?.teacher_id ?? booking?.teacher_profile_id ?? booking?.teacher?.id ?? null;
        const teacher = resolveTeacher(teacherId);
        const vehicleId = booking?.vehicle_id ?? booking?.vehicle?.id ?? null;
        const vehicle = resolveVehicle(vehicleId);
        const teacherName = booking?.professorName
            || booking?.teacher_name
            || booking?.teacherName
            || (teacher ? [teacher.name, teacher.surname, teacher.surname1, teacher.surname2].filter(Boolean).join(' ') : null)
            || (teacherId ? `Profesor #${teacherId}` : 'Profesor');
        const vehicleLabel = booking?.vehicle_name
            || booking?.vehicle_label
            || booking?.vehicle?.name
            || booking?.vehicle?.label
            || booking?.vehicle?.brand && booking?.vehicle?.model ? `${booking.vehicle.brand} ${booking.vehicle.model}`.trim() : null
            || (typeof booking?.vehicle === 'string' ? booking.vehicle : null)
            || (vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || vehicle.plate_number : null)
            || (vehicleId ? `Vehículo #${vehicleId}` : 'Por asignar');

        return {
            ...booking,
            date: booking?.date || booking?.session_date || booking?.scheduled_date || '—',
            time: booking?.time || formatBookingTime(booking?.start_time || booking?.slot_starts_at || booking?.start),
            professorName: teacherName,
            vehicle: vehicleLabel,
            townName: booking?.townName || booking?.town_name || booking?.town?.name || getTownNameById(booking?.town_id),
            status: _normalizeStatus(booking?.status),
        };
    }

    function showMessage(type, message) {
        messageBox.className = `message-state ${type}`;
        messageBox.textContent = message;
        messageBox.style.display = message ? 'block' : 'none';

        if (message) {
            UI.showToast(message, type === 'success' ? 'info' : 'error');
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000);
        }
    }

    function getAvailabilityBlocks(apiResponse) {
        const payload = apiResponse && apiResponse.data ? apiResponse.data : apiResponse;
        return payload && Array.isArray(payload.slots) ? payload.slots : [];
    }

    function extractHour(raw) {
        const value = String(raw || '').trim();
        if (!value) {
            return '';
        }

        // 2026-05-05 10:00:00 o 2026-05-05T10:00:00
        if (value.length >= 16 && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(value)) {
            return value.slice(11, 16);
        }

        // 10:00:00 o 10:00
        if (/^\d{2}:\d{2}/.test(value)) {
            return value.slice(0, 5);
        }

        return '';
    }

    function resolveTeacher(teacherId) {
        return teachersList.find(t => Number(t.id) === Number(teacherId)) || null;
    }

    function resolveVehicle(vehicleId) {
        return vehiclesList.find(v => Number(v.id) === Number(vehicleId)) || null;
    }

    function adaptBackendSlots(apiResponse, townId, date) {
        const blocks = getAvailabilityBlocks(apiResponse);
        const result = [];

        blocks.forEach(block => {
            const teacherId = block?.teacher_id || block?.teacher_profile_id || block?.teacher?.id;
            const teacher = resolveTeacher(teacherId);
            const teacherName = teacher
                ? [teacher.name, teacher.surname, teacher.surname1, teacher.surname2].filter(Boolean).join(' ')
                : (teacherId ? `Profesor #${teacherId}` : 'Profesor');
            const teacherEmail = teacher?.email || block?.teacher?.email || 'No disponible';

            const blockVehicleId = block?.vehicle_id;
            const vehicle = resolveVehicle(blockVehicleId);
            const vehicleLabel = vehicle
                ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || vehicle.plate_number || `Vehículo #${blockVehicleId}`
                : (blockVehicleId ? `Vehículo #${blockVehicleId}` : 'Vehículo por asignar');
            const nested = Array.isArray(block?.slots) ? block.slots : [];

            nested.forEach(slot => {
                const start = slot?.start || slot?.slot_starts_at || slot?.starts_at || slot?.time;
                const time = extractHour(start);
                if (!time) {
                    return;
                }

                result.push({
                    id: slot?.id ?? slot?.slot_id ?? slot?.availability_slot_id ?? null,
                    townId: Number(townId),
                    date: date,
                    time: time,
                    startTime: extractHour(slot?.start || slot?.slot_starts_at || slot?.starts_at || slot?.time),
                    endTime: extractHour(slot?.end || slot?.slot_ends_at || slot?.ends_at),
                    slotStartsAt: slot?.start || slot?.slot_starts_at || slot?.starts_at || null,
                    slotEndsAt: slot?.end || slot?.slot_ends_at || slot?.ends_at || null,
                    professorId: Number(teacherId),
                    professorName: teacherName,
                    professorEmail: teacherEmail,
                    vehicle: vehicleLabel,
                    vehicleId: blockVehicleId ? Number(blockVehicleId) : null,
                    status: slot?.reserved ? 'booked' : 'pending',
                });
            });
        });

        return result;
    }

});