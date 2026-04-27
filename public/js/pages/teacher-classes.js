// ─────────────────────────────────────────────
// teacher-classes.js — Mis clases asignadas
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const filterForm = document.getElementById('classes-filter-form');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    const filterClassStatus = document.getElementById('filter-class-status');
    const upcomingTbody = document.getElementById('upcoming-classes-tbody');
    const pastTbody = document.getElementById('past-classes-tbody');
    const messageBox = document.getElementById('message-state');
    const statusFormContainer = document.getElementById('class-status-form-container');
    const statusForm = document.getElementById('class-status-form');
    const statusCancel = document.getElementById('class-status-cancel');

    // Set default dates (last 30 days to next 60 days)
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    const nextTwoMonths = new Date(today);
    nextTwoMonths.setDate(nextTwoMonths.getDate() + 60);

    filterDateFrom.value = lastMonth.toISOString().split('T')[0];
    filterDateTo.value = nextTwoMonths.toISOString().split('T')[0];

    // Cargar clases inicial
    await loadClasses({
        dateFrom: filterDateFrom.value,
        dateTo: filterDateTo.value,
        status: ''
    });

    // Form submit para filtrar
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const filters = {
            dateFrom: filterDateFrom.value,
            dateTo: filterDateTo.value,
            status: filterClassStatus.value
        };
        await loadClasses(filters);
    });

    // Status form submit
    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookingId = document.getElementById('class-status-booking-id').value;
        const newStatus = document.getElementById('class-status-select').value;

        if (!newStatus) {
            showMessage('error', 'Debes seleccionar un estado.');
            return;
        }

        UI.setLoading(true);
        try {
            await Api.updateBookingStatus(bookingId, newStatus);
            showMessage('success', 'Estado de clase actualizado correctamente.');
            statusFormContainer.style.display = 'none';
            await loadClasses({
                dateFrom: filterDateFrom.value,
                dateTo: filterDateTo.value,
                status: filterClassStatus.value
            });
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

    async function loadClasses(filters) {
        UI.setLoading(true);
        upcomingTbody.innerHTML = '';
        pastTbody.innerHTML = '';

        try {
            // Para este caso, usaremos getTeacherBookings con los filtros
            const bookings = await Api.getTeacherBookings(filters);
            const today = new Date().toISOString().split('T')[0];

            // Separar próximas y pasadas
            const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelada');
            const past = bookings.filter(b => b.date < today || b.status === 'cancelada');

            renderUpcomingClasses(upcoming);
            renderPastClasses(past);

            if (bookings.length === 0) {
                showMessage('info', 'No hay clases en el rango de fechas seleccionado.');
            }
        } catch (error) {
            showMessage('error', error.message || 'Error al cargar clases.');
            upcomingTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #d32f2f;">Error al cargar</td></tr>';
            pastTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #d32f2f;">Error al cargar</td></tr>';
        } finally {
            UI.setLoading(false);
        }
    }

    function renderUpcomingClasses(bookings) {
        upcomingTbody.innerHTML = '';

        if (bookings.length === 0) {
            upcomingTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">No tienes clases próximas.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = _getStatusColor(booking.status);

            row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td><strong>${booking.studentName}</strong></td>
                <td>Nivel A</td>
                <td>${booking.vehicle || 'Sin especificar'}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td><span class="badge-inline ${statusColor}">${_formatStatus(booking.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-status" data-booking-id="${booking.id}" data-date="${booking.date}" data-time="${booking.time}" data-student="${booking.studentName}">
                        Cambiar Estado
                    </button>
                </td>
            `;

            // Event handler para cambiar estado
            const statusBtn = row.querySelector('.btn-status');
            statusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookingId = statusBtn.dataset.bookingId;
                const date = statusBtn.dataset.date;
                const time = statusBtn.dataset.time;
                const student = statusBtn.dataset.student;

                document.getElementById('class-status-booking-id').value = bookingId;
                document.getElementById('class-status-info').textContent = `Clase de ${student} el ${date} a las ${time}`;
                statusFormContainer.style.display = 'block';
                statusFormContainer.scrollIntoView({ behavior: 'smooth' });
            });

            upcomingTbody.appendChild(row);
        });
    }

    function renderPastClasses(bookings) {
        pastTbody.innerHTML = '';

        if (bookings.length === 0) {
            pastTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">Sin historial.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = _getStatusColor(booking.status);

            row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td><strong>${booking.studentName}</strong></td>
                <td>Nivel A</td>
                <td>${booking.vehicle || 'Sin especificar'}</td>
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