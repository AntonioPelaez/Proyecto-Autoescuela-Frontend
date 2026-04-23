document.addEventListener('DOMContentLoaded', () => {
	Router.init();

	const form = document.getElementById('professor-form');
	const professorIdInput = document.getElementById('professor-id');
	const professorNameInput = document.getElementById('professor-name');
	const professorEmailInput = document.getElementById('professor-email');
	const professorActiveInput = document.getElementById('professor-active');
	const formTitle = document.getElementById('professor-form-title');
	const cancelButton = document.getElementById('professor-cancel');
	const createButton = document.getElementById('professor-create');
	const tableBody = document.getElementById('professors-table-body');
	const messageBox = document.getElementById('professors-message');

	loadProfessors();

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const id = professorIdInput.value;
		const name = professorNameInput.value.trim();
		const email = professorEmailInput.value.trim();
		const active = professorActiveInput.checked;

		if (!name || !email) {
			showMessage('El nombre y el email son obligatorios.', 'error');
			return;
		}

		if (!isValidEmail(email)) {
			showMessage('El email no es válido.', 'error');
			return;
		}

		try {
			clearMessage();

			if (id) {
				await Api.updateProfessor(id, { name, email, active });
				showMessage('Profesor actualizado correctamente.', 'success');
			} else {
				await Api.createProfessor({ name, email, active });
				showMessage('Profesor creado correctamente.', 'success');
			}

			resetForm();
			await loadProfessors();
		} catch (error) {
			showMessage(error.message || 'No se pudo guardar el profesor.', 'error');
		}
	});

	cancelButton.addEventListener('click', () => {
		resetForm();
		clearMessage();
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
			clearMessage();

			if (action === 'edit') {
				const professors = await Api.getProfessors();
				const professor = professors.find((item) => item.id === Number(id));

				if (!professor) {
					showMessage('El profesor no existe.', 'error');
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
				showMessage('Estado del profesor actualizado.', 'success');
				await loadProfessors();
			}
		} catch (error) {
			showMessage(error.message || 'No se pudo completar la acción.', 'error');
		}
	});

	async function loadProfessors() {
		try {
			const professors = await Api.getProfessors();
			renderProfessors(professors);
		} catch (error) {
			showMessage(error.message || 'No se pudo cargar el listado.', 'error');
		}
	}

	function renderProfessors(professors) {
		if (!professors.length) {
			tableBody.innerHTML = '<tr><td colspan="5">No hay profesores registrados.</td></tr>';
			return;
		}

		tableBody.innerHTML = professors
			.map((professor) => {
				const status = professor.active ? 'Activo' : 'Inactivo';
				const toggleLabel = professor.active ? 'Desactivar' : 'Activar';

				return `
					<tr>
						<td>${professor.id}</td>
						<td>${professor.name}</td>
						<td>${professor.email}</td>
						<td>${status}</td>
						<td>
							<button type="button" data-action="edit" data-id="${professor.id}">Editar</button>
							<button type="button" data-action="toggle" data-id="${professor.id}">${toggleLabel}</button>
						</td>
					</tr>
				`;
			})
			.join('');
	}

	function resetForm() {
		form.reset();
		professorIdInput.value = '';
		professorActiveInput.checked = false;
		formTitle.textContent = 'Crear profesor';
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

	function isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}
});
