document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#convocatoria-edit-form");
    const townSelect = document.querySelector("#town_id");
    const teacherSelect = document.querySelector("#teacher_id");
    const vehicleSelect = document.querySelector("#vehicle_id");
    const studentsList = document.querySelector("#students-list");

    const convocatoriaId = router.param("id"); // /admin/convocatorias/123/editar

    init();

    async function init() {
        await loadTowns();
        await loadTeachers();
        await loadVehicles();
        await loadStudents();
        await loadConvocatoriaData();
        setupSubmit();
    }

    /* ---------------------------------------------------------
        CARGAR DATOS DE LA CONVOCATORIA
    --------------------------------------------------------- */
    async function loadConvocatoriaData() {
        try {
            const res = await api.get(`/exam-calls/${convocatoriaId}`);
            const c = res.data;

            document.querySelector("#date_time").value = c.date_time.replace(" ", "T");
            townSelect.value = c.town_id;
            teacherSelect.value = c.teacher_id;
            vehicleSelect.value = c.vehicle_id;

            // Marcar alumnos seleccionados
            c.students.forEach(s => {
                const checkbox = document.querySelector(`#student_${s.id}`);
                if (checkbox) checkbox.checked = true;
            });

        } catch (error) {
            console.error("Error cargando convocatoria:", error);
            ui.showToast("Error cargando datos", "error");
        }
    }

    /* ---------------------------------------------------------
        CARGAR POBLACIONES
    --------------------------------------------------------- */
    async function loadTowns() {
        try {
            const res = await api.get("/towns");
            const towns = res.data;

            townSelect.innerHTML = `<option value="">Selecciona una población</option>`;

            towns.forEach(town => {
                const opt = document.createElement("option");
                opt.value = town.id;
                opt.textContent = town.name;
                townSelect.appendChild(opt);
            });

        } catch (error) {
            townSelect.innerHTML = `<option value="">Error cargando poblaciones</option>`;
        }
    }

    /* ---------------------------------------------------------
        CARGAR PROFESORES
    --------------------------------------------------------- */
    async function loadTeachers() {
        try {
            const res = await api.get("/teachers");
            const teachers = res.data;

            teacherSelect.innerHTML = `<option value="">Selecciona un profesor</option>`;

            teachers.forEach(teacher => {
                const opt = document.createElement("option");
                opt.value = teacher.id;
                opt.textContent = teacher.user.name;
                teacherSelect.appendChild(opt);
            });

        } catch (error) {
            teacherSelect.innerHTML = `<option value="">Error cargando profesores</option>`;
        }
    }

    /* ---------------------------------------------------------
        CARGAR VEHÍCULOS
    --------------------------------------------------------- */
    async function loadVehicles() {
        try {
            const res = await api.get("/vehicles");
            const vehicles = res.data;

            vehicleSelect.innerHTML = `<option value="">Selecciona un vehículo</option>`;

            vehicles.forEach(vehicle => {
                const opt = document.createElement("option");
                opt.value = vehicle.id;
                opt.textContent = vehicle.plate;
                vehicleSelect.appendChild(opt);
            });

        } catch (error) {
            vehicleSelect.innerHTML = `<option value="">Error cargando vehículos</option>`;
        }
    }

    /* ---------------------------------------------------------
        CARGAR ALUMNOS
    --------------------------------------------------------- */
    async function loadStudents() {
        try {
            const res = await api.get("/students?ready_for_exam=1");
            const students = res.data;

            studentsList.innerHTML = "";

            if (!students.length) {
                studentsList.innerHTML = `<p class="text-muted">No hay alumnos preparados.</p>`;
                return;
            }

            students.forEach(student => {
                const wrapper = document.createElement("div");
                wrapper.className = "form-check mb-2";

                wrapper.innerHTML = `
                    <input type="checkbox" class="form-check-input" id="student_${student.id}" name="students[]" value="${student.id}">
                    <label class="form-check-label" for="student_${student.id}">
                        ${student.user.name}
                    </label>
                `;

                studentsList.appendChild(wrapper);
            });

        } catch (error) {
            studentsList.innerHTML = `<p class="text-danger">Error cargando alumnos.</p>`;
        }
    }

    /* ---------------------------------------------------------
        GUARDAR CAMBIOS
    --------------------------------------------------------- */
    function setupSubmit() {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);

            const payload = {
                date_time: formData.get("date_time"),
                town_id: formData.get("town_id"),
                teacher_id: formData.get("teacher_id"),
                vehicle_id: formData.get("vehicle_id"),
                students: formData.getAll("students[]"),
            };

            try {
                await api.put(`/exam-calls/${convocatoriaId}`, payload);
                ui.showToast("Convocatoria actualizada", "success");
                router.go("/admin/convocatorias");

            } catch (error) {
                console.error("Error actualizando:", error);
                ui.showToast("Error al guardar cambios", "error");
            }
        });
    }

});
