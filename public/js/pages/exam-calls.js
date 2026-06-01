document.addEventListener('DOMContentLoaded', async () => {
    const acceptExamCallSelect = document.getElementById('accept-exam-call-select');
    const evaluateExamCallSelect = document.getElementById('evaluate-exam-call-select');
    const studentsBody = document.getElementById('exam-call-students-body');
    const pendingReservationsBody = document.getElementById('pending-reservations-body');
    const approvedStudentsBody = document.getElementById('approved-students-body');
    const manualAddStudentsBody = document.getElementById('manual-add-students-body');
    const examCallDateTime = document.getElementById('exam-call-date-time');
    const examCallLocation = document.getElementById('exam-call-location');
    const examCallProfessor = document.getElementById('exam-call-professor');
    const examCallVehicle = document.getElementById('exam-call-vehicle');
    const examCallRemainingSeats = document.getElementById('exam-call-remaining-seats');
    const examCallStudentsCount = document.getElementById('exam-call-students-count');

    let examCalls = [];
    let currentAcceptExamCallId = null;
    let currentEvaluateExamCallId = null;
    let evaluationStudents = [];
    let pendingStudents = [];
    let approvedStudents = [];
    let manualAddStudents = [];
    const teacherNameCache = {};
    const vehicleNameCache = {};

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

    function unwrapValue(value) {
        if (value === null || value === undefined) return value;
        if (typeof value === 'string' || typeof value === 'number') return value;
        if (Array.isArray(value)) return value.length ? unwrapValue(value[0]) : value;
        if (typeof value === 'object') {
            if (value.data && value.data !== value) return unwrapValue(value.data);
            if (value.user && value.user !== value) return unwrapValue(value.user);
            if (value.teacher && value.teacher !== value) return unwrapValue(value.teacher);
            if (value.professor && value.professor !== value) return unwrapValue(value.professor);
            if (value.instructor && value.instructor !== value) return unwrapValue(value.instructor);
            if (value.vehicle && value.vehicle !== value) return unwrapValue(value.vehicle);
            if (value.car && value.car !== value) return unwrapValue(value.car);
            if (value.person && value.person !== value) return unwrapValue(value.person);
            if (value.record && value.record !== value) return unwrapValue(value.record);
        }
        return value;
    }

    function extractBestText(value, keys = []) {
        const current = unwrapValue(value);
        if (current === null || current === undefined) return null;
        if (typeof current === 'string') return current.trim();
        if (typeof current === 'number') return null;
        if (Array.isArray(current)) return current.map(item => extractBestText(item, keys)).filter(Boolean)[0] || null;
        if (typeof current === 'object') {
            for (const key of keys) {
                const candidate = current[key];
                if (candidate !== null && candidate !== undefined && candidate !== '') {
                    const text = extractBestText(candidate, keys);
                    if (text) return text;
                }
            }
            // prefer string-like primitives (with letters) and avoid returning generic ids/numbers
            for (const key of Object.keys(current)) {
                const candidate = current[key];
                if (typeof candidate === 'string') {
                    if (/[A-Za-zÀ-ÿ]/.test(candidate)) return candidate.trim();
                }
            }
            for (const key of Object.keys(current)) {
                const candidate = current[key];
                if (typeof candidate === 'object') {
                    const text = extractBestText(candidate, keys);
                    if (text) return text;
                }
            }
        }
        return null;
    }

    function extractAnyString(value) {
        const current = unwrapValue(value);
        if (current === null || current === undefined) return null;
        if (typeof current === 'string') return current.trim() || null;
        if (typeof current === 'number') return String(current);
        if (Array.isArray(current)) {
            for (const item of current) {
                const v = extractAnyString(item);
                if (v) return v;
            }
            return null;
        }
        if (typeof current === 'object') {
            for (const k of Object.keys(current)) {
                const v = extractAnyString(current[k]);
                if (v) return v;
            }
        }
        return null;
    }

    function getFullName(person) {
        const current = unwrapValue(person);
        if (current === null || current === undefined) return '';
        if (typeof current === 'string') return current.trim();
        if (typeof current === 'number') return String(current);

        const firstName =
            current?.user?.name ||
            current?.name ||
            current?.first_name ||
            current?.firstName ||
            current?.full_name ||
            current?.fullName ||
            current?.display_name ||
            current?.title ||
            '';
        const lastName =
            current?.user?.surname ||
            current?.surname ||
            current?.last_name ||
            current?.lastName ||
            current?.family_name ||
            current?.surname1 ||
            current?.surname2 ||
            '';
        const result = [firstName, lastName].filter(Boolean).join(' ').trim();
        if (result) return result;

        const extracted = extractBestText(current, [
            'full_name', 'fullName', 'display_name', 'title', 'nombre', 'name',
            'professor_name', 'teacher_name', 'instructor_name', 'surname', 'surname1', 'surname2'
        ]);
        if (extracted && typeof extracted === 'string') return extracted.trim();

        // Do not return generic object string like [object Object]
        return '';
    }

    function formatVehicleValue(value) {
        const current = unwrapValue(value);
        if (current === null || current === undefined) return '—';
        if (typeof current === 'string') return current;
        if (typeof current === 'number') return String(current);
        if (Array.isArray(current)) return current.length ? formatVehicleValue(current[0]) : '—';
        if (typeof current === 'object') {
            const plate =
                current.plate ||
                current.plate_number ||
                current.vehicle_plate ||
                current.license_plate ||
                current.registration ||
                current.plateNumber ||
                current?.vehicle?.plate ||
                current?.vehicle?.plate_number;
            const brandModel =
                [current.brand, current.model].filter(Boolean).join(' ') ||
                current.name ||
                current.display_name ||
                current.title ||
                current.registration ||
                '';
            const result = [brandModel, plate].filter(Boolean).join(' ').trim();
            return result || extractBestText(current, [
                'plate', 'plate_number', 'vehicle_plate', 'registration', 'name',
                'brand', 'model', 'title', 'display_name'
            ]) || (typeof current === 'object' ? JSON.stringify(current) : String(current));
        }
        return String(current);
    }

    async function resolveTeacherName(examCall) {
        if (!examCall) return null;
        // Try flat name fields first
        const teacherParts = [
            examCall?.teacher_name,
            examCall?.teacher_surname1,
            examCall?.teacher_surname2,
            examCall?.professor_name,
            examCall?.professor_surname1,
            examCall?.professor_surname2,
            examCall?.instructor_name,
            examCall?.instructor_surname1,
            examCall?.instructor_surname2
        ].filter(Boolean);
        if (teacherParts.length) return teacherParts.join(' ').trim();

        const directTeacher =
            examCall?.teacher ||
            examCall?.professor ||
            examCall?.instructor ||
            examCall?.teacher_profile ||
            examCall?.teacherProfile ||
            examCall?.professor_profile ||
            examCall?.instructor_profile ||
            examCall?.user ||
            examCall?.teacher?.user ||
            examCall?.teacher_profile?.user ||
            examCall?.teacherProfile?.user ||
            examCall?.professor?.user;

        const directName = getFullName(directTeacher);
        if (directName) return directName;

        const fallbackName =
            examCall?.teacher_name ||
            examCall?.professor_name ||
            examCall?.instructor_name ||
            examCall?.teacher_full_name ||
            examCall?.professor_full_name ||
            examCall?.teacher?.full_name ||
            examCall?.teacher_profile?.full_name ||
            examCall?.teacher_profile?.name ||
            examCall?.teacher?.name ||
            examCall?.professor?.name;
        if (fallbackName) return fallbackName;

        const teacherId =
            examCall?.teacher_id ||
            examCall?.teacher_profile_id ||
            examCall?.professor_id ||
            examCall?.instructor_id;
        if (!teacherId) return null;

        if (teacherNameCache[teacherId]) return teacherNameCache[teacherId];

        try {
            const teacherRaw = normalizeObject(await Api.getTeacher(teacherId));
            console.debug('Api.getTeacher response for id', teacherId, teacherRaw);
            const teacherName =
                getFullName(teacherRaw) ||
                teacherRaw?.name ||
                teacherRaw?.full_name ||
                getFullName(teacherRaw?.user) ||
                (teacherRaw?.surname
                    ? `${teacherRaw?.name || ''} ${teacherRaw?.surname}`.trim()
                    : null);
            if (teacherName) {
                teacherNameCache[teacherId] = teacherName;
                return teacherName;
            }

            // Try user by id if present
            const userId = teacherRaw?.user_id || teacherRaw?.user?.id || teacherRaw?.user_id;
            if (userId) {
                try {
                    const userRaw = normalizeObject(await Api.getUser(userId));
                    const userName = getFullName(userRaw) || extractAnyString(userRaw);
                    if (userName) {
                        teacherNameCache[teacherId] = userName;
                        return userName;
                    }
                } catch (e) {
                    console.debug('Api.getUser failed for id', userId, e);
                }
            }

            // As a last resort, pick any string from the teacher object
            const any = extractAnyString(teacherRaw);
            if (any) {
                teacherNameCache[teacherId] = any;
                return any;
            }
            if (teacherName) {
                teacherNameCache[teacherId] = teacherName;
                return teacherName;
            }
        } catch (error) {
            console.error('Error loading teacher name:', error);
        }

        teacherNameCache[teacherId] = `Profesor #${teacherId}`;
        return teacherNameCache[teacherId];
    }

    async function resolveVehicleLabel(examCall) {
        if (!examCall) return '—';
        const vehicleParts = [
            examCall?.vehicle_brand,
            examCall?.vehicle_model,
            examCall?.vehicle_plate,
            examCall?.plate_number,
            examCall?.license_plate,
            examCall?.registration
        ].filter(Boolean);
        if (vehicleParts.length) return vehicleParts.join(' ').trim();

        const vehicleValue =
            examCall?.vehicle ||
            examCall?.vehicle_id ||
            examCall?.vehicle_number ||
            examCall?.vehicle_plate ||
            examCall?.vehicle?.plate ||
            examCall?.vehicle?.plate_number ||
            examCall?.vehicle?.registration;

        if (vehicleValue === null || vehicleValue === undefined) return '—';
        if (typeof vehicleValue === 'object') return formatVehicleValue(vehicleValue);

        const vehicleId = Number(vehicleValue);
        if (!Number.isFinite(vehicleId)) return formatVehicleValue(vehicleValue);

        if (vehicleNameCache[vehicleId]) return vehicleNameCache[vehicleId];

        try {
            const vehicleRaw = normalizeObject(await Api.getVehicle(vehicleId));
            console.debug('Api.getVehicle response for id', vehicleId, vehicleRaw);
            const resolved =
                formatVehicleValue(vehicleRaw) ||
                vehicleRaw?.name ||
                vehicleRaw?.brand ||
                vehicleRaw?.model ||
                String(vehicleId);
            if (resolved && resolved !== String(vehicleId)) {
                vehicleNameCache[vehicleId] = resolved;
                return resolved;
            }

            // fallback: try any string in the vehicle object (plate, display, etc.)
            const anyVehicle = extractAnyString(vehicleRaw);
            if (anyVehicle) {
                vehicleNameCache[vehicleId] = anyVehicle;
                return anyVehicle;
            }

            vehicleNameCache[vehicleId] = String(vehicleId);
            return String(vehicleId);
        } catch (error) {
            console.error('Error loading vehicle label:', error);
            return String(vehicleValue);
        }
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
                    <td class="text-center text-nowrap">
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

    function renderApprovedStudents(examCallId) {
        if (!approvedStudents || !approvedStudents.length) {
            approvedStudentsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3">No hay alumnos en la convocatoria.</td>
                </tr>
            `;
            return;
        }

        approvedStudentsBody.innerHTML = approvedStudents.map(s => {
            const studentName = getFullName(s.student) || getFullName(s.user) || s.name || 'Sin nombre';
            const studentId = s.student_id ?? s.student?.id ?? s.id ?? '';
            return `
                <tr data-student-id="${studentId}">
                    <td class="text-start">${studentName}</td>
                    <td class="text-center text-nowrap">
                        <button type="button" class="btn btn-danger btn-sm" data-action="remove" data-student-id="${studentId}" aria-label="Quitar ${studentName}">
                            Quitar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderManualAddStudents(examCallId) {
        if (!manualAddStudents || !manualAddStudents.length) {
            manualAddStudentsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3">No hay alumnos disponibles para añadir manualmente.</td>
                </tr>
            `;
            return;
        }

        manualAddStudentsBody.innerHTML = manualAddStudents.map(s => {
            const studentName = getFullName(s.student) || getFullName(s.user) || s.name || 'Sin nombre';
            const studentId = s.student_id ?? s.student?.id ?? s.id ?? '';
            return `
                <tr data-student-id="${studentId}">
                    <td class="text-start">${studentName}</td>
                    <td class="text-center text-nowrap">
                        <button type="button" class="btn btn-primary btn-sm" data-action="add-manual" data-student-id="${studentId}" aria-label="Añadir ${studentName}">
                            Añadir
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async function renderExamCallInfo(examCall) {
        const date = formatDate(
            examCall?.exam_date ||
            examCall?.date ||
            examCall?.fecha ||
            examCall?.start_date ||
            examCall?.startDate ||
            examCall?.examDate
        );
        const time = formatTime(
            examCall?.start_time ||
            examCall?.time ||
            examCall?.hora ||
            examCall?.startTime ||
            examCall?.examTime
        );
        examCallDateTime.textContent = examCall ? `${date} ${time}` : 'Selecciona una convocatoria';

        const location =
            examCall?.location ||
            examCall?.place ||
            examCall?.address ||
            examCall?.lugar ||
            examCall?.town?.name ||
            examCall?.city ||
            examCall?.venue ||
            examCall?.locality ||
            '—';
        examCallLocation.textContent = location;
        examCallProfessor.textContent = (await resolveTeacherName(examCall)) || '—';
        examCallVehicle.textContent = await resolveVehicleLabel(examCall);

        const capacity = Number(
            examCall?.capacity ??
            examCall?.plazas ??
            examCall?.slots ??
            examCall?.max_students ??
            examCall?.total_seats ??
            examCall?.seats ??
            examCall?.capacity_total ??
            examCall?.maxCapacity ??
            examCall?.seat_count ??
            null
        );

        const remaining = Number.isFinite(capacity) ? Math.max(capacity - approvedStudents.length, 0) : null;
        examCallRemainingSeats.textContent = remaining !== null ? `${remaining} de ${capacity}` : '—';
        examCallStudentsCount.textContent = approvedStudents.length;
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

    // 🔥 Si el profesor lo ha aprobado → es confirmado
    if (
        item.teacher_approved === 1 ||
        item.teacher_approved === '1' ||
        item.teacher_approved === true ||
        item.teacher_approved === 'true'
    ) {
        return true;
    }

    // 🔥 Si el alumno ha confirmado → también es confirmado
    if (
        item.student_confirmed === 1 ||
        item.student_confirmed === '1' ||
        item.student_confirmed === true ||
        item.student_confirmed === 'true'
    ) {
        return true;
    }

    // 🔥 Compatibilidad con otros estados
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
    const match = pendingStudents.find(s =>
        String(s.student_id ?? s.student?.id ?? s.id ?? '') === String(studentId)
    );
    if (!match) return;

    if (!currentAcceptExamCallId) {
        console.error('No exam call selected for acceptance.');
        return;
    }

    try {
        // ✔ APROBAR ALUMNO (teacher_approved = true)
        await Api.approveExamCall(currentAcceptExamCallId, studentId);

        removePendingStudent(studentId);
        approvedStudents.push(match);

        // Si estamos en la misma convocatoria → mover a evaluación
        if (currentEvaluateExamCallId === currentAcceptExamCallId) {
            const examCall = await Api.getExamCall(currentAcceptExamCallId);
            evaluationStudents.push({ ...match, exam_call: examCall });
            renderStudents(evaluationStudents, currentEvaluateExamCallId);
        }

        renderPendingReservations();
        renderApprovedStudents(currentAcceptExamCallId);
        renderExamCallInfo(await Api.getExamCall(currentAcceptExamCallId));
    } catch (error) {
        console.error('Error approving student:', error);
        pendingReservationsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3 text-danger">
                    No se pudo aprobar al alumno. Intenta de nuevo.
                </td>
            </tr>
        `;
    }
}


async function rejectPendingStudent(studentId) {
    if (!currentAcceptExamCallId) {
        console.error('No exam call selected for rejection.');
        return;
    }

    try {
        // ✔ DESAPROBAR ALUMNO
        await Api.rejectExamCall(currentAcceptExamCallId, studentId);

        removePendingStudent(studentId);
        renderPendingReservations();
    } catch (error) {
        console.error('Error rejecting student:', error);
        pendingReservationsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3 text-danger">
                    No se pudo rechazar al alumno. Intenta de nuevo.
                </td>
            </tr>
        `;
    }
}

async function addManualStudent(studentId) {
    if (!currentAcceptExamCallId) {
        console.error('No exam call selected for manual add.');
        return;
    }

    const match = manualAddStudents.find(s => String(s.student_id ?? s.student?.id ?? s.id ?? '') === String(studentId));
    if (!match) return;

    try {
        await Api.addApprovedStudent(currentAcceptExamCallId, studentId);

        manualAddStudents = manualAddStudents.filter(s => String(s.student_id ?? s.student?.id ?? s.id ?? '') !== String(studentId));
        approvedStudents.push(match);

        renderManualAddStudents(currentAcceptExamCallId);
        renderApprovedStudents(currentAcceptExamCallId);
        renderExamCallInfo(await Api.getExamCall(currentAcceptExamCallId));
    } catch (error) {
        console.error('Error adding student manually:', error);
        manualAddStudentsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3 text-danger">
                    No se pudo añadir al alumno. Intenta de nuevo.
                </td>
            </tr>
        `;
    }
}

async function removeApprovedStudentFromCall(studentId) {
    if (!currentAcceptExamCallId) {
        console.error('No exam call selected for removal.');
        return;
    }

    const match = approvedStudents.find(s => String(s.student_id ?? s.student?.id ?? s.id ?? '') === String(studentId));
    if (!match) return;

    try {
        await Api.removeApprovedStudent(currentAcceptExamCallId, studentId);

        approvedStudents = approvedStudents.filter(s => String(s.student_id ?? s.student?.id ?? s.id ?? '') !== String(studentId));
        manualAddStudents.push(match);

        renderApprovedStudents(currentAcceptExamCallId);
        renderManualAddStudents(currentAcceptExamCallId);
        renderExamCallInfo(await Api.getExamCall(currentAcceptExamCallId));
    } catch (error) {
        console.error('Error removing approved student:', error);
        approvedStudentsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3 text-danger">
                    No se pudo quitar al alumno. Intenta de nuevo.
                </td>
            </tr>
        `;
    }
}



    function normalizeList(raw) {
        if (Array.isArray(raw)) return raw;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        if (raw?.exam_calls && Array.isArray(raw.exam_calls)) return raw.exam_calls;
        if (raw?.examCalls && Array.isArray(raw.examCalls)) return raw.examCalls;
        return [];
    }

    function normalizeObject(raw) {
        if (!raw) return null;
        if (raw?.data && typeof raw.data === 'object') return raw.data;
        if (raw?.exam_call && typeof raw.exam_call === 'object') return raw.exam_call;
        if (raw?.teacher && typeof raw.teacher === 'object') return raw.teacher;
        if (raw?.vehicle && typeof raw.vehicle === 'object') return raw.vehicle;
        return raw;
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
            approvedStudentsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3">Selecciona una convocatoria para ver los alumnos que ya están en la convocatoria.</td>
                </tr>
            `;
            manualAddStudentsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3">Selecciona una convocatoria para ver los alumnos que puedes añadir manualmente.</td>
                </tr>
            `;
            examCallDateTime.textContent = 'Selecciona una convocatoria';
            examCallLocation.textContent = '—';
            examCallProfessor.textContent = '—';
            examCallVehicle.textContent = '—';
            examCallRemainingSeats.textContent = '—';
            examCallStudentsCount.textContent = '0';
            pendingStudents = [];
            approvedStudents = [];
            manualAddStudents = [];
            return;
        }

        pendingReservationsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3">Cargando alumnos pendientes...</td>
            </tr>
        `;
        approvedStudentsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3">Cargando alumnos en la convocatoria...</td>
            </tr>
        `;
        manualAddStudentsBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3">Cargando alumnos disponibles...</td>
            </tr>
        `;

        try {
            const [examCallResponse, studentsResponse, allStudentsResponse] = await Promise.all([
                Api.getExamCall(examCallId),
                Api.getExamCallStudents(examCallId),
                Api.getStudents(),
            ]);

            const examCall = normalizeObject(examCallResponse);
            const studentsList = normalizeList(studentsResponse);
            const allStudents = normalizeList(allStudentsResponse);

            approvedStudents = studentsList.filter(s => isConfirmedStudent(s));
            pendingStudents = studentsList.filter(s => !isConfirmedStudent(s));

            const existingIds = new Set(studentsList.map(s => String(s.student_id ?? s.student?.id ?? s.id ?? '')));
            manualAddStudents = allStudents.filter(s => {
                const studentId = String(s.student_id ?? s.student?.id ?? s.id ?? '');
                return studentId && !existingIds.has(studentId);
            });

            await renderExamCallInfo(examCall);
            renderPendingReservations();
            renderApprovedStudents(examCallId);
            renderManualAddStudents(examCallId);
        } catch (error) {
            console.error('Error loading pending students:', error);
            pendingReservationsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3 text-danger">Error cargando alumnos pendientes de la convocatoria.</td>
                </tr>
            `;
            approvedStudentsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3 text-danger">Error cargando alumnos en la convocatoria.</td>
                </tr>
            `;
            manualAddStudentsBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3 text-danger">Error cargando alumnos disponibles para añadir.</td>
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
                .filter(s => s.teacher_approved == 1)
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

    approvedStudentsBody?.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const studentId = button.dataset.studentId;
        if (!studentId) return;

        if (action === 'remove') {
            removeApprovedStudentFromCall(studentId);
        }
    });

    manualAddStudentsBody?.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const studentId = button.dataset.studentId;
        if (!studentId) return;

        if (action === 'add-manual') {
            addManualStudent(studentId);
        }
    });

    await loadExamCalls();
});
