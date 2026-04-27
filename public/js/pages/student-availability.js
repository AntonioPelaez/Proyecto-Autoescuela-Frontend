// ─────────────────────────────────────────────
// student-availability.js — Reservar clases con horarios
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const selectionForm = document.getElementById('selection-form');
    const townSelect = document.getElementById('town-select');
    const dateSelect = document.getElementById('date-select');
    const timeSlotsSection = document.getElementById('time-slots-section');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    const professorsSection = document.getElementById('professors-section');
    const professorsContainer = document.getElementById('professors-container');
    const bookingSummary = document.getElementById('booking-summary');
    const summaryDetails = document.getElementById('summary-details');
    const confirmForm = document.getElementById('confirm-form');
    const cancelBooking = document.getElementById('cancel-booking');
    const bookingsContainer = document.getElementById('bookings-container');
    const messageBox = document.getElementById('message-state');

    let selectedTown = null;
    let selectedDate = null;
    let selectedTime = null;
    let selectedProfessor = null;
    let timeSlots = [];

    // Cargar datos iniciales
    await loadTowns();
    await loadMyBookings();
    await loadTimeSlots();

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateSelect.min = today;

    // Form submit para buscar horarios
    selectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const townId = townSelect.value;
        const date = dateSelect.value;

        if (!townId || !date) {
            showMessage('error', 'Debes seleccionar población y fecha.');
            return;
        }

        selectedTown = { id: townId, name: townSelect.options[townSelect.selectedIndex].text };
        selectedDate = date;
        selectedTime = null;
        selectedProfessor = null;

        // Mostrar horarios disponibles
        renderTimeSlots();
        timeSlotsSection.style.display = 'block';
        professorsSection.style.display = 'none';
        bookingSummary.style.display = 'none';
        timeSlotsSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Confirm final booking
    confirmForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedProfessor || !selectedTime) {
            showMessage('error', 'Por favor completa todos los pasos.');
            return;
        }

        UI.setLoading(true);
        try {
            await Api.createBookingByTimeSlot(selectedTown.id, selectedDate, selectedTime, selectedProfessor.id);
            showMessage('success', '¡Clase reservada correctamente!');
            bookingSummary.style.display = 'none';
            selectionForm.reset();
            timeSlotsSection.style.display = 'none';
            professorsSection.style.display = 'none';
            await loadMyBookings();
        } catch (error) {
            showMessage('error', error.message || 'Error al reservar.');
        } finally {
            UI.setLoading(false);
        }
    });

    cancelBooking.addEventListener('click', () => {
        bookingSummary.style.display = 'none';
        selectedTime = null;
        selectedProfessor = null;
    });

    // ─────────────────────────────────────────────
    // Funciones internas
    // ─────────────────────────────────────────────

    async function loadTowns() {
        try {
            const towns = await Api.getTowns();
            townSelect.innerHTML = '<option value="">Selecciona población</option>';
            towns.forEach(town => {
                const option = document.createElement('option');
                option.value = town.id;
                option.textContent = town.name;
                townSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading towns:', error);
        }
    }

    async function loadTimeSlots() {
        try {
            timeSlots = await Api.getTimeSlots();
        } catch (error) {
            console.error('Error loading time slots:', error);
        }
    }

    async function renderTimeSlots() {
        timeSlotsGrid.innerHTML = '';

        if (!timeSlots.length) {
            timeSlotsGrid.innerHTML = '<p style="grid-column: 1/-1; color: #999;">No hay horarios disponibles.</p>';
            return;
        }

        for (const slot of timeSlots) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'time-slot-btn';
            btn.textContent = slot.display;
            btn.dataset.time = slot.time;

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                selectedTime = slot.time;
                await loadProfessorsForSlot();
                renderTimeSlotButtons();
            });

            timeSlotsGrid.appendChild(btn);
        }
    }

    function renderTimeSlotButtons() {
        const buttons = timeSlotsGrid.querySelectorAll('.time-slot-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.time === selectedTime) {
                btn.classList.add('selected');
            }
        });
    }

    async function loadProfessorsForSlot() {
        UI.setLoading(true);
        try {
            const professors = await Api.getAvailableProfessorsByTimeSlot(selectedTown.id, selectedDate, selectedTime);
            renderProfessors(professors);
            professorsSection.style.display = 'block';
            professorsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showMessage('error', error.message || 'Error al cargar profesores.');
        } finally {
            UI.setLoading(false);
        }
    }

    function renderProfessors(professors) {
        const list = professorsContainer.querySelector('.professors-list');
        list.innerHTML = '';

        if (!professors.length) {
            list.innerHTML = '<p style="color: #999;">No hay profesores disponibles a esa hora.</p>';
            return;
        }

        professors.forEach(prof => {
            const card = document.createElement('div');
            card.className = 'professor-card';
            card.innerHTML = `
                <div class="professor-info">
                    <h4>${prof.name}</h4>
                    <p>📧 ${prof.email}</p>
                    <p>🚗 ${prof.vehicle || 'Vehículo 1'}</p>
                </div>
                <button type="button" class="btn btn-select-professor" data-professor-id="${prof.id}" data-professor-name="${prof.name}">Seleccionar</button>
            `;

            const selectBtn = card.querySelector('.btn-select-professor');
            selectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                selectedProfessor = {
                    id: prof.id,
                    name: prof.name,
                    vehicle: prof.vehicle
                };
                renderProfessorCards();
                showBookingSummary();
            });

            list.appendChild(card);
        });
    }

    function renderProfessorCards() {
        const cards = professorsContainer.querySelectorAll('.professor-card');
        cards.forEach(card => {
            const btn = card.querySelector('.btn-select-professor');
            if (selectedProfessor && btn.dataset.professorId == selectedProfessor.id) {
                btn.textContent = '✓ Seleccionado';
                btn.disabled = true;
                card.classList.add('selected');
            } else {
                btn.textContent = 'Seleccionar';
                btn.disabled = false;
                card.classList.remove('selected');
            }
        });
    }

    function showBookingSummary() {
        if (!selectedProfessor || !selectedTime || !selectedTown || !selectedDate) return;

        summaryDetails.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-m);">
                <div><strong>Población:</strong> ${selectedTown.name}</div>
                <div><strong>Fecha:</strong> ${selectedDate}</div>
                <div><strong>Hora:</strong> ${selectedTime}</div>
                <div><strong>Profesor:</strong> ${selectedProfessor.name}</div>
                <div><strong>Vehículo:</strong> ${selectedProfessor.vehicle || 'Por asignar'}</div>
            </div>
        `;

        document.getElementById('selected-professor-id').value = selectedProfessor.id;
        bookingSummary.style.display = 'block';
        bookingSummary.scrollIntoView({ behavior: 'smooth' });
    }

    async function loadMyBookings() {
        try {
            const bookings = await Api.getMyBookings();

            if (bookings.length === 0) {
                bookingsContainer.innerHTML = '<p style="color: #999;">Aún no tienes clases reservadas.</p>';
                return;
            }

            bookingsContainer.innerHTML = bookings.map(b => `
                <div class="booking-card">
                    <div class="booking-info">
                        <div><strong>📅 Fecha:</strong> ${b.date}</div>
                        <div><strong>⏰ Hora:</strong> ${b.time}</div>
                        <div><strong>👨‍🏫 Profesor:</strong> ${b.professorName}</div>
                        <div><strong>🚗 Vehículo:</strong> ${b.vehicle || 'Por asignar'}</div>
                    </div>
                    <div class="booking-actions">
                        <span class="badge-inline badge-green">Confirmada</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading bookings:', error);
            bookingsContainer.innerHTML = '<p style="color: #d32f2f;">Error al cargar reservas.</p>';
        }
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
});