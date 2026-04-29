document.addEventListener("DOMContentLoaded", () => {
    Router.init();

    const TABLE_BODY_ID = "professors-table-body";
    const form = document.getElementById("professor-form");
    const professorIdInput = document.getElementById("professor-id");
    const professorNameInput = document.getElementById("professor-name");
    const professorEmailInput = document.getElementById("professor-email");
    const dniInput = document.getElementById("professor-dni");
    const licenseNumberInput = document.getElementById("professor-license");
    const notesInput = document.getElementById("professor-notes");
    const professorActiveInput = document.getElementById("professor-active");
    const formTitle = document.getElementById("professor-form-title");
    const cancelButton = document.getElementById("professor-cancel");
    const createButton = document.getElementById("professor-create");
    const tableBody = document.getElementById(TABLE_BODY_ID);
    const messageBox = document.getElementById("professors-message");

    loadProfessors();

    // ─────────────────────────────────────────────
    // SUBMIT FORM
    // ─────────────────────────────────────────────
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = professorIdInput.value;
        const name = professorNameInput.value.trim();
        const email = professorEmailInput.value.trim();
        const dni = dniInput.value.trim();
        const license_number = licenseNumberInput.value.trim();
        const notes = notesInput.value.trim();
        const active = professorActiveInput.checked;

        if (!name || !email) {
            showState("error", "El nombre y el email son obligatorios.");
            return;
        }

        if (!isValidEmail(email)) {
            showState("error", "El email no es válido.");
            return;
        }

        try {
            showState("", "");

            if (id) {
                await Api.updateTeacher(id, {
                    name,
                    email,
                    dni,
                    license_number,
                    notes,
                    active,
                });
                showState("success", "Profesor actualizado correctamente.");
            } else {
                await Api.createTeacher({
                    name,
                    email,
                    dni,
                    license_number,
                    notes,
                    active,
                });
                showState("success", "Profesor creado correctamente.");
            }

            resetForm();
            await loadProfessors();
        } catch (error) {
            showState("error", error.message || "No se pudo guardar el profesor.");
        }
    });

    // ─────────────────────────────────────────────
    // BOTONES DEL FORMULARIO
    // ─────────────────────────────────────────────
    cancelButton.addEventListener("click", () => {
        resetForm();
        showState("", "");
    });

    createButton.addEventListener("click", () => {
        resetForm();
        professorNameInput.focus();
    });

    // ─────────────────────────────────────────────
    // ACCIONES DE LA TABLA
    // ─────────────────────────────────────────────
    tableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;

        try {
            showState("", "");

            // EDITAR
            if (action === "edit") {
                const professors = await Api.getTeachers();
                const professor = professors.find((item) => item.id === Number(id));

                if (!professor) {
                    showState("error", "El profesor no existe.");
                    return;
                }

                professorIdInput.value = professor.id;
                professorNameInput.value = professor.full_name;
                professorEmailInput.value = professor.email;
                dniInput.value = professor.dni ?? "";
                licenseNumberInput.value = professor.license_number ?? "";
                notesInput.value = professor.notes ?? "";
                professorActiveInput.checked = professor.active;

                formTitle.textContent = "Editar profesor";
                cancelButton.classList.remove("hidden");
                professorNameInput.focus();
                return;
            }

            // ACTIVAR / DESACTIVAR
            if (action === 'toggle') {
				await Api.toggleProfessor(id);
				showState('success', 'Estado del profesor actualizado.');
				await loadProfessors();
				return;
			}

            // ELIMINAR
            if (action === "delete") {
                if (confirm("¿Seguro que quieres eliminar este profesor?")) {
                    await Api.deleteTeacher(id);
                    showState("success", "Profesor eliminado.");
                    await loadProfessors();
                }
                return;
            }

        } catch (error) {
            showState("error", error.message || "No se pudo completar la acción.");
        }
    });

    // ─────────────────────────────────────────────
    // CARGAR LISTADO
    // ─────────────────────────────────────────────
    async function loadProfessors() {
        UI.setLoading(TABLE_BODY_ID, true);
        try {
            const professors = await Api.getTeachers();
            renderProfessors(professors);
        } catch (error) {
            showState("error", error.message || "No se pudo cargar el listado.");
        } finally {
            UI.setLoading(TABLE_BODY_ID, false);
        }
    }

    // ─────────────────────────────────────────────
    // RENDER TABLA
    // ─────────────────────────────────────────────
    function renderProfessors(professors) {
        tableBody.replaceChildren();

        if (!professors.length) {
            const row = document.createElement("tr");
            row.className = "table-empty";
            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.textContent = "No hay profesores registrados.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        professors.forEach((professor) => {
            const row = document.createElement("tr");

            const status = professor.is_active_for_booking ? "Activo" : "Inactivo";
            const toggleLabel = professor.is_active_for_booking ? "Desactivar" : "Activar";

            const vehicles = professor.vehicles?.length
    ? professor.vehicles.map(v => `${v.brand} ${v.model}`).join(', ')
    : '—';

row.innerHTML = `
    <td>${professor.id}</td>
    <td>${professor.full_name}</td>
    <td>${professor.email}</td>
    <td>${vehicles}</td>
    <td>${status}</td>
    <td>
        <button class="btn btn-outline btn-sm" data-action="edit" data-id="${professor.id}">Editar</button>
        <button class="btn btn-secondary btn-sm" data-action="toggle" data-id="${professor.id}">${toggleLabel}</button>
        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${professor.id}">Eliminar</button>
    </td>
`;


            tableBody.appendChild(row);
        });
    }

    // ─────────────────────────────────────────────
    // UTILIDADES
    // ─────────────────────────────────────────────
    function resetForm() {
        form.reset();
        professorIdInput.value = "";
        professorActiveInput.checked = false;
        formTitle.textContent = "Crear profesor";
        cancelButton.classList.add("hidden");
    }

    function showState(type, message) {
        if (!message) {
            messageBox.textContent = "";
            messageBox.className = "hidden";
            return;
        }

        messageBox.textContent = message;
        messageBox.className =
            type === "error" ? "card card-body input-error" : "card card-body";

        if (typeof UI !== "undefined" && UI.showToast) {
            UI.showToast(message, type === "error" ? "error" : "success");
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});
