console.log("🔥 JS PERIODO CARGADO");

document.addEventListener("DOMContentLoaded", () => {

    const dateFrom = document.getElementById("date-from");
    const dateTo = document.getElementById("date-to");
    const btnFilter = document.getElementById("btn-filter");
    const loaderTable = document.getElementById("loader-table");
    const tableBody = document.getElementById("fuel-logs-table");

    // -------------------------------
    // GRÁFICA 1: periodo
    // -------------------------------
    const ctxPeriod = document.getElementById("chart-cars-period").getContext("2d");
    const chartPeriod = new Chart(ctxPeriod, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Litros",
                data: [],
                backgroundColor: "#0d6efd"
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    // -------------------------------
    // GRÁFICA 2: global
    // -------------------------------
    const ctxGlobal = document.getElementById("chart-cars-global").getContext("2d");
    const chartGlobal = new Chart(ctxGlobal, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Litros totales",
                data: [],
                backgroundColor: "#ffc107"
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    // Cargar gráfica global al inicio
    loadGlobalChart(chartGlobal);

    // -------------------------------
    // FILTRAR PERIODO
    // -------------------------------
    btnFilter.addEventListener("click", async () => {

        const from = dateFrom.value;
        const to = dateTo.value;

        if (!from || !to) {
            alert("Debes seleccionar ambas fechas.");
            return;
        }

        loaderTable.classList.remove("d-none");
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-muted text-center">
                    Cargando registros...
                </td>
            </tr>
        `;

        try {
            const response = await Api.getFuelLogs({ from, to });

            const logs = Array.isArray(response)
                ? response
                : (response.fuel_logs || response.data || []);

            renderTable(logs);
            renderChartPeriod(logs, chartPeriod);

        } catch (err) {
            console.error(err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-danger text-center">
                        Error cargando registros.
                    </td>
                </tr>
            `;
        } finally {
            loaderTable.classList.add("d-none");
        }
    });

});

// -------------------------------
// TABLA
// -------------------------------
function renderTable(logs) {
    const tableBody = document.getElementById("fuel-logs-table");

    if (!logs.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-muted text-center">
                    No hay registros en este periodo.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = logs.map(l => `
        <tr>
            <td>${l.vehicle.brand} ${l.vehicle.model} — ${l.vehicle.plate_number}</td>
            <td>${new Date(l.created_at).toLocaleString("es-ES")}</td>
            <td>${l.liters} L</td>
            <td>${l.kilometers} km</td>
            <td>${Number(l.amount).toFixed(2)} €</td>
            <td class="text-end">
                <a href="/admin/fuel/${l.id}/edit" class="btn btn-sm btn-secondary">Editar</a>
            </td>
        </tr>
    `).join("");
}

// -------------------------------
// GRÁFICA 1: periodo
// -------------------------------
function renderChartPeriod(logs, chart) {
    const totals = {};

    logs.forEach(l => {
        const name = `${l.vehicle.brand} ${l.vehicle.model}`;
        totals[name] = (totals[name] || 0) + Number(l.liters);
    });

    chart.data.labels = Object.keys(totals);
    chart.data.datasets[0].data = Object.values(totals);
    chart.update();
}

// -------------------------------
// GRÁFICA 2: global
// -------------------------------
async function loadGlobalChart(chart) {
    try {
        const response = await Api.getFuelLogs({});
        const logs = Array.isArray(response)
            ? response
            : (response.fuel_logs || response.data || []);

        const totals = {};

        logs.forEach(l => {
            const name = `${l.vehicle.brand} ${l.vehicle.model}`;
            totals[name] = (totals[name] || 0) + Number(l.liters);
        });

        chart.data.labels = Object.keys(totals);
        chart.data.datasets[0].data = Object.values(totals);
        chart.update();

    } catch (err) {
        console.error(err);
    }
}
