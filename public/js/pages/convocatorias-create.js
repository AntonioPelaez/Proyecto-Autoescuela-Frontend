document.addEventListener("DOMContentLoaded", () => {

    const townSelect = document.querySelector("#town_id");
    const teacherSelect = document.querySelector("#teacher_id");
    const vehicleSelect = document.querySelector("#vehicle_id");
    const studentsList = document.querySelector("#students-list");
    const form = document.querySelector("#convocatoria-create-form");

    init();

    async function init() {
        await loadTowns();
        await loadTeachers();
        await loadVehicles();
        await loadStudents();
        setupSubmit();
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
            console.error("Error cargando poblaciones:", error);
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
            console.error("Error cargando profesores:", error);
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
            console.error("Error cargando vehículos:", error);
            vehicleSelect.innerHTML = `<option value="">Error cargando vehículos</option>`;
        }
    }

    /* ---------------------------------------------------------
        CARGAR ALUMNOS PREPARADOS
    --------------------------------------------------------- */
    async function loadStudents() {
        try {
            const res = await api.get("/students?ready_for_exam=1");
            const students = res.data;

            studentsList.innerHTML = "";

            if (!students.length) {
                studentsList.innerHTML = `<p class="text-muted">No hay alumnos preparados para examen.</p>`;
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
            console.error("Error cargando alumnos:", error);
            studentsList.innerHTML = `<p class="text-danger">Error cargando alumnos.</p>`;
        }
    }

    /* ---------------------------------------------------------
        ENVIAR FORMULARIO
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
                await api.post("/exam-calls", payload);
                ui.showToast("Convocatoria creada correctamente", "success");
                router.go("/admin/convocatorias");

            } catch (error) {
                console.error("Error creando convocatoria:", error);
                ui.showToast("Error al crear la convocatoria", "error");
            }
        });
    }

});
