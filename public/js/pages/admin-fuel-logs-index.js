document.addEventListener("DOMContentLoaded", async () => {

    const monthSelect = document.getElementById("month-select");
    const tableBody = document.getElementById("fuel-logs-table");

    const initialMessage = document.getElementById("initial-message");
    const loaderTable = document.getElementById("loader-table");

    const chartMonthsWrapper = document.getElementById("chart-months-wrapper");
    const loaderMonths = document.getElementById("loader-months");
    const loaderCars = document.getElementById("loader-cars");

    let chartMonths = null;
    let chartCars = null;

    loadGlobalVehicleChart();

    monthSelect.addEventListener("change", loadFuelLogsByMonth);

    async function loadFuelLogsByMonth() {

        const month = monthSelect.value;
        if (!month) return;

        // Mostrar loader en el sitio exacto del mensaje inicial
        initialMessage.classList.add("d-none");
        loaderTable.classList.remove("d-none");

        chartMonthsWrapper.classList.remove("d-none");
        loaderMonths.classList.remove("d-none");

        try {
            const response = await Api.getFuelLogs({ month });

            const logs = Array.isArray(response)
                ? response
                : (response.fuel_logs || response.data || []);

            if (logs.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-muted text-center">No hay registros este mes.</td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = logs.map(l => `
                    <tr>
                        <td>${l.vehicle.brand} ${l.vehicle.model} — ${l.vehicle.plate_number}</td>
                        <td>${l.liters} L</td>
                        <td>${l.kilometers ?? 0} km</td>
                        <td class="text-end">
                            <a href="/admin/fuel/${l.id}/edit" class="btn btn-sm btn-secondary">Editar</a>
                        </td>
                    </tr>
                `).join("");
            }

            loaderTable.classList.add("d-none");

            setTimeout(() => {
                renderChartMonths(logs, month);
            }, 50);

        } catch (err) {
            console.error(err);
            loaderTable.classList.add("d-none");
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-danger text-center">Error cargando datos.</td>
                </tr>
            `;
        }
    }

    async function loadGlobalVehicleChart() {
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

            const labels = Object.keys(totals);
            const liters = Object.values(totals);

            loaderCars.classList.add("d-none");

            setTimeout(() => {
                renderChartCars(labels, liters);
            }, 50);

        } catch (err) {
            console.error(err);
            loaderCars.innerHTML = "Error cargando gráfica.";
        }
    }

    function renderChartMonths(logs, month) {
        const ctx = document.getElementById("chart-months");
        if (!ctx) return;

        const totals = {};

        logs.forEach(l => {
            const name = `${l.vehicle.brand} ${l.vehicle.model}`;
            totals[name] = (totals[name] || 0) + Number(l.liters);
        });

        const labels = Object.keys(totals);
        const liters = Object.values(totals);

        if (chartMonths) chartMonths.destroy();

        loaderMonths.classList.add("d-none");

        chartMonths = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: `Litros por vehículo (${month})`,
                    data: liters,
                    backgroundColor: "#0d6efd"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    function renderChartCars(labels, liters) {
        const ctx = document.getElementById("chart-cars");
        if (!ctx) return;

        if (chartCars) chartCars.destroy();

        chartCars = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Litros totales",
                    data: liters,
                    backgroundColor: "#ffc107"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

});
