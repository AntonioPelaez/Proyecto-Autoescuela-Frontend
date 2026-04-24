(function () {
	'use strict';

	const ROOT_ID = 'student-home-page';
	const STATE_ID = 'student-home-state';
	const NEXT_CLASS_ID = 'student-next-class';
	const SUMMARY_ID = 'student-summary';
	const HISTORY_BODY_ID = 'student-history-body';
	const QUICK_FORM_ID = 'student-quick-form';
	const QUICK_TOWN_ID = 'quick-town';
	const QUICK_DATE_ID = 'quick-date';
	const QUICK_RESULTS_ID = 'student-quick-results';

	function getDateTimeValue(item) {
		const date = item && item.date ? item.date : '';
		const time = item && item.time ? item.time : '00:00';
		const dt = new Date(date + 'T' + time + ':00');
		if (Number.isNaN(dt.getTime())) {
			return null;
		}
		return dt;
	}

	function sortByDateTimeAsc(items) {
		return items.slice().sort(function (a, b) {
			const da = getDateTimeValue(a);
			const db = getDateTimeValue(b);
			if (!da || !db) {
				return 0;
			}
			return da.getTime() - db.getTime();
		});
	}

	function showState(type, message) {
		const el = document.getElementById(STATE_ID);
		if (!el) {
			return;
		}

		if (!message) {
			el.className = 'hidden';
			el.textContent = '';
			return;
		}

		const classes = {
			success: 'card card-body',
			error: 'card card-body input-error',
			info: 'card card-body',
		};

		el.className = classes[type] || classes.info;
		el.textContent = message;
	}

	function renderNextClass(bookings) {
		const container = document.getElementById(NEXT_CLASS_ID);
		if (!container) {
			return;
		}

		container.replaceChildren();

		const now = new Date();
		const upcoming = sortByDateTimeAsc(bookings).find(function (booking) {
			const value = getDateTimeValue(booking);
			return value && value >= now;
		});

		if (!upcoming) {
			const paragraph = document.createElement('p');
			paragraph.textContent = 'No tienes proximas clases reservadas.';
			container.appendChild(paragraph);
			return;
		}

		const vehicle = upcoming.vehicle || 'Sin vehiculo asignado';

		appendLabelValue(container, 'Fecha:', upcoming.date);
		appendLabelValue(container, 'Hora:', upcoming.time);
		appendLabelValue(container, 'Profesor:', upcoming.professorName);
		appendLabelValue(container, 'Vehiculo:', vehicle);
	}

	function renderSummary(bookings) {
		const container = document.getElementById(SUMMARY_ID);
		if (!container) {
			return;
		}

		container.replaceChildren();

		const totals = bookings.reduce(function (acc, booking) {
			acc.total += 1;
			const status = (booking.status || '').toLowerCase();
			if (status.includes('pend')) {
				acc.pending += 1;
			} else if (status.includes('cancel')) {
				acc.canceled += 1;
			} else {
				acc.completed += 1;
			}
			return acc;
		}, { total: 0, pending: 0, completed: 0, canceled: 0 });

		container.appendChild(createBadge('Total: ' + totals.total));
		container.appendChild(createBadge('Pendientes: ' + totals.pending));
		container.appendChild(createBadge('Completadas: ' + totals.completed));
		container.appendChild(createBadge('Canceladas: ' + totals.canceled));
	}

	function renderHistory(bookings) {
		const tbody = document.getElementById(HISTORY_BODY_ID);
		if (!tbody) {
			return;
		}

		tbody.replaceChildren();

		const sorted = sortByDateTimeAsc(bookings);
		if (!sorted.length) {
			const row = document.createElement('tr');
			row.className = 'table-empty';
			const cell = document.createElement('td');
			cell.colSpan = 5;
			cell.textContent = 'No hay clases para mostrar.';
			row.appendChild(cell);
			tbody.appendChild(row);
			return;
		}

		sorted.forEach(function (booking) {
			const row = document.createElement('tr');
			row.append(
				createCell(booking.date),
				createCell(booking.time),
				createCell(booking.professorName || '-'),
				createCell(booking.vehicle || 'Sin vehiculo asignado'),
				createCell(booking.status || '-')
			);
			tbody.appendChild(row);
		});
	}

	function renderQuickResults(slots) {
		const container = document.getElementById(QUICK_RESULTS_ID);
		if (!container) {
			return;
		}

		container.replaceChildren();

		if (!slots.length) {
			const paragraph = document.createElement('p');
			paragraph.className = 'table-empty';
			paragraph.textContent = 'No hay huecos para esa fecha y poblacion.';
			container.appendChild(paragraph);
			return;
		}

		const table = document.createElement('table');
		table.className = 'table table-striped table-hover';

		const thead = document.createElement('thead');
		const headRow = document.createElement('tr');
		headRow.append(createHeadCell('Hora'), createHeadCell('Profesor'), createHeadCell('Vehiculo'));
		thead.appendChild(headRow);

		const tbody = document.createElement('tbody');
		slots.forEach(function (slot) {
			const row = document.createElement('tr');
			row.append(
				createCell(slot.time),
				createCell(slot.professorName),
				createCell(slot.vehicle || 'Sin vehiculo asignado')
			);
			tbody.appendChild(row);
		});

		table.append(thead, tbody);
		container.appendChild(table);
	}

	async function loadTowns() {
		const townSelect = document.getElementById(QUICK_TOWN_ID);
		if (!townSelect) {
			return;
		}

		const towns = await Api.getTowns();
		const active = towns.filter(function (town) { return town.active; });
		townSelect.replaceChildren();

		const defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.textContent = 'Selecciona una poblacion';
		townSelect.appendChild(defaultOption);
		active.forEach(function (town) {
			const option = document.createElement('option');
			option.value = String(town.id);
			option.textContent = town.name;
			townSelect.appendChild(option);
		});
	}

	function appendLabelValue(container, label, value) {
		const paragraph = document.createElement('p');
		const strong = document.createElement('strong');
		strong.textContent = label + ' ';
		paragraph.append(strong, document.createTextNode(String(value || '-')));
		container.appendChild(paragraph);
	}

	function createBadge(text) {
		const badge = document.createElement('span');
		badge.className = 'badge';
		badge.textContent = text;
		return badge;
	}

	function createCell(text) {
		const cell = document.createElement('td');
		cell.textContent = String(text || '-');
		return cell;
	}

	function createHeadCell(text) {
		const cell = document.createElement('th');
		cell.textContent = text;
		return cell;
	}

	function bindQuickSearch() {
		const form = document.getElementById(QUICK_FORM_ID);
		const townSelect = document.getElementById(QUICK_TOWN_ID);
		const dateInput = document.getElementById(QUICK_DATE_ID);
		if (!form || !townSelect || !dateInput) {
			return;
		}

		form.addEventListener('submit', async function (event) {
			event.preventDefault();

			const townId = townSelect.value;
			const date = dateInput.value;
			if (!townId || !date) {
				showState('error', 'Selecciona poblacion y fecha para buscar disponibilidad.');
				return;
			}

			try {
				UI.setLoading(QUICK_RESULTS_ID, true);
				const slots = await Api.getAvailabilitySlots(townId, date);
				renderQuickResults(slots);
				showState('success', 'Disponibilidad cargada. Puedes reservar desde la pantalla de Reservar nueva clase.');
			} catch (error) {
				renderQuickResults([]);
				showState('error', error && error.message ? error.message : 'No se pudo cargar la disponibilidad.');
			} finally {
				UI.setLoading(QUICK_RESULTS_ID, false);
			}
		});
	}

	async function loadPanelData() {
		UI.setLoading(HISTORY_BODY_ID, true);
		try {
			const bookings = await Api.getMyBookings();
			renderNextClass(bookings);
			renderSummary(bookings);
			renderHistory(bookings);
			showState('success', 'Panel actualizado correctamente.');
		} catch (error) {
			showState('error', error && error.message ? error.message : 'No se pudo cargar el panel del alumno.');
			UI.showToast('Error al cargar el panel del alumno.', 'error');
		} finally {
			UI.setLoading(HISTORY_BODY_ID, false);
		}
	}

	async function init() {
		const root = document.getElementById(ROOT_ID);
		if (!root) {
			return;
		}

		Router.init();
		bindQuickSearch();

		try {
			await loadTowns();
			await loadPanelData();
		} catch (error) {
			showState('error', error && error.message ? error.message : 'No se pudo inicializar el panel.');
		}
	}

	document.addEventListener('DOMContentLoaded', init);
})();
