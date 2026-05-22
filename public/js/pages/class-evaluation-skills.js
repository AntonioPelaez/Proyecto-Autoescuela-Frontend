document.addEventListener("DOMContentLoaded", async () => {

    const classId = window.CLASS_SESSION_ID;
    const infoEl = document.getElementById("class-info");
    const skillsContainer = document.getElementById("skills-container");
    const form = document.getElementById("skills-form");

    try {
        // 1. Obtener datos de la clase
        const classData = await Api.getTeacherBookings(); 
        const classInfo = classData.find(c => c.id == classId);

        if (!classInfo) {
            infoEl.innerHTML = "No se encontró la información de la clase.";
            return;
        }

        infoEl.innerHTML = `
            Alumno: <strong>${classInfo.studentName}</strong><br>
            Fecha: <strong>${classInfo.date}</strong> — Hora: <strong>${classInfo.time}</strong>
        `;

        // 2. Cargar skills
        const skillsData = await Api.getStudentSkillEvaluations();
        const skills = skillsData.skills || skillsData;

        skillsContainer.innerHTML = skills.map(skill => `
            <div class="col-md-3">
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
        infoEl.innerHTML = "Error cargando información.";
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
