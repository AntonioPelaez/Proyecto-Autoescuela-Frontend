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
        UI.setLoading('teacher-bookings-table-body', true);
        try {
            const bookings = await Api.getTeacherBookings();
            _renderBookings(bookings);
        } catch (error) {
            _showState('error', 'Error al cargar tu agenda: ' + error.message);
        } finally {
            UI.setLoading('teacher-bookings-table-body', false);
        }
    }

    function _renderBookings(bookings) {
        const tbody = document.getElementById('teacher-bookings-table-body');
        if (!tbody) return;

        tbody.replaceChildren();

        if (bookings.length === 0) {
            _showState('success', 'No tienes clases asignadas.');
            return;
        }

        bookings.forEach((booking) => {
            const row = document.createElement('tr');
            row.append(
                _createCell(booking.studentName),
                _createCell(booking.townName),
                _createCell(booking.vehicle || 'Sin vehículo asignado'),
                _createCell(booking.time),
                _createCell(booking.status)
            );
            tbody.appendChild(row);
        });

        _showState('success', 'Agenda cargada correctamente.');
    }

    function _showState(type, text) {
        const msg = document.getElementById('teacher-bookings-message');
        if (!msg) return;

        if (!text) {
            msg.textContent = '';
            msg.className = 'hidden';
            return;
        }

        msg.textContent = text;
        msg.className = type === 'error' ? 'card card-body input-error' : 'card card-body';
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(text, type === 'error' ? 'error' : 'success');
        }
    }

    function _createCell(text) {
        const cell = document.createElement('td');
        cell.textContent = String(text || '-');
        return cell;
    }

});
