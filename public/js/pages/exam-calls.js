document.addEventListener('DOMContentLoaded', async () => {
    const acceptExamCallSelect = document.getElementById('accept-exam-call-select');
    const evaluateExamCallSelect = document.getElementById('evaluate-exam-call-select');
    const studentsBody = document.getElementById('exam-call-students-body');
    const pendingReservationsBody = document.getElementById('pending-reservations-body');

    let examCalls = [];
    let currentAcceptExamCallId = null;
    let currentEvaluateExamCallId = null;
    let evaluationStudents = [];
    let pendingStudents = [];

    function formatDate(value) {
        if (!value) return '—';
        const raw = String(value).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
            const parts = raw.slice(0, 10).split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
    }

    function formatTime(value) {
        if (!value) return '—';
        const raw = String(value).trim();
        if (/^\d{2}:\d{2}:\d{2}/.test(raw)) {
            return raw.slice(0, 5);
        }
        if (/^\d{2}:\d{2}/.test(raw)) {
            return raw.slice(0, 5);
        }
        return raw;
    }

    function getFullName(person) {
        if (!person) return '';
        const firstName =
            person?.user?.name ||
            person?.name ||
            person?.first_name ||
            person?.firstName ||
            person?.full_name ||
            person?.fullName ||
            '';
        const lastName =
            person?.user?.surname ||
            person?.surname ||
            person?.last_name ||
            person?.lastName ||
            person?.family_name ||
            '';
        return [firstName, lastName].filter(Boolean).join(' ').trim();
    }

    function formatVehicleValue(value) {
        if (value === null || value === undefined) return '—';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            const plate =
                value.plate ||
                value.plate_number ||
                value.vehicle_plate ||
                value.license_plate ||
                value.registration ||
                value.plateNumber;
            const brandModel =
                [value.brand, value.model].filter(Boolean).join(' ') ||
                value.name ||
                value.display_name ||
                value.title ||
                '';
            const result = [brandModel, plate].filter(Boolean).join(' ').trim();
            return result || JSON.stringify(value);
        }
        return String(value);
    }

    function normalizeStudentRecord(item) {
        const studentName = getFullName(item.student) || getFullName(item.user) || item.name || 'Sin nombre';
        const professor =
            getFullName(item.teacher) ||
            getFullName(item.professor) ||
            item.teacher_name ||
            item.professor_name ||
            item.profesor ||
            item.profesor_nombre ||
            getFullName(item.exam_call?.teacher) ||
            item.exam_call?.teacher_name ||
            '—';
        const examDate =
            item.exam_date ||
            item.examDate ||
            item.date ||
            item.exam_call?.exam_date ||
            item.exam_call?.date ||
            '—';
        const startTime =
            item.start_time ||
            item.startTime ||
            item.time ||
            item.exam_call?.start_time ||
            item.exam_call?.time ||
            '—';
        const vehicleValue =
            item.vehicle ||
            item.vehicle_number ||
            item.vehicle_plate ||
            item.exam_call?.vehicle ||
            item.exam_call?.vehicle?.plate_number ||
            item.exam_call?.vehicle?.name ||
            item.exam_call?.vehicle?.brand ||
            item.exam_call?.vehicle?.plate ||
            null;

        return {
            studentId: item.student_id ?? item.student?.id ?? item.id ?? null,
            studentName,
            professor,
            examDate,
            startTime,
            vehicle: formatVehicleValue(vehicleValue),
           result:
    item.exam_result_status?.label ||
    item.exam_result_status?.name ||
    item.resultado ||
    item.result ||
    item.status ||
    'Pendiente',

            notes: item.result_notes || item.notes || '—',
        };
    }

    function getExamCallId(call) {
        return call?.id ?? call?.exam_call_id ?? call?.examCallId ?? null;
    }

    function getExamCallStatus(call) {
        return String(
            call?.exam_call_status?.name ||
            call?.exam_call_status?.label ||
            call?.status_convocatoria ||
            call?.status ||
            call?.status_call ||
            call?.status_call_id ||
            ''
        ).toLowerCase();
    }

    function isExamCallScheduled(call) {
        const status = getExamCallStatus(call);
        return status === 'pendiente' || status === 'programada' || status === 'scheduled';
    }

    function setSelectLoading() {
        const loadingHtml = '<option value="">Cargando convocatorias...</option>';
        if (acceptExamCallSelect) acceptExamCallSelect.innerHTML = loadingHtml;
        if (evaluateExamCallSelect) evaluateExamCallSelect.innerHTML = loadingHtml;
    }

    function setSelectEmpty() {
        const emptyHtml = '<option value="">No hay convocatorias disponibles</option>';
        if (acceptExamCallSelect) acceptExamCallSelect.innerHTML = emptyHtml;
        if (evaluateExamCallSelect) evaluateExamCallSelect.innerHTML = emptyHtml;
    }

    function renderStudents(students, examCallId) {
        if (!students || !students.length) {
            studentsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-3">No hay alumnos para esta convocatoria.</td>
                </tr>
            `;
            return;
        }

        studentsBody.innerHTML = students.map(s => {
            const record = normalizeStudentRecord(s);
            return `
                <tr>
                    <td class="text-start">${record.studentName}</td>
                    <td>${record.professor}</td>
                    <td>${formatDate(record.examDate)}</td>
                    <td>${formatTime(record.startTime)}</td>
                    <td>${record.vehicle}</td>
                    <td>${record.result}</td>
                    <td>
                        <a href="/teacher/exam-calls/${examCallId}/students/${record.studentId}/result" class="btn btn-primary btn-sm">
                            Poner resultado
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderPendingReservations() {
        if (!pendingStudents || !pendingStudents.length) {
            pendingReservationsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3">No hay alumnos pendientes de aceptar en esta convocatoria.</td>
                </tr>
            `;
            return;
        }

        pendingReservationsBody.innerHTML = pendingStudents.map(s => {
            const studentName = getFullName(s.student) || getFullName(s.user) || s.name || 'Sin nombre';
            const studentId = s.student_id ?? s.student?.id ?? s.id ?? '';
            return `
                <tr data-student-id="${studentId}">
                    <td class="text-start">${studentName}</td>
                    <td class="text-nowrap">
                        <button type="button" class="btn btn-success btn-sm me-2" data-action="accept" data-student-id="${studentId}" aria-label="Aceptar ${studentName}">
                            ✓
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" data-action="reject" data-student-id="${studentId}" aria-label="Rechazar ${studentName}">
                            ✕
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function loadExamCallsOptions() {
        const selectHtml = examCalls.length
            ? `<option value="">Selecciona convocatoria</option>${examCalls.map(call => {
                    const examCallId = getExamCallId(call);
                    const date = formatDate(call.exam_date || call.date);
                    const time = formatTime(call.start_time || call.time);
                    const town = call.town?.name || call.town || call.city || '—';
                    return `<option value="${examCallId}">${date} ${time} — ${town}</option>`;
                }).join('')}`
            : '<option value="">No hay convocatorias disponibles</option>';

        if (acceptExamCallSelect) acceptExamCallSelect.innerHTML = selectHtml;
        if (evaluateExamCallSelect) evaluateExamCallSelect.innerHTML = selectHtml;
    }

    function isConfirmedStudent(item) {
        if (!item) return false;

        const confirmedFlag =
            item.student_confirmed === 1 ||
            item.student_confirmed === '1' ||
            item.student_confirmed === true ||
            item.student_confirmed === 'true' ||
            item.confirmed === true ||
            item.confirmed === '1';

        if (confirmedFlag) {
            return true;
        }

        const status = String(
            item.status ||
            item.booking_status ||
            item.status_convocatoria ||
            item.exam_result_status?.name ||
            item.exam_result_status?.label ||
            ''
        ).toLowerCase();

        return [
            'confirmed',
            'confirmada',
            'approved',
            'aprobado',
            'booked'
        ].includes(status);
    }

    function splitStudentsByConfirmation(items) {
        if (!Array.isArray(items)) return { pending: [], confirmed: [] };

        const pending = [];
        const confirmed = [];

        items.forEach(item => {
            if (isConfirmedStudent(item)) {
                confirmed.push(item);
            } else {
                pending.push(item);
            }
        });

        return { pending, confirmed };
    }

    function removePendingStudent(studentId) {
        pendingStudents = pendingStudents.filter(s => {
            const id = String(s.student_id ?? s.student?.id ?? s.id ?? '');
            return id !== String(studentId);
        });
    }

    async function acceptPendingStudent(studentId) {
        const match = pendingStudents.find(s => String(s.student_id ?? s.student?.id ?? s.id ?? '') === String(studentId));
        if (!match) return;

        if (!currentAcceptExamCallId) {
            console.error('No exam call selected for acceptance.');
            return;
        }

        try {
            await Api.confirmExamCall(currentAcceptExamCallId, studentId);
            removePendingStudent(studentId);

            if (currentEvaluateExamCallId === currentAcceptExamCallId) {
                const examCall = await Api.getExamCall(currentAcceptExamCallId);
                evaluationStudents.push({ ...match, exam_call: examCall });
                renderStudents(evaluationStudents, currentEvaluateExamCallId);
            }

            renderPendingReservations();
        } catch (error) {
            console.error('Error confirming pending student:', error);
            pendingReservationsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3 text-danger">No se pudo aceptar al alumno. Intenta de nuevo.</td>
                </tr>
            `;
        }
    }

    function rejectPendingStudent(studentId) {
        removePendingStudent(studentId);
        renderPendingReservations();
    }

    function normalizeList(raw) {
        if (Array.isArray(raw)) return raw;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        if (raw?.exam_calls && Array.isArray(raw.exam_calls)) return raw.exam_calls;
        if (raw?.examCalls && Array.isArray(raw.examCalls)) return raw.examCalls;
        return [];
    }

    async function loadExamCalls() {
        try {
            setSelectLoading();
            const response = await Api.getExamCalls();
            examCalls = normalizeList(response);
            examCalls = examCalls.filter(isExamCallScheduled);

            if (!examCalls.length) {
                setSelectEmpty();
                renderStudents([], null);
                pendingReservationsBody.innerHTML = `
                    <tr>
                        <td colspan="2" class="text-center py-3">No hay convocatorias disponibles.</td>
                    </tr>
                `;
                return;
            }

            loadExamCallsOptions();
        } catch (error) {
            console.error('Error loading exam calls:', error);
            setSelectEmpty();
            studentsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-3 text-danger">Error cargando convocatorias.</td>
                </tr>
            `;
            pendingReservationsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3 text-danger">Error cargando convocatorias.</td>
                </tr>
            `;
        }
    }

    async function loadAcceptExamCall(examCallId) {
        currentAcceptExamCallId = examCallId;

        if (!examCallId) {
            pendingReservationsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3">Selecciona una convocatoria para ver los alumnos pendientes de aceptar.</td>
                </tr>
            `;
            pendingStudents = [];
            return;
        }

        pendingReservationsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3">Cargando alumnos pendientes...</td>
            </tr>
        `;

        try {
            const response = await Api.getExamCallStudents(examCallId);
            const studentsList = Array.isArray(response) ? response : response?.data ?? [];
            pendingStudents = studentsList.filter(s => !isConfirmedStudent(s));
            renderPendingReservations();
        } catch (error) {
            console.error('Error loading pending students:', error);
            pendingReservationsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3 text-danger">Error cargando alumnos pendientes de la convocatoria.</td>
                </tr>
            `;
        }
    }

    async function loadEvaluateExamCall(examCallId) {
        currentEvaluateExamCallId = examCallId;

        if (!examCallId) {
            studentsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-3">Selecciona una convocatoria para ver los alumnos.</td>
                </tr>
            `;
            evaluationStudents = [];
            return;
        }

        studentsBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-3">Cargando alumnos...</td>
            </tr>
        `;

        try {
            const [response, examCall] = await Promise.all([
                Api.getExamCallStudents(examCallId),
                Api.getExamCall(examCallId),
            ]);

            const studentsList = Array.isArray(response) ? response : response?.data ?? [];
            evaluationStudents = studentsList
                .filter(s => isConfirmedStudent(s))
                .map(s => ({ ...s, exam_call: examCall }));

            renderStudents(evaluationStudents, examCallId);
        } catch (error) {
            console.error('Error loading exam call students:', error);
            studentsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-3 text-danger">Error cargando alumnos de la convocatoria.</td>
                </tr>
            `;
        }
    }

    acceptExamCallSelect?.addEventListener('change', () => {
        loadAcceptExamCall(acceptExamCallSelect.value);
    });

    evaluateExamCallSelect?.addEventListener('change', () => {
        loadEvaluateExamCall(evaluateExamCallSelect.value);
    });

    pendingReservationsBody?.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const studentId = button.dataset.studentId;
        if (!studentId) return;

        if (action === 'accept') {
            acceptPendingStudent(studentId);
        }
        if (action === 'reject') {
            rejectPendingStudent(studentId);
        }
    });

    await loadExamCalls();
});
