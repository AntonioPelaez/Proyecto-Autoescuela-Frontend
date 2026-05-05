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
	const modal = document.getElementById('reassign-modal');
	const modalCloseBtn = document.getElementById('modal-close-btn');
	const reassignMsgBox = document.getElementById('reassign-message');

	if (!filtersForm || !tableBody || !reassignForm || !modal) {
		return;
	}

	// Mapa en memoria: id → booking normalizado
	const bookingMap = new Map();
	const townIdByName = new Map();
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
		const vehicleId = Number(reassignVehicle.value) || null;

		if (!bookingId || !professorId) {
			showReassignMsg('error', 'Debes seleccionar un profesor para reasignar.');
			return;
		}

		try {
			showReassignMsg('', '');

			const booking = bookingMap.get(bookingId);
			const bookingDate = booking?.session_date || booking?.date || '';
			const townKey = normalizeTownName(booking?.townName || booking?.town_name || '');
			const bookingTownId = Number(booking?.town_id || booking?.townId || townIdByName.get(townKey) || 0);

			if (bookingDate && bookingTownId && professorId) {
				try {
					const availability = await Api.getAvailabilityHours({
						town_id: bookingTownId,
						teacher_id: professorId,
						date: bookingDate,
					});
					const hours = Array.isArray(availability?.hours) ? availability.hours : [];
					if (!hours.length) {
						showReassignMsg('error', 'El profesor seleccionado no tiene disponibilidad para esa fecha/población. Elige otro profesor.');
						return;
					}
				} catch (_) {
					// Si falla esta comprobación previa, se continúa y decide el backend.
				}
			}

			await Api.reassignAdminBooking(bookingId, professorId, vehicleId);
			showReassignMsg('success', 'Clase reasignada correctamente.');
			setTimeout(() => closeModal(), 1200);
			await loadBookings();
		} catch (error) {
			const msg = getApiErrorMessage(error, 'No se pudo reasignar la clase.');
			showReassignMsg('error', msg);
		}
	});

	reassignProfessor.addEventListener('change', async () => {
		const professorId = Number(reassignProfessor.value);
		reassignVehicle.replaceChildren();
		const defaultOpt = document.createElement('option');
		defaultOpt.value = '';
		defaultOpt.textContent = '— Sin cambiar vehículo —';
		reassignVehicle.appendChild(defaultOpt);
		if (!professorId) return;
		try {
			const data = await Api.getTeacherVehicles(professorId);
			const vehicles = data.vehicles || data || [];
			vehicles.forEach((v) => {
				const opt = document.createElement('option');
				opt.value = String(v.id);
				opt.textContent = `${v.brand} ${v.model}`;
				reassignVehicle.appendChild(opt);
			});
		} catch (_) { /* sin vehículos */ }
	});

	reassignCancel.addEventListener('click', () => {
		closeModal();
	});

	modalCloseBtn.addEventListener('click', () => {
		closeModal();
	});

	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && modal.style.display !== 'none') closeModal();
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
				const row = bookingMap.get(bookingId);
				if (!row) {
					showState('error', 'No se pudo cargar la clase seleccionada.');
					return;
				}

				reassignBookingId.value = String(row.id);
				reassignTitle.textContent = 'Reasignar clase #' + String(row.id);

				// Preseleccionar el profesor actual
				reassignProfessor.value = String(row.teacher_profile_id || row.professorId || '');

				// Cargar vehículos del profesor actual
				reassignVehicle.replaceChildren();
				const defaultOpt = document.createElement('option');
				defaultOpt.value = '';
				defaultOpt.textContent = '— Sin cambiar vehículo —';
				reassignVehicle.appendChild(defaultOpt);
				if (row.teacher_profile_id || row.professorId) {
					try {
						const tid = row.teacher_profile_id || row.professorId;
						const data = await Api.getTeacherVehicles(tid);
						const vehicles = data.vehicles || data || [];
						vehicles.forEach((v) => {
							const opt = document.createElement('option');
							opt.value = String(v.id);
							opt.textContent = `${v.brand} ${v.model}`;
							reassignVehicle.appendChild(opt);
						});
						if (row.vehicle_id) reassignVehicle.value = String(row.vehicle_id);
					} catch (err) {
						console.warn('No se pudieron cargar los vehículos del profesor:', err);
					}
				}

				openModal();
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
		townIdByName.clear();
		const defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.textContent = 'Todas';
		filtersTown.appendChild(defaultOption);

		towns.forEach((town) => {
			const option = document.createElement('option');
			option.value = String(town.id);
			option.textContent = town.name;
			filtersTown.appendChild(option);
			townIdByName.set(normalizeTownName(town.name), Number(town.id));
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
			const fullName = [professor.name, professor.surname1, professor.surname2]
				.filter(Boolean)
				.join(' ')
				.trim() || professor.name || 'Profesor';
			const isEligibleForReassign = professor.is_active_for_booking === false;

			const filterOption = document.createElement('option');
			filterOption.value = String(professor.id);
			filterOption.textContent = fullName;
			filtersProfessor.appendChild(filterOption);

			const reassignOption = document.createElement('option');
			reassignOption.value = String(professor.id);
			reassignOption.textContent = fullName + (isEligibleForReassign ? '' : ' (No disponible)');
			reassignOption.disabled = !isEligibleForReassign;
			reassignProfessor.appendChild(reassignOption);
		});
	}

	function getFilters() {
		const filters = {};
		const date = filtersDate.value || '';
		const townId = filtersTown.value ? Number(filtersTown.value) : null;
		const professorId = filtersProfessor.value ? Number(filtersProfessor.value) : null;
		const status = filtersStatus.value || '';
		if (date) filters.date = date;
		if (townId) filters.town_id = townId;
		if (professorId) filters.teacher_id = professorId;
		if (status) filters.status = status;
		return filters;
	}

	async function loadBookings() {
		UI.setLoading(TABLE_BODY_ID, true);
		try {
			const raw = await Api.getAdminClasses(getFilters());
			const bookings = raw.map(normalizeAdminBooking);
			bookingMap.clear();
			bookings.forEach((b) => bookingMap.set(b.id, b));
			renderBookings(bookings);
		} catch (error) {
			showState('error', error.message || 'No se pudieron cargar las reservas.');
		} finally {
			UI.setLoading(TABLE_BODY_ID, false);
		}
	}

	function normalizeAdminBooking(b) {
		const status = _normalizeStatus(b.status);
		return {
			...b,
			date: b.session_date || b.date || '',
			time: b.start_time ? b.start_time.slice(0, 5) : (b.time || ''),
			studentName: [b.student_name, b.student_surname1, b.student_surname2].filter(Boolean).join(' ') || b.studentName || '-',
			professorName: [b.teacher_name, b.teacher_surname1, b.teacher_surname2].filter(Boolean).join(' ') || b.professorName || '-',
			townName: b.town_name || b.townName || '-',
			vehicle: (b.vehicle_brand && b.vehicle_model) ? `${b.vehicle_brand} ${b.vehicle_model}` : (b.vehicle || null),
			professorId: b.teacher_profile_id || b.professorId || '',
			status,
		};
	}

	function _normalizeStatus(raw) {
		const s = String(raw || '').toLowerCase();
		if (s === 'pending' || s === 'confirmed' || s === 'booked') return 'Confirmada';
		if (s === 'cancelled' || s === 'canceled' || s === 'cancelada') return 'Cancelada';
		if (s === 'in_progress' || s === 'en_curso') return 'En curso';
		if (s === 'completed' || s === 'completada') return 'Completada';
		return raw || '-';
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
			const isCancelled = booking.status === 'Cancelada';

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
		reassignTitle.textContent = 'Reasignar clase';
		if (reassignMsgBox) { reassignMsgBox.style.display = 'none'; reassignMsgBox.textContent = ''; }
	}

	function openModal() {
		if (reassignMsgBox) { reassignMsgBox.style.display = 'none'; reassignMsgBox.textContent = ''; }
		modal.style.display = 'flex';
		modalCloseBtn.focus();
	}

	function closeModal() {
		modal.style.display = 'none';
		resetReassignForm();
	}

	function showReassignMsg(type, message) {
		if (!reassignMsgBox) return;
		if (!message) {
			reassignMsgBox.style.display = 'none';
			reassignMsgBox.textContent = '';
			return;
		}
		reassignMsgBox.textContent = message;
		reassignMsgBox.style.display = 'block';
		if (type === 'error') {
			reassignMsgBox.style.background = '#fff0f0';
			reassignMsgBox.style.color = '#a30000';
			reassignMsgBox.style.border = '1.5px solid #f5bcbc';
		} else {
			reassignMsgBox.style.background = '#eafbe7';
			reassignMsgBox.style.color = '#1a4d1a';
			reassignMsgBox.style.border = '1.5px solid #b6e2c6';
		}
	}

	function createCell(text) {
		const cell = document.createElement('td');
		cell.textContent = text;
		return cell;
	}

	function normalizeTownName(value) {
		return String(value || '').trim().toLowerCase();
	}

	function getApiErrorMessage(error, fallback) {
		if (!error) return fallback;
		if (typeof error.message === 'string' && error.message.trim()) {
			const raw = error.message.trim();
			if (raw.startsWith('{') && raw.endsWith('}')) {
				try {
					const parsed = JSON.parse(raw);
					return parsed.message || parsed.error || fallback;
				} catch (_) {
					return raw;
				}
			}
			return raw;
		}
		if (typeof error.error === 'string' && error.error.trim()) return error.error.trim();
		return fallback;
	}

	function showState(type, message) {
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

		messageBox.style.opacity = 0;
		messageBox.style.transition = 'opacity 0.3s';
		setTimeout(() => { messageBox.style.opacity = 1; }, 10);

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
	}
});
