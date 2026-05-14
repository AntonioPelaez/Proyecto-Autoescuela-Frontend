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

            const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled');
            const past = bookings.filter(b => b.date < today || b.status === 'cancelled');

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

                    ${booking.status === 'pending' ? `
                        <button class="btn btn-sm btn-confirm" data-booking-id="${booking.id}">
                            Confirmar clase
                        </button>
                    ` : ''}

                    ${booking.status === 'confirmed' ? `
                        <button class="btn btn-sm btn-complete" data-booking-id="${booking.id}">
                            Completar
                        </button>
                    ` : ''}

                    ${booking.status !== 'cancelled' ? `
                        <button class="btn btn-sm btn-cancel" data-booking-id="${booking.id}">
                            Cancelar
                        </button>
                    ` : ''}

                </td>
            `;

            // Confirmar clase
            const confirmBtn = row.querySelector('.btn-confirm');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.confirmClassSession({ id: booking.id });
                        showMessage('success', 'Clase confirmada correctamente.');
                        await loadClasses({
                            dateFrom: filterDateFrom.value,
                            dateTo: filterDateTo.value,
                            status: filterClassStatus.value
                        });
                    } catch (error) {
                        showMessage('error', error.message || 'No se pudo confirmar la clase.');
                    } finally {
                        UI.setLoading(false);
                    }
                });
            }

            // Completar clase
            const completeBtn = row.querySelector('.btn-complete');
            if (completeBtn) {
                completeBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.completeClassSession({ id: booking.id });
                        showMessage('success', 'Clase completada correctamente.');
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

            // Cancelar clase
            const cancelBtn = row.querySelector('.btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.cancelClassSession({ id: booking.id });
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

    // ─────────────────────────────────────────────
    // Estados y colores
    // ─────────────────────────────────────────────

    function _formatStatus(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmada',
            'in_progress': 'En curso',
            'completed': 'Completada',
            'cancelled': 'Cancelada',
        };
        return statusMap[status] || status;
    }

    function _getStatusColor(status) {
        const colorMap = {
            'pending': 'badge-pending',
            'confirmed': 'badge-confirmed',
            'in_progress': 'badge-progress',
            'completed': 'badge-completed',
            'cancelled': 'badge-cancelled',
        };
        return colorMap[status] || 'badge-gray';
    }

});
