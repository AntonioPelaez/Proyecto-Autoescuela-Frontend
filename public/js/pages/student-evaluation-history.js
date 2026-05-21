document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;
    const container = document.getElementById("history-container");

    try {
        const history = await Api.getStudentSkillEvaluationHistory(studentId);

        if (!history.length) {
            container.innerHTML = "<p>No hay histórico de clases.</p>";
            return;
        }

        container.innerHTML = history.map(ev => {

            const teacherName =
                (ev.class_session?.teacher?.user?.name ?? ev.class_session?.teacher?.name ?? "Desconocido") +
                " " +
                (ev.class_session?.teacher?.user?.surname ?? ev.class_session?.teacher?.surname ?? "");

            return `
                <div class="card card-body mb-3">
                    <h4>Clase del ${ev.class_session.session_date} — ${ev.class_session.start_time}</h4>
                    <p><strong>Profesor:</strong> ${teacherName}</p>
                    <ul>
                        ${ev.skill_evaluations.map(s => `
                            <li><strong>${s.driving_skill.name}:</strong> ${s.score}</li>
                        `).join("")}
                    </ul>
                </div>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error cargando el histórico.</p>";
    }
});
