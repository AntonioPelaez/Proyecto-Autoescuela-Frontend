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

	function formatBookingTime(value) {
		const raw = String(value || '').trim();
		if (!raw) {
			return '00:00';
		}

		if (raw.length >= 16 && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(raw)) {
			return raw.slice(11, 16);
		}

		if (/^\d{2}:\d{2}/.test(raw)) {
			return raw.slice(0, 5);
		}

		return raw;
	}

	function _normalizeStatus(raw) {
		const s = String(raw || '').toLowerCase();
		if (s === 'confirmada' || s === 'confirmed' || s === 'booked') return 'confirmada';
		if (s === 'cancelada' || s === 'cancelled' || s === 'canceled') return 'cancelada';
		if (s === 'en_curso' || s === 'in_progress') return 'en_curso';
		if (s === 'completada' || s === 'completed') return 'completada';
		if (s === 'pending') return 'confirmada';
		return s || 'confirmada';
	}

	function normalizeBookingRecord(booking) {
		const teacherId = booking && (booking.teacher_id || booking.teacher_profile_id || booking.teacher && booking.teacher.id);
		const vehicleId = booking && (booking.vehicle_id || booking.vehicle && booking.vehicle.id);
		return {
			...booking,
			date: booking && (booking.date || booking.session_date || booking.scheduled_date) || '',
			time: booking && (booking.time || formatBookingTime(booking.start_time || booking.slot_starts_at || booking.start)) || '00:00',
			professorName: booking && (booking.professorName || booking.teacher_name || booking.teacherName || booking.teacher && booking.teacher.name) || (teacherId ? 'Profesor #' + teacherId : '-'),
			vehicle: booking && (booking.vehicle_name || booking.vehicle_label || (booking.vehicle && booking.vehicle.name) || (booking.vehicle && booking.vehicle.label) || (booking.vehicle && booking.vehicle.brand && booking.vehicle.model ? `${booking.vehicle.brand} ${booking.vehicle.model}`.trim() : null) || (typeof booking.vehicle === 'string' ? booking.vehicle : null)) || (vehicleId ? 'Vehículo #' + vehicleId : 'Sin vehiculo asignado'),
			status: _normalizeStatus(booking && booking.status),
		};
	}

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
				createCell(_formatStatus(booking.status))
			);
			tbody.appendChild(row);
		});
	}

	function _formatStatus(status) {
		const map = { confirmada: 'Confirmada', pendiente: 'Pendiente', cancelada: 'Cancelada', en_curso: 'En curso', completada: 'Completada' };
		return map[status] || status || '-';
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

	function normalizeQuickSlots(apiResponse) {
		const payload = apiResponse && apiResponse.data ? apiResponse.data : apiResponse;
		const groupedSlots = payload && Array.isArray(payload.slots) ? payload.slots : [];
		const result = [];

		groupedSlots.forEach(function (teacherBlock) {
			const teacherName = teacherBlock && teacherBlock.teacher_name ? teacherBlock.teacher_name : 'Profesor';
			const vehicle = teacherBlock && (teacherBlock.vehicle_name || teacherBlock.vehicle_label || teacherBlock.vehicle)
				? (teacherBlock.vehicle_name || teacherBlock.vehicle_label || teacherBlock.vehicle)
				: 'Sin vehiculo asignado';
			const slots = teacherBlock && Array.isArray(teacherBlock.slots) ? teacherBlock.slots : [];

			slots.forEach(function (slot) {
				if (slot && slot.reserved) {
					return;
				}

				const raw = slot ? (slot.start || slot.slot_starts_at || slot.starts_at || slot.time) : '';
				const time = raw && String(raw).includes('T')
					? String(raw).split('T')[1].slice(0, 5)
					: String(raw || '').slice(0, 5);

				if (!time) {
					return;
				}

				result.push({
					time: time,
					professorName: teacherName,
					vehicle: vehicle,
				});
			});
		});

		return result;
	}

	async function loadTowns() {
		const townSelect = document.getElementById(QUICK_TOWN_ID);
		if (!townSelect) {
			return;
		}

		const response = await Api.getTowns();
		const towns = response.data || response || [];
		const active = towns.filter(function (town) { return town.is_active; });
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
				const response = await Api.getAvailabilitySlots({ town_id: townId, date: date });
				const slots = normalizeQuickSlots(response);
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

	// Devuelve mapa session_id → label de vehículo
	async function buildTeacherVehicleMap(rawBookings) {
		const map = {};
		let storedMap = {};
		let teacherCache = {};
		try { storedMap = JSON.parse(localStorage.getItem('session_vehicle_map') || '{}'); } catch (_) {}
		try { teacherCache = JSON.parse(localStorage.getItem('teacher_vehicle_cache') || '{}'); } catch (_) {}

		const teacherIds = [...new Set(
			rawBookings.map(b => b?.teacher_profile_id ?? b?.teacher_id ?? null).filter(Boolean)
		)];
		const teacherVehicles = {};
		await Promise.all(teacherIds.map(async tid => {
			try {
				const res = await Api.getTeacherVehicles(tid);
				teacherVehicles[tid] = Array.isArray(res?.vehicles) ? res.vehicles : [];
			} catch (_) { teacherVehicles[tid] = []; }
		}));

		rawBookings.forEach(b => {
			const tid = b?.teacher_profile_id ?? b?.teacher_id ?? null;
			const sid = b?.id ?? null;
			const vehicles = teacherVehicles[tid] || [];
			if (!tid || !sid) return;

			const findLabel = vid => {
				const v = vehicles.find(x => Number(x.id) === Number(vid));
				return v ? `${v.brand || ''} ${v.model || ''}`.trim() || v.plate_number : null;
			};

			const savedVid = storedMap[sid];
			if (savedVid) { const l = findLabel(savedVid); if (l) { map[sid] = l; return; } }

			const cachedVid = teacherCache[tid];
			if (cachedVid) { const l = findLabel(cachedVid); if (l) { map[sid] = l; return; } }

			const active = vehicles.filter(v => v.is_active);
			if (active.length === 1) {
				map[sid] = `${active[0].brand || ''} ${active[0].model || ''}`.trim() || active[0].plate_number;
				return;
			}

			map[sid] = 'Ver con tu profesor';
		});
		return map;
	}

	async function loadPanelData() {
		UI.setLoading(HISTORY_BODY_ID, true);
		try {
			const response = await Api.getMyClasses();
			const rawBookings = Array.isArray(response && response.data) ? response.data : (Array.isArray(response) ? response : []);
			const teacherVehicleMap = await buildTeacherVehicleMap(rawBookings);
			const bookings = rawBookings.map(b => {
				const nb = normalizeBookingRecord(b);
				const sid = b?.id ?? null;
				if (sid && teacherVehicleMap[sid]) nb.vehicle = teacherVehicleMap[sid];
				return nb;
			});
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
