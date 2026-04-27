// ─────────────────────────────────────────────
// teacher-bookings.js — Mi agenda con disponibilidad
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const filterForm = document.getElementById('bookings-filter-form');
    const filterDate = document.getElementById('filter-date');
    const filterStudent = document.getElementById('filter-student');
    const filterStatus = document.getElementById('filter-status');
    const availabilityFilterForm = document.getElementById('availability-filter-form');
    const availabilityDate = document.getElementById('availability-date');
    const availabilityGrid = document.getElementById('availability-grid');
    const upcomingTbody = document.getElementById('upcoming-tbody');
    const pastTbody = document.getElementById('past-tbody');
    const messageBox = document.getElementById('message-state');
    const statusFormContainer = document.getElementById('status-form-container');
    const statusForm = document.getElementById('status-form');
    const statusCancel = document.getElementById('status-cancel');

    let timeSlots = [];

    // Set default date filter to today
    const today = new Date().toISOString().split('T')[0];
    filterDate.value = today;
    availabilityDate.value = today;
    availabilityDate.min = today;

    // Cargar datos iniciales
    await loadTimeSlots();
    await loadBookings({ date: today, student: '', status: '' });

    // Form submit para filtrar
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const filters = {
            date: filterDate.value,
            student: filterStudent.value,
            status: filterStatus.value
        };
        await loadBookings(filters);
    });

    // Availability form submit
    availabilityFilterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await loadAvailability(availabilityDate.value);
    });

    // Status form submit
    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookingId = document.getElementById('status-booking-id').value;
        const newStatus = document.getElementById('status-new-status').value;

        if (!newStatus) {
            showMessage('error', 'Debes seleccionar un estado.');
            return;
        }

        UI.setLoading(true);
        try {
            await Api.updateBookingStatus(bookingId, newStatus);
            showMessage('success', 'Estado de clase actualizado correctamente.');
            statusFormContainer.style.display = 'none';
            await loadBookings({ date: filterDate.value, student: filterStudent.value, status: filterStatus.value });
        } catch (error) {
            showMessage('error', error.message || 'Error al actualizar estado.');
        } finally {
            UI.setLoading(false);
        }
    });

    statusCancel.addEventListener('click', () => {
        statusFormContainer.style.display = 'none';
    });

    // ─────────────────────────────────────────────
    // Funciones internas
    // ─────────────────────────────────────────────

    async function loadTimeSlots() {
        try {
            timeSlots = await Api.getTimeSlots();
        } catch (error) {
            console.error('Error loading time slots:', error);
        }
    }

    async function loadBookings(filters) {
        UI.setLoading(true);
        upcomingTbody.innerHTML = '';
        pastTbody.innerHTML = '';

        try {
            const bookings = await Api.getTeacherBookings(filters);
            const today = new Date().toISOString().split('T')[0];

            const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelada');
            const past = bookings.filter(b => b.date < today || b.status === 'cancelada');

            renderUpcoming(upcoming);
            renderPast(past);

            if (bookings.length === 0) {
                showMessage('info', 'No hay clases con los filtros seleccionados.');
            }
        } catch (error) {
            showMessage('error', error.message || 'Error al cargar agenda.');
            upcomingTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #d32f2f;">Error al cargar</td></tr>';
            pastTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #d32f2f;">Error al cargar</td></tr>';
        } finally {
            UI.setLoading(false);
        }
    }

    async function loadAvailability(date) {
        UI.setLoading(true);
        availabilityGrid.innerHTML = '';

        try {
            // Obtener mis reservas para esa fecha
            const bookings = await Api.getTeacherBookings({ date });
            const bookedTimes = bookings.map(b => b.time);

            // Renderear todos los horarios disponibles
            availabilityGrid.innerHTML = timeSlots.map(slot => {
                const isBooked = bookedTimes.includes(slot.time);
                const booking = bookings.find(b => b.time === slot.time);
                
                return `
                    <div class="time-slot-card ${isBooked ? 'booked' : 'available'}">
                        <div class="time-slot-time">${slot.display}</div>
                        <div class="time-slot-status">
                            ${isBooked ? 
                                `<span class="badge-inline badge-blue">Con ${booking.studentName}</span>` :
                                `<span class="badge-inline badge-green">Disponible</span>`
                            }
                        </div>
                        ${isBooked ? `<div class="time-slot-detail">📚 ${booking.townName}</div>` : ''}
                    </div>
                `;
            }).join('');

            availabilityGrid.style.display = 'grid';
        } catch (error) {
            showMessage('error', error.message || 'Error al cargar disponibilidad.');
        } finally {
            UI.setLoading(false);
        }
    }

    function renderUpcoming(bookings) {
        upcomingTbody.innerHTML = '';

        if (bookings.length === 0) {
            upcomingTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No tienes clases próximas.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = _getStatusColor(booking.status);

            row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.studentName}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td>${booking.vehicle || 'Sin especificar'}</td>
                <td><span class="badge-inline ${statusColor}">${_formatStatus(booking.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-status" data-booking-id="${booking.id}" data-date="${booking.date}" data-time="${booking.time}" data-student="${booking.studentName}">
                        Cambiar Estado
                    </button>
                </td>
            `;

            const statusBtn = row.querySelector('.btn-status');
            statusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookingId = statusBtn.dataset.bookingId;
                const date = statusBtn.dataset.date;
                const time = statusBtn.dataset.time;
                const student = statusBtn.dataset.student;

                document.getElementById('status-booking-id').value = bookingId;
                document.getElementById('status-booking-info').textContent = `Clase de ${student} el ${date} a las ${time}`;
                statusFormContainer.style.display = 'block';
                statusFormContainer.scrollIntoView({ behavior: 'smooth' });
            });

            upcomingTbody.appendChild(row);
        });
    }

    function renderPast(bookings) {
        pastTbody.innerHTML = '';

        if (bookings.length === 0) {
            pastTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">Sin historial.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = _getStatusColor(booking.status);

            row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.studentName}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td>${booking.vehicle || 'Sin especificar'}</td>
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
            'en_curso': 'En curso',
            'completada': 'Completada',
            'cancelada': 'Cancelada',
        };
        return statusMap[status] || status;
    }

    function _getStatusColor(status) {
        const colorMap = {
            'confirmada': 'badge-yellow',
            'en_curso': 'badge-blue',
            'completada': 'badge-green',
            'cancelada': 'badge-red',
        };
        return colorMap[status] || 'badge-gray';
    }
});