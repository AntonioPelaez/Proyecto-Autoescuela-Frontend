document.addEventListener('DOMContentLoaded', async () => {
    const examCallId = document.getElementById('notes-exam-call-id')?.value;
    const studentId = document.getElementById('notes-student-id')?.value;
    const notesInfo = document.getElementById('notes-info');
    const form = document.getElementById('notes-form');
    const notesField = document.getElementById('notes-text');

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

    function getStudentRecord(item) {
        const studentName = getFullName(item.student) || getFullName(item.user) || item.name || 'Sin nombre';

        return {
            studentId: item.student_id ?? item.student?.id ?? item.id ?? null,
            studentName,
            examDate: item.exam_date || item.examDate || item.date || item.exam_call?.exam_date || item.exam_call?.date || '—',
            startTime: item.start_time || item.startTime || item.time || item.exam_call?.start_time || item.exam_call?.time || '—',
            town: item.town || item.city || item.exam_call?.town || item.exam_call?.city || '—',
            vehicle: formatVehicleValue(item.vehicle || item.vehicle_number || item.vehicle_plate || item.exam_call?.vehicle || item.exam_call?.vehicle?.name || item.exam_call?.vehicle?.plate_number || null),
            result: item.resultado || item.result || item.status || 'Pendiente',
            notes: item.result_notes || item.notes || '',
        };
    }

    function showInfo(student) {
        notesInfo.innerHTML = `
            <p><strong>Alumno:</strong> ${student.studentName}</p>
            <p><strong>Convocatoria:</strong> ${formatDate(student.examDate)} ${formatTime(student.startTime)}</p>
            <p><strong>Resultado guardado:</strong> ${student.result}</p>
            <p><strong>Población:</strong> ${student.town}</p>
        `;
    }

    if (!examCallId || !studentId) {
        notesInfo.textContent = 'Faltan datos de convocatoria o alumno.';
        return;
    }

    try {
        const response = await Api.getExamCallStudents(examCallId);
        const students = Array.isArray(response) ? response : response?.data ?? [];
        const student = students.find(item => String(item.student_id ?? item.student?.id ?? item.id ?? '') === String(studentId));

        if (!student) {
            notesInfo.textContent = 'No se ha encontrado el alumno en esta convocatoria.';
            return;
        }

        const record = getStudentRecord(student);
        showInfo(record);
        notesField.value = student.result_notes || student.notes || '';
    } catch (error) {
        console.error('Error cargando alumno:', error);
        notesInfo.textContent = 'Error cargando datos del alumno.';
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const notes = notesField.value.trim();

        try {
            await Api.updateExamStudentResult(examCallId, studentId, {
                result_notes: notes || null,
            });
            UI.showToast('Notas guardadas correctamente.', 'success');
            window.location.href = '/teacher/exam-calls';
        } catch (error) {
            console.error('Error guardando notas:', error);
            UI.showToast('No se pudieron guardar las notas.', 'error');
        }
    });
});