document.addEventListener('DOMContentLoaded', () => {
	Router.init();

	const TABLE_BODY_ID = 'towns-table-body';
	const form = document.getElementById('town-form');
	const townIdInput = document.getElementById('town-id');
	const townNameInput = document.getElementById('town-name');
	const formTitle = document.getElementById('town-form-title');
	const cancelButton = document.getElementById('town-cancel');
	const createButton = document.getElementById('town-create');
	const tableBody = document.getElementById(TABLE_BODY_ID);
	const messageBox = document.getElementById('towns-message');

	loadTowns();

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const id = townIdInput.value;
		const name = townNameInput.value.trim();

		if (!name) {
			showState('error', 'El nombre de la población es obligatorio.');
			return;
		}

		try {
			showState('', '');

			if (id) {
				await Api.updateTown(id, { name });
				showState('success', 'Población actualizada correctamente.');
			} else {
				await Api.createTown({ name });
				showState('success', 'Población creada correctamente.');
			}

			resetForm();
			await loadTowns();
		} catch (error) {
			showState('error', error.message || 'No se pudo guardar la población.');
		}
	});

	cancelButton.addEventListener('click', () => {
		resetForm();
		showState('', '');
	});

	createButton.addEventListener('click', () => {
		resetForm();
		townNameInput.focus();
	});

	tableBody.addEventListener('click', async (event) => {
		const button = event.target.closest('button[data-action]');
		if (!button) {
			return;
		}

		const { action, id } = button.dataset;

		try {
			showState('', '');

			if (action === 'edit') {
				const towns = await Api.getTowns();
				const town = towns.find((item) => item.id === Number(id));

				if (!town) {
					showState('error', 'La población no existe.');
					return;
				}

				townIdInput.value = town.id;
				townNameInput.value = town.name;
				formTitle.textContent = 'Editar población';
				cancelButton.classList.remove('hidden');
				townNameInput.focus();
				return;
			}

			if (action === 'toggle') {
				await Api.toggleTown(id);
				showState('success', 'Estado de la población actualizado.');
				await loadTowns();
			}
		} catch (error) {
			showState('error', error.message || 'No se pudo completar la acción.');
		}
	});

	async function loadTowns() {
		UI.setLoading(TABLE_BODY_ID, true);
		try {
			const towns = await Api.getTowns();
			renderTowns(towns);
		} catch (error) {
			showState('error', error.message || 'No se pudo cargar el listado.');
		} finally {
			UI.setLoading(TABLE_BODY_ID, false);
		}
	}

	function renderTowns(towns) {
		tableBody.replaceChildren();

		if (!towns.length) {
			const row = document.createElement('tr');
			row.className = 'table-empty';
			const cell = document.createElement('td');
			cell.colSpan = 4;
			cell.textContent = 'No hay poblaciones registradas.';
			row.appendChild(cell);
			tableBody.appendChild(row);
			return;
		}

		towns.forEach((town) => {
			const row = document.createElement('tr');
			const status = town.active ? 'Activa' : 'Inactiva';
			const toggleLabel = town.active ? 'Desactivar' : 'Activar';

			const idCell = document.createElement('td');
			idCell.textContent = String(town.id);

			const nameCell = document.createElement('td');
			nameCell.textContent = town.name;

			const statusCell = document.createElement('td');
			statusCell.textContent = status;

			const actionsCell = document.createElement('td');

			const editButton = document.createElement('button');
			editButton.type = 'button';
			editButton.className = 'btn btn-outline btn-sm';
			editButton.dataset.action = 'edit';
			editButton.dataset.id = String(town.id);
			editButton.textContent = 'Editar';

			const toggleButton = document.createElement('button');
			toggleButton.type = 'button';
			toggleButton.className = 'btn btn-secondary btn-sm';
			toggleButton.dataset.action = 'toggle';
			toggleButton.dataset.id = String(town.id);
			toggleButton.textContent = toggleLabel;

			actionsCell.append(editButton, document.createTextNode(' '), toggleButton);
			row.append(idCell, nameCell, statusCell, actionsCell);
			tableBody.appendChild(row);
		});
	}

	function resetForm() {
		form.reset();
		townIdInput.value = '';
		formTitle.textContent = 'Crear población';
		cancelButton.classList.add('hidden');
	}

	function showState(type, message) {
		if (!message) {
			messageBox.textContent = '';
			messageBox.className = 'hidden';
			return;
		}

		messageBox.textContent = message;
		messageBox.className = type === 'error' ? 'card card-body input-error' : 'card card-body';
		if (typeof UI !== 'undefined' && UI.showToast) {
			UI.showToast(message, type === 'error' ? 'error' : 'success');
		}
	}
});
