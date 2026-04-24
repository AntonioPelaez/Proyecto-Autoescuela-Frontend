(function () {
	'use strict';

	const ROOT_ID = 'teacher-classes-page';
	const STATE_ID = 'classes-state';
	const TABLE_BODY_ID = 'classes-table-body';

	function getStateEl() {
		return document.getElementById(STATE_ID);
	}

	function showState(type, message) {
		const stateEl = getStateEl();
		if (!stateEl) {
			return;
		}

		if (!message) {
			stateEl.className = 'hidden';
			stateEl.textContent = '';
			return;
		}

		const classes = {
			success: 'card card-body',
			error: 'card card-body input-error',
			empty: 'card card-body table-empty',
		};

		stateEl.className = classes[type] || 'card card-body';
		stateEl.textContent = message;
	}

	function formatDate(value) {
		if (!value) {
			return '-';
		}

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return date.toLocaleDateString('es-ES');
	}

	function mapBookingToRow(booking) {
		return {
			date: formatDate(booking.date || booking.classDate),
			time: booking.time || booking.classTime || '-',
			student: booking.studentName || booking.student || '-',
			vehicle: booking.vehicleName || booking.vehicle || '-',
			town: booking.townName || booking.town || '-',
		};
	}

	function renderRows(classes) {
		const tbody = document.getElementById(TABLE_BODY_ID);
		if (!tbody) {
			return;
		}

		tbody.replaceChildren();

		if (!classes.length) {
			showState('empty', 'No tienes clases asignadas por el momento.');
			return;
		}

		showState('success', 'Clases cargadas correctamente.');

		classes.forEach(function (item) {
			const row = document.createElement('tr');
			row.append(
				createCell(item.date),
				createCell(item.time),
				createCell(item.student),
				createCell(item.vehicle),
				createCell(item.town)
			);
			tbody.appendChild(row);
		});
	}

	function createCell(text) {
		const cell = document.createElement('td');
		cell.textContent = String(text || '-');
		return cell;
	}

	async function loadClasses() {
		UI.setLoading(TABLE_BODY_ID, true);

		try {
			const bookings = await Api.getTeacherBookings();
			const rows = Array.isArray(bookings) ? bookings.map(mapBookingToRow) : [];
			renderRows(rows);
		} catch (error) {
			const message = error && error.message ? error.message : 'Error al cargar las clases.';
			showState('error', message);
			UI.showToast('No se pudieron cargar las clases.', 'error');
		} finally {
			UI.setLoading(TABLE_BODY_ID, false);
		}
	}

	function bindEvents() {
		const refresh = document.getElementById('classes-refresh');
		if (refresh) {
			refresh.addEventListener('click', function () {
				loadClasses();
			});
		}
	}

	function init() {
		const root = document.getElementById(ROOT_ID);
		if (!root) {
			return;
		}

		Router.init();
		bindEvents();
		loadClasses();
	}

	document.addEventListener('DOMContentLoaded', init);
})();
