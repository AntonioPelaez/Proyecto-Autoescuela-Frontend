// ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // Inicialización
    // ─────────────────────────────────────────────

    document.addEventListener("DOMContentLoaded", async () => {
        // Dar tiempo a que se inicialicen los scripts con defer
        setTimeout(async () => {
            try {
                Router.init();
            } catch (err) {
                console.error("Error en Router.init():", err);
            }

            try {
                const me = await Api.getMe();
                studentId = me?.student_profile?.id;

                await loadTownsFilter();
                await loadConvocatorias();

                // Event listeners
                const townFilter = document.getElementById(FILTER_TOWN_ID);
                const dateFilter = document.getElementById(FILTER_DATE_ID);
                const resetBtn = document.getElementById(FILTER_RESET_ID);

                if (townFilter) townFilter.addEventListener("change", applyFilters);
                if (dateFilter) dateFilter.addEventListener("change", applyFilters);
                if (resetBtn) resetBtn.addEventListener("click", resetFilters);

            } catch (error) {
                console.error("Error inicializando:", error);
                showMessage("error", "Error al inicializar la página: " + (error.message || "desconocido"));
            }
        }, 100);
    });

    // ─────────────────────────────────────────────
    // Funciones principales
    // ─────────────────────────────────────────────

    async function loadTownsFilter() {
        try {
            const townSelect = document.getElementById(FILTER_TOWN_ID);
            if (!townSelect) {
                console.warn("Town select element not found");
                return;
            }

            const towns = await Api.getTowns();
            
            const townArray = Array.isArray(towns) ? towns : towns?.data ?? [];
            
            townArray.forEach(town => {
                const option = document.createElement("option");
                option.value = town.id;
                option.textContent = town.name;
                townSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error cargando poblaciones:", error);
        }
    }

    async function loadConvocatorias() {
        const tbody = document.getElementById(CONVOCATORIAS_TBODY_ID);
        if (!tbody) {
            console.error("Convocatorias tbody not found");
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Cargando...</td></tr>';

        try {
            const response = await Api.getExamCalls();
            allConvocatorias = Array.isArray(response) ? response : response?.data ?? [];

            // Filtrar solo convocatorias futuras y abiertas
            const now = new Date();
            allConvocatorias = allConvocatorias.filter(c => {
                if (!c.exam_date) return false;
                const examDate = new Date(c.exam_date);
                const status = String(c.exam_status || "").toLowerCase();
                // Mostrar convocatorias creadas o abiertas que no hayan pasado
                return examDate >= now && (status === "creada" || status === "abierta");
            });

            if (!allConvocatorias.length) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">No hay convocatorias disponibles.</td></tr>';
                return;
            }

            applyFilters();

        } catch (error) {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #d32f2f;">Error cargando convocatorias.</td></tr>';
        }
    }

    function applyFilters() {
        const townSelect = document.getElementById(FILTER_TOWN_ID);
        const dateInput = document.getElementById(FILTER_DATE_ID);
        
        if (!townSelect || !dateInput) {
            console.warn("Filter elements not found");
            return;
        }

        const townFilter = townSelect.value;
        const dateFilter = dateInput.value;

        let filtered = allConvocatorias;

        if (townFilter) {
            filtered = filtered.filter(c => String(c.town_id) === String(townFilter));
        }

        if (dateFilter) {
            filtered = filtered.filter(c => {
                const examDate = new Date(c.exam_date).toISOString().split("T")[0];
                return examDate >= dateFilter;
            });
        }

        renderConvocatorias(filtered);
    }

    function resetFilters() {
        const townSelect = document.getElementById(FILTER_TOWN_ID);
        const dateInput = document.getElementById(FILTER_DATE_ID);
        
        if (!townSelect || !dateInput) {
            console.warn("Filter elements not found");
            return;
        }

        townSelect.value = "";
        dateInput.value = "";
        renderConvocatorias(allConvocatorias);
    }

    async function renderConvocatorias(convocatorias) {
        const tbody = document.getElementById(CONVOCATORIAS_TBODY_ID);
        if (!tbody) {
            console.error("Convocatorias tbody not found");
            return;
        }

        if (!convocatorias.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">No hay convocatorias que cumplan los filtros.</td></tr>';
            return;
        }

        tbody.innerHTML = await Promise.all(convocatorias.map(async c => {
            return await renderConvocatoriaRow(c);
        })).then(rows => rows.join(""));

        // Agregar event listeners a los botones
        tbody.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", handleConvocationAction);
        });
    }

    async function renderConvocatoriaRow(convocation) {
        try {
            const examDate = new Date(convocation.exam_date);
            const formattedDate = `${examDate.getDate().toString().padStart(2, "0")}/${(examDate.getMonth() + 1).toString().padStart(2, "0")}/${examDate.getFullYear()}`;
            const startTime = convocation.start_time || "-";

            // Obtener nombre de población
            const townName = convocation.town?.name || `Población #${convocation.town_id || "?"}`;

            // Obtener nombre de profesor
            const teacherName = convocation.teacher?.user
                ? `${convocation.teacher.user.name} ${convocation.teacher.user.surname1 || ""}`
                : "Por asignar";

            // Obtener nombre de vehículo
            const vehicleName = convocation.vehicle
                ? `${convocation.vehicle.brand} ${convocation.vehicle.model}`
                : "Por asignar";

            // Calcular plazas disponibles
            const totalPlaces = convocation.max_students || 0;
            const enrolledCount = convocation.exam_students?.length || 0;
            const availablePlaces = Math.max(0, totalPlaces - enrolledCount);
            const placesText = availablePlaces > 0 ? availablePlaces : "Lleno";
            const placesColor = availablePlaces > 0 ? "inherit" : "#d32f2f";

            // Verificar si el estudiante ya está inscrito
            const isEnrolled = convocation.exam_students?.some(
                s => Number(s.student_id) === Number(studentId)
            );

            const studentRecord = convocation.exam_students?.find(
                s => Number(s.student_id) === Number(studentId)
            );

            let status = "Disponible";
            let statusClass = "";
            let actionBtn = "";

            if (isEnrolled) {
                const isConfirmed = studentRecord && (
                    Number(studentRecord.student_confirmed) === 1 ||
                    Number(studentRecord.teacher_approved) === 1
                );
                const isPending = studentRecord && !isConfirmed;

                if (isPending) {
                    status = "Confirmación Pendiente";
                    statusClass = "badge-warning";
                    actionBtn = `
                        <button class="btn btn-sm btn-danger" data-action="unconfirm" data-id="${convocation.id}">
                            Cancelar inscripción
                        </button>
                    `;
                } else if (isConfirmed) {
                    status = "Inscrito";
                    statusClass = "badge-success";
                    actionBtn = `
                        <button class="btn btn-sm btn-danger" data-action="unconfirm" data-id="${convocation.id}">
                            Cancelar inscripción
                        </button>
                    `;
                }
            } else {
                if (availablePlaces > 0) {
                    actionBtn = `
                        <button class="btn btn-sm btn-success" data-action="confirm" data-id="${convocation.id}">
                            Inscribirse
                        </button>
                    `;
                } else {
                    actionBtn = `<span class="text-muted">Sin plazas</span>`;
                }
            }

            const statusBadge = statusClass 
                ? `<span class="badge ${statusClass}">${status}</span>`
                : `<span>${status}</span>`;

            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${startTime}</td>
                    <td>${townName}</td>
                    <td>${teacherName}</td>
                    <td>${vehicleName}</td>
                    <td style="color: ${placesColor}">${placesText}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        } catch (error) {
            console.error("Error renderizando convocatoria:", error);
            return `<tr><td colspan="8" style="color: #d32f2f;">Error en la fila</td></tr>`;
        }
    }

    async function handleConvocationAction(e) {
        const btn = e.target;
        const action = btn.dataset.action;
        const convocationId = btn.dataset.id;

        UI.setLoading(true);
        try {
            if (action === "confirm") {
                await Api.confirmExamCall(convocationId, studentId);
                showMessage("success", "¡Te has inscrito en la convocatoria! Estado: Confirmación Pendiente");
            } else if (action === "unconfirm") {
                await Api.unconfirmExamCall(convocationId, studentId);
                showMessage("success", "Has cancelado tu inscripción en la convocatoria.");
            }

            await loadConvocatorias();

        } catch (error) {
            showMessage("error", error.message || "Error al procesar la acción.");
        } finally {
            UI.setLoading(false);
        }
    }

    // ─────────────────────────────────────────────
    // Funciones auxiliares
    // ─────────────────────────────────────────────

    function showMessage(type, message) {
        const messageBox = document.getElementById(MESSAGE_STATE_ID);
        if (!messageBox) {
            console.warn("Message box not found, logging message:", type, message);
            return;
        }
        messageBox.className = `message-state message-state-${type}`;
        messageBox.textContent = message;
        messageBox.style.display = "block";

        setTimeout(() => {
            messageBox.style.display = "none";
        }, 5000);
    }

})();
