document.addEventListener("DOMContentLoaded", async () => {

    const studentId = window.STUDENT_ID;
    const listContainer = document.getElementById("history-container");
    const chartContainer = document.getElementById("chart-container");
    const skillsModal = document.getElementById("skills-modal");
    const skillsContent = document.getElementById("skills-content");

    const btnListado = document.getElementById("btn-listado");
    const btnGrafica = document.getElementById("btn-grafica");

    let history = [];
    let charts = [];

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
            prepareCharts(history);
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
                    <p><strong>Media:</strong> ${average.toFixed(2)}</p>
                    <p><strong>Profesor:</strong> ${teacherName}</p>
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
    function prepareCharts(data) {
        const chartContainer = document.getElementById("chart-container");
        if (!chartContainer) return;

        const labels = data.map(ev => `${ev.class_session.session_date} ${ev.class_session.start_time}`);
        const skillNames = Array.from(new Set(data.flatMap(ev => ev.skill_evaluations.map(s => s.driving_skill.name))));
        const colors = [
            "#002357", "#198754", "#dc3545", "#fd7e14", "#6610f2",
            "#20c997", "#6f42c1", "#0dcaf0", "#ffc107", "#d63384"
        ];

        charts.forEach(chartInstance => chartInstance.destroy());
        charts = [];

        const averageData = data.map(ev => {
            const total = ev.skill_evaluations.reduce((acc, s) => acc + s.score, 0);
            return ev.skill_evaluations.length ? total / ev.skill_evaluations.length : null;
        });

        chartContainer.innerHTML = `
            <div class="skill-chart mb-4">
                <h4>Media por clase</h4>
                <canvas id="historyChart-average" height="120"></canvas>
            </div>
            ${skillNames.map((skill, index) => `
                <div class="skill-chart mb-4">
                    <h4>${skill}</h4>
                    <canvas id="historyChart-${index}" height="120"></canvas>
                </div>
            `).join("")}
        `;

        const averageCtx = document.getElementById("historyChart-average");
        if (averageCtx) {
            const averageChart = new Chart(averageCtx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: "Media por clase",
                        data: averageData,
                        borderColor: "#0d6efd",
                        backgroundColor: "rgba(13,110,253,0.2)",
                        tension: 0.3,
                        fill: false,
                        spanGaps: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false
                        }
                    },
                    interaction: {
                        mode: "nearest",
                        intersect: false
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMin: 0,
                            suggestedMax: 10
                        }
                    }
                }
            });
            charts.push(averageChart);
        }

        skillNames.forEach((skill, index) => {
            const ctx = document.getElementById(`historyChart-${index}`);
            if (!ctx) return;

            const dataPoints = data.map(ev => {
                const evaluation = ev.skill_evaluations.find(s => s.driving_skill.name === skill);
                return evaluation ? evaluation.score : null;
            });

            const chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: skill,
                        data: dataPoints,
                        borderColor: colors[index % colors.length],
                        backgroundColor: colors[index % colors.length],
                        tension: 0.3,
                        fill: false,
                        spanGaps: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false
                        }
                    },
                    interaction: {
                        mode: "nearest",
                        intersect: false
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMin: 0,
                            suggestedMax: 10
                        }
                    }
                }
            });

            charts.push(chart);
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
