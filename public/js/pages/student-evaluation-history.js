document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;
    const listContainer = document.getElementById("history-container");
    const chartContainer = document.getElementById("chart-container");
    const skillsModal = document.getElementById("skills-modal");
    const skillsContent = document.getElementById("skills-content");

    const btnListado = document.getElementById("btn-listado");
    const btnGrafica = document.getElementById("btn-grafica");

    let history = [];
    let chart = null;

    // -----------------------------
    // BOTONES LISTADO / GRÁFICA
    // -----------------------------
    btnListado.onclick = () => {
        listContainer.style.display = "block";
        chartContainer.style.display = "none";

        btnListado.classList.add("active");
        btnListado.classList.remove("inactive");

        btnGrafica.classList.add("inactive");
        btnGrafica.classList.remove("active");
    };

    btnGrafica.onclick = () => {
        listContainer.style.display = "none";
        chartContainer.style.display = "block";

        btnGrafica.classList.add("active");
        btnGrafica.classList.remove("inactive");

        btnListado.classList.add("inactive");
        btnListado.classList.remove("active");
    };

    // -----------------------------
    // CARGAR HISTÓRICO
    // -----------------------------
    try {
        history = await Api.getStudentSkillEvaluationHistory(studentId);

        if (!history.length) {
            listContainer.innerHTML = "<p>No hay histórico de clases.</p>";
            return;
        }

        renderList(history);

        if (window.Chart) {
            prepareChart(history);
        }

    } catch (err) {
        console.error(err);
        listContainer.innerHTML = "<p>Error cargando el histórico.</p>";
    }

    // -----------------------------
    // RENDERIZAR LISTADO
    // -----------------------------
    function renderList(data) {
        listContainer.innerHTML = data.map(ev => {

            const teacherName =
                (ev.class_session?.teacher?.user?.name ?? "Desconocido") + " " +
                ((ev.class_session?.teacher?.user?.surname1 ?? "") + " " +
                (ev.class_session?.teacher?.user?.surname2 ?? "")).trim();

            const average =
                ev.skill_evaluations.reduce((acc, s) => acc + s.score, 0) /
                ev.skill_evaluations.length;

            return `
                <div class="card card-body mb-3 history-item" data-id="${ev.id}">
                    <h4>Clase del ${ev.class_session.session_date} — ${ev.class_session.start_time}</h4>
                    <p><strong>Profesor:</strong> ${teacherName}</p>
                    <p><strong>Media:</strong> ${average.toFixed(2)}</p>
                </div>
            `;
        }).join("");

        document.querySelectorAll(".history-item").forEach(item => {
            item.addEventListener("click", () => {
                const id = item.getAttribute("data-id");
                const clase = history.find(h => h.id == id);
                showSkills(clase);
            });
        });
    }

    // -----------------------------
    // GRÁFICA
    // -----------------------------
    function prepareChart(data) {
        const ctx = document.getElementById("historyChart");
        if (!ctx) return;

        const labels = data.map(ev => ev.class_session.session_date);
        const averages = data.map(ev =>
            ev.skill_evaluations.reduce((acc, s) => acc + s.score, 0) /
            ev.skill_evaluations.length
        );

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Media por clase",
                    data: averages,
                    borderColor: "#0d6efd",
                    backgroundColor: "rgba(13,110,253,0.2)",
                    tension: 0.3
                }]
            }
        });
    }

    // -----------------------------
    // MODAL DETALLE
    // -----------------------------
    function showSkills(clase) {
        skillsContent.innerHTML = `
            <p><strong>Clase del ${clase.class_session.session_date}</strong></p>
            <ul>
                ${clase.skill_evaluations.map(s => `
                    <li><strong>${s.driving_skill.name}:</strong> ${s.score}</li>
                `).join("")}
            </ul>
        `;

        skillsModal.style.display = "flex";
    }

    document.getElementById("close-modal").onclick = () => {
        skillsModal.style.display = "none";
    };

});
