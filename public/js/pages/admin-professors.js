import { showState as showStateFeedback } from "../ui-feedback.js";
document.addEventListener("DOMContentLoaded", () => {
    Router.init();

    const TABLE_BODY_ID = "professors-table-body";
    const form = document.getElementById("professor-form");
    const professorIdInput = document.getElementById("professor-id");
    const professorNameInput = document.getElementById("professor-name");
    const professorSurnameInput = document.getElementById("professor-surname");
    const professorSurname1Input = document.getElementById("professor-surname1");
    const professorSurname2Input = document.getElementById("professor-surname2");
    const professorEmailInput = document.getElementById("professor-email");
    const dniInput = document.getElementById("professor-dni");
    const licenseNumberInput = document.getElementById("professor-license");
    const notesInput = document.getElementById("professor-notes");
    const professorActiveInput = document.getElementById("professor-active");
    const formTitle = document.getElementById("professor-form-title");
    const cancelButton = document.getElementById("professor-cancel");
    const createButton = document.getElementById("professor-create");
    const submitButton = document.getElementById("professor-submit");
    const professorPicker = document.getElementById("professor-picker");
    const professorPickerResetButton = document.getElementById("professor-picker-reset");
    const professorPickerHelp = document.getElementById("professor-picker-help");
    const professorModeBadge = document.getElementById("professor-mode-badge");
    const tableBody = document.getElementById(TABLE_BODY_ID);
    const messageBox = document.getElementById("professors-message");
    let professorsCache = [];
    const pickerKeyToProfessor = new Map();

    if (!form || !tableBody) {
        return;
    }

    loadProfessors();

    // ─────────────────────────────────────────────
    // SUBMIT FORM
    // ─────────────────────────────────────────────
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = professorIdInput.value;
        const name = professorNameInput.value.trim();
        const surname = (professorSurnameInput?.value || "").trim();
        const surname1 = (professorSurname1Input?.value || "").trim();
        const surname2 = (professorSurname2Input?.value || "").trim();
        const combinedSurname = surname || [surname1, surname2].filter(Boolean).join(" ").trim();
        const email = professorEmailInput.value.trim();
        const dni = dniInput.value.trim();
        const license_number = licenseNumberInput.value.trim();
        const notes = notesInput.value.trim();
        const active = professorActiveInput.checked;

        if (!name || !combinedSurname || !email) {
            showState("error", "El nombre, los apellidos y el email son obligatorios.");
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
                    surname: combinedSurname,
                    surname1: surname1 || undefined,
                    surname2: surname2 || undefined,
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
                    surname: combinedSurname,
                    surname1: surname1 || undefined,
                    surname2: surname2 || undefined,
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

    if (professorPicker) {
        professorPicker.addEventListener("change", () => {
            if (!professorPicker.value) {
                resetForm();
                showState("", "");
                return;
            }

            const selected = pickerKeyToProfessor.get(String(professorPicker.value)) || null;
            if (!selected) {
                showState("error", "No se encontró el profesor seleccionado.");
                return;
            }

            populateFormFromProfessor(selected, { mode: "select" });
            showState("success", "Profesor seleccionado para consulta.");
        });
    }

    if (professorPickerResetButton) {
        professorPickerResetButton.addEventListener("click", () => {
            resetForm();
            showState("", "");
            professorNameInput.focus();
        });
    }

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
                let professor = findProfessorByAnyId(String(id));

                if (!professor) {
                    const professors = await Api.getTeachers();
                    professorsCache = professors;
                    updateProfessorPicker(professorsCache);
                    professor = findProfessorByAnyId(String(id));
                }

                if (!professor) {
                    showState("error", "El profesor no existe.");
                    return;
                }
                populateFormFromProfessor(professor);
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
            professorsCache = professors;
            updateProfessorPicker(professors);
            renderProfessors(professors);
        } catch (error) {
            showState("error", error.message || "No se pudo cargar el listado.");
        } finally {
            UI.setLoading(TABLE_BODY_ID, false);
        }
    }

    function updateProfessorPicker(professors) {
        if (!professorPicker) {
            return;
        }

        const currentValue = String(professorPicker.value || "");
        const currentProfessor = pickerKeyToProfessor.get(currentValue) || null;
        const currentProfessorId = currentProfessor ? String(getProfessorId(currentProfessor) ?? "") : "";

        pickerKeyToProfessor.clear();
        professorPicker.replaceChildren();

        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "Seleccionar para consultar...";
        professorPicker.appendChild(emptyOption);

        professors.forEach((professor, index) => {
            const professorId = getProfessorId(professor);
            if (!professorId) {
                return;
            }

            const option = document.createElement("option");
            const pickerKey = `p-${index}-${professorId}`;
            option.value = pickerKey;
            const fullName = [professor.name, professor.surname1, professor.surname2]
                .filter(Boolean)
                .join(" ")
                .trim() || String(professor.full_name || "").trim();
            option.textContent = fullName ? `${fullName} (${professor.email || "sin email"})` : `Profesor #${professorId}`;
            professorPicker.appendChild(option);
            pickerKeyToProfessor.set(pickerKey, professor);
        });

        const nextSelectedKey = Array.from(pickerKeyToProfessor.entries())
            .find(([, professor]) => String(getProfessorId(professor) ?? "") === currentProfessorId)?.[0] || "";
        professorPicker.value = nextSelectedKey;
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
    <td>${[professor.name, professor.surname1, professor.surname2].filter(Boolean).join(' ') || professor.full_name || professor.name || '—'}</td>
    <td>${professor.email || '—'}</td>
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
        setFormReadonly(false);
        updateProfessorModeUi(false);
        if (professorPicker) {
            professorPicker.value = "";
        }
    }

    function setFormReadonly(isReadonly) {
        const textLikeInputs = [
            professorNameInput,
            professorSurnameInput,
            professorSurname1Input,
            professorSurname2Input,
            professorEmailInput,
            dniInput,
            licenseNumberInput,
            notesInput,
        ];

        textLikeInputs.forEach((input) => {
            if (!input) {
                return;
            }
            input.readOnly = isReadonly;
        });

        if (professorActiveInput) {
            professorActiveInput.disabled = isReadonly;
        }

        if (submitButton) {
            submitButton.disabled = isReadonly;
            submitButton.title = isReadonly
                ? "Modo consulta: pulsa Nuevo para volver a crear"
                : "";
        }

        if (form) {
            form.classList.toggle("is-readonly", isReadonly);
        }
    }

    function populateFormFromProfessor(professor, options = { mode: "edit" }) {
        const mode = options.mode || "edit";
        const professorId = getProfessorId(professor);

        professorIdInput.value = mode === "edit" ? String(professorId || "") : "";
        const resolvedName = professor.name ?? "";
        const resolvedSurname1 = professor.surname1 ?? "";
        const resolvedSurname2 = professor.surname2 ?? "";
        const resolvedSurname = professor.surname ?? [resolvedSurname1, resolvedSurname2].filter(Boolean).join(" ").trim();

        professorNameInput.value = resolvedName;
        if (professorSurnameInput) {
            professorSurnameInput.value = resolvedSurname;
        }
        if (professorSurname1Input) {
            professorSurname1Input.value = resolvedSurname1 || resolvedSurname.split(" ")[0] || "";
        }
        if (professorSurname2Input) {
            professorSurname2Input.value = resolvedSurname2 || resolvedSurname.split(" ").slice(1).join(" ") || "";
        }
        professorEmailInput.value = professor.email ?? "";
        dniInput.value = professor.dni ?? "";
        licenseNumberInput.value = professor.license_number ?? "";
        notesInput.value = professor.notes ?? "";
        professorActiveInput.checked = Boolean(professor.active);

        if (mode === "select") {
            formTitle.textContent = "Profesor seleccionado (solo consulta)";
            cancelButton.classList.add("hidden");
            setFormReadonly(true);
            updateProfessorModeUi(true, professor);
        } else {
            formTitle.textContent = "Editar profesor";
            cancelButton.classList.remove("hidden");
            setFormReadonly(false);
            updateProfessorModeUi(false);
        }

        if (professorPicker) {
            const selectedKey = Array.from(pickerKeyToProfessor.entries())
                .find(([, item]) => String(getProfessorId(item) ?? "") === String(professorId ?? ""))?.[0] || "";
            professorPicker.value = selectedKey;
        }
    }

    function getProfessorId(professor) {
        return professor?.id ?? professor?.teacher_id ?? professor?.user_id ?? null;
    }

    function findProfessorByAnyId(value) {
        const target = String(value || "").trim();
        return professorsCache.find((item) => String(getProfessorId(item) ?? "") === target) || null;
    }

    function updateProfessorModeUi(isConsultationMode, professor = null) {
        if (professorModeBadge) {
            professorModeBadge.classList.toggle("hidden", !isConsultationMode);
        }

        if (professorPickerHelp) {
            if (isConsultationMode && professor) {
                const fullName = [professor.name, professor.surname1, professor.surname2]
                    .filter(Boolean)
                    .join(" ")
                    .trim() || String(professor.full_name || "").trim() || "Profesor seleccionado";
                professorPickerHelp.textContent = `Mostrando datos de ${fullName}. Pulsa Nuevo para volver al modo creación.`;
            } else {
                professorPickerHelp.textContent = "Selecciona un profesor ya creado para consultar sus datos en el mismo formulario.";
            }
        }
    }

    function showState(type, message) {
        showStateFeedback(messageBox, type, message);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});
