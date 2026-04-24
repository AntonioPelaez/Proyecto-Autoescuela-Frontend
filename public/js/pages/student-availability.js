document.addEventListener('DOMContentLoaded', () => {
	Router.init();

	const SLOTS_CONTAINER_ID = 'availability-selection-status';
	const form = document.getElementById('availability-form');
	const townSelect = document.getElementById('availability-town');
	const dateInput = document.getElementById('availability-date');
	const messageBox = document.getElementById('availability-message');
	const statusBox = document.getElementById(SLOTS_CONTAINER_ID);
	const currentUser = typeof Auth !== 'undefined' && typeof Auth.getUser === 'function'
		? Auth.getUser()
		: null;
	const selectedTownStorageKey = currentUser && currentUser.id
		? 'selectedTownId:' + String(currentUser.id)
		: 'selectedTownId';
	const savedTownId = localStorage.getItem(selectedTownStorageKey);
	const slotsContainer = statusBox;

	if (!form || !townSelect || !dateInput || !messageBox || !slotsContainer) {
		return;
	}

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
			showState('', '');
			setBookingLoading(reserveButton, true);

			await Api.createBooking(slotId);
			showState('success', 'Reserva confirmada correctamente.');
			showBookingSuccess();
		} catch (error) {
			const message = error.message || 'No se pudo completar la reserva.';
			showState('error', message);
		} finally {
			setBookingLoading(reserveButton, false, originalLabel);
		}
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const townId = townSelect.value;
		const date = dateInput.value;

		if (!townId || !date) {
			showState('error', 'Debes seleccionar una población y una fecha.');
			return;
		}

		let loadingStarted = false;
		try {
			showState('', '');

			UI.setLoading(SLOTS_CONTAINER_ID, true);
			loadingStarted = true;

			const towns = await Api.getTowns();
			const selectedTown = towns.find((town) => town.id === Number(townId));

			if (!selectedTown) {
				showState('error', 'La población seleccionada no existe.');
				return;
			}

			localStorage.setItem(selectedTownStorageKey, String(selectedTown.id));

			const slots = await Api.getAvailabilitySlots(townId, date);
			renderSlots(slots, selectedTown.name, date);

			showState('success', 'Selección guardada correctamente.');
		} catch (error) {
			renderSlots([]);
			showState('error', error.message || 'No se pudo preparar la búsqueda.', true);
		} finally {
			if (loadingStarted) {
				UI.setLoading(SLOTS_CONTAINER_ID, false);
			}
		}
	});

	async function loadTowns() {
		if (!townSelect) {
			return;
		}
		try {
			const towns = await Api.getTowns();
			renderTownOptions(towns);

			if (savedTownId) {
				townSelect.value = savedTownId;
			}
		} catch (error) {
			showState('error', error.message || 'No se pudieron cargar las poblaciones.');
		}
	}

	function renderTownOptions(towns) {
		if (!townSelect) {
			return;
		}
		const activeTowns = towns.filter((town) => town.active);

		townSelect.replaceChildren();

		const defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.textContent = 'Selecciona una población';
		townSelect.appendChild(defaultOption);

		activeTowns.forEach((town) => {
			const option = document.createElement('option');
			option.value = String(town.id);
			option.textContent = town.name;
			townSelect.appendChild(option);
		});
	}

	function showState(type, message, skipToast) {
		if (!messageBox) {
			return;
		}
		if (!message) {
			messageBox.textContent = '';
			messageBox.className = 'hidden';
			return;
		}

		messageBox.textContent = message;
		messageBox.className = type === 'error' ? 'card card-body input-error' : 'card card-body';
		if (!skipToast && typeof UI !== 'undefined' && UI.showToast) {
			UI.showToast(message, type === 'error' ? 'error' : 'success');
		}
	}

	function renderSlots(slots, selectedTownName = '', selectedDate = '') {
		if (!slotsContainer) {
			return;
		}

		slotsContainer.replaceChildren();

		const sortedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time));
		const summary = document.createElement('p');
		summary.textContent = selectedTownName && selectedDate
			? 'Selección guardada: ' + selectedTownName + ' para el día ' + selectedDate + '.'
			: 'Resultados de disponibilidad.';
		slotsContainer.appendChild(summary);

		if (!sortedSlots.length) {
			const empty = document.createElement('p');
			empty.className = 'table-empty';
			empty.textContent = 'No hay disponibilidad para esta fecha.';
			slotsContainer.appendChild(empty);
			return;
		}

		sortedSlots.forEach((slot) => {
			const vehicle = slot.vehicle ? slot.vehicle : 'Sin vehículo asignado';
			const slotCard = document.createElement('div');
			slotCard.className = 'card card-body';

			const time = document.createElement('p');
			time.textContent = 'Hora: ' + slot.time;

			const professor = document.createElement('p');
			professor.textContent = 'Profesor: ' + slot.professorName;

			const vehicleLabel = document.createElement('p');
			vehicleLabel.textContent = 'Vehículo: ' + vehicle;

			const reserveButton = document.createElement('button');
			reserveButton.type = 'button';
			reserveButton.className = 'btn btn-primary btn-sm';
			reserveButton.dataset.action = 'reserve';
			reserveButton.dataset.slotId = String(slot.id);
			reserveButton.textContent = 'Reservar';

			slotCard.append(time, professor, vehicleLabel, reserveButton);
			slotsContainer.appendChild(slotCard);
		});
	}

	function setBookingLoading(button, isLoading, originalLabel = 'Reservar') {
		button.disabled = isLoading;
		button.textContent = isLoading ? 'Procesando...' : originalLabel;
	}

	function showBookingSuccess() {
		const existingAction = document.getElementById('view-my-classes-button');
		if (existingAction) {
			existingAction.disabled = false;
			return;
		}

		const actionButton = document.createElement('button');
		actionButton.type = 'button';
		actionButton.className = 'btn btn-secondary btn-sm';
		actionButton.id = 'view-my-classes-button';
		actionButton.textContent = 'Ver mis clases';
		actionButton.addEventListener('click', () => {
			window.location.href = '/student/my-classes';
		});
		slotsContainer.appendChild(actionButton);
	}
});
