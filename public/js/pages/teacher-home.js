(function () {
	'use strict';

	const ROOT_ID = 'teacher-home-page';
	const STATE_ID = 'teacher-home-state';
	const TODAY_BODY_ID = 'teacher-today-body';
	const UPCOMING_BODY_ID = 'teacher-upcoming-body';
	const HISTORY_BODY_ID = 'teacher-history-body';
	const WEEK_SUMMARY_ID = 'teacher-week-summary';

	function parseDateTime(item) {
		const date = item && item.date ? item.date : '';
		const time = item && item.time ? item.time : '00:00';
		const value = new Date(date + 'T' + time + ':00');
		if (Number.isNaN(value.getTime())) {
			return null;
		}
		return value;
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

	function getTodayIso() {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		return yyyy + '-' + mm + '-' + dd;
	}

	function mapBooking(raw) {
		return {
			date: raw.date || '-',
			time: raw.time || '-',
			studentName: raw.studentName || '-',
			townName: raw.townName || '-',
			vehicle: raw.vehicle || 'Sin vehiculo asignado',
			status: raw.status || '-',
			dt: parseDateTime(raw),
		};
	}

	function renderRows(bodyId, rows, columns, emptyMessage) {
		const tbody = document.getElementById(bodyId);
		if (!tbody) {
			return;
		}

		tbody.replaceChildren();

		if (!rows.length) {
			const row = document.createElement('tr');
			row.className = 'table-empty';
			const cell = document.createElement('td');
			cell.colSpan = columns;
			cell.textContent = emptyMessage;
			row.appendChild(cell);
			tbody.appendChild(row);
			return;
		}

		rows.forEach(function (rowData) {
			const row = document.createElement('tr');
			rowData.forEach(function (value) {
				row.appendChild(createCell(value));
			});
			tbody.appendChild(row);
		});
	}

	function renderWeekSummary(bookings) {
		const container = document.getElementById(WEEK_SUMMARY_ID);
		if (!container) {
			return;
		}

		container.replaceChildren();

		const today = new Date();
		const end = new Date(today);
		end.setDate(today.getDate() + 7);

		const weekly = bookings.filter(function (item) {
			return item.dt && item.dt >= today && item.dt < end;
		});

		const byDate = weekly.reduce(function (acc, item) {
			const key = item.date;
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {});

		const days = Object.keys(byDate).sort();
		if (!days.length) {
			const paragraph = document.createElement('p');
			paragraph.className = 'table-empty';
			paragraph.textContent = 'No hay clases planificadas para los proximos 7 dias.';
			container.appendChild(paragraph);
			return;
		}

		const list = document.createElement('ul');
		days.forEach(function (day) {
			const item = document.createElement('li');
			const strong = document.createElement('strong');
			strong.textContent = day + ': ';
			item.append(strong, document.createTextNode(String(byDate[day]) + ' clase(s)'));
			list.appendChild(item);
		});
		container.appendChild(list);
	}

	function renderPanel(bookings) {
		const todayIso = getTodayIso();
		const now = new Date();
		const sorted = bookings.slice().sort(function (a, b) {
			if (!a.dt || !b.dt) {
				return 0;
			}
			return a.dt.getTime() - b.dt.getTime();
		});

		const todayRows = sorted.filter(function (item) {
			return item.date === todayIso;
		}).map(function (item) {
			return [item.time, item.studentName, item.townName, item.vehicle];
		});

		const upcomingRows = sorted.filter(function (item) {
			return item.dt && item.dt >= now;
		}).slice(0, 6).map(function (item) {
			return [item.date, item.time, item.studentName, item.townName];
		});

		const historyRows = sorted.filter(function (item) {
			return item.dt && item.dt < now;
		}).slice(-6).reverse().map(function (item) {
			return [item.date, item.time, item.studentName, item.status];
		});

		renderRows(TODAY_BODY_ID, todayRows, 4, 'No tienes clases para hoy.');
		renderRows(UPCOMING_BODY_ID, upcomingRows, 4, 'No hay proximas clases registradas.');
		renderRows(HISTORY_BODY_ID, historyRows, 4, 'Sin clases historicas.');
		renderWeekSummary(sorted);
	}

	function createCell(text) {
		const cell = document.createElement('td');
		cell.textContent = String(text || '-');
		return cell;
	}

	async function init() {
		const root = document.getElementById(ROOT_ID);
		if (!root) {
			return;
		}

		Router.init();
		UI.setLoading(TODAY_BODY_ID, true);
		UI.setLoading(UPCOMING_BODY_ID, true);
		UI.setLoading(HISTORY_BODY_ID, true);

		try {
			const raw = await Api.getTeacherBookings();
			const bookings = Array.isArray(raw) ? raw.map(mapBooking) : [];
			renderPanel(bookings);
			showState('success', 'Panel del profesor cargado correctamente.');
		} catch (error) {
			showState('error', error && error.message ? error.message : 'No se pudo cargar el panel del profesor.');
			UI.showToast('Error al cargar el panel del profesor.', 'error');
		} finally {
			UI.setLoading(TODAY_BODY_ID, false);
			UI.setLoading(UPCOMING_BODY_ID, false);
			UI.setLoading(HISTORY_BODY_ID, false);
		}
	}

	document.addEventListener('DOMContentLoaded', init);
})();
