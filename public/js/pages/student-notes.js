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
        if (/^\d{2}:\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
        if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
        return raw;
    }

    function getFullName(person) {
        if (!person) return '';
        const firstName = person?.user?.name || person?.name || '';
        const lastName = person?.user?.surname1 || person?.surname || '';
        return [firstName, lastName].filter(Boolean).join(' ').trim();
    }

    function formatVehicleValue(value) {
        if (!value) return '—';
        if (typeof value === 'string') return value;

        if (typeof value === 'object') {
            const plate = value.plate || value.plate_number || null;
            const brandModel = [value.brand, value.model].filter(Boolean).join(' ') || value.name || '';
            return [brandModel, plate].filter(Boolean).join(' ').trim() || '—';
        }

        return String(value);
    }

    function getStudentRecord(student, examCall) {
        return {
            studentId: student.student_id,
            studentName: getFullName(student.student),
            examDate: examCall.exam_date,
            startTime: examCall.start_time,
            town: examCall.town?.name ?? '—',
            vehicle: formatVehicleValue(student.vehicle),
            result: student.exam_result_status?.name ?? 'Pendiente',
            notes: student.result_notes ?? '',
        };
    }

    if (!examCallId || !studentId) {
        notesInfo.textContent = 'Faltan datos de convocatoria o alumno.';
        return;
    }

    try {
        // 🔥 Cargar convocatoria completa (incluye resultado actualizado)
        const examCall = await Api.getExamCall(examCallId);

        // 🔥 Buscar alumno dentro de exam_students
        const student = examCall.exam_students.find(s =>
            String(s.student_id) === String(studentId)
        );

        if (!student) {
            notesInfo.textContent = 'No se ha encontrado el alumno en esta convocatoria.';
            return;
        }

        const record = getStudentRecord(student, examCall);

        notesInfo.innerHTML = `
            <p><strong>Alumno:</strong> ${record.studentName}</p>
            <p><strong>Convocatoria:</strong> ${formatDate(record.examDate)} ${formatTime(record.startTime)}</p>
            <p><strong>Resultado guardado:</strong> ${record.result}</p>
            <p><strong>Población:</strong> ${record.town}</p>
        `;

        notesField.value = record.notes;

    } catch (error) {
        console.error('Error cargando alumno:', error);
        notesInfo.textContent = 'Error cargando datos del alumno.';
    }

    // 🔥 Guardar notas
    form.addEventListener('submit', async event => {
    event.preventDefault();
    const notes = notesField.value.trim();

    try {
        // 🔥 1. Cargar convocatoria completa para obtener el resultado actual
        const examCall = await Api.getExamCall(examCallId);

        const student = examCall.exam_students.find(s =>
            String(s.student_id) === String(studentId)
        );

        const exam_result_status_id = student.exam_result_status_id;

        // 🔥 2. Enviar resultado + notas
        await Api.updateExamStudentResult(examCallId, studentId, {
            exam_result_status_id,
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
