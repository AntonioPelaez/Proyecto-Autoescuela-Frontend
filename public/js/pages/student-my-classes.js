// ─────────────────────────────────────────────
// student-my-classes.js — Panel de mis clases del alumno
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // El router ya habrá redirigido si no hay sesión
    Router.init();

    _loadMyClasses();

    // ─────────────────────────────────────────────
    // Carga y renderiza las clases del alumno
    // ─────────────────────────────────────────────

    async function _loadMyClasses() {
        UI.setLoading('my-classes-table-body', true);
        try {
            const bookings = await Api.getMyBookings();
            _renderClasses(bookings);
        } catch (error) {
            _showState('error', 'Error al cargar tus clases: ' + error.message);
        } finally {
            UI.setLoading('my-classes-table-body', false);
        }
    }

    function _renderClasses(bookings) {
        const tbody = document.getElementById('my-classes-table-body');
        if (!tbody) return;

        tbody.replaceChildren();

        if (bookings.length === 0) {
            _showState('success', 'No tienes clases reservadas.');
            return;
        }

        bookings.forEach((booking) => {
            const row = document.createElement('tr');
            row.append(
                _createCell(booking.date),
                _createCell(booking.time),
                _createCell(booking.professorName),
                _createCell(booking.vehicle || 'Sin vehículo asignado'),
                _createCell(booking.status)
            );
            tbody.appendChild(row);
        });

        _showState('success', 'Clases cargadas correctamente.');
    }

    function _showState(type, text) {
        const msg = document.getElementById('my-classes-message');
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
