document.addEventListener('DOMContentLoaded', async () => {
    const examCallId = document.getElementById('result-exam-call-id')?.value;
    const studentId = document.getElementById('result-student-id')?.value;
    const resultInfo = document.getElementById('result-info');
    const form = document.getElementById('result-form');
    const RESULT_MAP = {
        apto: 2,
        no_apto: 3,
        'no apto': 3,
        no_presentado: 4,
        'no presentado': 4
    };


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
        const firstName =
            person?.user?.name ||
            person?.name ||
            '';
        const lastName =
            person?.user?.surname1 ||
            person?.user?.surname ||
            person?.surname ||
            '';
        return [firstName, lastName].filter(Boolean).join(' ').trim();
    }

    function formatVehicleValue(value) {
        if (!value) return '—';
        if (typeof value === 'string') return value;

        if (typeof value === 'object') {
            const plate =
                value.plate ||
                value.plate_number ||
                value.registration ||
                null;

            const brandModel =
                [value.brand, value.model].filter(Boolean).join(' ') ||
                value.name ||
                '';

            return [brandModel, plate].filter(Boolean).join(' ').trim() || '—';
        }

        return String(value);
    }

    function getStudentRecord(item, examCall) {
    const studentName = getFullName(item.student) || 'Sin nombre';

    return {
        studentId: item.student_id ?? item.student?.id ?? null,
        studentName,
        examDate: examCall.exam_date ?? '—',
        startTime: examCall.start_time ?? '—',
        town: examCall.town?.name ?? '—',
        vehicle: formatVehicleValue(
            item.vehicle ||
            examCall.vehicle ||
            null
        ),
        result: item.resultado || item.result || 'Pendiente',
        notes: item.result_notes || '',
    };
}


    function showInfo(student) {
        resultInfo.innerHTML = `
            <p><strong>Alumno:</strong> ${student.studentName}</p>
            <p><strong>Convocatoria:</strong> ${formatDate(student.examDate)} ${formatTime(student.startTime)}</p>
            <p><strong>Población:</strong> ${student.town}</p>
            <p><strong>Vehículo:</strong> ${student.vehicle}</p>
        `;
    }

    if (!examCallId || !studentId) {
        resultInfo.textContent = 'Faltan datos de convocatoria o alumno.';
        return;
    }

    try {
        // 🔥 1. Cargar alumnos
        const response = await Api.getExamCallStudents(examCallId);
        const students = Array.isArray(response) ? response : response?.data ?? [];

        // 🔥 2. Cargar convocatoria completa
        const examCall = await Api.getExamCall(examCallId);

        // 🔥 3. Inyectar exam_call en cada alumno
        const studentsWithCall = students.map(s => ({
            ...s,
            exam_call: examCall
        }));

        // 🔥 4. Buscar alumno
        const student = studentsWithCall.find(item =>
            String(item.student_id ?? item.student?.id ?? '') === String(studentId)
        );

        if (!student) {
            resultInfo.textContent = 'No se ha encontrado el alumno en esta convocatoria.';
            return;
        }

        // 🔥 5. Normalizar y mostrar
        const record = getStudentRecord(student, examCall);
showInfo(record);


        // 🔥 6. Seleccionar radio correcto
        const selectedValue = String(student.resultado || student.result || '').trim().toLowerCase().replace(/\s+/g, '_');
        const radios = form.elements['resultado'];
        Array.from(radios).forEach(radio => {
            radio.checked = radio.value === selectedValue;
        });

    } catch (error) {
        console.error('Error cargando alumno:', error);
        resultInfo.textContent = 'Error cargando datos del alumno.';
    }

    // 🔥 7. Guardar resultado
form.addEventListener('submit', async event => {
    event.preventDefault();

    const resultado = form.elements['resultado'].value;
    if (!resultado) {
        UI.showToast('Selecciona un resultado antes de continuar.', 'error');
        return;
    }

    const exam_result_status_id = RESULT_MAP[resultado];

    try {
        await Api.updateExamStudentResult(examCallId, studentId, {
            exam_result_status_id,
            result_notes: "" // si quieres enviar notas vacías
        });

        UI.showToast('Resultado guardado. Continúa con las notas.', 'success');
        window.location.href = `/teacher/exam-calls/${examCallId}/students/${studentId}/notes`;

    } catch (error) {
        console.error('Error guardando resultado:', error);
        UI.showToast('No se pudo guardar el resultado.', 'error');
    }
});

});
