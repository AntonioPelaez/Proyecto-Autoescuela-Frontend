// ─────────────────────────────────────────────
// student-my-classes.js — Ver mis clases
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const upcomingTbody = document.getElementById('upcoming-tbody');
    const pastTbody = document.getElementById('past-tbody');
    const messageBox = document.getElementById('message-state');
    const cancelFormContainer = document.getElementById('cancel-form-container');
    const cancelForm = document.getElementById('cancel-form');
    const cancelFormCancel = document.getElementById('cancel-form-cancel');

    // Cargar clases
    await loadMyClasses();

    // Cancel form submit
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

    async function loadMyClasses() {
        try {
            const bookings = await Api.getMyClasses();
            const today = new Date().toISOString().split('T')[0];

            // Separar próximas y pasadas
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

    function renderUpcoming(bookings) {
        upcomingTbody.innerHTML = '';

        if (bookings.length === 0) {
            upcomingTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">No tienes clases próximas reservadas.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const statusColor = booking.status === 'confirmada' ? 'badge-green' : 'badge-gray';
            
            row.innerHTML = `
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.professorName}</td>
                <td>${booking.vehicle || '(sin especificar)'}</td>
                <td>${booking.townName || 'N/A'}</td>
                <td><span class="badge-inline ${statusColor}">${_formatStatus(booking.status)}</span></td>
                <td>
                    ${booking.status !== 'cancelada' ? `<button class="btn btn-sm btn-cancel" data-booking-id="${booking.id}" data-date="${booking.date}" data-time="${booking.time}">Cancelar</button>` : ''}
                </td>
            `;

            // Event handler para cancelar
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
                <td>${booking.date}</td>
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
            'cancelada': 'Cancelada',
            'en_curso': 'En curso',
        };
        return statusMap[status] || status;
    }
});