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
            _showMessage('Error al cargar tus clases: ' + error.message, true);
        } finally {
            UI.setLoading('my-classes-table-body', false);
        }
    }

    function _renderClasses(bookings) {
        const tbody = document.getElementById('my-classes-table-body');
        if (!tbody) return;

        if (bookings.length === 0) {
            _showMessage('No tienes clases reservadas.', false);
            tbody.innerHTML = '';
            return;
        }

        tbody.innerHTML = bookings
            .map(booking => `
                <tr>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td>${booking.professorName}</td>
                    <td>${booking.vehicle || 'Sin vehículo asignado'}</td>
                    <td>${booking.status}</td>
                </tr>
            `)
            .join('');
    }

    function _showMessage(text, isError) {
        const msg = document.getElementById('my-classes-message');
        if (!msg) return;

        msg.textContent = text;
        msg.className = isError ? 'error' : 'success';
        msg.classList.remove('hidden');
    }

});
