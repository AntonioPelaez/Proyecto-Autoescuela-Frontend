document.addEventListener("DOMContentLoaded", async () => {

    const tbody = document.querySelector("#exam-history-body");

    const data = await Api.getExamHistory(studentId);

    tbody.innerHTML = data.map(exam => `
        <tr>
            <td>${exam.date}</td>
            <td>${exam.result === 'approved' ? 'Aprobado' : 'Suspendido'}</td>
            <td>${exam.notes ?? '-'}</td>
        </tr>
    `).join('');

    const approved = data.filter(e => e.result === 'approved').length;
    const failed = data.filter(e => e.result === 'failed').length;

    new Chart(document.querySelector("#exam-chart"), {
        type: 'pie',
        data: {
            labels: ['Aprobados', 'Suspendidos'],
            datasets: [{
                data: [approved, failed],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        }
    });

});
