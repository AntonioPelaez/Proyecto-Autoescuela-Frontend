document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#convocatoria-edit-form");
    const townSelect = document.querySelector("#town_id");
    const teacherSelect = document.querySelector("#teacher_id");
    const vehicleSelect = document.querySelector("#vehicle_id");
    const studentsList = document.querySelector("#students-list");

    // Obtener ID desde la URL
    const parts = window.location.pathname.split("/");
    const convocatoriaId = parts[parts.length - 2];

    init();

    async function init() {
        await loadTowns();
        await loadTeachers();
        await loadVehicles();
        await loadStudents();
        await loadConvocatoriaData();
        setupSubmit();
    }

    function normalizeList(raw) {
        if (Array.isArray(raw)) return raw;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        if (raw?.vehicles && Array.isArray(raw.vehicles)) return raw.vehicles;
        if (raw?.items && Array.isArray(raw.items)) return raw.items;
        return [];
    }

    async function loadConvocatoriaData() {
        try {
            const c = await Api.getExamCall(convocatoriaId);

            document.querySelector("#date_time").value = `${c.exam_date}T${c.start_time}`;
            townSelect.value = c.town_id ?? "";
            teacherSelect.value = c.teacher_id ?? "";
            vehicleSelect.value = c.vehicle_id ?? "";

            if (Array.isArray(c.exam_students)) {
                c.exam_students.forEach(s => {
                    const checkbox = document.querySelector(`#student_${s.student_id}`);
                    if (checkbox) checkbox.checked = true;
                });
            }

        } catch {
            UI.showToast("Error cargando datos", "error");
        }
    }

    async function loadTowns() {
        try {
            const towns = normalizeList(await Api.getTowns());
            townSelect.innerHTML = `<option value="">Selecciona una población</option>`;
            towns.forEach(town => {
                const opt = document.createElement("option");
                opt.value = town.id;
                opt.textContent = town.name;
                townSelect.appendChild(opt);
            });
        } catch {
            townSelect.innerHTML = `<option value="">Error cargando poblaciones</option>`;
        }
    }

    async function loadTeachers() {
        try {
            const teachers = normalizeList(await Api.getTeachers());
            teacherSelect.innerHTML = `<option value="">Selecciona un profesor</option>`;
            teachers.forEach(teacher => {
                const opt = document.createElement("option");
                opt.value = teacher.id;
                opt.textContent = teacher.name ?? teacher.user?.name ?? "Profesor sin nombre";
                teacherSelect.appendChild(opt);
            });
        } catch {
            teacherSelect.innerHTML = `<option value="">Error cargando profesores</option>`;
        }
    }

    async function loadVehicles() {
        try {
            const vehicles = normalizeList(await Api.getVehicles());
            vehicleSelect.innerHTML = `<option value="">Selecciona un vehículo</option>`;
            vehicles.forEach(vehicle => {
                const opt = document.createElement("option");
                opt.value = vehicle.id;
                opt.textContent =
                    (vehicle.brand && vehicle.model)
                        ? `${vehicle.brand} ${vehicle.model}`
                        : vehicle.name ?? vehicle.plate_number ?? "Vehículo";
                vehicleSelect.appendChild(opt);
            });
        } catch {
            vehicleSelect.innerHTML = `<option value="">Error cargando vehículos</option>`;
        }
    }

    async function loadStudents() {
        try {
            const students = normalizeList(await Api.getReadyForExamStudents());
            studentsList.innerHTML = "";

            if (!students.length) {
                studentsList.innerHTML = `<p class="text-muted">No hay alumnos preparados.</p>`;
                return;
            }

            students.forEach(student => {
                const wrapper = document.createElement("div");
                wrapper.className = "student-item";

                wrapper.innerHTML = `
                    <span class="student-name">
                        ${student.name ?? student.user?.name ?? "Alumno sin nombre"}
                    </span>
                    <input type="checkbox" class="form-check-input" id="student_${student.id}" name="students[]" value="${student.id}">
                `;

                studentsList.appendChild(wrapper);
            });

        } catch {
            studentsList.innerHTML = `<p class="text-danger">Error cargando alumnos.</p>`;
        }
    }

    function setupSubmit() {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);

            const payload = {
                exam_date: formData.get("date_time").split("T")[0],
                start_time: formData.get("date_time").split("T")[1],
                town_id: formData.get("town_id"),
                teacher_id: formData.get("teacher_id"),
                vehicle_id: formData.get("vehicle_id"),
                students: formData.getAll("students[]"),
            };

            try {
                await Api.updateExamCall(convocatoriaId, payload);
                UI.showToast("Convocatoria actualizada", "success");
               window.location.href = "/admin/convocatorias";
            } catch {
                UI.showToast("Error al guardar cambios", "error");
            }
        });
    }

});
