// admin-incidents.js — Gestion de incidencias para admin
// Integrado con el CRUD real expuesto en Api

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    let INCIDENT_TYPE_OPTIONS = [
        { id: 1, key: 'reserva', label: 'Problema con reserva' },
        { id: 2, key: 'profesor', label: 'Cambio de profesor' },
        { id: 3, key: 'vehiculo', label: 'Cambio de vehiculo' },
        { id: 4, key: 'otro', label: 'Otro' },
    ];

    const form = document.getElementById('incident-form');
    const filterForm = document.getElementById('filter-form');
    const clearBtn = document.getElementById('clear-filters');
    const incidentCancel = document.getElementById('incident-cancel');
    const incidentsTbody = document.getElementById('incidents-tbody');
    const messageBox = document.getElementById('message-state');

    const incidentIdInput = document.getElementById('incident-id');
    const incidentTypeInput = document.getElementById('incident-type');
    const incidentPriorityInput = document.getElementById('incident-priority');
    const incidentStatusInput = document.getElementById('incident-status');
    const incidentDescriptionInput = document.getElementById('incident-description');
    const incidentBookingInput = document.getElementById('incident-booking');
    const incidentTeacherInput = document.getElementById('incident-teacher');
    const incidentStudentInput = document.getElementById('incident-student');
    const incidentResponsableInput = document.getElementById('incident-responsable');
    const incidentSubmit = document.getElementById('incident-submit');

    let teachersCache = [];
    let studentsCache = [];
    let incidentsCache = [];

    if (!form || !filterForm || !clearBtn || !incidentCancel || !incidentsTbody || !messageBox) {
        return;
    }

    await loadIncidentTypes();
    await loadAssignmentOptions();
    await loadIncidents();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = String(incidentIdInput.value || '').trim();
        const payload = {
            tipo_id: normalizeNullableNumber(incidentTypeInput.value),
            prioridad: incidentPriorityInput.value,
            estado: incidentStatusInput.value,
            descripcion: incidentDescriptionInput.value.trim(),
            reserva_id: normalizeNullableNumber(incidentBookingInput.value),
            profesor_asignado: normalizeNullableNumber(incidentTeacherInput.value),
            alumno_asignado: normalizeNullableNumber(incidentStudentInput.value),
            responsable: incidentResponsableInput.value,
        };

        if (!payload.tipo_id || !payload.prioridad || !payload.estado || !payload.descripcion || !payload.responsable) {
            showState('error', 'Tipo, prioridad, estado, descripción y responsable son obligatorios.');
            return;
        }

        UI.setLoading(true);
        try {
            if (id) {
                await Api.updateIncident(id, payload);
                showState('success', 'Incidencia actualizada correctamente.');
            } else {
                await Api.createIncident(payload);
                showState('success', 'Incidencia creada correctamente.');
            }

            resetForm();
            await loadIncidents(collectFilters());
        } catch (error) {
            showState('error', error.message || 'Error al guardar incidencia.');
        } finally {
            UI.setLoading(false);
        }
    });

    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await loadIncidents(collectFilters());
    });

    clearBtn.addEventListener('click', async () => {
        filterForm.reset();
        await loadIncidents();
    });

    incidentCancel.addEventListener('click', () => {
        resetForm();
        showState('', '');
    });

    incidentsTbody.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }

        const { action, id } = button.dataset;
        let incident = null;

        incident = incidentsCache.find((item) => String(item.id) === String(id));

        if (!incident) {
            const response = await Api.getIncident(id);
            incident = normalizeIncident(unwrapApiPayload(response));
        }

        if (!incident) {
            showState('error', 'La incidencia seleccionada no existe.');
            return;
        }

        if (action === 'edit') {
            populateForm(incident);
            showState('success', 'Incidencia cargada en el formulario para editar.');
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        if (action === 'delete') {
            if (!confirm('¿Seguro que quieres borrar esta incidencia?')) {
                return;
            }

            await Api.deleteIncident(id);
            showState('success', 'Incidencia borrada correctamente.');

            if (String(incidentIdInput.value) === String(id)) {
                resetForm();
            }

            await loadIncidents(collectFilters());
        }
    });

    async function loadAssignmentOptions() {
        try {
            const [teachers, students] = await Promise.all([
                Api.getTeachers(),
                Api.getStudents(),
            ]);

            teachersCache = Array.isArray(teachers) ? teachers : [];
            studentsCache = Array.isArray(students) ? students : [];

            populateSelect(
                incidentTeacherInput,
                teachersCache,
                'Sin profesor asignado',
                (teacher) => String(resolveEntityId(teacher) || ''),
                (teacher) => formatTeacherName(teacher),
            );

            populateSelect(
                incidentStudentInput,
                studentsCache,
                'Sin alumno asignado',
                (student) => String(resolveEntityId(student) || ''),
                (student) => formatStudentName(student),
            );
        } catch (error) {
            showState('error', error.message || 'No se pudieron cargar profesores y alumnos para las incidencias.');
        }
    }

    async function loadIncidentTypes() {
        try {
            const tipos = await Api.getIncidentTypes();
            if (Array.isArray(tipos) && tipos.length) {
                INCIDENT_TYPE_OPTIONS = tipos.map((t) => ({
                    id: t.id,
                    key: normalizeTypeValue(t.nombre ?? t.name ?? ''),
                    label: t.nombre ?? t.name ?? String(t.id),
                }));
            }
        } catch (error) {
            // Mantener el array hardcoded como fallback
        }
        populateSelect(
            incidentTypeInput,
            INCIDENT_TYPE_OPTIONS,
            'Selecciona tipo',
            (typeOption) => String(typeOption.id),
            (typeOption) => typeOption.label,
        );
    }

    async function loadIncidents(filters = {}) {
        UI.setLoading(true);
        try {
            const incidents = await fetchIncidents(filters);
            incidentsCache = incidents;
            renderIncidents(incidents);
        } catch (error) {
            showState('error', error.message || 'No se pudieron cargar las incidencias.');
        } finally {
            UI.setLoading(false);
        }
    }

    function renderIncidents(incidents) {
        incidentsTbody.innerHTML = '';

        if (!incidents.length) {
            incidentsTbody.innerHTML = '<tr><td colspan="9">No hay incidencias.</td></tr>';
            return;
        }

        incidents.forEach((incident) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(incident.id)}</td>
                <td>${escapeHtml(formatType(incident.type))}</td>
                <td><span class="priority-badge ${escapeHtml(incident.priority)}">${escapeHtml(formatPriority(incident.priority))}</span></td>
                <td><span class="status-badge ${escapeHtml(incident.status)}">${escapeHtml(formatStatus(incident.status))}</span></td>
                <td>${escapeHtml(truncate(incident.description, 50))}</td>
                <td>${incident.bookingId ? '#' + escapeHtml(incident.bookingId) : 'N/A'}</td>
                <td>${escapeHtml(formatDate(incident.createdAt))}</td>
                <td>${escapeHtml(formatAssignment(incident))}</td>
                <td>
                    <button class="btn btn-outline btn-sm" data-action="edit" data-id="${escapeHtml(incident.id)}">Editar</button>
                    <button class="btn btn-danger btn-sm" data-action="delete" data-id="${escapeHtml(incident.id)}">Borrar</button>
                </td>
            `;
            incidentsTbody.appendChild(row);
        });
    }

    function collectFilters() {
        return {
            status: document.getElementById('filter-status').value || '',
            priority: document.getElementById('filter-priority').value || '',
            type: document.getElementById('filter-type').value || '',
            assigned: document.getElementById('filter-assigned').value || '',
            dateFrom: document.getElementById('filter-date-from').value || '',
            dateTo: document.getElementById('filter-date-to').value || '',
        };
    }

    function applyFilters(incidents, filters) {
        return incidents.filter((incident) => {
            if (filters.status && incident.status !== filters.status) {
                return false;
            }
            if (filters.priority && incident.priority !== filters.priority) {
                return false;
            }
            if (filters.type && incident.type !== filters.type) {
                return false;
            }
            if (filters.assigned === 'sin_asignar' && (incident.teacherId || incident.studentId)) {
                return false;
            }
            if (filters.dateFrom && String(incident.createdAt || '').slice(0, 10) < filters.dateFrom) {
                return false;
            }
            if (filters.dateTo && String(incident.createdAt || '').slice(0, 10) > filters.dateTo) {
                return false;
            }
            return true;
        });
    }

    function populateForm(incident) {
        incidentIdInput.value = String(incident.id || '');
        loadIncidentTypes().then(() => {
            incidentTypeInput.value = incident.typeId != null ? String(incident.typeId) : '';
        });
        incidentPriorityInput.value = incident.priority || '';
        incidentStatusInput.value = incident.status || 'abierta';
        incidentDescriptionInput.value = incident.description || '';
        incidentBookingInput.value = incident.bookingId || '';
        incidentTeacherInput.value = incident.teacherId ? String(incident.teacherId) : '';
        incidentStudentInput.value = incident.studentId ? String(incident.studentId) : '';
        incidentResponsableInput.value = incident.responsable || '';
        incidentSubmit.textContent = 'Guardar cambios';
        incidentCancel.style.display = 'inline-flex';
    }

    function resetForm() {
        form.reset();
        incidentIdInput.value = '';
        incidentStatusInput.value = 'abierta';
        incidentTeacherInput.value = '';
        incidentStudentInput.value = '';
        incidentResponsableInput.value = '';
        incidentSubmit.textContent = 'Crear Incidencia';
        incidentCancel.style.display = 'none';
    }

    async function fetchIncidents(filters = {}) {
        const response = await Api.getIncidents(buildApiFilters(filters));
        const payload = unwrapApiPayload(response);
        const incidents = Array.isArray(payload) ? payload : [];
        return incidents.map(normalizeIncident);
    }

    function populateSelect(selectElement, items, emptyLabel, getValue, getLabel) {
        if (!selectElement) {
            return;
        }

        selectElement.replaceChildren();

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = emptyLabel;
        selectElement.appendChild(emptyOption);

        items.forEach((item) => {
            const option = document.createElement('option');
            option.value = getValue(item);
            option.textContent = getLabel(item);
            selectElement.appendChild(option);
        });
    }

    function resolveEntityId(entity) {
        return entity?.id ?? entity?.teacher_id ?? entity?.student_id ?? entity?.user_id ?? null;
    }

    function formatTeacherName(teacher) {
        return [teacher?.name, teacher?.surname1, teacher?.surname2].filter(Boolean).join(' ').trim()
            || String(teacher?.full_name || '').trim()
            || `Profesor #${resolveEntityId(teacher) || '?'}`;
    }

    function formatStudentName(student) {
        return [student?.name, student?.surname1, student?.surname2].filter(Boolean).join(' ').trim()
            || String(student?.full_name || '').trim()
            || `Alumno #${resolveEntityId(student) || '?'}`;
    }

    function formatAssignment(incident) {
        const teacher = teachersCache.find((item) => String(resolveEntityId(item) || '') === String(incident.teacherId || ''));
        const student = studentsCache.find((item) => String(resolveEntityId(item) || '') === String(incident.studentId || ''));

        const parts = [];
        if (teacher) {
            parts.push(`Prof. ${formatTeacherName(teacher)}`);
        }
        if (student) {
            parts.push(`Alumno ${formatStudentName(student)}`);
        }

        return parts.join(' / ') || 'Sin asignar';
    }

    function normalizeNullableNumber(value) {
        const normalized = String(value || '').trim();
        if (!normalized) {
            return null;
        }

        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function buildApiFilters(filters) {
        const params = new URLSearchParams();

        if (filters.status) {
            params.set('estado', filters.status);
        }
        if (filters.priority) {
            params.set('prioridad', filters.priority);
        }
        if (filters.type) {
            const typeId = resolveTypeId(filters.type);
            if (typeId) {
                params.set('tipo_id', String(typeId));
            }
        }
        if (filters.assigned) {
            if (filters.assigned === 'sin_asignar') {
                params.set('sin_asignar', '1');
            }
        }
        if (filters.dateFrom) {
            params.set('desde', filters.dateFrom);
        }
        if (filters.dateTo) {
            params.set('hasta', filters.dateTo);
        }

        return Object.fromEntries(params.entries());
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

    function normalizeIncident(rawIncident) {
        if (!rawIncident || typeof rawIncident !== 'object') {
            return {
                id: '',
                type: '',
                typeId: null,
                priority: '',
                status: '',
                description: '',
                bookingId: null,
                teacherId: null,
                studentId: null,
                responsable: '',
                createdAt: null,
            };
        }

        return {
            id: rawIncident.id ?? '',
            type: normalizeTypeValue(rawIncident.type ?? rawIncident.tipo ?? ''),
            typeId: normalizeNullableNumber(
                rawIncident.typeId ??
                rawIncident.tipo_id ??
                rawIncident.tipo?.id ??
                rawIncident.type?.id ??
                resolveTypeId(rawIncident.type ?? rawIncident.tipo?.nombre ?? rawIncident.tipo ?? '')
            ),
            priority: rawIncident.priority ?? rawIncident.prioridad ?? '',
            status: rawIncident.status ?? rawIncident.estado ?? 'abierta',
            description: rawIncident.description ?? rawIncident.descripcion ?? '',
            bookingId: rawIncident.bookingId ?? rawIncident.reserva_id ?? rawIncident.reservaId ?? null,
            teacherId: rawIncident.teacherId ?? rawIncident.profesor ?? rawIncident.profesor_asignado ?? null,
            studentId: rawIncident.studentId ?? rawIncident.alumno ?? rawIncident.alumno_asignado ?? null,
            responsable: rawIncident.responsable ?? '',
            createdAt: rawIncident.createdAt ?? rawIncident.created_at ?? null,
        };
    }

    function normalizeTypeValue(value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
            const typeOption = INCIDENT_TYPE_OPTIONS.find((item) => item.id === numericValue);
            return typeOption ? typeOption.key : String(value);
        }

        const normalized = String(value || '').trim().toLowerCase();

        if (normalized === 'problema con reserva' || normalized === 'reserva') {
            return 'reserva';
        }
        if (normalized === 'cambio de profesor' || normalized === 'profesor') {
            return 'profesor';
        }
        if (normalized === 'cambio de vehículo' || normalized === 'cambio de vehiculo' || normalized === 'vehiculo') {
            return 'vehiculo';
        }
        if (normalized === 'otro') {
            return 'otro';
        }

        return normalized;
    }

    function resolveTypeId(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
            return numericValue;
        }

        const normalized = normalizeTypeValue(value);
        const typeOption = INCIDENT_TYPE_OPTIONS.find((item) => item.key === normalized);
        return typeOption ? typeOption.id : null;
    }

    function formatType(type) {
        const typeMap = {
            reserva: 'Problema con reserva',
            profesor: 'Cambio de profesor',
            vehiculo: 'Cambio de vehiculo',
            otro: 'Otro',
        };
        return typeMap[type] || type || 'N/A';
    }

    function formatPriority(priority) {
        return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'N/A';
    }

    function formatStatus(status) {
        const statusMap = {
            abierta: 'Abierta',
            en_curso: 'En curso',
            cerrada: 'Cerrada',
        };
        return statusMap[status] || status || 'N/A';
    }

    function formatDate(dateStr) {
        if (!dateStr) {
            return 'N/A';
        }

        const date = new Date(dateStr);
        return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES');
    }

    function truncate(str, length) {
        const text = String(str || '');
        return text.length > length ? text.slice(0, length) + '...' : text;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function showState(type, message) {
        if (!message) {
            messageBox.textContent = '';
            messageBox.style.display = 'none';
            messageBox.className = 'message-state';
            return;
        }

        messageBox.className = `message-state ${type}`;
        messageBox.textContent = message;
        messageBox.style.display = 'block';

        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
            UI.showToast(message, type === 'success' ? 'info' : 'error');
        }

        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
});
