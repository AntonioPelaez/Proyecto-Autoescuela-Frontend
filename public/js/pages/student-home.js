(function () {
    "use strict";

    const ROOT_ID = "student-home-page";
    const STATE_ID = "student-home-state";
    const NEXT_CLASS_ID = "student-next-class";
    const NEXT_EXAM_CALL_ID = "student-next-exam";
    const SUMMARY_ID = "student-summary";
    const HISTORY_BODY_ID = "student-history-body";
    const QUICK_FORM_ID = "student-quick-form";
    const QUICK_TOWN_ID = "quick-town";
    const QUICK_DATE_ID = "quick-date";
    const QUICK_RESULTS_ID = "student-quick-results";
async function loadTotalSpent() {
    try {
        const me = await Api.getMe();
        const studentId = me.student_profile.id;

        const result = await Api.totalSpent(studentId);

        // Normalizar respuesta
        const total = Number(
            result.total_spent ??
            result.data?.total_spent ??
            result.raw?.total_spent ??
            0
        );

        const el = document.getElementById("student-total-spent");
        if (el) el.textContent = `€${total.toFixed(2)}`;

    } catch (err) {
        console.error("Error cargando total gastado:", err);
    }
}


    function formatDate(value) {
        const raw = String(value || "").trim();
        if (!raw) {
            return "";
        }

        // Formato ISO: YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
            const parts = raw.slice(0, 10).split("-");
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        // Si ya está en formato DD/MM/YYYY, devolverlo como está
        if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
            return raw.slice(0, 10);
        }

        return raw;
    }

    function formatBookingTime(value) {
        const raw = String(value || "").trim();
        if (!raw) {
            return "00:00";
        }

        if (raw.length >= 16 && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(raw)) {
            return raw.slice(11, 16);
        }

        if (/^\d{2}:\d{2}/.test(raw)) {
            return raw.slice(0, 5);
        }

        return raw;
    }

    function _normalizeStatus(raw) {
        const s = String(raw || "").toLowerCase();
        if (s === "confirmada" || s === "confirmed" || s === "booked")
            return "confirmada";
        if (s === "cancelada" || s === "cancelled" || s === "canceled")
            return "cancelada";
        if (s === "en_curso" || s === "in_progress") return "en_curso";
        if (s === "completada" || s === "completed") return "completada";
        if (s === "pending") return "confirmada";
        return s || "confirmada";
    }

    function normalizeBookingRecord(booking) {
        const teacherId =
            booking &&
            (booking.teacher_id ||
                booking.teacher_profile_id ||
                (booking.teacher && booking.teacher.id));

        return {
            ...booking,

            date:
                booking?.date ||
                booking?.session_date ||
                booking?.scheduled_date ||
                "",
            time:
                booking?.time ||
                formatBookingTime(
                    booking?.start_time ||
                        booking?.slot_starts_at ||
                        booking?.start,
                ),

            professorName:
                booking?.professorName ||
                booking?.teacher_name ||
                booking?.teacherName ||
                booking?.teacher?.name ||
                (teacherId ? `Profesor #${teacherId}` : "-"),

            // ✔ VEHÍCULO — PRIORIDAD AL BACKEND
            vehicle:
                (booking?.vehicle_brand && booking?.vehicle_model
                    ? `${booking.vehicle_brand} ${booking.vehicle_model}`
                    : null) ||
                booking?.vehicle_name ||
                booking?.vehicle_label ||
                (booking?.vehicle &&
                booking.vehicle.brand &&
                booking.vehicle.model
                    ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                    : null) ||
                (typeof booking?.vehicle === "string"
                    ? booking.vehicle
                    : null) ||
                null,

            status: _normalizeStatus(booking?.status),
        };
    }

    function getDateTimeValue(item) {
        const date = item && item.date ? item.date : "";
        const time = item && item.time ? item.time : "00:00";
        const dt = new Date(date + "T" + time + ":00");
        if (Number.isNaN(dt.getTime())) {
            return null;
        }
        return dt;
    }

    function sortByDateTimeAsc(items) {
        return items.slice().sort(function (a, b) {
            const da = getDateTimeValue(a);
            const db = getDateTimeValue(b);
            if (!da || !db) {
                return 0;
            }
            return da.getTime() - db.getTime();
        });
    }

    function showState(type, message) {
        const el = document.getElementById(STATE_ID);
        if (!el) {
            return;
        }

        if (!message) {
            el.className = "hidden";
            el.textContent = "";
            return;
        }

        const classes = {
            success: "card card-body",
            error: "card card-body input-error",
            info: "card card-body",
        };

        el.className = classes[type] || classes.info;
        el.textContent = message;
    }

    function renderNextClass(bookings) {
        const container = document.getElementById(NEXT_CLASS_ID);
        if (!container) {
            return;
        }

        container.replaceChildren();

        const now = new Date();
        const upcoming = sortByDateTimeAsc(bookings).find(function (booking) {
            const value = getDateTimeValue(booking);
            return value && value >= now;
        });

        if (!upcoming) {
            const paragraph = document.createElement("p");
            paragraph.textContent = "No tienes proximas clases reservadas.";
            container.appendChild(paragraph);
            return;
        }

        const vehicle = upcoming.vehicle || "Sin vehiculo asignado";

        appendLabelValue(container, "Fecha:", formatDate(upcoming.date));
        appendLabelValue(container, "Hora:", upcoming.time);
        appendLabelValue(container, "Profesor:", upcoming.professorName);
        appendLabelValue(container, "Vehiculo:", vehicle);
    }

    function renderSummary(bookings) {
        const container = document.getElementById(SUMMARY_ID);
       
        if (!container) {
            return;
        }

        container.replaceChildren();

        const totals = bookings.reduce(
            function (acc, booking) {
                acc.total += 1;

                const status = (booking.status || "").toLowerCase();

                if (status.includes("confirm")) {
                    acc.confirmed += 1;
                } else if (status.includes("cancel")) {
                    acc.canceled += 1;
                } else if (status.includes("complet")) {
                    acc.completed += 1;
                }

                return acc;
            },
            { total: 0, confirmed: 0, completed: 0, canceled: 0 },
        );

        container.appendChild(createBadge("Total: " + totals.total));
        container.appendChild(createBadge("Confirmadas: " + totals.confirmed));
        container.appendChild(createBadge("Completadas: " + totals.completed));
        container.appendChild(createBadge("Canceladas: " + totals.canceled));
    }

    function renderHistory(bookings) {
        const tbody = document.getElementById(HISTORY_BODY_ID);
        if (!tbody) {
            return;
        }

        tbody.replaceChildren();

        const sorted = sortByDateTimeAsc(bookings);
        if (!sorted.length) {
            const row = document.createElement("tr");
            row.className = "table-empty";
            const cell = document.createElement("td");
            cell.colSpan = 6;
            cell.textContent = "No hay clases para mostrar.";
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }

        sorted.forEach(function (booking) {
            const row = document.createElement("tr");
            
            // Crear celda de acciones
            const actionCell = document.createElement("td");
let html = "";

// ✔ Mostrar informe SOLO si está completada
if (booking.status === "completada") {
    html += `
        <button class="btn btn-info btn-sm view-report-btn" data-session-id="${booking.id}">
            Ver informe
        </button>
    `;
}

// ✔ Mostrar ticket SIEMPRE que tenga payment_intent_id
if (booking.payment_intent_id) {
    html += `
        <button class="btn btn-success btn-sm download-ticket-btn" data-session-id="${booking.id}">
            Ticket
        </button>
    `;
} else {
    html += `<span class="badge bg-warning">Sin pago</span>`;
}

actionCell.innerHTML = html;


            
            row.append(
                createCell(formatDate(booking.date)),
                createCell(booking.time),
                createCell(booking.professorName || "-"),
                createCell(booking.vehicle || "Sin vehiculo asignado"),
                createCell(_formatStatus(booking.status)),
                actionCell,
            );
            tbody.appendChild(row);
        });
    }

    function _formatStatus(status) {
        const map = {
            confirmada: "Confirmada",
            pendiente: "Pendiente",
            cancelada: "Cancelada",
            en_curso: "En curso",
            completada: "Completada",
        };
        return map[status] || status || "-";
    }

    function renderQuickResults(slots) {
        const container = document.getElementById(QUICK_RESULTS_ID);
        if (!container) {
            return;
        }

        container.replaceChildren();

        if (!slots.length) {
            const paragraph = document.createElement("p");
            paragraph.className = "table-empty";
            paragraph.textContent = "No hay huecos para esa fecha y poblacion.";
            container.appendChild(paragraph);
            return;
        }

        const table = document.createElement("table");
        table.className = "table table-striped table-hover";

        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        headRow.append(
            createHeadCell("Hora"),
            createHeadCell("Profesor"),
            createHeadCell("Vehiculo"),
        );
        thead.appendChild(headRow);

        const tbody = document.createElement("tbody");
        slots.forEach(function (slot) {
            const row = document.createElement("tr");
            row.append(
                createCell(slot.time),
                createCell(slot.professorName),
                createCell(slot.vehicle || "Sin vehiculo asignado"),
            );
            tbody.appendChild(row);
        });

        table.append(thead, tbody);
        container.appendChild(table);
    }

    function normalizeQuickSlots(apiResponse) {
        const payload =
            apiResponse && apiResponse.data ? apiResponse.data : apiResponse;
        const groupedSlots =
            payload && Array.isArray(payload.slots) ? payload.slots : [];
        const result = [];

        groupedSlots.forEach(function (teacherBlock) {
            const teacherName =
                teacherBlock && teacherBlock.teacher_name
                    ? teacherBlock.teacher_name
                    : "Profesor";
            const vehicle =
                teacherBlock &&
                (teacherBlock.vehicle_name ||
                    teacherBlock.vehicle_label ||
                    teacherBlock.vehicle)
                    ? teacherBlock.vehicle_name ||
                      teacherBlock.vehicle_label ||
                      teacherBlock.vehicle
                    : "Sin vehiculo asignado";
            const slots =
                teacherBlock && Array.isArray(teacherBlock.slots)
                    ? teacherBlock.slots
                    : [];

            slots.forEach(function (slot) {
                if (slot && slot.reserved) {
                    return;
                }

                const raw = slot
                    ? slot.start ||
                      slot.slot_starts_at ||
                      slot.starts_at ||
                      slot.time
                    : "";
                const time =
                    raw && String(raw).includes("T")
                        ? String(raw).split("T")[1].slice(0, 5)
                        : String(raw || "").slice(0, 5);

                if (!time) {
                    return;
                }

                result.push({
                    time: time,
                    professorName: teacherName,
                    vehicle: vehicle,
                });
            });
        });

        return result;
    }

    async function loadTowns() {
        const townSelect = document.getElementById(QUICK_TOWN_ID);
        if (!townSelect) {
            return;
        }

        const response = await Api.getTowns();
        const towns = response.data || response || [];
        const active = towns.filter(function (town) {
            return town.is_active;
        });
        townSelect.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona una poblacion";
        townSelect.appendChild(defaultOption);
        active.forEach(function (town) {
            const option = document.createElement("option");
            option.value = String(town.id);
            option.textContent = town.name;
            townSelect.appendChild(option);
        });
    }

    function appendLabelValue(container, label, value) {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label + " ";
        paragraph.append(strong, document.createTextNode(String(value || "-")));
        container.appendChild(paragraph);
    }
async function loadNextConvocation() {
    const box = document.getElementById(NEXT_EXAM_CALL_ID);
    if (!box) return;

    function normalizeExamCallPayload(data) {
        if (!data) return null;
        if (data.exam_call) return data.exam_call;
        if (data.data?.exam_call) return data.data.exam_call;
        return null;
    }

    function getTownLabel(exam) {
        return exam?.town?.name || "-";
    }

    async function resolveTownName(exam) {
        const label = getTownLabel(exam);
        if (label !== "-" && !label.startsWith("Población #")) return label;

        const towns = await loadStudentHomeTownsCache();
        const id = exam.town_id || exam.town?.id || null;

        if (id) {
            const town = towns.find(t => String(t.id) === String(id));
            if (town?.name) return town.name;
        }

        return label;
    }

    function getStudentList(exam) {
        if (!exam?.exam_students?.length) return "-";

        return exam.exam_students
            .map(s => {
                const user = s.student?.user;
                if (!user) return "Alumno";
                return `${user.name} ${user.surname1 ?? ""} ${user.surname2 ?? ""}`.trim();
            })
            .join(", ");
    }

    try {
        box.innerHTML = '<div class="loader loader-inline loader-sm">Cargando…</div>';

        const response = await Api.nextConvocation();
        const exam = normalizeExamCallPayload(response);

        if (!exam) {
            box.innerHTML = '<p class="text-muted">No tienes convocatorias próximas.</p>';
            return;
        }

        const townLabel = await resolveTownName(exam);
        box.replaceChildren();

        appendLabelValue(box, "Fecha:", formatDate(exam.exam_date));
        appendLabelValue(box, "Hora:", exam.start_time);
        appendLabelValue(box, "Población:", townLabel);
        appendLabelValue(box, "Alumnos:", getStudentList(exam));

        // ─────────────────────────────────────────────
        // ESTADO DE CONFIRMACIÓN DEL ESTUDIANTE
        // ─────────────────────────────────────────────
        const me = await Api.getMe();
        const studentId = me.student_profile.id;

        const studentRecord = exam.exam_students?.find(
            s => Number(s.student_id) === Number(studentId)
        );


        const isEnrolled = !!studentRecord;
        const isConfirmed = isEnrolled && (
            Number(studentRecord.student_confirmed) === 1 ||
            Number(studentRecord.teacher_approved) === 1 ||
            String(studentRecord.status_convocatoria || "").toLowerCase() === "confirmada"
        );

        let statusLabel;
        if (!isEnrolled) {
            statusLabel = "No inscrito";
        } else {
            statusLabel = isConfirmed ? "Confirmada" : "No confirmada";
        }

        appendLabelValue(box, "Estado:", statusLabel);

        // ─────────────────────────────────────────────
        // BOTONES SEGÚN ESTADO
        // ─────────────────────────────────────────────
        const btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "15px";
        btnContainer.style.display = "flex";
        btnContainer.style.gap = "10px";

        const examStatus = String(exam.exam_status || "").toLowerCase();
        const isClosed = examStatus === "finalizada" || examStatus === "cancelada";

        // Si la convocatoria está cerrada → no hay botones
        if (isClosed) {
            box.appendChild(btnContainer);
            return;
        }

        // Caso 1: alumno NO inscrito → botón "Confirmar asistencia" (reservar plaza)
        if (!isEnrolled) {
            const confirmBtn = document.createElement("button");
            confirmBtn.className = "btn btn-success";
            confirmBtn.textContent = "Confirmar asistencia";

            confirmBtn.addEventListener("click", async () => {
                UI.setLoading(true);
                try {
                    await Api.confirmExamCall(exam.id, studentId);
                    showState("success", "Te has inscrito y confirmado en la convocatoria.");
                    await loadNextConvocation();
                } catch (err) {
                    showState("error", err.message || "No se pudo confirmar.");
                } finally {
                    UI.setLoading(false);
                }
            });

            btnContainer.appendChild(confirmBtn);
        }

        // Caso 2: alumno inscrito → no mostrar botón de reservar plaza,
        // solo permitir cancelar si ya estaba confirmado.
        if (isEnrolled && isConfirmed) {
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "btn btn-danger";
            cancelBtn.textContent = "Cancelar asistencia";

            cancelBtn.addEventListener("click", async () => {
                UI.setLoading(true);
                try {
                    await Api.unconfirmExamCall(exam.id, studentId);
                    showState("success", "Has cancelado tu asistencia.");
                    await loadNextConvocation();
                } catch (err) {
                    showState("error", err.message || "No se pudo cancelar.");
                } finally {
                    UI.setLoading(false);
                }
            });

            btnContainer.appendChild(cancelBtn);
        }

        box.appendChild(btnContainer);
    } catch (error) {
        console.error(error);
        box.innerHTML = '<p class="text-danger">Error cargando la próxima convocatoria.</p>';
    }
}



    function createBadge(text) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = text;
        return badge;
    }

    function createCell(text) {
        const cell = document.createElement("td");
        cell.textContent = String(text || "-");
        return cell;
    }

    function createHeadCell(text) {
        const cell = document.createElement("th");
        cell.textContent = text;
        return cell;
    }

    function bindQuickSearch() {
        const form = document.getElementById(QUICK_FORM_ID);
        const townSelect = document.getElementById(QUICK_TOWN_ID);
        const dateInput = document.getElementById(QUICK_DATE_ID);
        if (!form || !townSelect || !dateInput) {
            return;
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const townId = townSelect.value;
            const date = dateInput.value;
            if (!townId || !date) {
                showState(
                    "error",
                    "Selecciona poblacion y fecha para buscar disponibilidad.",
                );
                return;
            }

            try {
                UI.setLoading(QUICK_RESULTS_ID, true);
                const response = await Api.getAvailabilitySlots({
                    town_id: townId,
                    date: date,
                });
                const slots = normalizeQuickSlots(response);
                renderQuickResults(slots);
                showState(
                    "success",
                    "Disponibilidad cargada. Puedes reservar desde la pantalla de Reservar nueva clase.",
                );
            } catch (error) {
                renderQuickResults([]);
                showState(
                    "error",
                    error && error.message
                        ? error.message
                        : "No se pudo cargar la disponibilidad.",
                );
            } finally {
                UI.setLoading(QUICK_RESULTS_ID, false);
            }
        });
    }

    // Devuelve mapa session_id → label de vehículo
    async function buildTeacherVehicleMap(rawBookings) {
        const map = {};
        let storedMap = {};
        let teacherCache = {};
        try {
            storedMap = JSON.parse(
                localStorage.getItem("session_vehicle_map") || "{}",
            );
        } catch (_) {}
        try {
            teacherCache = JSON.parse(
                localStorage.getItem("teacher_vehicle_cache") || "{}",
            );
        } catch (_) {}

        const teacherIds = [
            ...new Set(
                rawBookings
                    .map((b) => b?.teacher_profile_id ?? b?.teacher_id ?? null)
                    .filter(Boolean),
            ),
        ];
        const teacherVehicles = {};
        await Promise.all(
            teacherIds.map(async (tid) => {
                try {
                    const res = await Api.getTeacherVehicles(tid);
                    teacherVehicles[tid] = Array.isArray(res?.vehicles)
                        ? res.vehicles
                        : [];
                } catch (_) {
                    teacherVehicles[tid] = [];
                }
            }),
        );

        rawBookings.forEach((b) => {
            const tid = b?.teacher_profile_id ?? b?.teacher_id ?? null;
            const sid = b?.id ?? null;
            const vehicles = teacherVehicles[tid] || [];
            if (!tid || !sid) return;

            const findLabel = (vid) => {
                const v = vehicles.find((x) => Number(x.id) === Number(vid));
                return v
                    ? `${v.brand || ""} ${v.model || ""}`.trim() ||
                          v.plate_number
                    : null;
            };

            const savedVid = storedMap[sid];
            if (savedVid) {
                const l = findLabel(savedVid);
                if (l) {
                    map[sid] = l;
                    return;
                }
            }

            const cachedVid = teacherCache[tid];
            if (cachedVid) {
                const l = findLabel(cachedVid);
                if (l) {
                    map[sid] = l;
                    return;
                }
            }

            const active = vehicles.filter((v) => v.is_active);
            if (active.length === 1) {
                map[sid] =
                    `${active[0].brand || ""} ${active[0].model || ""}`.trim() ||
                    active[0].plate_number;
                return;
            }

            map[sid] = "Ver con tu profesor";
        });
        return map;
    }

    async function loadPanelData() {
    UI.setLoading(HISTORY_BODY_ID, true);
    UI.setLoading(SUMMARY_ID, true); // ✔ activar cargando en el resumen

    try {
        const response = await Api.getMyClasses();
        const rawBookings = Array.isArray(response && response.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];

        const teacherVehicleMap = await buildTeacherVehicleMap(rawBookings);

        const bookings = rawBookings.map((b) => {
            const nb = normalizeBookingRecord(b);
            const sid = b?.id ?? null;

            if (!nb.vehicle && sid && teacherVehicleMap[sid]) {
                nb.vehicle = teacherVehicleMap[sid];
            }

            return nb;
        });

        renderNextClass(bookings);
        renderSummary(bookings);
        renderHistory(bookings);

        showState("success", "Panel actualizado correctamente.");
    } catch (error) {
        showState("error", error?.message || "No se pudo cargar el panel del alumno.");
        UI.showToast("Error al cargar el panel del alumno.", "error");
    } finally {
        UI.setLoading(HISTORY_BODY_ID, false);
        UI.setLoading(SUMMARY_ID, false); // ✔ desactivar cargando en el resumen
    }
}


    let townsCache = [];
    let studentHomeTownsCache = null;

    async function loadStudentHomeTownsCache() {
        if (studentHomeTownsCache) return studentHomeTownsCache;
        try {
            const response = await Api.getTowns();
            studentHomeTownsCache = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                ? response.data
                : [];
        } catch (error) {
            console.error('Error loading student towns cache:', error);
            studentHomeTownsCache = [];
        }
        return studentHomeTownsCache;
    }

    async function init() {
        const root = document.getElementById(ROOT_ID);
        if (!root) {
            return;
        }

        Router.init();
        bindQuickSearch();

        try {
            await loadTowns();
            await loadNextConvocation();
            await loadPanelData();
            await loadTotalSpent();
        } catch (error) {
            showState(
                "error",
                error && error.message
                    ? error.message
                    : "No se pudo inicializar el panel.",
            );
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();
document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("download-ticket-btn")) return;

    const sessionId = Number(e.target.dataset.sessionId);

    try {
        const session = await Api.getClassSession(sessionId);
        const paymentIntentId = session.payment_intent_id;

        if (!paymentIntentId) {
            alert("Esta clase no tiene ticket disponible.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/payments/${paymentIntentId}/ticket`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `ticket-${paymentIntentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);

    } catch (err) {
        console.error(err);
        alert("No se pudo descargar el ticket.");
    }
});

// ─────────────────────────────────────────────
// MODAL PURO JS (sin Bootstrap)
// ─────────────────────────────────────────────

const modalOverlay = document.getElementById("report-modal");
const modalContent = document.getElementById("report-modal-content");
const modalClose = document.getElementById("report-modal-close");

// Cerrar modal
modalClose.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
});
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add("hidden");
    }
});

// Abrir modal con contenido dinámico
function openReportModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.classList.remove("hidden");
}

function formatDateDMY(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}


// ─────────────────────────────────────────────
// BOTÓN "VER INFORME"
// ─────────────────────────────────────────────

document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("view-report-btn")) return;

    const sessionId = Number(e.target.dataset.sessionId);

    openReportModal("<p>Cargando informe...</p>");

    try {
        const report = await Api.getStudentSkillEvaluationReport(sessionId);

        let evaluation = null;

        // ✔ Caso 1: informe global (tiene evaluations[])
        if (Array.isArray(report.evaluations)) {
            evaluation = report.evaluations.find(ev =>
                Number(ev.class_session.id) === sessionId
            );
        }

        // ✔ Caso 2: informe por clase (tiene class_session)
        if (!evaluation && report.class_session) {
            evaluation = {
                class_session: report.class_session,
                skill_evaluations: report.skills,
                report_text: report.report_text
            };
        }

        if (!evaluation) {
            openReportModal("<p>No se encontró el informe de esta clase.</p>");
            return;
        }

        const teacherName =
            evaluation.class_session?.teacher?.user?.name ??
            evaluation.class_session?.teacher?.name ??
            report.teacher ??
            "Profesor";

        const reportText = evaluation.report_text ?? "Sin informe";

        const skillsHtml = evaluation.skill_evaluations.map(s => `
            <p><strong>${s.driving_skill.name}:</strong> ${s.score}</p>
        `).join("");

        openReportModal(`
            <p><strong>Fecha:</strong> ${formatDateDMY(evaluation.class_session.session_date)}</p>
            <p><strong>Hora:</strong> ${evaluation.class_session.start_time}</p>
            <p><strong>Profesor:</strong> ${teacherName}</p>

            <hr>
            <h4>Evaluación de habilidades</h4>
            ${skillsHtml}

            <hr>
            <h4>Informe del profesor</h4>
            <p>${reportText}</p>
        `);

    } catch (err) {
        console.error(err);
        openReportModal("<p>Error cargando el informe.</p>");
    }
    
});