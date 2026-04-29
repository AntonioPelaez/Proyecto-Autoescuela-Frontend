(function () {
    "use strict";

    const ROOT_ID = "admin-vehicles-page";
    const STATE_ID = "vehicles-state";
    const TABLE_BODY_ID = "vehicles-table-body";

    let vehicles = [];
    let professors = [];
    let professorsById = new Map();
    let editingId = null;

    function getStateEl() {
        return document.getElementById(STATE_ID);
    }

    function showState(type, message) {
        const stateEl = getStateEl();
        if (!stateEl) return;

        if (!message) {
            stateEl.className = "hidden";
            stateEl.textContent = "";
            return;
        }

        const classes = {
            success: "card card-body",
            error: "card card-body input-error",
            empty: "card card-body table-empty",
        };

        stateEl.className = classes[type] || "card card-body";
        stateEl.textContent = message;
    }

    function normalizePlate(value) {
        return String(value || "")
            .toUpperCase()
            .replace(/\s+/g, "");
    }

    function resetForm() {
        const form = document.getElementById("vehicle-form");
        const title = document.getElementById("vehicle-form-title");
        const submit = document.getElementById("vehicle-submit");
        const cancel = document.getElementById("vehicle-cancel");

        editingId = null;
        if (form) form.reset();
        if (title) title.textContent = "Añadir vehículo";
        if (submit) submit.textContent = "Guardar";
        if (cancel) cancel.classList.add("hidden");
    }

    function setEditMode(vehicle) {
        document.getElementById("vehicle-id").value = vehicle.id;
        document.getElementById("vehicle-name").value = vehicle.name || "";
        document.getElementById("vehicle-plate").value = vehicle.plate;
        document.getElementById("vehicle-model").value = vehicle.model || "";
        document.getElementById("vehicle-professor").value =
            vehicle.professor_id || "";

        document.getElementById("vehicle-form-title").textContent =
            "Editar vehículo";
        document.getElementById("vehicle-submit").textContent = "Actualizar";
        document.getElementById("vehicle-cancel").classList.remove("hidden");

        editingId = vehicle.id;
    }

    function isProfessorActive(professor) {
        if (!professor) return false;
        if (typeof professor.is_active_for_booking !== "undefined") {
            return Boolean(professor.is_active_for_booking);
        }
        if (typeof professor.is_active !== "undefined") {
            return Boolean(professor.is_active);
        }
        if (typeof professor.active !== "undefined") {
            return Boolean(professor.active);
        }
        return true;
    }

    function buildProfessorsIndex() {
        professorsById = new Map();
        (professors || []).forEach((prof) => {
            if (!prof || typeof prof.id === "undefined" || prof.id === null)
                return;
            professorsById.set(Number(prof.id), prof);
        });
    }

    function getProfessorLabel(professorId) {
        const id = Number(professorId);
        if (!id || Number.isNaN(id)) return "—";
        const prof = professorsById.get(id);
        return prof?.full_name || prof?.name || "—";
    }

    function renderRows() {
        const tbody = document.getElementById(TABLE_BODY_ID);
        if (!tbody) return;

        tbody.replaceChildren();

        if (!vehicles.length) {
            showState("empty", "No hay vehículos disponibles todavía.");
            return;
        }

        showState("", "");

        vehicles.forEach((vehicle) => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${vehicle.id}</td>
            <td>${vehicle.name}</td>
            <td>${vehicle.plate}</td>
            <td>${vehicle.model || "—"}</td>
            <td>${getProfessorLabel(vehicle.professor_id)}</td>
            <td>${vehicle.active ? "Activo" : "Inactivo"}</td>
            <td>
                <button class="btn btn-outline btn-sm" data-action="edit" data-id="${vehicle.id}">Editar</button>
                <button class="btn btn-secondary btn-sm" data-action="toggle" data-id="${vehicle.id}">
                    ${vehicle.active ? "Desactivar" : "Activar"}
                </button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${vehicle.id}">Eliminar</button>
            </td>
        `;

            tbody.appendChild(row);
        });
    }

    async function loadVehicles() {
        UI.setLoading(TABLE_BODY_ID, true);

        try {
            const [vehiclesResponse, teachersResponse] = await Promise.all([
                Api.getVehicles(),
                Api.getTeachers(),
            ]);

            // Siguiendo el estilo del resto de páginas (p.ej. admin-professors.js),
            // `Api.getTeachers()` normalmente devuelve un array directamente.
            const rawTeachers = Array.isArray(teachersResponse)
                ? teachersResponse
                : teachersResponse?.teachers || [];

            // `Api.getVehicles()` puede devolver `{ vehicles: [...] }` o un array.
            const rawVehicles = Array.isArray(vehiclesResponse)
                ? vehiclesResponse
                : vehiclesResponse?.vehicles || [];

            professors = rawTeachers;
            buildProfessorsIndex();

            // Transformación a lo que tu frontend espera
            vehicles = rawVehicles.map((v) => {
                const primaryTeacher = Array.isArray(v.teachers)
                    ? v.teachers[0]
                    : null;

                return {
                    id: v.id,
                    name: v.brand || v.name || "",
                    plate: v.plate_number || v.plate || "",
                    model: v.model || "",
                    active:
                        typeof v.is_active !== "undefined"
                            ? v.is_active == 1
                            : Boolean(v.active),
                    notes: v.notes || "",
                    // En tu backend, el profesor principal llega en `teachers` (pivot `is_primary`).
                    professor_id: primaryTeacher?.id ?? v.professor_id ?? null,
                };
            });

            renderRows();
            fillProfessorSelect();
        } catch (error) {
            showState(
                "error",
                error.message || "No se pudo cargar el listado.",
            );
        } finally {
            UI.setLoading(TABLE_BODY_ID, false);
        }
    }

    function fillProfessorSelect() {
        const select = document.getElementById("vehicle-professor");
        if (!select) return;

        const current = select.value;
        select.innerHTML =
            '<option value="">-- Selecciona profesor --</option>';

        professors
            .filter(isProfessorActive)
            .forEach((prof) => {
                const opt = document.createElement("option");
                opt.value = prof.id;
                opt.textContent = prof.full_name || prof.name || `#${prof.id}`;
                select.appendChild(opt);
            });

        select.value = current;
    }

    function handleSubmit(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const name = form.name.value.trim();
        const plate = normalizePlate(form.plate.value);
        const model = form.model?.value?.trim?.() || "";
        const professorIdRaw = form.professor_id?.value;
        const professor_id =
            professorIdRaw === "" || typeof professorIdRaw === "undefined"
                ? null
                : Number(professorIdRaw);

        if (!name || !plate) {
            showState("error", "Debes completar nombre y matrícula.");
            UI.showToast("Completa los campos obligatorios.", "error");
            return;
        }

        if (editingId === null) {
            const nextId = vehicles.length
                ? Math.max(...vehicles.map((v) => v.id)) + 1
                : 1;
            vehicles.push({
                id: nextId,
                name,
                plate,
                model,
                professor_id,
                active: true,
            });

            showState("success", "Vehículo creado correctamente.");
            UI.showToast("Vehículo añadido.", "success");
        } else {
            const index = vehicles.findIndex((v) => v.id === editingId);
            if (index === -1) {
                showState(
                    "error",
                    "No se ha encontrado el vehículo para editar.",
                );
                UI.showToast("Error al editar el vehículo.", "error");
                return;
            }

            vehicles[index].name = name;
            vehicles[index].plate = plate;
            vehicles[index].model = model;
            vehicles[index].professor_id = professor_id;

            showState("success", "Vehículo actualizado correctamente.");
            UI.showToast("Vehículo actualizado.", "success");
        }

        resetForm();
        renderRows();
    }

    function handleTableClick(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const action = target.dataset.action;
        const id = Number(target.dataset.id);

        if (!action || Number.isNaN(id)) return;

        const vehicle = vehicles.find((v) => v.id === id);
        if (!vehicle) {
            showState("error", "No se ha encontrado el vehículo seleccionado.");
            UI.showToast("No se encontró el vehículo.", "error");
            return;
        }

        if (action === "edit") {
            setEditMode(vehicle);
            return;
        }

        if (action === "toggle") {
            vehicle.active = !vehicle.active;
            renderRows();
            showState("success", "Estado del vehículo actualizado.");
            UI.showToast("Estado actualizado.", "success");
            return;
        }

        if (action === "delete") {
            if (confirm("¿Seguro que quieres eliminar este vehículo?")) {
                Api.deleteVehicle(vehicle.id)
                    .then(() => {
                        showState("success", "Vehículo eliminado.");
                        UI.showToast("Vehículo eliminado.", "success");
                        loadVehicles();
                    })
                    .catch((error) => {
                        showState(
                            "error",
                            error.message || "No se pudo eliminar el vehículo.",
                        );
                        UI.showToast("Error al eliminar.", "error");
                    });
            }
            return;
        }
    }

    function bindEvents() {
        document
            .getElementById("vehicle-form")
            ?.addEventListener("submit", handleSubmit);

        document
            .getElementById("vehicle-cancel")
            ?.addEventListener("click", () => {
                resetForm();
                showState("", "");
            });

        document
            .getElementById("vehicle-create")
            ?.addEventListener("click", () => {
                resetForm();
                document.getElementById("vehicle-name")?.focus();
            });

        document
            .getElementById(TABLE_BODY_ID)
            ?.addEventListener("click", handleTableClick);
    }

    function init() {
        if (!document.getElementById(ROOT_ID)) return;

        Router.init();
        bindEvents();
        resetForm();
        loadVehicles();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
