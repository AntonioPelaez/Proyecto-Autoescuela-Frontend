document.addEventListener('DOMContentLoaded', async () => {
    Router.init();

    const stateBox = document.getElementById('admin-panel-summary-state');

    const managementBody = document.getElementById('admin-management-body');
    const operationsBody = document.getElementById('admin-operations-body');
    const incidentsSummary = document.getElementById('admin-incidents-summary');

    if (!managementBody || !operationsBody || !incidentsSummary) {
        return;
    }

    await loadPanelSummary();

    async function loadPanelSummary() {
        showState('', '');

        const today = new Date();
        const todayYmd = formatDateYYYYMMDD(today);

        const [
            townsResult,
            teachersResult,
            studentsResult,
            vehiclesResult,
            bookingsResult,
            incidentsResult,
            slotsResult,
        ] = await Promise.allSettled([
            Api.getTowns(),
            Api.getTeachers(),
            Api.getStudents(),
            Api.getVehicles(),
            Api.getAdminClasses(),
            Api.getIncidents(),
             Api.getWeeklyAvailabilities({ day_of_week: today.getDay() }),
        ]);

        const failedSections = [];
        const managementRows = [];
        const operationsRows = [];
        let incidents = [];

        if (townsResult.status === 'fulfilled') {
            const towns = toArray(townsResult.value);
            const active = towns.filter((town) => asBool(town.is_active ?? town.active ?? 0)).length;
            const inactive = Math.max(0, towns.length - active);
            managementRows.push({
                section: 'Poblaciones',
                total: towns.length,
                detail: active + ' activas · ' + inactive + ' inactivas',
                href: '/admin/towns',
                cta: 'Abrir',
            });
        } else {
            failedSections.push('poblaciones');
            managementRows.push(makeUnavailableRow('Poblaciones', '/admin/towns'));
        }

        if (teachersResult.status === 'fulfilled') {
            const teachers = toArray(teachersResult.value);
            const active = teachers.filter((teacher) => asBool(teacher.is_active_for_booking ?? teacher.is_active ?? teacher.active ?? 0)).length;
            const inactive = Math.max(0, teachers.length - active);
            managementRows.push({
                section: 'Profesores',
                total: teachers.length,
                detail: active + ' disponibles · ' + inactive + ' no disponibles',
                href: '/admin/professors',
                cta: 'Abrir',
            });
        } else {
            failedSections.push('profesores');
            managementRows.push(makeUnavailableRow('Profesores', '/admin/professors'));
        }

        if (studentsResult.status === 'fulfilled') {
            const students = toArray(studentsResult.value);
            const withTown = students.filter((student) => Number(student.town_id || student.townId || 0) > 0).length;
            const withoutTown = Math.max(0, students.length - withTown);
            managementRows.push({
                section: 'Alumnos',
                total: students.length,
                detail: withTown + ' con poblacion · ' + withoutTown + ' sin asignar',
                href: '/admin/students',
                cta: 'Abrir',
            });
        } else {
            failedSections.push('alumnos');
            managementRows.push(makeUnavailableRow('Alumnos', '/admin/students'));
        }

        if (vehiclesResult.status === 'fulfilled') {
            const payload = vehiclesResult.value;
            const vehicles = toArray(payload.vehicles || payload);
            const active = vehicles.filter((vehicle) => asBool(vehicle.is_active ?? vehicle.active ?? 0)).length;
            const inactive = Math.max(0, vehicles.length - active);
            managementRows.push({
                section: 'Vehiculos',
                total: vehicles.length,
                detail: active + ' activos · ' + inactive + ' inactivos',
                href: '/admin/vehicles',
                cta: 'Abrir',
            });
        } else {
            failedSections.push('vehiculos');
            managementRows.push(makeUnavailableRow('Vehiculos', '/admin/vehicles'));
        }

        if (slotsResult.status === 'fulfilled') {
           const slots = toArray(slotsResult.value.data || []);
const available = slots.length;
const reserved = 0;
            operationsRows.push({
                section: 'Huecos ofertados (hoy)',
                total: slots.length,
                detail: available + ' disponibles · ' + reserved + ' reservados',
                href: '/admin/slots',
                cta: 'Abrir',
            });
        } else {
            failedSections.push('huecos');
            operationsRows.push(makeUnavailableRow('Huecos ofertados (hoy)', '/admin/slots'));
        }

        if (bookingsResult.status === 'fulfilled') {
            const bookings = toArray(bookingsResult.value);
            const cancelled = bookings.filter((booking) => {
                const status = String(booking.status || '').toLowerCase();
                return status === 'cancelled' || status === 'canceled' || status === 'cancelada';
            }).length;
            const confirmed = Math.max(0, bookings.length - cancelled);
            operationsRows.push({
                section: 'Clases reservadas',
                total: bookings.length,
                detail: confirmed + ' activas · ' + cancelled + ' canceladas',
                href: '/admin/bookings',
                cta: 'Abrir',
            });
        } else {
            failedSections.push('reservas');
            operationsRows.push(makeUnavailableRow('Clases reservadas', '/admin/bookings'));
        }

        if (incidentsResult.status === 'fulfilled') {
            incidents = extractIncidents(incidentsResult.value);
            const opened = incidents.filter((incident) => String(incident.estado || incident.status || '').toLowerCase() === 'abierta').length;
            const inProgress = incidents.filter((incident) => {
                const status = String(incident.estado || incident.status || '').toLowerCase();
                return status === 'en_curso' || status === 'en curso';
            }).length;
            const closed = incidents.filter((incident) => String(incident.estado || incident.status || '').toLowerCase() === 'cerrada').length;
            operationsRows.push({
                section: 'Incidencias',
                total: incidents.length,
                detail: opened + ' abiertas · ' + inProgress + ' en curso · ' + closed + ' cerradas',
                href: '/admin/incidents',
                cta: 'Abrir',
            });
        } else {
            failedSections.push('incidencias');
            operationsRows.push(makeUnavailableRow('Incidencias', '/admin/incidents'));
        }

        renderSummaryTable(managementBody, managementRows, 'No hay datos de gestion para mostrar.');
        renderSummaryTable(operationsBody, operationsRows, 'No hay datos operativos para mostrar.');
        renderIncidentsBreakdown(incidentsSummary, incidents);

        if (failedSections.length) {
            showState('error', 'No se pudieron cargar algunos bloques del panel: ' + failedSections.join(', ') + '.');
        } else {
            showState('success', 'Panel admin cargado correctamente.');
        }
    }

    function renderSummaryTable(container, rows, emptyMessage) {
        container.replaceChildren();

        if (!rows.length) {
            const row = document.createElement('tr');
            row.className = 'table-empty';
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = emptyMessage;
            row.appendChild(cell);
            container.appendChild(row);
            return;
        }

        rows.forEach((entry) => {
            const row = document.createElement('tr');
            row.appendChild(createCell(entry.section));
            row.appendChild(createCell(String(entry.total)));
            row.appendChild(createCell(entry.detail));

            const linkCell = document.createElement('td');
            const link = document.createElement('a');
            link.href = entry.href;
            link.className = 'btn btn-outline btn-sm';
            link.textContent = entry.cta || 'Abrir';
            linkCell.appendChild(link);
            row.appendChild(linkCell);

            container.appendChild(row);
        });
    }

    function renderIncidentsBreakdown(container, incidents) {
        container.replaceChildren();

        if (!incidents.length) {
            const paragraph = document.createElement('p');
            paragraph.className = 'table-empty';
            paragraph.textContent = 'No hay incidencias registradas.';
            container.appendChild(paragraph);
            return;
        }

        const opened = incidents.filter((incident) => String(incident.estado || incident.status || '').toLowerCase() === 'abierta').length;
        const inProgress = incidents.filter((incident) => {
            const status = String(incident.estado || incident.status || '').toLowerCase();
            return status === 'en_curso' || status === 'en curso';
        }).length;
        const closed = incidents.filter((incident) => String(incident.estado || incident.status || '').toLowerCase() === 'cerrada').length;

        const list = document.createElement('ul');
        const items = [
            'Abiertas: ' + opened,
            'En curso: ' + inProgress,
            'Cerradas: ' + closed,
            'Total: ' + incidents.length,
        ];

        items.forEach((text) => {
            const item = document.createElement('li');
            item.textContent = text;
            list.appendChild(item);
        });

        container.appendChild(list);
    }

    function makeUnavailableRow(section, href) {
        return {
            section,
            total: '-',
            detail: 'Sin datos disponibles ahora mismo',
            href,
            cta: 'Abrir',
        };
    }

    function createCell(text) {
        const cell = document.createElement('td');
        cell.textContent = String(text || '-');
        return cell;
    }

    function extractIncidents(response) {
        if (Array.isArray(response)) {
            return response;
        }
        if (response && Array.isArray(response.data)) {
            return response.data;
        }
        if (response && response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        if (response && Array.isArray(response.incidents)) {
            return response.incidents;
        }
        return [];
    }

    function normalizeSlots(slots) {
        return slots.map((slot) => {
            const statusRaw = String(slot.status || slot.slot_status || '').toLowerCase();
            let status = statusRaw;
            if (!status) {
                if (asBool(slot.is_booked ?? slot.booked ?? 0)) {
                    status = 'booked';
                } else if (asBool(slot.is_active ?? slot.active ?? 0)) {
                    status = 'pending';
                }
            }

            return {
                status,
            };
        });
    }

    function toArray(payload) {
        return Array.isArray(payload) ? payload : [];
    }

    function asBool(value) {
        return value === true || value === 1 || value === '1';
    }

    function formatDateYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function showState(type, message) {
        if (!stateBox) {
            return;
        }

        if (!message) {
            stateBox.textContent = '';
            stateBox.className = 'hidden';
            return;
        }

        stateBox.textContent = message;
        stateBox.className = type === 'error' ? 'card card-body input-error' : 'card card-body';
    }
});
