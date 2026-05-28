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

    function formatDateDMY(dateStr) {
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("-");
        return `${d}/${m}/${y}`;
    }

    function normalizeStatus(value) {
        if (!value || value === "Todos los estados") return null;
        return value;
    }

    function buildFilters() {
        const status = normalizeStatus(filterClassStatus.value);

        const filters = {
            dateFrom: filterDateFrom.value,
            dateTo: filterDateTo.value
        };

        if (status) filters.status = status;

        return filters;
    }

    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    const nextTwoMonths = new Date(today);
    nextTwoMonths.setDate(nextTwoMonths.getDate() + 60);

    filterDateFrom.value = lastMonth.toISOString().split('T')[0];
    filterDateTo.value = nextTwoMonths.toISOString().split('T')[0];

    await loadClasses(buildFilters());

    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await loadClasses(buildFilters());
    });

    async function loadClasses(filters) {
        UI.setLoading('upcoming-classes-tbody', true);
        UI.setLoading('past-classes-tbody', true);

        try {
            const safeFilters = {
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                ...(filters.status ? { status: filters.status } : {})
            };

            let bookings = await Api.getTeacherBookings(safeFilters);

            if (!Array.isArray(bookings)) {
                if (Array.isArray(bookings?.reservas)) bookings = bookings.reservas;
                else if (Array.isArray(bookings?.data)) bookings = bookings.data;
                else bookings = [];
            }


            const today = new Date().toISOString().split('T')[0];

const upcoming = bookings.filter(b =>
    b.status !== 'completed' &&
    b.status !== 'cancelled' &&
    b.date >= today
);

const past = bookings.filter(b =>
    b.status === 'completed' ||
    b.status === 'cancelled' ||
    b.date < today
);


            renderUpcomingClasses(upcoming);
            renderPastClasses(past);

            if (bookings.length === 0) {
                showMessage('info', 'No hay clases en el rango de fechas seleccionado.');
            }
        } catch (error) {
            showMessage('error', error.message || 'Error al cargar clases.');
        } finally {
            UI.setLoading('upcoming-classes-tbody', false);
            UI.setLoading('past-classes-tbody', false);
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

            const fecha = formatDateDMY(booking.date);

            row.innerHTML = `
                <td>${fecha}</td>
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

            const confirmBtn = row.querySelector('.btn-confirm');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.confirmClassSession(parseInt(booking.id, 10));
                        showMessage('success', 'Clase confirmada correctamente.');
                        await loadClasses(buildFilters());
                    } catch (error) {
                        showMessage('error', error.message || 'No se pudo confirmar la clase.');
                    } finally {
                        UI.setLoading(false);
                    }
                });
            }

            const completeBtn = row.querySelector('.btn-complete');
            if (completeBtn) {
                completeBtn.addEventListener('click', async () => {
                    // 👉 Redirigimos a la página de evaluación de skills
                    window.location.href = `/teacher/classes/${booking.id}/evaluate-skills`;
                });
            }

            const cancelBtn = row.querySelector('.btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.cancelClassSession({ id: parseInt(booking.id, 10) });
                        showMessage('success', 'Clase cancelada correctamente.');
                        await loadClasses(buildFilters());
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

    function renderPastClasses(bookings) {
        pastTbody.innerHTML = '';

        if (bookings.length === 0) {
            pastTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">Sin historial.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = _getStatusColor(booking.status);

            const fecha = formatDateDMY(booking.date);

            row.innerHTML = `
                <td>${fecha}</td>
                <td>${booking.time}</td>
                <td><strong>${booking.studentName}</strong></td>
                <td>Nivel A</td>
                <td>${booking.vehicle || 'Sin especificar'}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td><span class="badge-inline ${statusColor}">${_formatStatus(booking.status)}</span></td>
                <td>
                    ${booking.status === 'confirmed' ? `
                        <button class="btn btn-sm btn-complete" data-booking-id="${booking.id}">
                            Completar
                        </button>
                    ` : ''}

                    ${booking.status !== 'cancelled' && booking.status !== 'completed' ? `
                        <button class="btn btn-sm btn-cancel" data-booking-id="${booking.id}">
                            Cancelar
                        </button>
                    ` : ''}
                </td>
            `;

            const completeBtn = row.querySelector('.btn-complete');
            if (completeBtn) {
                completeBtn.addEventListener('click', async () => {
                    // 👉 Redirigimos a la página de evaluación de skills
                    window.location.href = `/teacher/classes/${booking.id}/evaluate-skills`;
                });
            }

            const cancelBtn = row.querySelector('.btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', async () => {
                    UI.setLoading(true);
                    try {
                        await Api.cancelClassSession({ id: parseInt(booking.id, 10) });
                        showMessage('success', 'Clase cancelada correctamente.');
                        await loadClasses(buildFilters());
                    } catch (error) {
                        showMessage('error', error.message || 'No se pudo cancelar la clase.');
                    } finally {
                        UI.setLoading(false);
                    }
                });
            }

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
