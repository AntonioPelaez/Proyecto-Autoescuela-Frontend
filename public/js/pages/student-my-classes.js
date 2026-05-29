// ─────────────────────────────────────────────
// student-my-classes.js — Ver mis clases
// ─────────────────────────────────────────────

let teacherVehicleMap = {}; 

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const upcomingTbody = document.getElementById('upcoming-tbody');
    const pastTbody = document.getElementById('past-tbody');
    const examHistoryBody = document.getElementById('exam-history-body');
    const messageBox = document.getElementById('message-state');
    const cancelFormContainer = document.getElementById('cancel-form-container');
    const cancelForm = document.getElementById('cancel-form');
    const cancelFormCancel = document.getElementById('cancel-form-cancel');

    await loadMyClasses();
    await loadExamHistory();
    await loadConvocationHistory();

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

            // Opción A: mostrar SIEMPRE el primer vehículo del profesor
            if (vehicles.length > 0) {
                const v = vehicles[0];
                map[sid] = `${v.brand || ''} ${v.model || ''}`.trim() || v.plate_number;
                return;
            }

            map[sid] = 'Ver con tu profesor';
        });

        return map;
    }
async function loadConvocationHistory() {
    const tbody = document.getElementById('convocatorias-history-body');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Cargando...</td></tr>';

    try {
        const me = await Api.getMe();
        const studentId = me?.student_profile?.id;

        const response = await Api.getStudentConvocationHistory(studentId);
        const convocations = Array.isArray(response) ? response : response?.data ?? [];

        if (!convocations.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">No hay convocatorias.</td></tr>';
            return;
        }

        tbody.innerHTML = convocations.map(c => {
            const confirmBtn = !c.student_confirmed
                ? `<button class="btn btn-sm btn-success" data-action="confirm" data-id="${c.exam_call_id}">Confirmar</button>`
                : `<button class="btn btn-sm btn-danger" data-action="unconfirm" data-id="${c.exam_call_id}">Cancelar</button>`;

            return `
                <tr>
                    <td>${formatDate(c.date)}</td>
                    <td>${formatBookingTime(c.time)}</td>
                    <td>${c.student_confirmed ? 'Confirmada' : 'Pendiente'}</td>
                    <td>${c.exam_status}</td>
                    <td>${confirmBtn}</td>
                </tr>
            `;
        }).join('');

        // Eventos de botones
        tbody.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', async () => {
                const examCallId = btn.dataset.id;
                const action = btn.dataset.action;

                UI.setLoading(true);
                try {
                    if (action === 'confirm') {
                        await Api.confirmExamCall(examCallId, studentId);
                    } else {
                        await Api.unconfirmExamCall(examCallId, studentId);
                    }

                    showMessage('success', 'Estado actualizado correctamente');
                    await loadConvocationHistory();

                } catch (err) {
                    showMessage('error', err.message || 'Error al actualizar.');
                } finally {
                    UI.setLoading(false);
                }
            });
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#d32f2f;">Error cargando historial.</td></tr>';
    }
}

    async function loadMyClasses() {
        try {
            const response = await Api.getMyClasses();
            const rawBookings = response?.data ?? response ?? [];

            teacherVehicleMap = await buildTeacherVehicleMap(Array.isArray(rawBookings) ? rawBookings : []);

            const bookings = Array.isArray(rawBookings) ? rawBookings.map(b => {
                const nb = normalizeBookingRecord(b);
                const sid = b?.id ?? null;

                // ✔ SOLO usar el mapa si el backend NO envía vehículo
                if (!nb.vehicle && sid && teacherVehicleMap[sid]) {
                    nb.vehicle = teacherVehicleMap[sid];
                }

                return nb;
            }) : [];

            const today = new Date().toISOString().split('T')[0];

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
        if (!raw) return '—';
        if (raw.length >= 16 && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(raw)) return raw.slice(11, 16);
        if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
        return raw;
    }

    function formatDate(value) {
        const raw = String(value || '').trim();
        if (!raw) return '—';
        if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
            const parts = raw.slice(0, 10).split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
            return raw.slice(0, 10);
        }
        return raw;
    }

    async function loadExamHistory() {
        if (!examHistoryBody) {
            return;
        }

        examHistoryBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Cargando...</td></tr>';

        try {
            const me = await Api.getMe();
            const studentId = me?.student_profile?.id;
            if (!studentId) {
                throw new Error('No se ha encontrado el perfil de alumno.');
            }

            const response = await Api.getStudentExamHistory(studentId);
            const exams = Array.isArray(response)
                ? response
                : response?.data ?? [];

            const finalizadas = exams.filter(exam => {
                return String(exam.status_convocatoria || exam.status || '').toLowerCase() === 'finalizada';
            });

            if (!finalizadas.length) {
                examHistoryBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">No hay exámenes finalizados.</td></tr>';
                return;
            }

            examHistoryBody.innerHTML = finalizadas.map(exam => {
                const date = formatDate(exam.exam_date || exam.date);
                const result = exam.resultado ?? exam.result ?? '—';
                const notes = exam.result_notes ?? exam.notes ?? '—';

                return `
                    <tr>
                        <td>${date}</td>
                        <td>${result}</td>
                        <td>${notes}</td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading exam history:', error);
            examHistoryBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #d32f2f;">Error cargando historial de exámenes.</td></tr>';
        }
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
        const teacherId = booking?.teacher_profile_id 
                       ?? booking?.teacher_id 
                       ?? booking?.teacher?.id 
                       ?? null;

        return {
            ...booking,
            date: booking?.date || booking?.session_date || booking?.scheduled_date || '—',
            time: booking?.time || formatBookingTime(booking?.start_time || booking?.slot_starts_at || booking?.start),
            professorName: booking?.professorName 
                        || booking?.teacher_name 
                        || booking?.teacherName 
                        || booking?.teacher?.name 
                        || (teacherId ? `Profesor #${teacherId}` : 'Profesor'),

            // ✔ VEHÍCULO — PRIORIDAD AL BACKEND
            vehicle:
                (booking?.vehicle_brand && booking?.vehicle_model
                    ? `${booking.vehicle_brand} ${booking.vehicle_model}`
                    : null)
                || booking?.vehicle_name
                || booking?.vehicle_label
                || booking?.vehicle
                || null, // ← NO ponemos mapa aquí

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
                <td>${formatDate(booking.date)}</td>
                <td>${booking.time}</td>
                <td>${booking.professorName}</td>
                <td>${booking.vehicle || '(sin especificar)'}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td><span class="badge-inline ${statusColor}">${_formatStatus(booking.status)}</span></td>
                <td>
                    ${booking.status !== 'cancelada' ? `<button class="btn btn-sm btn-cancel" data-booking-id="${booking.id}" data-date="${booking.date}" data-time="${booking.time}">Cancelar</button>` : ''}
                </td>
            `;

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
                <td>${formatDate(booking.date)}</td>
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
