document.addEventListener("DOMContentLoaded", async () => {

    const classId = window.CLASS_SESSION_ID;
    const infoEl = document.getElementById("class-info");
    const skillsContainer = document.getElementById("skills-container");
    const form = document.getElementById("skills-form");

    try {
        // 1. Cargar datos de la clase
        const classData = await Api.getClassSession(classId);

        const studentName = classData.student?.user?.name + " " + classData.student?.user?.surname;
        const date = classData.date;
        const time = classData.time;

        infoEl.innerHTML = `
            Alumno: <strong>${studentName}</strong><br>
            Fecha: <strong>${date}</strong> — Hora: <strong>${time}</strong>
        `;

        // 2. Cargar skills
        const skillsData = await Api.getStudentSkillEvaluations();
        const skills = skillsData.skills || skillsData;

        skillsContainer.innerHTML = skills.map(skill => `
            <div class="col-md-3 mb-3">
                <label><strong>${skill.name}</strong></label>
                <input type="number"
                       class="form-control skill-score"
                       data-skill-id="${skill.id}"
                       min="1" max="10"
                       required>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
        infoEl.innerHTML = "Error cargando información de la clase.";
    }

    // 3. Guardar y pasar al reporte
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const scores = [...document.querySelectorAll(".skill-score")].map(input => ({
            skill_id: input.dataset.skillId,
            score: parseInt(input.value, 10)
        }));

        sessionStorage.setItem(
            `class_eval_${classId}`,
            JSON.stringify({ scores })
        );

        window.location.href = `/teacher/classes/${classId}/evaluate-report`;
    });
});
