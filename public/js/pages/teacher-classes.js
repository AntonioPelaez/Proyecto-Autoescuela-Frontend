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

    await loadClasses({
        dateFrom: filterDateFrom.value,
        dateTo: filterDateTo.value,
        status: filterClassStatus.value
    });

    // Filtrar
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await loadClasses({
            dateFrom: filterDateFrom.value,
            dateTo: filterDateTo.value,
            status: filterClassStatus.value
        });
    });

    // Formulario de cambiar estado (en curso / completada)
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
    // Cargar clases
    // ─────────────────────────────────────────────

    async function loadClasses(filters) {
        UI.setLoading(true);
        upcomingTbody.innerHTML = '';
        pastTbody.innerHTML = '';

        try {
            let bookings = await Api.getTeacherBookings(filters);

            if (!Array.isArray(bookings)) {
                if (Array.isArray(bookings?.reservas)) bookings = bookings.reservas;
                else if (Array.isArray(bookings?.data)) bookings = bookings.data;
                else bookings = [];
            }

            const today = new Date().toISOString().split('T')[0];

            const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelada');
            const past = bookings.filter(b => b.date < today || b.status === 'cancelada');

            renderUpcomingClasses(upcoming);
            renderPastClasses(past);

            if (bookings.length === 0) {
                showMessage('info', 'No hay clases en el rango de fechas seleccionado.');
            }
        } catch (error) {
            showMessage('error', error.message || 'Error al cargar clases.');
        } finally {
            UI.setLoading(false);
        }
    }

    // ─────────────────────────────────────────────
    // Render Próximas Clases
    // ─────────────────────────────────────────────

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

                    ${booking.status !== 'completada' && booking.status !== 'cancelada' ? `
                        <button class="btn btn-sm btn-complete" data-booking-id="${booking.id}">
                            Completar
                        </button>
                    ` : ''}

                    ${booking.status !== 'cancelada' ? `
                        <button class="btn btn-sm btn-cancel" data-booking-id="${booking.id}">
                            Cancelar
                        </button>
                    ` : ''}

                </td>
            `;

            // Completar
            const completeBtn = row.querySelector('.btn-complete');
            if (completeBtn) {
                completeBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.completeClassSession({ id: booking.id });
                        showMessage('success', 'Clase marcada como completada.');
                        await loadClasses({
                            dateFrom: filterDateFrom.value,
                            dateTo: filterDateTo.value,
                            status: filterClassStatus.value
                        });
                    } catch (error) {
                        showMessage('error', error.message || 'No se pudo completar la clase.');
                    } finally {
                        UI.setLoading(false);
                    }
                });
            }

            // Cancelar
            const cancelBtn = row.querySelector('.btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.updateBookingStatus(booking.id, 'cancelada');
                        showMessage('success', 'Clase cancelada correctamente.');
                        await loadClasses({
                            dateFrom: filterDateFrom.value,
                            dateTo: filterDateTo.value,
                            status: filterClassStatus.value
                        });
                    } catch (error) {
                        showMessage('error', error.message || 'No se pudo cancelar la clase.');
                    } finally {
                        UI.setLoading(false);
                    }
                });
            }

            upcomingTbody.appendChild(row);
        });
    }

    // ─────────────────────────────────────────────
    // Render Historial
    // ─────────────────────────────────────────────

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

    // ─────────────────────────────────────────────
    // Mensajes
    // ─────────────────────────────────────────────

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
        'confirmed': 'Confirmada',
        'in_progress': 'En curso',
        'completed': 'Completada',
        'cancelled': 'Cancelada',
    };
    return statusMap[status] || status;
}

    function _getStatusColor(status) {
    const colorMap = {
        'confirmed': 'badge-confirmed',
        'in_progress': 'badge-progress',
        'completed': 'badge-completed',
        'cancelled': 'badge-cancelled',
    };
    return colorMap[status] || 'badge-gray';
}

});
