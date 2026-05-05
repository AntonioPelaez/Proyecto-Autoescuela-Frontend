document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const TABLE_BODY_ID = 'students-table-body';
    const form = document.getElementById('student-form');
    const filtersForm = document.getElementById('students-filters-form');
    const tableBody = document.getElementById(TABLE_BODY_ID);
    const messageBox = document.getElementById('students-message');
    const formTitle = document.getElementById('student-form-title');
    const createButton = document.getElementById('student-create');
    const clearFiltersButton = document.getElementById('student-clear-filters');
    const cancelButton = document.getElementById('student-cancel');
    const submitButton = document.getElementById('student-submit');
    const passwordBlock = document.getElementById('student-password-block');
    const passwordHelp = document.getElementById('student-password-help');
    const studentPicker = document.getElementById('student-picker');
    const studentPickerResetButton = document.getElementById('student-picker-reset');
    const studentPickerHelp = document.getElementById('student-picker-help');
    const studentModeBadge = document.getElementById('student-mode-badge');

    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const studentSurname1Input = document.getElementById('student-surname1');
    const studentSurname2Input = document.getElementById('student-surname2');
    const studentEmailInput = document.getElementById('student-email');
    const studentPhoneInput = document.getElementById('student-phone');
    const studentTownInput = document.getElementById('student-town');
    const studentDniInput = document.getElementById('student-dni');
    const studentBirthDateInput = document.getElementById('student-birth-date');
    const studentNotesInput = document.getElementById('student-notes');
    const studentNotesBlock = document.getElementById('student-notes-block');
    const studentFilterSearchInput = document.getElementById('student-filter-search');
    const studentFilterTownInput = document.getElementById('student-filter-town');
    const studentPasswordInput = document.getElementById('student-password');
    const studentPasswordConfirmInput = document.getElementById('student-password-confirm');

    let studentsCache = [];
    let townsCache = [];
    const pickerKeyToStudent = new Map();

    if (!form || !filtersForm || !tableBody || !messageBox) {
        return;
    }

    await loadTowns();
    await loadStudents();
    setCreateMode(true);

    filtersForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        renderStudents(applyFilters(studentsCache, collectFilters()));
    });

    clearFiltersButton?.addEventListener('click', () => {
        filtersForm.reset();
        renderStudents(studentsCache);
    });

    studentFilterSearchInput?.addEventListener('input', () => {
        renderStudents(applyFilters(studentsCache, collectFilters()));
    });

    studentFilterTownInput?.addEventListener('change', () => {
        renderStudents(applyFilters(studentsCache, collectFilters()));
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = String(studentIdInput.value || '').trim();
        const payload = buildPayload();

        if (!payload.name || !payload.surname1 || !payload.surname2 || !payload.email || !payload.phone) {
            showState('error', 'Nombre, apellidos, email y teléfono son obligatorios.');
            return;
        }

        if (!isValidEmail(payload.email)) {
            showState('error', 'El email no es válido.');
            return;
        }

        if (!id) {
            const password = String(studentPasswordInput.value || '');
            const passwordConfirm = String(studentPasswordConfirmInput.value || '');

            if (password.length < 8) {
                showState('error', 'La contraseña debe tener al menos 8 caracteres.');
                return;
            }

            if (password !== passwordConfirm) {
                showState('error', 'Las contraseñas no coinciden.');
                return;
            }

            payload.password = password;
            payload.password_confirm = passwordConfirm;
        }

        UI.setLoading(TABLE_BODY_ID, true);
        try {
            const notesText = String(studentNotesInput?.value || '').trim();
            if (id) {
                await Api.updateStudent(id, payload);
                try {
                    await Api.saveStudentNotes(id, { notes: notesText });
                } catch {
                    // Las notas no bloquean el guardado principal
                }
                showState('success', 'Alumno actualizado correctamente.');
            } else {
                const createResponse = await Api.createStudent(payload);
                if (notesText) {
                    const newStudent = unwrapApiPayload(createResponse);
                    const newId = newStudent?.id ?? newStudent?.user_id ?? null;
                    if (newId) {
                        try {
                            await Api.saveStudentNotes(newId, { notes: notesText });
                        } catch {
                            // Las notas no bloquean el guardado principal
                        }
                    }
                }
                showState('success', 'Alumno creado correctamente.');
            }

            resetForm();
            await loadStudents();
        } catch (error) {
            showState('error', error.message || 'No se pudo guardar el alumno.');
        } finally {
            UI.setLoading(TABLE_BODY_ID, false);
        }
    });

    createButton?.addEventListener('click', () => {
        resetForm();
        studentNameInput?.focus();
    });

    if (studentPicker) {
        studentPicker.addEventListener('change', async () => {
            if (!studentPicker.value) {
                resetForm();
                showState('', '');
                return;
            }

            const selected = pickerKeyToStudent.get(String(studentPicker.value)) || null;
            if (!selected) {
                showState('error', 'No se encontró el alumno seleccionado.');
                return;
            }

            await populateForm(selected, { mode: 'select' });
            showState('success', 'Alumno seleccionado para consulta.');
        });
    }

    if (studentPickerResetButton) {
        studentPickerResetButton.addEventListener('click', () => {
            resetForm();
            showState('', '');
            studentNameInput?.focus();
        });
    }

    cancelButton?.addEventListener('click', () => {
        resetForm();
        showState('', '');
    });

    tableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }

        const { action, id } = button.dataset;
        if (!action || !id) {
            return;
        }

        try {
            if (action === 'edit') {
                let student = studentsCache.find((item) => String(item.id) === String(id));
                if (!student) {
                    const response = await Api.getStudent(id);
                    student = normalizeStudent(unwrapApiPayload(response));
                }

                if (!student) {
                    showState('error', 'El alumno seleccionado no existe.');
                    return;
                }

                await populateForm(student);
                studentNameInput?.focus();
                return;
            }

            if (action === 'delete') {
                if (!confirm('¿Seguro que quieres eliminar este alumno?')) {
                    return;
                }

                await Api.deleteStudent(id);
                showState('success', 'Alumno eliminado correctamente.');

                if (String(studentIdInput.value || '') === String(id)) {
                    resetForm();
                }

                await loadStudents();
            }
        } catch (error) {
            showState('error', error.message || 'No se pudo completar la acción sobre el alumno.');
        }
    });

    async function loadTowns() {
        try {
            const response = await Api.getTowns();
            const payload = unwrapApiPayload(response);
            townsCache = Array.isArray(payload) ? payload : [];
            renderTownOptions();
        } catch (error) {
            townsCache = [];
            renderTownOptions();
            showState('error', error.message || 'No se pudieron cargar las poblaciones.');
        }
    }

    async function loadStudents() {
        UI.setLoading(TABLE_BODY_ID, true);
        try {
            const response = await Api.getStudents();
            const payload = unwrapApiPayload(response);
            const students = Array.isArray(payload) ? payload.map(normalizeStudent) : [];
            studentsCache = students;
            updateStudentPicker(students);
            renderStudents(applyFilters(students, collectFilters()));
        } catch (error) {
            showState('error', error.message || 'No se pudo cargar el listado de alumnos.');
        } finally {
            UI.setLoading(TABLE_BODY_ID, false);
        }
    }

    function renderTownOptions() {
        const currentValue = String(studentTownInput.value || '');
        const currentFilterValue = String(studentFilterTownInput?.value || '');
        studentTownInput.replaceChildren();
        studentFilterTownInput?.replaceChildren();

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Sin población asignada';
        studentTownInput.appendChild(emptyOption);

        if (studentFilterTownInput) {
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'Todas';
            studentFilterTownInput.appendChild(allOption);
        }

        townsCache.forEach((town) => {
            const option = document.createElement('option');
            option.value = String(town.id);
            option.textContent = town.name || `Población #${town.id}`;
            studentTownInput.appendChild(option);

            if (studentFilterTownInput) {
                const filterOption = document.createElement('option');
                filterOption.value = String(town.id);
                filterOption.textContent = town.name || `Población #${town.id}`;
                studentFilterTownInput.appendChild(filterOption);
            }
        });

        studentTownInput.value = currentValue;
        if (studentFilterTownInput) {
            studentFilterTownInput.value = currentFilterValue;
        }
    }

    function collectFilters() {
        return {
            search: String(studentFilterSearchInput?.value || '').trim().toLowerCase(),
            townId: String(studentFilterTownInput?.value || '').trim(),
        };
    }

    function applyFilters(students, filters) {
        return students.filter((student) => {
            if (filters.townId && String(student.townId || '') !== filters.townId) {
                return false;
            }

            if (filters.search) {
                const haystack = [
                    student.fullName,
                    student.email,
                    student.phone,
                    resolveTownName(student.townId),
                    formatStudentStatus(student.active),
                    formatDate(student.createdAt),
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                if (!haystack.includes(filters.search)) {
                    return false;
                }
            }

            return true;
        });
    }

    function renderStudents(students) {
        tableBody.replaceChildren();

        if (!students.length) {
            const row = document.createElement('tr');
            row.className = 'table-empty';
            const cell = document.createElement('td');
            cell.colSpan = 8;
            cell.textContent = studentsCache.length ? 'No hay alumnos que coincidan con el filtro actual.' : 'No hay alumnos registrados.';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        students.forEach((student) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(student.id)}</td>
                <td>${escapeHtml(student.fullName)}</td>
                <td>${escapeHtml(student.email || '—')}</td>
                <td>${escapeHtml(student.phone || '—')}</td>
                <td>${escapeHtml(resolveTownName(student.townId))}</td>
                <td>${escapeHtml(formatDate(student.createdAt))}</td>
                <td>${escapeHtml(formatStudentStatus(student.active))}</td>
                <td>
                    <button class="btn btn-outline btn-sm" data-action="edit" data-id="${escapeHtml(student.id)}">Editar</button>
                    <button class="btn btn-danger btn-sm" data-action="delete" data-id="${escapeHtml(student.id)}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    async function populateForm(student, options = { mode: 'edit' }) {
        const mode = options.mode || 'edit';
        const studentId = getStudentId(student);

        studentIdInput.value = mode === 'edit' ? String(studentId || '') : '';
        studentNameInput.value = student.name || '';
        studentSurname1Input.value = student.surname1 || '';
        studentSurname2Input.value = student.surname2 || '';
        studentEmailInput.value = student.email || '';
        studentPhoneInput.value = student.phone || '';
        studentTownInput.value = student.townId ? String(student.townId) : '';
        if (studentDniInput) {
            studentDniInput.value = student.dni || '';
        }
        if (studentBirthDateInput) {
            studentBirthDateInput.value = student.birthDate || '';
        }

        // Cargar notas del alumno
        if (studentNotesInput) {
            studentNotesInput.value = '';
        }
        if (studentId) {
            try {
                const notesResponse = await Api.getStudentNotes(studentId);
                const notesPayload = unwrapApiPayload(notesResponse);
                if (studentNotesInput) {
                    studentNotesInput.value = notesPayload?.notes ?? notesPayload?.content ?? '';
                }
            } catch {
                // Las notas pueden no estar disponibles
            }
        }

        if (mode === 'select') {
            formTitle.textContent = 'Alumno seleccionado (solo consulta)';
            cancelButton.classList.add('hidden');
            setFormReadonly(true);
            updateStudentModeUi(true, student);
        } else {
            formTitle.textContent = 'Editar alumno';
            cancelButton.classList.remove('hidden');
            setFormReadonly(false);
            updateStudentModeUi(false);
        }

        submitButton.textContent = 'Guardar cambios';
        setCreateMode(false);

        if (studentPicker) {
            const selectedKey = Array.from(pickerKeyToStudent.entries())
                .find(([, item]) => String(getStudentId(item) ?? '') === String(studentId ?? ''))?.[0] || '';
            studentPicker.value = selectedKey;
        }
    }

    function resetForm() {
        form.reset();
        studentIdInput.value = '';
        if (studentNotesInput) {
            studentNotesInput.value = '';
        }
        if (studentDniInput) {
            studentDniInput.value = '';
        }
        if (studentBirthDateInput) {
            studentBirthDateInput.value = '';
        }
        formTitle.textContent = 'Crear alumno';
        submitButton.textContent = 'Crear alumno';
        cancelButton.classList.add('hidden');
        setFormReadonly(false);
        updateStudentModeUi(false);
        if (studentPicker) {
            studentPicker.value = '';
        }
        setCreateMode(true);
    }

    function setCreateMode(isCreateMode) {
        if (passwordBlock) {
            passwordBlock.style.display = isCreateMode ? 'grid' : 'none';
        }
        if (passwordHelp) {
            passwordHelp.textContent = isCreateMode
                ? 'La contraseña se solicita al crear el alumno.'
                : 'La contraseña no se cambia desde esta pantalla.';
        }
        studentPasswordInput.value = '';
        studentPasswordConfirmInput.value = '';
    }

    function setFormReadonly(isReadonly) {
        const textLikeInputs = [
            studentNameInput,
            studentSurname1Input,
            studentSurname2Input,
            studentEmailInput,
            studentPhoneInput,
            studentDniInput,
            studentNotesInput,
        ];

        if (studentBirthDateInput) {
            studentBirthDateInput.disabled = isReadonly;
        }

        textLikeInputs.forEach((input) => {
            if (!input) {
                return;
            }
            input.readOnly = isReadonly;
        });

        if (studentTownInput) {
            studentTownInput.disabled = isReadonly;
        }

        if (submitButton) {
            submitButton.disabled = isReadonly;
            submitButton.title = isReadonly ? 'Modo consulta: pulsa Nuevo para volver a crear' : '';
        }

        if (form) {
            form.classList.toggle('is-readonly', isReadonly);
        }
    }

    function updateStudentPicker(students) {
        if (!studentPicker) {
            return;
        }

        const currentValue = String(studentPicker.value || '');
        const currentStudent = pickerKeyToStudent.get(currentValue) || null;
        const currentStudentId = currentStudent ? String(getStudentId(currentStudent) ?? '') : '';

        pickerKeyToStudent.clear();
        studentPicker.replaceChildren();

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Seleccionar para consultar...';
        studentPicker.appendChild(emptyOption);

        students.forEach((student, index) => {
            const studentId = getStudentId(student);
            if (!studentId) {
                return;
            }

            const option = document.createElement('option');
            const pickerKey = `s-${index}-${studentId}`;
            option.value = pickerKey;
            option.textContent = `${student.fullName || `Alumno #${studentId}`} (${student.email || 'sin email'})`;
            studentPicker.appendChild(option);
            pickerKeyToStudent.set(pickerKey, student);
        });

        const nextSelectedKey = Array.from(pickerKeyToStudent.entries())
            .find(([, student]) => String(getStudentId(student) ?? '') === currentStudentId)?.[0] || '';
        studentPicker.value = nextSelectedKey;
    }

    function getStudentId(student) {
        return student?.id ?? student?.student_id ?? student?.user_id ?? null;
    }

    function updateStudentModeUi(isConsultationMode, student = null) {
        if (studentModeBadge) {
            studentModeBadge.classList.toggle('hidden', !isConsultationMode);
        }

        if (studentPickerHelp) {
            if (isConsultationMode && student) {
                studentPickerHelp.textContent = `Mostrando datos de ${student.fullName || 'Alumno seleccionado'}. Pulsa Nuevo para volver al modo creación.`;
            } else {
                studentPickerHelp.textContent = 'Selecciona un alumno ya creado para consultar sus datos en el mismo formulario.';
            }
        }
    }

    function buildPayload() {
        const payload = {
            name: String(studentNameInput.value || '').trim(),
            surname1: String(studentSurname1Input.value || '').trim(),
            surname2: String(studentSurname2Input.value || '').trim(),
            email: String(studentEmailInput.value || '').trim(),
            phone: String(studentPhoneInput.value || '').trim(),
        };

        const townId = normalizeNullableNumber(studentTownInput.value);
        if (townId) {
            payload.town_id = townId;
        }

        const dni = String(studentDniInput?.value || '').trim();
        if (dni) {
            payload.dni = dni;
        }

        const birthDate = String(studentBirthDateInput?.value || '').trim();
        if (birthDate) {
            payload.birth_date = birthDate;
        }

        payload.surname = [payload.surname1, payload.surname2].filter(Boolean).join(' ').trim();
        return payload;
    }

    function normalizeStudent(rawStudent) {
        if (!rawStudent || typeof rawStudent !== 'object') {
            return {
                id: '',
                name: '',
                surname1: '',
                surname2: '',
                email: '',
                phone: '',
                townId: null,
                createdAt: null,
                active: null,
                fullName: '—',
            };
        }

        const name = rawStudent.name ?? rawStudent.user?.name ?? '';
        const surname1 = rawStudent.surname1 ?? rawStudent.user?.surname1 ?? splitSurname(rawStudent.surname ?? rawStudent.user?.surname ?? '').surname1;
        const surname2 = rawStudent.surname2 ?? rawStudent.user?.surname2 ?? splitSurname(rawStudent.surname ?? rawStudent.user?.surname ?? '').surname2;
        const townId = normalizeNullableNumber(
            rawStudent.town_id ??
            rawStudent.preferred_town_id ??
            rawStudent.student_profile?.town_id ??
            rawStudent.student_profile?.preferred_town_id ??
            rawStudent.town?.id
        );

        const dni = rawStudent.dni ?? rawStudent.student_profile?.dni ?? '';
        const birthDate = rawStudent.birth_date ?? rawStudent.birthDate ?? rawStudent.student_profile?.birth_date ?? '';

        return {
            id: rawStudent.id ?? rawStudent.student_id ?? rawStudent.user_id ?? '',
            name,
            surname1,
            surname2,
            email: rawStudent.email ?? rawStudent.user?.email ?? '',
            phone: rawStudent.phone ?? rawStudent.user?.phone ?? '',
            townId,
            dni: typeof dni === 'string' ? dni : '',
            birthDate: typeof birthDate === 'string' ? birthDate.slice(0, 10) : '',
            createdAt: rawStudent.created_at ?? rawStudent.createdAt ?? rawStudent.user?.created_at ?? rawStudent.user?.createdAt ?? null,
            active: normalizeBoolean(rawStudent.active ?? rawStudent.is_active ?? rawStudent.student_profile?.active ?? rawStudent.user?.active ?? rawStudent.user?.is_active),
            fullName: [name, surname1, surname2].filter(Boolean).join(' ').trim() || rawStudent.full_name || '—',
        };
    }

    function normalizeBoolean(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value === 1;
        }
        const normalized = String(value).trim().toLowerCase();
        if (normalized === '1' || normalized === 'true' || normalized === 'activo' || normalized === 'active') {
            return true;
        }
        if (normalized === '0' || normalized === 'false' || normalized === 'inactivo' || normalized === 'inactive') {
            return false;
        }
        return null;
    }

    function formatStudentStatus(value) {
        if (value === true) {
            return 'Activo';
        }
        if (value === false) {
            return 'Inactivo';
        }
        return 'N/D';
    }

    function formatDate(value) {
        if (!value) {
            return '—';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '—';
        }

        return date.toLocaleDateString('es-ES');
    }

    function splitSurname(value) {
        const normalized = String(value || '').trim();
        if (!normalized) {
            return { surname1: '', surname2: '' };
        }

        const parts = normalized.split(/\s+/);
        return {
            surname1: parts[0] || '',
            surname2: parts.slice(1).join(' '),
        };
    }

    function resolveTownName(townId) {
        if (!townId) {
            return '—';
        }
        const town = townsCache.find((item) => String(item.id) === String(townId));
        return town?.name || `#${townId}`;
    }

    function unwrapApiPayload(response) {
        if (Array.isArray(response)) {
            return response;
        }
        if (response && Array.isArray(response.data)) {
            return response.data;
        }
        if (response && response.data && typeof response.data === 'object') {
            return response.data;
        }
        return response;
    }

    function normalizeNullableNumber(value) {
        const normalized = String(value || '').trim();
        if (!normalized) {
            return null;
        }
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    }

    function showState(type, message) {
        if (!messageBox) {
            return;
        }

        if (!message) {
            messageBox.className = 'hidden';
            messageBox.textContent = '';
            return;
        }

        messageBox.className = `state-message state-${type}`;
        messageBox.textContent = message;
        messageBox.focus?.();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
});