document.addEventListener('DOMContentLoaded', () => {
	Router.init();

	const TABLE_BODY_ID = 'bookings-table-body';
	const filtersForm = document.getElementById('bookings-filters-form');
	const filtersDate = document.getElementById('booking-filter-date');
	const filtersTown = document.getElementById('booking-filter-town');
	const filtersProfessor = document.getElementById('booking-filter-professor');
	const filtersStatus = document.getElementById('booking-filter-status');
	const clearFiltersButton = document.getElementById('booking-clear-filters');
	const messageBox = document.getElementById('bookings-message');
	const tableBody = document.getElementById(TABLE_BODY_ID);

	const reassignForm = document.getElementById('booking-reassign-form');
	const reassignTitle = document.getElementById('booking-reassign-title');
	const reassignBookingId = document.getElementById('booking-id');
	const reassignProfessor = document.getElementById('booking-reassign-professor');
	const reassignVehicle = document.getElementById('booking-reassign-vehicle');
	const reassignSubmit = document.getElementById('booking-reassign-submit');
	const reassignCancel = document.getElementById('booking-reassign-cancel');

	if (!filtersForm || !tableBody || !reassignForm) {
		return;
	}

	void bootstrap();

	async function bootstrap() {
		await Promise.all([loadSelectors(), loadBookings()]);
	}

	filtersForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		await loadBookings();
	});

	clearFiltersButton.addEventListener('click', async () => {
		filtersForm.reset();
		showState('', '');
		await loadBookings();
	});

	reassignForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const bookingId = Number(reassignBookingId.value);
		const professorId = Number(reassignProfessor.value);
		const vehicle = String(reassignVehicle.value || '').trim();

		if (!bookingId || !professorId || !vehicle) {
			showState('error', 'Debes seleccionar profesor y vehículo para reasignar.');
			return;
		}

		try {
			showState('', '');
			await Api.reassignAdminBooking(bookingId, { professorId, vehicle });
			showState('success', 'Clase reasignada correctamente.');
			resetReassignForm();
			await loadBookings();
		} catch (error) {
			showState('error', error.message || 'No se pudo reasignar la clase.');
		}
	});

	reassignCancel.addEventListener('click', () => {
		resetReassignForm();
		showState('', '');
	});

	tableBody.addEventListener('click', async (event) => {
		const button = event.target.closest('button[data-action]');
		if (!button) {
			return;
		}

		const action = button.dataset.action;
		const bookingId = Number(button.dataset.id);

		if (!action || !bookingId) {
			return;
		}

		try {
			showState('', '');

			if (action === 'cancel') {
				await Api.cancelAdminBooking(bookingId);
				showState('success', 'Clase cancelada correctamente.');
				resetReassignForm();
				await loadBookings();
				return;
			}

			if (action === 'reassign') {
				const row = JSON.parse(button.dataset.booking || '{}');
				if (!row.id) {
					showState('error', 'No se pudo cargar la clase seleccionada.');
					return;
				}

				reassignBookingId.value = String(row.id);
				reassignProfessor.value = String(row.professorId);
				reassignVehicle.value = row.vehicle || '';
				reassignTitle.textContent = 'Reasignar clase #' + String(row.id);
				reassignSubmit.disabled = false;
				reassignCancel.disabled = false;
				reassignProfessor.focus();
			}
		} catch (error) {
			showState('error', error.message || 'No se pudo completar la acción.');
		}
	});

	async function loadSelectors() {
		try {
			const [towns, professors] = await Promise.all([
				Api.getTowns(),
				Api.getTeachers(),
			]);

			renderTownOptions(towns);
			renderProfessorOptions(professors);
		} catch (error) {
			showState('error', error.message || 'No se pudieron cargar los selectores.');
		}
	}

	function renderTownOptions(towns) {
		filtersTown.replaceChildren();
		const defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.textContent = 'Todas';
		filtersTown.appendChild(defaultOption);

		towns.forEach((town) => {
			const option = document.createElement('option');
			option.value = String(town.id);
			option.textContent = town.name;
			filtersTown.appendChild(option);
		});
	}

	function renderProfessorOptions(professors) {
		filtersProfessor.replaceChildren();
		reassignProfessor.replaceChildren();

		const filterDefault = document.createElement('option');
		filterDefault.value = '';
		filterDefault.textContent = 'Todos';
		filtersProfessor.appendChild(filterDefault);

		const reassignDefault = document.createElement('option');
		reassignDefault.value = '';
		reassignDefault.textContent = 'Selecciona un profesor';
		reassignProfessor.appendChild(reassignDefault);

		professors.forEach((professor) => {
			const filterOption = document.createElement('option');
			filterOption.value = String(professor.id);
			filterOption.textContent = professor.name;
			filtersProfessor.appendChild(filterOption);

			const reassignOption = document.createElement('option');
			reassignOption.value = String(professor.id);
			reassignOption.textContent = professor.name;
			reassignProfessor.appendChild(reassignOption);
		});
	}

	function getFilters() {
		return {
			date: filtersDate.value || '',
			townId: filtersTown.value ? Number(filtersTown.value) : null,
			professorId: filtersProfessor.value ? Number(filtersProfessor.value) : null,
			status: filtersStatus.value || '',
		};
	}

	async function loadBookings() {
		UI.setLoading(TABLE_BODY_ID, true);
		try {
			const bookings = await Api.getAdminClasses(getFilters());
			renderBookings(bookings);
		} catch (error) {
			showState('error', error.message || 'No se pudieron cargar las reservas.');
		} finally {
			UI.setLoading(TABLE_BODY_ID, false);
		}
	}

	function renderBookings(bookings) {
		tableBody.replaceChildren();

		if (!bookings.length) {
			const row = document.createElement('tr');
			row.className = 'table-empty';
			const cell = document.createElement('td');
			cell.colSpan = 9;
			cell.textContent = 'No hay clases reservadas para el filtro actual.';
			row.appendChild(cell);
			tableBody.appendChild(row);
			return;
		}

		bookings.forEach((booking) => {
			const row = document.createElement('tr');
			const isCancelled = booking.status === 'cancelada';

			row.append(
				createCell(String(booking.id)),
				createCell(booking.date),
				createCell(booking.time),
				createCell(booking.studentName),
				createCell(booking.townName),
				createCell(booking.professorName),
				createCell(booking.vehicle || 'Sin vehículo asignado'),
				createCell(booking.status)
			);

			const actionsCell = document.createElement('td');

			const reassignButton = document.createElement('button');
			reassignButton.type = 'button';
			reassignButton.className = 'btn btn-outline btn-sm';
			reassignButton.dataset.action = 'reassign';
			reassignButton.dataset.id = String(booking.id);
			reassignButton.dataset.booking = JSON.stringify(booking);
			reassignButton.textContent = 'Reasignar';
			reassignButton.disabled = isCancelled;

			const cancelButton = document.createElement('button');
			cancelButton.type = 'button';
			cancelButton.className = 'btn btn-danger btn-sm';
			cancelButton.dataset.action = 'cancel';
			cancelButton.dataset.id = String(booking.id);
			cancelButton.textContent = 'Cancelar';
			cancelButton.disabled = isCancelled;

			actionsCell.append(reassignButton, document.createTextNode(' '), cancelButton);
			row.appendChild(actionsCell);
			tableBody.appendChild(row);
		});
	}

	function resetReassignForm() {
		reassignForm.reset();
		reassignBookingId.value = '';
		reassignTitle.textContent = 'Reasignación rápida';
		reassignSubmit.disabled = true;
		reassignCancel.disabled = true;
	}

	function createCell(text) {
		const cell = document.createElement('td');
		cell.textContent = text;
		return cell;
	}

		if (!message) {
			messageBox.textContent = '';
			messageBox.className = 'hidden';
			messageBox.removeAttribute('role');
			return;
		}

		messageBox.textContent = message;
		if (type === 'error') {
			messageBox.className = 'card card-body input-error state-message state-error';
			messageBox.setAttribute('role', 'alert');
		} else {
			messageBox.className = 'card card-body state-message state-success';
			messageBox.setAttribute('role', 'status');
		}
		messageBox.setAttribute('aria-live', 'assertive');

		// Animación de aparición
		messageBox.style.opacity = 0;
		messageBox.style.transition = 'opacity 0.3s';
		setTimeout(() => {
			messageBox.style.opacity = 1;
		}, 10);

		// Auto-ocultar después de 3.5s si es éxito
		if (type !== 'error') {
			setTimeout(() => {
				messageBox.style.opacity = 0;
				setTimeout(() => {
					messageBox.textContent = '';
					messageBox.className = 'hidden';
					messageBox.removeAttribute('role');
				}, 350);
			}, 3500);
		}

		if (typeof UI !== 'undefined' && UI.showToast) {
			UI.showToast(message, type === 'error' ? 'error' : 'success');
		}
});
