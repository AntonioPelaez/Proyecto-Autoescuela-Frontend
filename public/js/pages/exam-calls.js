// exam-calls.js — compact, robust implementation
document.addEventListener("DOMContentLoaded", async () => {
    const $ = (id) => document.getElementById(id);
    const acceptSelect = $("accept-exam-call-select");
    const evalSelect = $("evaluate-exam-call-select");
    const studentsBody = $("exam-call-students-body");
    const pendingBody = $("pending-reservations-body");
    const approvedBody = $("approved-students-body");
    const manualBody = $("manual-add-students-body");
    const dtEl = $("exam-call-date-time");
    const locEl = $("exam-call-location");
    const profEl = $("exam-call-professor");
    const vehicleEl = $("exam-call-vehicle");
    const seatsEl = $("exam-call-remaining-seats");
    const countEl = $("exam-call-students-count");

    let examCalls = [];
    let currentAccept = null,
        currentEval = null;
    let pending = [],
        approved = [],
        manual = [],
        evalStudents = [];
    const teacherCache = {},
        vehicleCache = {};

    const fmtDate = (v) => {
        if (!v) return "—";
        const s = String(v).trim();
        return /^\d{4}-\d{2}-\d{2}/.test(s)
            ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`
            : s;
    };
    const fmtTime = (v) => {
        if (!v) return "—";
        const s = String(v).trim();
        return /^\d{2}:\d{2}/.test(s) ? s.slice(0, 5) : s;
    };

    const unwrap = (x) => {
        if (x == null) return x;
        if (typeof x === "string" || typeof x === "number") return x;
        if (Array.isArray(x)) return x.length ? unwrap(x[0]) : x;
        if (typeof x === "object") {
            const keys = [
                "data",
                "user",
                "teacher",
                "professor",
                "instructor",
                "vehicle",
                "car",
                "person",
                "record",
            ];
            for (const k of keys)
                if (
                    Object.prototype.hasOwnProperty.call(x, k) &&
                    x[k] &&
                    x[k] !== x
                )
                    return unwrap(x[k]);
        }
        return x;
    };

    const pickString = (obj, keys = []) => {
        const v = unwrap(obj);
        if (v == null) return null;
        if (typeof v === "string") return v.trim();
        if (typeof v === "number") return String(v);
        if (Array.isArray(v))
            for (const it of v) {
                const s = pickString(it, keys);
                if (s) return s;
            }
        if (typeof v === "object") {
            for (const k of keys)
                if (v[k]) {
                    const s = pickString(v[k], keys);
                    if (s) return s;
                }
            for (const k of Object.keys(v))
                if (typeof v[k] === "string" && /[A-Za-zÀ-ÿ]/.test(v[k]))
                    return v[k].trim();
            for (const k of Object.keys(v)) {
                const s = pickString(v[k], keys);
                if (s) return s;
            }
        }
        return null;
    };

    const fullName = (p) => {
        const v = unwrap(p);
        if (v == null) return "";
        if (typeof v === "string") return v.trim();
        const names = [
            v?.user?.name,
            v?.name,
            v?.first_name,
            v?.firstName,
            v?.full_name,
            v?.display_name,
            v?.title,
        ].filter(Boolean);
        const surnames = [
            v?.user?.surname,
            v?.surname,
            v?.last_name,
            v?.lastName,
            v?.family_name,
            v?.surname1,
            v?.surname2,
        ].filter(Boolean);
        const out = [...names, ...surnames].join(" ").trim();
        if (out) return out;
        return (
            pickString(v, [
                "full_name",
                "display_name",
                "name",
                "title",
                "professor_name",
                "teacher_name",
            ]) || ""
        );
    };

    const formatVehicle = (v) => {
        const x = unwrap(v);
        if (x == null) return "—";
        if (typeof x === "string" || typeof x === "number") return String(x);
        if (Array.isArray(x)) return x.length ? formatVehicle(x[0]) : "—";
        const plate =
            x.plate ||
            x.plate_number ||
            x.vehicle_plate ||
            x.license_plate ||
            x.registration ||
            x.vehicle?.plate;
        const brandModel =
            [x.brand, x.model].filter(Boolean).join(" ") ||
            x.name ||
            x.display_name ||
            "";
        return (
            [brandModel, plate].filter(Boolean).join(" ") ||
            pickString(x, [
                "plate",
                "plate_number",
                "vehicle_plate",
                "registration",
                "name",
            ]) ||
            JSON.stringify(x)
        );
    };

    const normalizeList = (r) =>
        Array.isArray(r) ? r : r?.data || r?.exam_calls || r?.examCalls || [];
    const normalizeObject = (r) => {
        if (!r) return null;
        if (r?.data) return r.data;
        if (r?.exam_call) return r.exam_call;
        return r;
    };

    async function resolveTeacher(call) {
        if (!call) return null;
        const fromFields = [
            call.teacher_name,
            call.professor_name,
            call.instructor_name,
        ]
            .filter(Boolean)
            .join(" ");
        if (fromFields) return fromFields;
        const direct =
            call.teacher ?? call.professor ?? call.teacher_profile ?? call.user;
        const dn = fullName(direct);
        if (dn) return dn;
        const id =
            call.teacher_id ??
            call.teacher_profile_id ??
            call.professor_id ??
            call.instructor_id;
        if (!id) return null;
        if (teacherCache[id]) return teacherCache[id];
        console.debug("resolveTeacher: fetching", id, call);
        try {
            const t = normalizeObject(await Api.getTeacher(id));
            console.debug("resolveTeacher: response", id, t);
            const tname =
                pickString(t) ||
                fullName(t) ||
                t?.name ||
                t?.full_name ||
                `Profesor #${id}`;
            teacherCache[id] = tname;
            return tname;
        } catch (e) {
            console.error("getTeacher", e);
            teacherCache[id] = `Profesor #${id}`;
            return teacherCache[id];
        }
    }

    async function resolveVehicle(call) {
        if (!call) return "—";
        const quick = [
            call?.vehicle_brand,
            call?.vehicle_model,
            call?.vehicle_plate,
            call?.plate_number,
        ]
            .filter(Boolean)
            .join(" ");
        if (quick) return quick;
        const v =
            call.vehicle ??
            call.vehicle_id ??
            call.vehicle_number ??
            call.vehicle_plate;
        if (v == null) return "—";
        if (typeof v === "object") return formatVehicle(v);
        const id = Number(v);
        if (!Number.isFinite(id)) return formatVehicle(v);
        if (vehicleCache[id]) return vehicleCache[id];
        console.debug("resolveVehicle: fetching", id, call);
        try {
            const veh = normalizeObject(await Api.getVehicle(id));
            console.debug("resolveVehicle: response", id, veh);
            const label =
                formatVehicle(veh) ||
                pickString(veh) ||
                veh?.name ||
                veh?.brand ||
                veh?.model ||
                String(id);
            vehicleCache[id] = label;
            return label;
        } catch (e) {
            console.error("getVehicle", e);
            return String(v);
        }
    }

    const isConfirmed = (it) => {
        if (!it) return false;
        if ([1, "1", true, "true"].includes(it.teacher_approved)) return true;
        if ([1, "1", true, "true"].includes(it.student_confirmed)) return true;
        const s = String(
            it.status ||
                it.booking_status ||
                it.status_convocatoria ||
                it.exam_result_status?.name ||
                it.exam_result_status?.label ||
                "",
        ).toLowerCase();
        return ["confirmed", "confirmada", "booked"].includes(s);
    };

    function studentName(item) {
        return (
            fullName(item.student) ||
            fullName(item.user) ||
            item.name ||
            "Sin nombre"
        );
    }
    function renderRows(body, rows) {
        body.innerHTML = rows.length
            ? rows.join("")
            : `<tr><td colspan="${body.closest("table")?.querySelectorAll("th").length || 2}" class="text-center py-3">No hay alumnos pendientes de aceptar</td></tr>`;
    }

    function renderStudents(list, examCallId) {
        const rows = (list || []).map((s) => {
            const id = s.student_id ?? s.student?.id ?? s.id ?? "";
            const prof =
                fullName(s.teacher) ||
                fullName(s.professor) ||
                s.teacher_name ||
                s.professor_name ||
                fullName(s.exam_call?.teacher) ||
                s.exam_call?.teacher_name ||
                "—";
            const date = fmtDate(
                s.exam_date ||
                    s.date ||
                    s.exam_call?.exam_date ||
                    s.exam_call?.date,
            );
            const time = fmtTime(
                s.start_time ||
                    s.time ||
                    s.exam_call?.start_time ||
                    s.exam_call?.time,
            );
            const vehicle = formatVehicle(
                s.vehicle || s.vehicle_plate || s.exam_call?.vehicle,
            );
            const result =
                s.exam_result_status?.label ||
                s.exam_result_status?.name ||
                s.resultado ||
                s.result ||
                s.status ||
                "Pendiente";
            return `<tr><td class="text-start">${studentName(s)}</td><td>${prof}</td><td>${date}</td><td>${time}</td><td>${vehicle}</td><td>${result}</td><td><a href="/teacher/exam-calls/${examCallId}/students/${id}/result" class="btn btn-primary btn-sm">Poner resultado</a></td></tr>`;
        });
        renderRows(studentsBody, rows);
    }

    function renderPending() {
        const rows = (pending || []).map((s) => {
            const id = s.student_id ?? s.student?.id ?? s.id ?? "";
            const name = studentName(s);
            return `<tr data-student-id="${id}"><td class="text-start">${name}</td><td class="text-center text-nowrap"><button class="btn btn-success btn-sm me-2" data-action="accept" data-student-id="${id}">✓</button><button class="btn btn-danger btn-sm" data-action="reject" data-student-id="${id}">✕</button></td></tr>`;
        });
        renderRows(pendingBody, rows);
    }
    function renderApproved() {
        const rows = (approved || []).map((s) => {
            const id = s.student_id ?? s.student?.id ?? s.id ?? "";
            return `<tr data-student-id="${id}"><td class="text-start">${studentName(s)}</td><td class="text-center text-nowrap"><a href="/teacher/exam-calls/${currentAccept}/students/${id}/remove" class="btn btn-danger btn-sm">Quitar</a></td></tr>`;
        });
        renderRows(approvedBody, rows);
    }
    function renderManual() {
        const rows = (manual || []).map((s) => {
            const id = s.student_id ?? s.student?.id ?? s.id ?? "";
            return `<tr data-student-id="${id}"><td class="text-start">${studentName(s)}</td><td class="text-center text-nowrap"><button class="btn btn-primary btn-sm" data-action="add-manual" data-student-id="${id}">Añadir</button></td></tr>`;
        });
        renderRows(manualBody, rows);
    }

    async function renderExamInfo(call) {
    const c = normalizeObject(call);

    if (!c) {
        dtEl.textContent = "Selecciona una convocatoria";
        locEl.textContent = "—";
        profEl.textContent = "—";
        vehicleEl.textContent = "—";
        seatsEl.textContent = "—";
        countEl.textContent = 0;
        return;
    }

    // Fecha y hora
    dtEl.textContent = `${fmtDate(c.exam_date)} ${fmtTime(c.start_time)}`;

    // Localidad
    locEl.textContent = c?.town?.name || c?.town || c?.city || "—";

    // 🔥 PROFESOR Y VEHÍCULO DESDE EL PRIMER ALUMNO
    const first = Array.isArray(c.exam_students) ? c.exam_students[0] : null;

    const teacher =
        fullName(first?.teacher) ||
        first?.teacher_name ||
        (await resolveTeacher(first)) ||
        "—";

    const vehicle =
        formatVehicle(first?.vehicle) ||
        first?.vehicle_plate ||
        (await resolveVehicle(first)) ||
        "—";

    profEl.textContent = teacher;
    vehicleEl.textContent = vehicle;

    // Plazas
    const cap = Number(
        c?.capacity ??
        c?.plazas ??
        c?.slots ??
        c?.max_students ??
        c?.total_seats ??
        c?.seats ??
        null
    );

    const remaining = Number.isFinite(cap)
        ? Math.max(cap - (approved?.length || 0), 0)
        : null;

    seatsEl.textContent = remaining !== null ? `${remaining} de ${cap}` : "—";
    countEl.textContent = approved?.length || 0;
}


    async function loadExamCalls() {
        try {
            if (acceptSelect)
                acceptSelect.innerHTML =
                    "<option>Cargando convocatorias...</option>";
            if (evalSelect)
                evalSelect.innerHTML =
                    "<option>Cargando convocatorias...</option>";
            const resp = await Api.getExamCalls();
            examCalls = normalizeList(resp).filter((c) => {
                const s = String(
                    c?.exam_call_status?.name ||
                        c?.exam_call_status?.label ||
                        c?.status_convocatoria ||
                        c?.status ||
                        "",
                ).toLowerCase();
                return ["pendiente", "programada", "scheduled"].includes(s);
            });
            if (!examCalls.length) {
                if (acceptSelect)
                    acceptSelect.innerHTML =
                        "<option>No hay convocatorias disponibles</option>";
                if (evalSelect)
                    evalSelect.innerHTML =
                        "<option>No hay convocatorias disponibles</option>";
                renderStudents([], null);
                pending = [];
                approved = [];
                manual = [];
                renderPending();
                renderApproved();
                renderManual();
                return;
            }
            const options = `<option value="">Selecciona convocatoria</option>${examCalls
                .map((c) => {
                    const id = c?.id || c?.exam_call_id || c?.examCallId;
                    return `<option value="${id}">${fmtDate(c?.exam_date || c?.date)} ${fmtTime(c?.start_time || c?.time)} — ${c?.town?.name || c?.town || c?.city || "—"}</option>`;
                })
                .join("")}`;
            if (acceptSelect) acceptSelect.innerHTML = options;
            if (evalSelect) evalSelect.innerHTML = options;
        } catch (e) {
            console.error("loadExamCalls", e);
            if (acceptSelect)
                acceptSelect.innerHTML = "<option>Error cargando</option>";
            if (evalSelect)
                evalSelect.innerHTML = "<option>Error cargando</option>";
        }
    }

    async function loadAccept(id) {
        currentAccept = id;
        if (!id) {
            pending = [];
            approved = [];
            manual = [];
            await renderExamInfo(null);
            renderPending();
            renderApproved();
            renderManual();
            return;
        }
        pendingBody.innerHTML =
            approvedBody.innerHTML =
            manualBody.innerHTML =
                '<tr><td class="text-center py-3">Cargando...</td></tr>';
        try {
            const [callRes, studentsRes, allStudentsRes] = await Promise.all([
                Api.getExamCall(id),
                Api.getExamCallStudents(id),
                Api.getStudents(),
            ]);
            const call = normalizeObject(callRes);
            const studs = normalizeList(studentsRes);
            const all = normalizeList(allStudentsRes);
            approved = studs.filter(s =>
                isConfirmed(s) && Number(s.exam_result_status_id) !== 4
            );

            pending = studs.filter(s =>
                !isConfirmed(s) && Number(s.exam_result_status_id) !== 4
            );

            const existing = new Set(
                studs
                    .filter(s => Number(s.exam_result_status_id) !== 4)
                    .map(s => String(s.student_id ?? s.student?.id ?? s.id ?? ""))
            );

            manual = all.filter((s) => {
                const sid = String(s.student_id ?? s.student?.id ?? s.id ?? "");
                return sid && !existing.has(sid);
            });
            await renderExamInfo(callRes);
            renderPending();
            renderApproved();
            renderManual();
        } catch (e) {
            console.error("loadAccept", e);
            pendingBody.innerHTML =
                approvedBody.innerHTML =
                manualBody.innerHTML =
                    '<tr><td class="text-center py-3 text-danger">Error cargando datos.</td></tr>';
        }
    }

    async function loadEval(id) {
        currentEval = id;
        if (!id) {
            renderStudents([], null);
            evalStudents = [];
            return;
        }
        studentsBody.innerHTML =
            '<tr><td colspan="7" class="text-center py-3">Cargando alumnos...</td></tr>';
        try {
            const [studentsRes, callRes] = await Promise.all([
                Api.getExamCallStudents(id),
                Api.getExamCall(id),
            ]);
            const list = normalizeList(studentsRes);
            evalStudents = list
            .filter(s => s.teacher_approved == 1 && Number(s.exam_result_status_id) !== 4)
            evalStudents = evalStudents.map((s) => ({ ...s, exam_call: callRes }));
            renderStudents(evalStudents, id);
        } catch (e) {
            console.error("loadEval", e);
            studentsBody.innerHTML =
                '<tr><td colspan="7" class="text-center py-3 text-danger">Error cargando alumnos.</td></tr>';
        }
    }

    // actions
    pendingBody?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const action = btn.dataset.action;
        const sid = btn.dataset.studentId;
        if (action === "accept") handleApprove(sid);
        if (action === "reject") handleReject(sid);
    });
    approvedBody?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        if (btn.dataset.action === "remove")
            handleRemove(btn.dataset.studentId);
    });
    manualBody?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        if (btn.dataset.action === "add-manual")
            handleAddManual(btn.dataset.studentId);
    });
    acceptSelect?.addEventListener("change", () =>
        loadAccept(acceptSelect.value),
    );
    evalSelect?.addEventListener("change", () => loadEval(evalSelect.value));

    async function handleApprove(studentId) {
        const match = pending.find(
            (s) =>
                String(s.student_id ?? s.student?.id ?? s.id ?? "") ===
                String(studentId),
        );
        if (!match || !currentAccept) return;
        try {
            await Api.approveExamCall(currentAccept, studentId);
            pending = pending.filter(
                (s) =>
                    String(s.student_id ?? s.student?.id ?? s.id ?? "") !==
                    String(studentId),
            );
            approved.push(match);
            if (currentEval === currentAccept) {
                const call = await Api.getExamCall(currentAccept);
                evalStudents.push({ ...match, exam_call: call });
                renderStudents(evalStudents, currentEval);
            }
            renderPending();
            renderApproved();
            await renderExamInfo(await Api.getExamCall(currentAccept));
        } catch (e) {
            console.error("approve failed", e);
            pendingBody.innerHTML =
                '<tr><td colspan="2" class="text-center py-3 text-danger">No se pudo aprobar al alumno.</td></tr>';
        }
    }

    async function handleReject(studentId) {
        if (!currentAccept) return;
        try {
            await Api.rejectExamCall(currentAccept, studentId);
            pending = pending.filter(
                (s) =>
                    String(s.student_id ?? s.student?.id ?? s.id ?? "") !==
                    String(studentId),
            );
            renderPending();
        } catch (e) {
            console.error("reject failed", e);
            pendingBody.innerHTML =
                '<tr><td colspan="2" class="text-center py-3 text-danger">No se pudo rechazar al alumno.</td></tr>';
        }
    }

    async function handleAddManual(studentId) {
        if (!currentAccept) return;
        const match = manual.find(
            (s) =>
                String(s.student_id ?? s.student?.id ?? s.id ?? "") ===
                String(studentId),
        );
        if (!match) return;
        try {
            await Api.addApprovedStudent(currentAccept, studentId);
            manual = manual.filter(
                (s) =>
                    String(s.student_id ?? s.student?.id ?? s.id ?? "") !==
                    String(studentId),
            );
            approved.push(match);
            renderManual();
            renderApproved();
            await renderExamInfo(await Api.getExamCall(currentAccept));
        } catch (e) {
            console.error("add manual failed", e);
            manualBody.innerHTML =
                '<tr><td colspan="2" class="text-center py-3 text-danger">No se pudo añadir al alumno.</td></tr>';
        }
    }

    async function handleRemove(studentId) {
        if (!currentAccept) return;
        const match = approved.find(
            (s) =>
                String(s.student_id ?? s.student?.id ?? s.id ?? "") ===
                String(studentId),
        );
        if (!match) return;

        const reason = window.prompt(
            "Introduce la razón para quitar al alumno de la convocatoria:",
        );
        if (reason === null) return;
        const trimmedReason = String(reason).trim();
        if (!trimmedReason) {
            window.alert("Debes indicar una razón para quitar al alumno.");
            return;
        }

        try {
            await Api.removeApprovedStudent(currentAccept, studentId, {
                result_notes: trimmedReason,
            });
            approved = approved.filter(
                (s) =>
                    String(s.student_id ?? s.student?.id ?? s.id ?? "") !==
                    String(studentId),
            );
            manual.push(match);
            renderApproved();
            renderManual();
            await renderExamInfo(await Api.getExamCall(currentAccept));
        } catch (e) {
            console.error("remove failed", e);
            approvedBody.innerHTML =
                '<tr><td colspan="2" class="text-center py-3 text-danger">No se pudo quitar al alumno.</td></tr>';
        }
    }

    // init
    await loadExamCalls();
});
