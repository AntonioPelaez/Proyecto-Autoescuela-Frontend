// ─────────────────────────────────────────────
// teacher-bookings.js — Panel de agenda del profesor
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // El router ya habrá redirigido si no hay sesión
    Router.init();

    _loadTeacherBookings();

    // ─────────────────────────────────────────────
    // Carga y renderiza las clases asignadas
    // ─────────────────────────────────────────────

    async function _loadTeacherBookings() {
        try {
            const bookings = await Api.getTeacherBookings();
            _renderBookings(bookings);
        } catch (error) {
            _showMessage('Error al cargar tu agenda: ' + error.message, true);
        }
    }

    function _renderBookings(bookings) {
        const tbody = document.getElementById('teacher-bookings-table-body');
        if (!tbody) return;

        if (bookings.length === 0) {
            _showMessage('No tienes clases asignadas.', false);
            tbody.innerHTML = '';
            return;
        }

        tbody.innerHTML = bookings
            .map(booking => `
                <tr>
                    <td>${booking.studentName}</td>
                    <td>${booking.townName}</td>
                    <td>${booking.vehicle || 'Sin vehículo asignado'}</td>
                    <td>${booking.time}</td>
                    <td>${booking.status}</td>
                </tr>
            `)
            .join('');
    }

    function _showMessage(text, isError) {
        const msg = document.getElementById('teacher-bookings-message');
        if (!msg) return;

        msg.textContent = text;
        msg.className = isError ? 'error' : 'success';
        msg.classList.remove('hidden');
    }

});
