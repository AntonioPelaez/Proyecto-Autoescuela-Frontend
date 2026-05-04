// ─────────────────────────────────────────────
// admin-incidents.js — Gestión de incidencias para admin
// Persistencia local mientras no exista backend real de incidencias
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const STORAGE_KEY = 'admin-incidents-store';

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
    const incidentSubmit = document.getElementById('incident-submit');

    let teachersCache = [];
    let studentsCache = [];

    if (!form || !filterForm || !incidentsTbody) {
        return;
    }

    await loadAssignmentOptions();
    await loadIncidents();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = String(incidentIdInput.value || '').trim();
        const payload = {
            type: incidentTypeInput.value,
            priority: incidentPriorityInput.value,
            status: incidentStatusInput.value,
            description: incidentDescriptionInput.value.trim(),
            bookingId: normalizeNullableNumber(incidentBookingInput.value),
            teacherId: normalizeNullableNumber(incidentTeacherInput.value),
            studentId: normalizeNullableNumber(incidentStudentInput.value),
        };

        if (!payload.type || !payload.priority || !payload.status || !payload.description) {
            showState('error', 'Tipo, prioridad, estado y descripción son obligatorios.');
            return;
        }

        UI.setLoading(true);
        try {
            const incidents = readIncidents();

            if (id) {
                const incidentIndex = incidents.findIndex((item) => String(item.id) === id);
                if (incidentIndex === -1) {
                    throw new Error('La incidencia que intentas editar ya no existe.');
                }

                incidents[incidentIndex] = {
                    ...incidents[incidentIndex],
                    ...payload,
                    updatedAt: new Date().toISOString(),
                };
                writeIncidents(incidents);
                showState('success', 'Incidencia actualizada correctamente.');
            } else {
                const nextId = incidents.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
                incidents.unshift({
                    id: nextId,
                    ...payload,
                    createdAt: new Date().toISOString(),
                    updatedAt: null,
                });
                writeIncidents(incidents);
                showState('success', 'Incidencia creada correctamente.');
            }

            resetForm();
            await loadIncidents();
        } catch (error) {
            showState('error', error.message || 'Error al guardar incidencia.');
        } finally {
            UI.setLoading(false);
        }
    });

    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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
        const incidents = readIncidents();
        const incident = incidents.find((item) => String(item.id) === String(id));

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

            const nextIncidents = incidents.filter((item) => String(item.id) !== String(id));
            writeIncidents(nextIncidents);
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

    async function loadIncidents(filters = {}) {
        UI.setLoading(true);
        try {
            const incidents = applyFilters(readIncidents(), filters);
            renderIncidents(incidents);
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
        incidentTypeInput.value = incident.type || '';
        incidentPriorityInput.value = incident.priority || '';
        incidentStatusInput.value = incident.status || 'abierta';
        incidentDescriptionInput.value = incident.description || '';
        incidentBookingInput.value = incident.bookingId || '';
        incidentTeacherInput.value = incident.teacherId ? String(incident.teacherId) : '';
        incidentStudentInput.value = incident.studentId ? String(incident.studentId) : '';
        incidentSubmit.textContent = 'Guardar cambios';
        incidentCancel.style.display = 'inline-flex';
    }

    function resetForm() {
        form.reset();
        incidentIdInput.value = '';
        incidentStatusInput.value = 'abierta';
        incidentTeacherInput.value = '';
        incidentStudentInput.value = '';
        incidentSubmit.textContent = 'Crear Incidencia';
        incidentCancel.style.display = 'none';
    }

    function readIncidents() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function writeIncidents(incidents) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
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

    function formatType(type) {
        const typeMap = {
            reserva: 'Problema con reserva',
            profesor: 'Cambio de profesor',
            vehiculo: 'Cambio de vehículo',
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

        messageBox.className = 'message-state ' + type;
        messageBox.textContent = message;
        messageBox.style.display = 'block';

        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(message, type === 'success' ? 'info' : 'error');
        }

        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
});
