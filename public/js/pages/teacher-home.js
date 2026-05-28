(function () {
    'use strict';

    const ROOT_ID = 'teacher-home-page';
    const STATE_ID = 'teacher-home-state';
    const TODAY_BODY_ID = 'teacher-today-body';
    const UPCOMING_BODY_ID = 'teacher-upcoming-body';
    const HISTORY_BODY_ID = 'teacher-history-body';
    const WEEK_SUMMARY_ID = 'teacher-week-summary';

    // 🔥 NUEVOS IDS
    const NEXT_EXAM_ID = 'teacher-next-exam';
    const TEACHER_STATS_ID = 'teacher-stats';
    let townsCache = null;

    async function loadTownsCache() {
        if (townsCache) return townsCache;
        try {
            const response = await Api.getTowns();
            townsCache = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                ? response.data
                : [];
        } catch (error) {
            console.error('Error loading towns cache:', error);
            townsCache = [];
        }
        return townsCache;
    }

    // 🔥 Convertir YYYY-MM-DD → DD/MM/YYYY
    function formatDateDMY(dateStr) {
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("-");
        return `${d}/${m}/${y}`;
    }

    function parseDateTime(item) {
        const date = item && item.date ? item.date : '';
        const time = item && item.time ? item.time : '00:00';
        const value = new Date(date + 'T' + time + ':00');
        if (Number.isNaN(value.getTime())) {
            return null;
        }
        return value;
    }

    function showState(type, message) {
        const el = document.getElementById(STATE_ID);
        if (!el) return;

        if (!message) {
            el.className = 'hidden';
            el.textContent = '';
            return;
        }

        const classes = {
            success: 'card card-body',
            error: 'card card-body input-error',
            info: 'card card-body',
        };

        el.className = classes[type] || classes.info;
        el.textContent = message;
    }

    function getTodayIso() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;
    }

    function mapBooking(raw) {
        return {
            date: raw.date || '-',
            time: raw.time || '-',
            studentName: raw.studentName || '-',
            townName: raw.townName || '-',
            vehicle: raw.vehicle || 'Sin vehiculo asignado',
            status: translateStatus(raw.status || '-'),
            dt: parseDateTime(raw),
        };
    }

    function createCell(text) {
        const cell = document.createElement('td');
        cell.textContent = String(text || '-');
        return cell;
    }

    function renderRows(bodyId, rows, columns, emptyMessage) {
        const tbody = document.getElementById(bodyId);
        if (!tbody) return;

        tbody.replaceChildren();

        if (!rows.length) {
            const row = document.createElement('tr');
            row.className = 'table-empty';
            const cell = document.createElement('td');
            cell.colSpan = columns;
            cell.textContent = emptyMessage;
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }

        rows.forEach(function (rowData) {
            const row = document.createElement('tr');
            rowData.forEach(function (value) {
                row.appendChild(createCell(value));
            });
            tbody.appendChild(row);
        });
    }

    function translateStatus(status) {
        const map = {
            pending: 'Pendiente',
            confirmed: 'Confirmada',
            completed: 'Completada',
            cancelled: 'Cancelada'
        };
        return map[status] || status;
    }

    function renderWeekSummary(bookings) {
        const container = document.getElementById(WEEK_SUMMARY_ID);
        if (!container) return;

        container.replaceChildren();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setDate(today.getDate() + 7);

        const weekly = bookings.filter(function (item) {
            if (!item.dt) return false;

            const dt = new Date(item.dt);
            dt.setHours(0, 0, 0, 0);

            return dt >= today && dt < end;
        });

        const byDate = weekly.reduce(function (acc, item) {
            const key = item.date;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const days = Object.keys(byDate).sort();
        if (!days.length) {
            const paragraph = document.createElement('p');
            paragraph.className = 'table-empty';
            paragraph.textContent = 'No hay clases planificadas para los próximos 7 días.';
            container.appendChild(paragraph);
            return;
        }

        const list = document.createElement('ul');
        days.forEach(function (day) {
            const item = document.createElement('li');
            const strong = document.createElement('strong');

            strong.textContent = formatDateDMY(day) + ': ';
            item.append(strong, document.createTextNode(String(byDate[day]) + ' clase(s)'));
            list.appendChild(item);
        });
        container.appendChild(list);
    }

    function renderPanel(bookings) {
        const todayIso = getTodayIso();
        const now = new Date();

        const sorted = bookings.slice().sort(function (a, b) {
            if (!a.dt || !b.dt) return 0;
            return a.dt.getTime() - b.dt.getTime();
        });

        const todayRows = sorted
            .filter(item => item.date === todayIso)
            .map(item => [
                item.time,
                item.studentName,
                item.townName,
                item.vehicle
            ]);

        const upcomingRows = sorted
            .filter(item => item.dt && item.dt >= now)
            .slice(0, 6)
            .map(item => [
                formatDateDMY(item.date),
                item.time,
                item.studentName,
                item.townName
            ]);

        const historyRows = sorted
            .filter(item => item.dt && item.dt < now)
            .slice(-6)
            .reverse()
            .map(item => [
                formatDateDMY(item.date),
                item.time,
                item.studentName,
                translateStatus(item.status)
            ]);

        renderRows(TODAY_BODY_ID, todayRows, 4, 'No tienes clases para hoy.');
        renderRows(UPCOMING_BODY_ID, upcomingRows, 4, 'No hay próximas clases registradas.');
        renderRows(HISTORY_BODY_ID, historyRows, 4, 'Sin clases históricas.');
        renderWeekSummary(sorted);
        UI.setLoading(WEEK_SUMMARY_ID, false);
    }

    // ---------------------------------------------------------
    // 🔥 NUEVO: Próxima convocatoria (usa nextConvocation)
    // ---------------------------------------------------------
    async function loadNextExam() {
    const box = document.getElementById(NEXT_EXAM_ID);
    if (!box) return;

    function normalizeExamCallPayload(data) {
        if (!data) return null;
        if (data.exam_call) return data.exam_call;
        if (data.data && data.data.exam_call) return data.data.exam_call;
        if (Array.isArray(data)) return data[0] || null;
        return data;
    }

    function getTownLabel(exam) {
        if (!exam) return "-";
        if (typeof exam.town === "string") return exam.town;
        if (exam.town?.name) return exam.town.name;
        if (Array.isArray(exam.town) && exam.town[0]?.name) return exam.town[0].name;
        if (exam.town_name) return exam.town_name;
        if (exam.townName) return exam.townName;
        if (exam.location) return exam.location;
        if (exam.location_name) return exam.location_name;
        if (exam.town?.data?.name) return exam.town.data.name;
        if (exam.town_id) return `Población #${exam.town_id}`;
        if (exam.town?.id) return `Población #${exam.town.id}`;
        return "-";
    }

    async function resolveTownName(exam) {
        const label = getTownLabel(exam);
        if (label && label !== "-" && !label.startsWith('Población #')) {
            return label;
        }

        const towns = await loadTownsCache();
        const id = exam.town_id || exam.town?.id || null;
        if (id) {
            const town = towns.find((t) => String(t.id) === String(id));
            if (town?.name) return town.name;
        }
        return label;
    }

    function getStudentList(exam) {
        if (!exam) return "-";
        const rawStudents =
            Array.isArray(exam.exam_students) && exam.exam_students.length > 0
                ? exam.exam_students
                : Array.isArray(exam.students) && exam.students.length > 0
                ? exam.students
                : Array.isArray(exam.participants) && exam.participants.length > 0
                ? exam.participants
                : [];

        if (!rawStudents.length) return "-";

        return rawStudents
            .map(function (item) {
                return (
                    item?.student?.name ||
                    item?.name ||
                    item?.student_name ||
                    item?.student?.full_name ||
                    "Alumno"
                );
            })
            .join(", ");
    }

    try {
        const data = await Api.nextConvocation();
        const exam = normalizeExamCallPayload(data);

        if (!exam || Object.keys(exam).length === 0) {
            box.innerHTML = `<p class="text-muted">No tienes convocatorias próximas.</p>`;
            return;
        }

        const townLabel = await resolveTownName(exam);

        box.innerHTML = `
            <p><strong>Fecha:</strong> ${formatDateDMY(exam.exam_date || exam.date || exam.start_date || exam.exam_date)}</p>
            <p><strong>Hora:</strong> ${exam.start_time || exam.time || exam.slot_time || "-"}</p>
            <p><strong>Población:</strong> ${townLabel}</p>
            <p><strong>Alumnos:</strong> ${getStudentList(exam)}</p>
        `;
    } catch (e) {
        console.error(e);
        box.innerHTML = `<p class="text-danger">Error cargando la próxima convocatoria.</p>`;
    }
}
    // ---------------------------------------------------------
    // 🔥 NUEVO: Estadísticas del profesor (usa getExamStatistics)
    // ---------------------------------------------------------
    async function loadTeacherStats() {
    const box = document.getElementById(TEACHER_STATS_ID);
    if (!box) return;

    try {
        const stats = await Api.getExamStatistics();

        box.innerHTML = `
            <p><strong>Aprobados:</strong> ${stats.approved ?? stats.aprobados ?? stats.passed ?? 0}%</p>
            <p><strong>Suspendidos:</strong> ${stats.failed ?? stats.suspendidos ?? stats.failed_count ?? 0}%</p>
        `;
    } catch (e) {
        box.innerHTML = `<p class="text-danger">Error cargando estadísticas.</p>`;
    }
}


    // ---------------------------------------------------------
    // INIT
    // ---------------------------------------------------------
    async function init() {
        const root = document.getElementById(ROOT_ID);
        if (!root) return;

        Router.init();
        UI.setLoading(TODAY_BODY_ID, true);
        UI.setLoading(UPCOMING_BODY_ID, true);
        UI.setLoading(HISTORY_BODY_ID, true);

        // 🔥 Tus métodos reales
        await loadNextExam();
        await loadTeacherStats();

        try {
            const raw = await Api.getTeacherBookings();

            let bookings = [];

            if (Array.isArray(raw)) bookings = raw;
            else if (Array.isArray(raw?.reservas)) bookings = raw.reservas;
            else if (Array.isArray(raw?.data)) bookings = raw.data;

            bookings = bookings.map(mapBooking);

            renderPanel(bookings);
            showState('success', 'Panel del profesor cargado correctamente.');
        } catch (error) {
            console.error('Error al cargar panel del profesor:', error);
            showState('error', error?.message || 'No se pudo cargar el panel del profesor.');
            UI.showToast('Error al cargar el panel del profesor.', 'error');
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
