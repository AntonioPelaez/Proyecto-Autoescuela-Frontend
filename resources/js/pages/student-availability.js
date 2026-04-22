document.addEventListener('DOMContentLoaded', () => {
	Router.init();

	const form = document.getElementById('availability-form');
	const townSelect = document.getElementById('availability-town');
	const dateInput = document.getElementById('availability-date');
	const messageBox = document.getElementById('availability-message');
	const statusBox = document.getElementById('availability-selection-status');
	const savedTownId = localStorage.getItem('selectedTownId');
	const slotsContainer = statusBox;

	loadTowns();

	if (savedTownId) {
		townSelect.value = savedTownId;
	}

	slotsContainer.addEventListener('click', async (event) => {
		const reserveButton = event.target.closest('button[data-action="reserve"]');
		if (!reserveButton) {
			return;
		}

		const slotId = reserveButton.dataset.slotId;
		if (!slotId) {
			return;
		}

		const originalLabel = reserveButton.textContent;

		try {
			clearMessage();
			setBookingLoading(reserveButton, true);

			await Api.createBooking(slotId);
			showMessage('Reserva confirmada correctamente.', 'success');
			showBookingSuccess();
		} catch (error) {
			const message = error.message || 'No se pudo completar la reserva.';
			showMessage(message, 'error');
		} finally {
			setBookingLoading(reserveButton, false, originalLabel);
		}
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const townId = townSelect.value;
		const date = dateInput.value;

		if (!townId || !date) {
			showMessage('Debes seleccionar una población y una fecha.', 'error');
			return;
		}

		try {
			clearMessage();

			const towns = await Api.getTowns();
			const selectedTown = towns.find((town) => town.id === Number(townId));

			if (!selectedTown) {
				showMessage('La población seleccionada no existe.', 'error');
				return;
			}

			localStorage.setItem('selectedTownId', String(selectedTown.id));
			statusBox.textContent = `Selección guardada: ${selectedTown.name} para el día ${date}.`;

			const slots = await Api.getAvailabilitySlots(townId, date);
			renderSlots(slots);

			showMessage('Selección guardada correctamente.', 'success');
		} catch (error) {
			renderSlots([]);
			showMessage(error.message || 'No se pudo preparar la búsqueda.', 'error');
		}
	});

	async function loadTowns() {
		try {
			const towns = await Api.getTowns();
			renderTownOptions(towns);

			if (savedTownId) {
				townSelect.value = savedTownId;
			}
		} catch (error) {
			showMessage(error.message || 'No se pudieron cargar las poblaciones.', 'error');
		}
	}

	function renderTownOptions(towns) {
		const activeTowns = towns.filter((town) => town.active);

		townSelect.innerHTML = '<option value="">Selecciona una población</option>';

		activeTowns.forEach((town) => {
			const option = document.createElement('option');
			option.value = String(town.id);
			option.textContent = town.name;
			townSelect.appendChild(option);
		});
	}

	function showMessage(message, type) {
		messageBox.textContent = message;
		messageBox.dataset.type = type;
		messageBox.classList.remove('hidden');
	}

	function clearMessage() {
		messageBox.textContent = '';
		messageBox.dataset.type = '';
		messageBox.classList.add('hidden');
	}

	function renderSlots(slots) {
		if (!slotsContainer) {
			return;
		}

		const sortedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time));

		if (!sortedSlots.length) {
			slotsContainer.innerHTML = '<p>No hay disponibilidad para esta fecha.</p>';
			return;
		}

		slotsContainer.innerHTML = sortedSlots
			.map((slot) => {
				const vehicle = slot.vehicle ? slot.vehicle : 'No asignado';

				return `
					<div>
						<p>Hora: ${slot.time}</p>
						<p>Profesor: ${slot.professorName}</p>
						<p>Vehículo: ${vehicle}</p>
						<button type="button" data-action="reserve" data-slot-id="${slot.id}">Reservar</button>
					</div>
				`;
			})
			.join('');
	}

	function setBookingLoading(button, isLoading, originalLabel = 'Reservar') {
		button.disabled = isLoading;
		button.textContent = isLoading ? 'Procesando...' : originalLabel;
	}

	function showBookingSuccess() {
		const existingAction = document.getElementById('view-my-classes-button');
		if (existingAction) {
			return;
		}

		const actionButton = document.createElement('button');
		actionButton.type = 'button';
		actionButton.id = 'view-my-classes-button';
		actionButton.textContent = 'Ver mis clases';
		actionButton.disabled = true;
		slotsContainer.appendChild(actionButton);
	}
});
