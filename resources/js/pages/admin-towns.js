document.addEventListener('DOMContentLoaded', () => {
	Router.init();

	const form = document.getElementById('town-form');
	const townIdInput = document.getElementById('town-id');
	const townNameInput = document.getElementById('town-name');
	const formTitle = document.getElementById('town-form-title');
	const cancelButton = document.getElementById('town-cancel');
	const createButton = document.getElementById('town-create');
	const tableBody = document.getElementById('towns-table-body');
	const messageBox = document.getElementById('towns-message');

	loadTowns();

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const id = townIdInput.value;
		const name = townNameInput.value.trim();

		if (!name) {
			showMessage('El nombre de la población es obligatorio.', 'error');
			return;
		}

		try {
			clearMessage();

			if (id) {
				await Api.updateTown(id, { name });
				showMessage('Población actualizada correctamente.', 'success');
			} else {
				await Api.createTown({ name });
				showMessage('Población creada correctamente.', 'success');
			}

			resetForm();
			await loadTowns();
		} catch (error) {
			showMessage(error.message || 'No se pudo guardar la población.', 'error');
		}
	});

	cancelButton.addEventListener('click', () => {
		resetForm();
		clearMessage();
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
			clearMessage();

			if (action === 'edit') {
				const towns = await Api.getTowns();
				const town = towns.find((item) => item.id === Number(id));

				if (!town) {
					showMessage('La población no existe.', 'error');
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
				showMessage('Estado de la población actualizado.', 'success');
				await loadTowns();
			}
		} catch (error) {
			showMessage(error.message || 'No se pudo completar la acción.', 'error');
		}
	});

	async function loadTowns() {
		try {
			const towns = await Api.getTowns();
			renderTowns(towns);
		} catch (error) {
			showMessage(error.message || 'No se pudo cargar el listado.', 'error');
		}
	}

	function renderTowns(towns) {
		if (!towns.length) {
			tableBody.innerHTML = '<tr><td colspan="4">No hay poblaciones registradas.</td></tr>';
			return;
		}

		tableBody.innerHTML = towns
			.map((town) => {
				const status = town.active ? 'Activa' : 'Inactiva';
				const toggleLabel = town.active ? 'Desactivar' : 'Activar';

				return `
					<tr>
						<td>${town.id}</td>
						<td>${town.name}</td>
						<td>${status}</td>
						<td>
							<button type="button" data-action="edit" data-id="${town.id}">Editar</button>
							<button type="button" data-action="toggle" data-id="${town.id}">${toggleLabel}</button>
						</td>
					</tr>
				`;
			})
			.join('');
	}

	function resetForm() {
		form.reset();
		townIdInput.value = '';
		formTitle.textContent = 'Crear población';
		cancelButton.classList.add('hidden');
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
});
