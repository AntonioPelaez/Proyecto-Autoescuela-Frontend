document.addEventListener('DOMContentLoaded', () => {
	Router.init();

	const TABLE_BODY_ID = 'professors-table-body';
	const form = document.getElementById('professor-form');
	const professorIdInput = document.getElementById('professor-id');
	const professorNameInput = document.getElementById('professor-name');
	const professorEmailInput = document.getElementById('professor-email');
	const professorActiveInput = document.getElementById('professor-active');
	const formTitle = document.getElementById('professor-form-title');
	const cancelButton = document.getElementById('professor-cancel');
	const createButton = document.getElementById('professor-create');
	const tableBody = document.getElementById(TABLE_BODY_ID);
	const messageBox = document.getElementById('professors-message');

	loadProfessors();

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const id = professorIdInput.value;
		const name = professorNameInput.value.trim();
		const email = professorEmailInput.value.trim();
		const active = professorActiveInput.checked;

		if (!name || !email) {
			showState('error', 'El nombre y el email son obligatorios.');
			return;
		}

		if (!isValidEmail(email)) {
			showState('error', 'El email no es válido.');
			return;
		}

		try {
			showState('', '');

			if (id) {
				await Api.updateProfessor(id, { name, email, active });
				showState('success', 'Profesor actualizado correctamente.');
			} else {
				await Api.createProfessor({ name, email, active });
				showState('success', 'Profesor creado correctamente.');
			}

			resetForm();
			await loadProfessors();
		} catch (error) {
			showState('error', error.message || 'No se pudo guardar el profesor.');
		}
	});

	cancelButton.addEventListener('click', () => {
		resetForm();
		showState('', '');
	});

	createButton.addEventListener('click', () => {
		resetForm();
		professorNameInput.focus();
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
				const professors = await Api.getProfessors();
				const professor = professors.find((item) => item.id === Number(id));

				if (!professor) {
					showState('error', 'El profesor no existe.');
					return;
				}

				professorIdInput.value = professor.id;
				professorNameInput.value = professor.name;
				professorEmailInput.value = professor.email;
				professorActiveInput.checked = professor.active;
				formTitle.textContent = 'Editar profesor';
				cancelButton.classList.remove('hidden');
				professorNameInput.focus();
				return;
			}

			if (action === 'toggle') {
				await Api.toggleProfessor(id);
				showState('success', 'Estado del profesor actualizado.');
				await loadProfessors();
			}
		} catch (error) {
			showState('error', error.message || 'No se pudo completar la acción.');
		}
	});

	async function loadProfessors() {
		UI.setLoading(TABLE_BODY_ID, true);
		try {
			const professors = await Api.getProfessors();
			renderProfessors(professors);
		} catch (error) {
			showState('error', error.message || 'No se pudo cargar el listado.');
		} finally {
			UI.setLoading(TABLE_BODY_ID, false);
		}
	}

	function renderProfessors(professors) {
		tableBody.replaceChildren();

		if (!professors.length) {
			const row = document.createElement('tr');
			row.className = 'table-empty';
			const cell = document.createElement('td');
			cell.colSpan = 5;
			cell.textContent = 'No hay profesores registrados.';
			row.appendChild(cell);
			tableBody.appendChild(row);
			return;
		}

		professors.forEach((professor) => {
			const row = document.createElement('tr');
			const status = professor.active ? 'Activo' : 'Inactivo';
			const toggleLabel = professor.active ? 'Desactivar' : 'Activar';

			const idCell = document.createElement('td');
			idCell.textContent = String(professor.id);

			const nameCell = document.createElement('td');
			nameCell.textContent = professor.name;

			const emailCell = document.createElement('td');
			emailCell.textContent = professor.email;

			const statusCell = document.createElement('td');
			statusCell.textContent = status;

			const actionsCell = document.createElement('td');

			const editButton = document.createElement('button');
			editButton.type = 'button';
			editButton.className = 'btn btn-outline btn-sm';
			editButton.dataset.action = 'edit';
			editButton.dataset.id = String(professor.id);
			editButton.textContent = 'Editar';

			const toggleButton = document.createElement('button');
			toggleButton.type = 'button';
			toggleButton.className = 'btn btn-secondary btn-sm';
			toggleButton.dataset.action = 'toggle';
			toggleButton.dataset.id = String(professor.id);
			toggleButton.textContent = toggleLabel;

			actionsCell.append(editButton, document.createTextNode(' '), toggleButton);
			row.append(idCell, nameCell, emailCell, statusCell, actionsCell);
			tableBody.appendChild(row);
		});
	}

	function resetForm() {
		form.reset();
		professorIdInput.value = '';
		professorActiveInput.checked = false;
		formTitle.textContent = 'Crear profesor';
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

	function isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}
});
