// ─────────────────────────────────────────────
// admin-incidents.js — Gestión de incidencias para admin
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const form = document.getElementById('incident-form');
    const filterForm = document.getElementById('filter-form');
    const clearBtn = document.getElementById('clear-filters');
    const statusForm = document.getElementById('status-form');
    const assignForm = document.getElementById('assign-form');
    const statusCancel = document.getElementById('status-cancel');
    const assignCancel = document.getElementById('assign-cancel');
    const incidentCancel = document.getElementById('incident-cancel');

    // Cargar incidencias iniciales
    await loadIncidents();

    // Form submit para crear incidencia
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('incident-id').value;
        const type = document.getElementById('incident-type').value;
        const priority = document.getElementById('incident-priority').value;
        const description = document.getElementById('incident-description').value;
        const bookingId = document.getElementById('incident-booking').value || null;

        if (!type || !priority || !description) {
            showState('error', 'Tipo, prioridad y descripción son obligatorios.');
            return;
        }

        UI.setLoading(true);
        try {
            if (id) {
                await Api.updateIncident(id, { type, priority, description, bookingId });
                showState('success', 'Incidencia actualizada correctamente.');
            } else {
                await Api.createIncident({ type, priority, description, bookingId });
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

    // Filter submit
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('filter-status').value || null;
        const priority = document.getElementById('filter-priority').value || null;
        const type = document.getElementById('filter-type').value || null;
        const assigned = document.getElementById('filter-assigned').value || null;
        const dateFrom = document.getElementById('filter-date-from').value || null;
        const dateTo = document.getElementById('filter-date-to').value || null;

        const filters = {
            status: status || undefined,
            priority: priority || undefined,
            type: type || undefined,
            assigned: assigned || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        };

        UI.setLoading(true);
        try {
            const incidents = await Api.getTeacherAvailabilityExceptions(filters);
            renderIncidents(incidents.exception);
        } catch (error) {
            showState('error', error.message || 'Error al filtrar incidencias.');
        } finally {
            UI.setLoading(false);
        }
    });

    // Clear filters
    clearBtn.addEventListener('click', async () => {
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-priority').value = '';
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-assigned').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';

        UI.setLoading(true);
        try {
            await loadIncidents();
        } finally {
            UI.setLoading(false);
        }
    });

    // Status form submit
    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const incidentId = document.getElementById('status-incident-id').value;
        const status = document.getElementById('status-select').value;

        UI.setLoading(true);
        try {
            await Api.updateIncident(incidentId, { status });
            showState('success', 'Estado actualizado correctamente.');
            document.getElementById('status-form-container').style.display = 'none';
            await loadIncidents();
        } catch (error) {
            showState('error', error.message || 'Error al actualizar estado.');
        } finally {
            UI.setLoading(false);
        }
    });

    // Assign form submit
    assignForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const incidentId = document.getElementById('assign-incident-id').value;
        const assignedTo = document.getElementById('assign-select').value;

        if (!assignedTo) {
            showState('error', 'Debes especificar un admin para asignar.');
            return;
        }

        UI.setLoading(true);
        try {
            await Api.updateIncident(incidentId, { assignedTo: Number(assignedTo) || null });
            showState('success', 'Asignación actualizada correctamente.');
            document.getElementById('assign-form-container').style.display = 'none';
            await loadIncidents();
        } catch (error) {
            showState('error', error.message || 'Error al reasignar.');
        } finally {
            UI.setLoading(false);
        }
    });

    // Cancel buttons
    statusCancel.addEventListener('click', () => {
        document.getElementById('status-form-container').style.display = 'none';
    });

    assignCancel.addEventListener('click', () => {
        document.getElementById('assign-form-container').style.display = 'none';
    });

    incidentCancel.addEventListener('click', () => {
        resetForm();
    });

    // ─────────────────────────────────────────────
    // Funciones internas
    // ─────────────────────────────────────────────

    async function loadIncidents() {
        UI.setLoading(true);
        try {
            const incidents = await Api.getTeacherAvailabilityExceptions();
            renderIncidents(incidents.exceptions);
        } catch (error) {
            showState('error', error.message || 'Error al cargar incidencias.');
        } finally {
            UI.setLoading(false);
        }
    }

    function renderIncidents(incidents) {
        const tbody = document.getElementById('incidents-tbody');
        tbody.innerHTML = '';

        if (!incidents || incidents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9">No hay incidencias.</td></tr>';
            return;
        }

        incidents.forEach((incident) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${incident.id}</td>
                <td>${_formatType(incident.type)}</td>
                <td><span class="priority-badge ${incident.priority}">${_formatPriority(incident.priority)}</span></td>
                <td><span class="status-badge ${incident.status}">${_formatStatus(incident.status)}</span></td>
                <td>${_truncate(incident.description, 50)}</td>
                <td>${incident.bookingId ? '#' + incident.bookingId : 'N/A'}</td>
                <td>${_formatDate(incident.createdAt)}</td>
                <td>${incident.assignedTo ? 'Admin #' + incident.assignedTo : 'Sin asignar'}</td>
                <td>
                    <button class="btn-change-status" data-id="${incident.id}" data-status="${incident.status}">Estado</button>
                    <button class="btn-assign" data-id="${incident.id}" data-assigned="${incident.assignedTo || ''}">Asignar</button>
                    ${incident.status !== 'cerrada' ? `<button class="btn-close" data-id="${incident.id}">Cerrar</button>` : ''}
                </td>
            `;

            // Event delegation para botones
            row.querySelector('.btn-change-status').addEventListener('click', (e) => {
                const incidentId = e.target.dataset.id;
                const currentStatus = e.target.dataset.status;
                document.getElementById('status-incident-id').value = incidentId;
                document.getElementById('status-select').value = currentStatus;
                document.getElementById('status-form-container').style.display = 'block';
            });

            row.querySelector('.btn-assign').addEventListener('click', (e) => {
                const incidentId = e.target.dataset.id;
                const assigned = e.target.dataset.assigned;
                document.getElementById('assign-incident-id').value = incidentId;
                document.getElementById('assign-select').value = assigned;
                document.getElementById('assign-form-container').style.display = 'block';
            });

            const closeBtn = row.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', async (e) => {
                    const incidentId = e.target.dataset.id;
                    UI.setLoading(true);
                    try {
                        await Api.updateIncident(incidentId, { status: 'cerrada' });
                        showState('success', 'Incidencia cerrada correctamente.');
                        await loadIncidents();
                    } catch (error) {
                        showState('error', error.message || 'Error al cerrar incidencia.');
                    } finally {
                        UI.setLoading(false);
                    }
                });
            }

            tbody.appendChild(row);
        });
    }

    function resetForm() {
        document.getElementById('incident-id').value = '';
        document.getElementById('incident-type').value = '';
        document.getElementById('incident-priority').value = '';
        document.getElementById('incident-description').value = '';
        document.getElementById('incident-booking').value = '';
        document.getElementById('incident-submit').textContent = 'Crear Incidencia';
        document.getElementById('incident-cancel').style.display = 'none';
    }

    function showState(type, message) {
        const messageBox = document.getElementById('message-state');
        messageBox.className = 'message-state ' + type;
        messageBox.textContent = message;
        messageBox.style.display = 'block';

        UI.showToast(message, type === 'success' ? 'info' : 'error');

        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }

    function _formatType(type) {
        const typeMap = {
            'reserva': 'Problema con reserva',
            'profesor': 'Cambio de profesor',
            'vehiculo': 'Cambio de vehículo',
            'otro': 'Otro',
        };
        return typeMap[type] || type;
    }

    function _formatPriority(priority) {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }

    function _formatStatus(status) {
        const statusMap = {
            'abierta': 'Abierta',
            'en_curso': 'En curso',
            'cerrada': 'Cerrada',
        };
        return statusMap[status] || status;
    }

    function _formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES');
    }

    function _truncate(str, length) {
        if (str.length > length) {
            return str.substring(0, length) + '...';
        }
        return str;
    }
});
