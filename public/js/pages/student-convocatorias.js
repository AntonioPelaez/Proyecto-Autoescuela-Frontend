/// ─────────────────────────────────────────────
// student-convocatorias.js — Convocatorias disponibles
// ─────────────────────────────────────────────

(function () {
    "use strict";

    const CONVOCATORIAS_TBODY_ID = "convocatorias-tbody";
    const FILTER_TOWN_ID = "filter-town";
    const FILTER_DATE_ID = "filter-date";
    const FILTER_RESET_ID = "filter-reset";
    const MESSAGE_STATE_ID = "message-state";

    let allConvocatorias = [];
    let studentId = null;

    document.addEventListener("DOMContentLoaded", async () => {
        setTimeout(async () => {
            try { Router.init(); } catch {}

            try {
                const me = await Api.getMe();
                studentId = me?.student_profile?.id;

                await loadTownsFilter();
                await loadConvocatorias();

                document.getElementById(FILTER_TOWN_ID)?.addEventListener("change", applyFilters);
                document.getElementById(FILTER_DATE_ID)?.addEventListener("change", applyFilters);
                document.getElementById(FILTER_RESET_ID)?.addEventListener("click", resetFilters);

            } catch (error) {
                showMessage("error", "Error al inicializar la página.");
            }
        }, 100);
    });

    // ─────────────────────────────────────────────
    // Cargar poblaciones
    // ─────────────────────────────────────────────

    async function loadTownsFilter() {
        try {
            const townSelect = document.getElementById(FILTER_TOWN_ID);
            const towns = await Api.getTowns();
            const list = Array.isArray(towns) ? towns : towns?.data ?? [];

            list.forEach(town => {
                const opt = document.createElement("option");
                opt.value = town.id;
                opt.textContent = town.name;
                townSelect.appendChild(opt);
            });
        } catch (error) {
            console.error("Error cargando poblaciones:", error);
        }
    }

    // ─────────────────────────────────────────────
    // Cargar convocatorias
    // ─────────────────────────────────────────────

    async function loadConvocatorias() {
        const tbody = document.getElementById(CONVOCATORIAS_TBODY_ID);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">Cargando...</td></tr>';

        try {
            const response = await Api.getExamCalls();
            allConvocatorias = Array.isArray(response) ? response : response?.data ?? [];

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            allConvocatorias = allConvocatorias.filter(c => {
                if (!c.exam_date) return false;
                const examDate = new Date(c.exam_date);
                return examDate >= today && Number(c.exam_call_status_id) === 1;
            });

            if (!allConvocatorias.length) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#999;">No hay convocatorias disponibles.</td></tr>';
                return;
            }

            applyFilters();

        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#d32f2f;">Error cargando convocatorias.</td></tr>';
        }
    }

    // ─────────────────────────────────────────────
    // Filtros
    // ─────────────────────────────────────────────

    function applyFilters() {
        const town = document.getElementById(FILTER_TOWN_ID).value;
        const date = document.getElementById(FILTER_DATE_ID).value;

        let filtered = allConvocatorias;

        if (town) filtered = filtered.filter(c => String(c.town_id) === town);
        if (date) filtered = filtered.filter(c => c.exam_date >= date);

        renderConvocatorias(filtered);
    }

    function resetFilters() {
        document.getElementById(FILTER_TOWN_ID).value = "";
        document.getElementById(FILTER_DATE_ID).value = "";
        renderConvocatorias(allConvocatorias);
    }

    // ─────────────────────────────────────────────
    // Render tabla
    // ─────────────────────────────────────────────

    async function renderConvocatorias(list) {
        const tbody = document.getElementById(CONVOCATORIAS_TBODY_ID);

        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#999;">No hay convocatorias que cumplan los filtros.</td></tr>';
            return;
        }

        tbody.innerHTML = (await Promise.all(list.map(renderConvocatoriaRow))).join("");

        tbody.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", handleConvocationAction);
        });
    }

    function normalizeBoolean(value) {
        return [1, "1", true, "true"].includes(value);
    }

    // ─────────────────────────────────────────────
    // LÓGICA DE ESTADOS + PROFESOR/VEHÍCULO CORREGIDOS
    // ─────────────────────────────────────────────

    async function renderConvocatoriaRow(c) {
        const date = new Date(c.exam_date);
        const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

        // 🔥 PROFESOR Y VEHÍCULO CORRECTOS (desde la convocatoria)
        const teacherName = c.teacher?.user
            ? `${c.teacher.user.name} ${c.teacher.user.surname1 ?? ""}`
            : "Por asignar";

        const vehicleName = c.vehicle
            ? `${c.vehicle.brand} ${c.vehicle.model}`
            : "Por asignar";

        const total = c.max_students || 0;
        const enrolled = c.exam_students?.length || 0;
        const available = Math.max(0, total - enrolled);

        // ─────────────────────────────────────────────
        // BUSCAR REGISTRO DEL ALUMNO
        // ─────────────────────────────────────────────
        let studentRecord = null;

        if (Array.isArray(c.exam_students)) {
            studentRecord = c.exam_students.find(s =>
                Number(s.student_id) === Number(studentId)
            ) || null;
        }

        let status = "";
        let statusClass = "";
        let actionBtn = "";

        // DISPONIBLE
        if (!studentRecord || Number(studentRecord.exam_result_status_id) === 4) {
            status = "Disponible";
            statusClass = "badge-primary";

            actionBtn = available > 0
                ? `<button class="btn btn-sm btn-success" data-action="confirm" data-id="${c.id}">Inscribirse</button>`
                : `<span class="text-muted">Sin plazas</span>`;
        }

        // PENDIENTE
        else if (
            Number(studentRecord.exam_result_status_id) === 1 &&
            Number(studentRecord.student_confirmed) === 0
        ) {
            status = "Pendiente";
            statusClass = "badge-warning";
            actionBtn = `
                <button class="btn btn-sm btn-danger" data-action="unconfirm" data-id="${c.id}">
                    Cancelar solicitud
                </button>
            `;
        }

        // INSCRITO
        else if (
            Number(studentRecord.exam_result_status_id) === 1 &&
            Number(studentRecord.student_confirmed) === 1
        ) {
            status = "Inscrito";
            statusClass = "badge-success";
            actionBtn = `
                <button class="btn btn-sm btn-danger" data-action="unconfirm" data-id="${c.id}">
                    Cancelar inscripción
                </button>
            `;
        }

        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${c.start_time}</td>
                <td>${c.town?.name ?? "—"}</td>
                <td>${teacherName}</td>
                <td>${vehicleName}</td>
                <td style="color:${available > 0 ? "inherit" : "#d32f2f"}">${available > 0 ? available : "Lleno"}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }

    // ─────────────────────────────────────────────
    // Acciones
    // ─────────────────────────────────────────────

    async function handleConvocationAction(e) {
        const btn = e.target;
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        UI.setLoading(true);

        try {
            if (action === "confirm") {
                await Api.confirmExamCall(id, studentId);
                showMessage("success", "Solicitud enviada.");
            } else if (action === "unconfirm") {
                window.location.href = `/student/convocatorias/${id}/cancel`;
            }

            await loadConvocatorias();

        } catch (error) {
            showMessage("error", error.message || "Error al procesar la acción.");
        } finally {
            UI.setLoading(false);
        }
    }

    // ─────────────────────────────────────────────
    // Mensajes
    // ─────────────────────────────────────────────

    function showMessage(type, message) {
        const box = document.getElementById(MESSAGE_STATE_ID);
        box.className = `message-state message-state-${type}`;
        box.textContent = message;
        box.style.display = "block";

        setTimeout(() => box.style.display = "none", 5000);
    }

})();
