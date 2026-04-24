(function () {
	'use strict';

	const ROOT_ID = 'admin-vehicles-page';
	const STATE_ID = 'vehicles-state';
	const TABLE_BODY_ID = 'vehicles-table-body';

	let vehicles = [
		{ id: 1, name: 'Seat Ibiza', plate: '1234ABC', active: true },
		{ id: 2, name: 'Renault Clio', plate: '5678DEF', active: true },
		{ id: 3, name: 'Toyota Yaris', plate: '9012GHI', active: false },
	];

	let editingId = null;

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

	function normalizePlate(value) {
		return String(value || '').toUpperCase().replace(/\s+/g, '');
	}

	function resetForm() {
		const form = document.getElementById('vehicle-form');
		const title = document.getElementById('vehicle-form-title');
		const submit = document.getElementById('vehicle-submit');
		const cancel = document.getElementById('vehicle-cancel');

		editingId = null;
		if (form) {
			form.reset();
		}
		if (title) {
			title.textContent = 'Añadir vehículo';
		}
		if (submit) {
			submit.textContent = 'Guardar';
		}
		if (cancel) {
			cancel.classList.add('hidden');
		}
	}

	function setEditMode(vehicle) {
		const idInput = document.getElementById('vehicle-id');
		const nameInput = document.getElementById('vehicle-name');
		const plateInput = document.getElementById('vehicle-plate');
		const title = document.getElementById('vehicle-form-title');
		const submit = document.getElementById('vehicle-submit');
		const cancel = document.getElementById('vehicle-cancel');

		editingId = vehicle.id;
		if (idInput) {
			idInput.value = String(vehicle.id);
		}
		if (nameInput) {
			nameInput.value = vehicle.name;
			nameInput.focus();
		}
		if (plateInput) {
			plateInput.value = vehicle.plate;
		}
		if (title) {
			title.textContent = 'Editar vehículo';
		}
		if (submit) {
			submit.textContent = 'Actualizar';
		}
		if (cancel) {
			cancel.classList.remove('hidden');
		}
	}

	function renderRows() {
		const tbody = document.getElementById(TABLE_BODY_ID);
		if (!tbody) {
			return;
		}

		tbody.replaceChildren();

		if (!vehicles.length) {
			showState('empty', 'No hay vehículos disponibles todavía.');
			return;
		}

		showState('', '');

		vehicles.forEach(function (vehicle) {
			const row = document.createElement('tr');

			const idCell = document.createElement('td');
			idCell.textContent = String(vehicle.id);

			const nameCell = document.createElement('td');
			nameCell.textContent = vehicle.name;

			const plateCell = document.createElement('td');
			plateCell.textContent = vehicle.plate;

			const stateCell = document.createElement('td');
			stateCell.textContent = vehicle.active ? 'Activo' : 'Inactivo';

			const actionsCell = document.createElement('td');

			const editButton = document.createElement('button');
			editButton.type = 'button';
			editButton.className = 'btn btn-outline btn-sm';
			editButton.dataset.action = 'edit';
			editButton.dataset.id = String(vehicle.id);
			editButton.textContent = 'Editar';

			const toggleButton = document.createElement('button');
			toggleButton.type = 'button';
			toggleButton.className = 'btn btn-secondary btn-sm';
			toggleButton.dataset.action = 'toggle';
			toggleButton.dataset.id = String(vehicle.id);
			toggleButton.textContent = vehicle.active ? 'Desactivar' : 'Activar';

			actionsCell.append(editButton, document.createTextNode(' '), toggleButton);
			row.append(idCell, nameCell, plateCell, stateCell, actionsCell);
			tbody.appendChild(row);
		});
	}

	function loadVehicles() {
		UI.setLoading(TABLE_BODY_ID, true);

		setTimeout(function () {
			UI.setLoading(TABLE_BODY_ID, false);
			renderRows();
		}, 150);
	}

	function handleSubmit(event) {
		event.preventDefault();

		const form = event.currentTarget;
		const name = form.name.value.trim();
		const plate = normalizePlate(form.plate.value);

		if (!name || !plate) {
			showState('error', 'Debes completar nombre y matrícula.');
			UI.showToast('Completa los campos obligatorios.', 'error');
			return;
		}

		if (editingId === null) {
			const nextId = vehicles.length ? Math.max.apply(null, vehicles.map(function (v) { return v.id; })) + 1 : 1;
			vehicles.push({ id: nextId, name: name, plate: plate, active: true });
			showState('success', 'Vehículo creado correctamente.');
			UI.showToast('Vehículo añadido.', 'success');
		} else {
			const index = vehicles.findIndex(function (v) { return v.id === editingId; });
			if (index === -1) {
				showState('error', 'No se ha encontrado el vehículo para editar.');
				UI.showToast('Error al editar el vehículo.', 'error');
				return;
			}

			vehicles[index].name = name;
			vehicles[index].plate = plate;
			showState('success', 'Vehículo actualizado correctamente.');
			UI.showToast('Vehículo actualizado.', 'success');
		}

		resetForm();
		renderRows();
	}

	function handleTableClick(event) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		const action = target.getAttribute('data-action');
		const id = Number(target.getAttribute('data-id'));

		if (!action || Number.isNaN(id)) {
			return;
		}

		const vehicle = vehicles.find(function (v) {
			return v.id === id;
		});

		if (!vehicle) {
			showState('error', 'No se ha encontrado el vehículo seleccionado.');
			UI.showToast('No se encontró el vehículo.', 'error');
			return;
		}

		if (action === 'edit') {
			setEditMode(vehicle);
			return;
		}

		if (action === 'toggle') {
			vehicle.active = !vehicle.active;
			renderRows();
			showState('success', 'Estado del vehículo actualizado.');
			UI.showToast('Estado actualizado.', 'success');
		}
	}

	function bindEvents() {
		const form = document.getElementById('vehicle-form');
		const cancel = document.getElementById('vehicle-cancel');
		const createBtn = document.getElementById('vehicle-create');
		const tbody = document.getElementById(TABLE_BODY_ID);

		if (form) {
			form.addEventListener('submit', handleSubmit);
		}

		if (cancel) {
			cancel.addEventListener('click', function () {
				resetForm();
				showState('', '');
			});
		}

		if (createBtn) {
			createBtn.addEventListener('click', function () {
				resetForm();
				const input = document.getElementById('vehicle-name');
				if (input) {
					input.focus();
				}
			});
		}

		if (tbody) {
			tbody.addEventListener('click', handleTableClick);
		}
	}

	function init() {
		const root = document.getElementById(ROOT_ID);
		if (!root) {
			return;
		}

		Router.init();
		bindEvents();
		resetForm();
		loadVehicles();
	}

	document.addEventListener('DOMContentLoaded', init);
})();
