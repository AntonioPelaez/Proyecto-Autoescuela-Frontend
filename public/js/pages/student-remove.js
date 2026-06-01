document.addEventListener('DOMContentLoaded', async () => {
    const examCallId = document.getElementById('remove-exam-call-id')?.value;
    const studentId = document.getElementById('remove-student-id')?.value;
    const removeInfo = document.getElementById('remove-info');
    const form = document.getElementById('remove-form');
    const reasonField = document.getElementById('remove-reason');

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
        const lastName =
            person?.user?.surname1 || person?.surname || person?.surname2 || '';
        return [firstName, lastName].filter(Boolean).join(' ').trim();
    }

    if (!examCallId || !studentId) {
        removeInfo.textContent = 'Faltan datos de convocatoria o alumno.';
        return;
    }

    try {
        const response = await Api.getExamCall(examCallId);
        const examCall = response?.exam_call || response?.data?.exam_call || response || null;
        const student = Array.isArray(examCall?.exam_students)
            ? examCall.exam_students.find(s => String(s.student_id) === String(studentId))
            : null;

        if (!student) {
            removeInfo.textContent = 'No se ha encontrado el alumno en esta convocatoria.';
            return;
        }

        const studentName = getFullName(student.student || student.user || student);
        const examDate = formatDate(examCall?.exam_date || examCall?.date);
        const examTime = formatTime(examCall?.start_time || examCall?.time);
        const town = examCall?.town?.name || examCall?.town || examCall?.city || '—';

        removeInfo.innerHTML = `
            <p><strong>Alumno:</strong> ${studentName}</p>
            <p><strong>Convocatoria:</strong> ${examDate} ${examTime}</p>
            <p><strong>Población:</strong> ${town}</p>
            <p><strong>Estado actual:</strong> ${student.student_confirmed || student.teacher_approved ? 'Aceptado' : 'No aceptado'}</p>
        `;
    } catch (error) {
        console.error('Error cargando datos de alumno para quitar:', error);
        removeInfo.textContent = 'Error cargando datos de la convocatoria.';
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const reason = String(reasonField.value || '').trim();
        if (!reason) {
            window.alert('Introduce la razón para quitar al alumno.');
            return;
        }

        try {
            await Api.removeApprovedStudent(examCallId, studentId, {
                result_notes: reason,
            });
            UI.showToast('Alumno retirado correctamente.', 'success');
            window.location.href = '/teacher/exam-calls';
        } catch (error) {
            console.error('Error al quitar alumno:', error);
            UI.showToast('No se pudo quitar al alumno. Intenta de nuevo.', 'error');
        }
    });
});