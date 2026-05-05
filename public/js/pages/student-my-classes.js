// ─────────────────────────────────────────────
// student-my-classes.js — Ver mis clases
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const upcomingTbody = document.getElementById('upcoming-tbody');
    const pastTbody = document.getElementById('past-tbody');
    const messageBox = document.getElementById('message-state');
    const cancelFormContainer = document.getElementById('cancel-form-container');
    const cancelForm = document.getElementById('cancel-form');
    const cancelFormCancel = document.getElementById('cancel-form-cancel');

    // Cargar clases
    await loadMyClasses();

    // Cancel form submit
    cancelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookingId = document.getElementById('cancel-booking-id').value;
        
        UI.setLoading(true);
        try {
            await Api.cancelAdminBooking(bookingId);
            showMessage('success', '¡Clase cancelada correctamente!');
            cancelFormContainer.style.display = 'none';
            await loadMyClasses();
        } catch (error) {
            showMessage('error', error.message || 'Error al cancelar.');
        } finally {
            UI.setLoading(false);
        }
    });

    cancelFormCancel.addEventListener('click', () => {
        cancelFormContainer.style.display = 'none';
    });

    // ─────────────────────────────────────────────
    // Funciones internas
    // ─────────────────────────────────────────────

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

            const savedVid = storedMap[sid];
            if (savedVid) { const l = findLabel(savedVid); if (l) { map[sid] = l; return; } }

            const cachedVid = teacherCache[tid];
            if (cachedVid) { const l = findLabel(cachedVid); if (l) { map[sid] = l; return; } }

            const active = vehicles.filter(v => v.is_active);
            if (active.length === 1) {
                map[sid] = `${active[0].brand || ''} ${active[0].model || ''}`.trim() || active[0].plate_number;
                return;
            }

            map[sid] = 'Ver con tu profesor';
        });
        return map;
    }

    async function loadMyClasses() {
        try {
            const response = await Api.getMyClasses();
            const rawBookings = response?.data ?? response ?? [];
            const teacherVehicleMap = await buildTeacherVehicleMap(Array.isArray(rawBookings) ? rawBookings : []);
            const bookings = Array.isArray(rawBookings) ? rawBookings.map(b => {
                const nb = normalizeBookingRecord(b);
                const sid = b?.id ?? null;
                if (sid && teacherVehicleMap[sid]) nb.vehicle = teacherVehicleMap[sid];
                return nb;
            }) : [];
            const today = new Date().toISOString().split('T')[0];

            // Separar próximas y pasadas
            const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelada');
            const past = bookings.filter(b => b.date < today || b.status === 'cancelada');

            renderUpcoming(upcoming);
            renderPast(past);
        } catch (error) {
            console.error('Error loading classes:', error);
            upcomingTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #d32f2f;">Error al cargar clases</td></tr>';
            pastTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #d32f2f;">Error al cargar historial</td></tr>';
        }
    }

    function formatBookingTime(value) {
        const raw = String(value || '').trim();
        if (!raw) {
            return '—';
        }

        if (raw.length >= 16 && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(raw)) {
            return raw.slice(11, 16);
        }

        if (/^\d{2}:\d{2}/.test(raw)) {
            return raw.slice(0, 5);
        }

        return raw;
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
        const vehicleId = booking?.vehicle_id ?? booking?.vehicle?.id ?? null;

        return {
            ...booking,
            date: booking?.date || booking?.session_date || booking?.scheduled_date || '—',
            time: booking?.time || formatBookingTime(booking?.start_time || booking?.slot_starts_at || booking?.start),
            professorName: booking?.professorName || booking?.teacher_name || booking?.teacherName || booking?.teacher?.name || (teacherId ? `Profesor #${teacherId}` : 'Profesor'),
            vehicle: booking?.vehicle_name || booking?.vehicle_label || booking?.vehicle?.name || booking?.vehicle?.label || (booking?.vehicle?.brand && booking?.vehicle?.model ? `${booking.vehicle.brand} ${booking.vehicle.model}`.trim() : null) || (typeof booking?.vehicle === 'string' ? booking.vehicle : null) || (vehicleId ? `Vehículo #${vehicleId}` : '(sin especificar)'),
            townName: booking?.townName || booking?.town_name || booking?.town?.name || (booking?.town_id ? `Población #${booking.town_id}` : 'N/A'),
            status: _normalizeStatus(booking?.status),
        };
    }

    function renderUpcoming(bookings) {
        upcomingTbody.innerHTML = '';

        if (bookings.length === 0) {
            upcomingTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No tienes clases próximas reservadas.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = (booking.status === 'confirmada' || booking.status === 'pendiente') ? 'badge-green' : 'badge-gray';
            
            row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.professorName}</td>
                <td>${booking.vehicle || '(sin especificar)'}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td><span class="badge-inline ${statusColor}">${_formatStatus(booking.status)}</span></td>
                <td>
                    ${booking.status !== 'cancelada' ? `<button class="btn btn-sm btn-cancel" data-booking-id="${booking.id}" data-date="${booking.date}" data-time="${booking.time}">Cancelar</button>` : ''}
                </td>
            `;

            // Event handler para cancelar
            const cancelBtn = row.querySelector('.btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const bookingId = cancelBtn.dataset.bookingId;
                    const date = cancelBtn.dataset.date;
                    const time = cancelBtn.dataset.time;

                    document.getElementById('cancel-booking-id').value = bookingId;
                    document.getElementById('cancel-class-info').textContent = `¿Estás seguro de que deseas cancelar la clase del ${date} a las ${time}?`;
                    cancelFormContainer.style.display = 'block';
                    cancelFormContainer.scrollIntoView({ behavior: 'smooth' });
                });
            }

            upcomingTbody.appendChild(row);
        });
    }

    function renderPast(bookings) {
        pastTbody.innerHTML = '';

        if (bookings.length === 0) {
            pastTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">No tienes historial de clases.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = booking.status === 'cancelada' ? 'badge-red' : 'badge-blue';
            
            row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.professorName}</td>
                <td>${booking.vehicle || '(sin especificar)'}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td><span class="badge-inline ${statusColor}">${_formatStatus(booking.status)}</span></td>
            `;

            pastTbody.appendChild(row);
        });
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

    function _formatStatus(status) {
        const statusMap = {
            'confirmada': 'Confirmada',
            'pendiente': 'Pendiente',
            'cancelada': 'Cancelada',
            'en_curso': 'En curso',
            'completada': 'Completada',
        };
        return statusMap[status] || status;
    }
});