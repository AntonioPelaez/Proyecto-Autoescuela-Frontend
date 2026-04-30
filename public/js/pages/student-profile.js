/**
 * student-profile.js — Perfil del alumno (mock)
 * Carga datos del usuario en sesión, permite editar y cambia contraseña.
 */
(function () {
    "use strict";

    // ── Utilidades ──────────────────────────────────────────────────
    function showFeedback(msg, type = "success") {
        const el = document.getElementById("profile-feedback");
        if (!el) return;
        el.className = `message-state message-state-${type}`;
        el.textContent = msg;
        el.classList.remove("hidden");
        setTimeout(() => el.classList.add("hidden"), 4000);
    }

    function passwordStrength(pwd) {
        if (!pwd) return "";
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1)
            return '<span class="strength-bar strength-bar-1"></span><span class="strength-label strength-weak">Débil</span>';
        if (score <= 3)
            return '<span class="strength-bar strength-bar-2"></span><span class="strength-label strength-ok">Aceptable</span>';
        return '<span class="strength-bar strength-bar-3"></span><span class="strength-label strength-strong">Fuerte</span>';
    }

    function togglePasswordVisibility(btn) {
        const input = document.getElementById(btn.getAttribute("data-target"));
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Ocultar" : "Mostrar");
        btn.textContent = show ? "🙈" : "👁";
    }

    // ── Cargar datos del usuario ────────────────────────────────────
    async function loadUserData() {
        let user = null;

        // Intenta obtener datos del API
        try {
            if (typeof Api !== "undefined") {
                const resp = await Api.getMe();
                console.log("📡 Respuesta de Api.getMe():", resp);
                user = resp.data || resp || null;
                if (user) console.log("✓ Usuario cargado del API:", user);
            }
        } catch (err) {
            console.warn(
                "⚠ Error al obtener datos del API:",
                err.message || err,
            );
        }

        // Fallback: datos de sessionStorage/localStorage
        if (!user) {
            const raw =
                sessionStorage.getItem("auth_user") ||
                localStorage.getItem("auth_user");
            try {
                user = raw ? JSON.parse(raw) : null;
                if (user)
                    console.log(
                        "✓ Usuario cargado de sessionStorage/localStorage:",
                        user,
                    );
            } catch (e) {
                console.warn("⚠ Error al parsear datos de storage:", e);
                user = null;
            }
        }

        // Guarda el ID para posteriores actualizaciones
        window.currentUserId = user.id;
        window.currentUser = user;

if (user.student_profile) {
    window.currentStudentId = user.student_profile.id;
    console.log("✓ ID del alumno cargado:", window.currentStudentId);
}


        // Extrae nombre y apellidos (soporta ambas estructuras)
        const firstName = user.name || "";
        const surname = user.surname
            ? user.surname
            : `${user.surname1 || ""} ${user.surname2 || ""}`.trim();

        // Carga los valores en los campos
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = val || "";
                console.log(`  → Cargado ${id}: "${val}"`);
            }
        };

        console.log("📝 Cargando datos en formulario...");
        set("profile-name", firstName);
        set("profile-surname", surname);
        set("profile-email", user.email);
        set("profile-phone", user.phone || "");

        // Guarda el email original para validar cambios
        window.originalEmail = user.email;
        console.log(`  → Email original guardado: "${window.originalEmail}"`);

        console.log("✓ Datos del usuario cargados correctamente");
    }

    // ── Cargar estadísticas ─────────────────────────────────────────
    async function loadStats() {
        const container = document.getElementById("profile-stats");
        if (!container) return;

        // Obtiene clases/reservas del API
        let classes = [];
        try {
            if (typeof Api !== "undefined") {
                const resp = await Api.getMyClasses();
                classes = resp.data || [];
            }
        } catch (err) {
            console.error("Error al obtener clases:", err);
            classes = [];
        }

        const now = new Date();
        const upcoming = classes.filter(
            (c) => new Date(c.date || c.scheduled_date || c.start_time) >= now,
        );
        const completed = classes.filter(
            (c) => c.status === "completada" || c.status === "completed",
        );
        const cancelled = classes.filter(
            (c) => c.status === "cancelada" || c.status === "cancelled",
        );

        container.innerHTML = `
            <article class="profile-stat">
                <strong>${upcoming.length}</strong>
                <span>Clases próximas</span>
            </article>
            <article class="profile-stat">
                <strong>${completed.length}</strong>
                <span>Clases completadas</span>
            </article>
            <article class="profile-stat">
                <strong>${classes.length}</strong>
                <span>Total de reservas</span>
            </article>
            <article class="profile-stat">
                <strong>${cancelled.length}</strong>
                <span>Canceladas</span>
            </article>
        `;
    }

    // ── Init ─────────────────────────────────────────────────────────
    document.addEventListener("DOMContentLoaded", () => {
        loadUserData();
        loadStats();

        // Toggle contraseñas
        document.querySelectorAll(".input-password-toggle").forEach((btn) => {
            btn.addEventListener("click", () => togglePasswordVisibility(btn));
        });

        // Fortaleza de contraseña
        const newPwd = document.getElementById("profile-new-password");
        const strengthBar = document.getElementById(
            "profile-password-strength",
        );
        if (newPwd && strengthBar) {
            newPwd.addEventListener("input", () => {
                strengthBar.innerHTML = passwordStrength(newPwd.value);
            });
        }

        // Formulario datos personales
        document
            .getElementById("profile-personal-form")
            ?.addEventListener("submit", async (e) => {
                e.preventDefault();

                const name = document.getElementById("profile-name").value;
                const surname =
                    document.getElementById("profile-surname").value;
                const email = document.getElementById("profile-email").value;
                const phone = document.getElementById("profile-phone").value;

                if (!name || !surname) {
                    showFeedback(
                        "Por favor, completa nombre y apellido.",
                        "error",
                    );
                    return;
                }

                if (window.currentUser?.student_profile) {
                    window.currentStudentId =
                        window.currentUser.student_profile.id;
                }

                // Valida que el email tenga formato correcto
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showFeedback(
                        "Por favor, introduce un email válido.",
                        "error",
                    );
                    return;
                }

                try {
                    if (typeof Api !== "undefined" && window.currentUserId) {
                        const updateData = {
                            name: name,
                            surname1: surname.split(" ")[0] || surname,
                            surname2:
                                surname.split(" ").slice(1).join(" ") || null,
                            phone,
                            email,
                        };

                        console.log("📤 Datos a enviar al API:", updateData);
                        const resp = await Api.updateStudent(
                            window.currentStudentId,
                            updateData,
                        );
                        console.log("✅ Respuesta del servidor:", resp);

                        window.originalEmail = email; // Actualiza el email original guardado
                        showFeedback(
                            "Datos actualizados correctamente.",
                            "success",
                        );
                    } else {
                        // Fallback si no hay API disponible
                        await new Promise((r) => setTimeout(r, 250));
                        window.originalEmail = email;
                        showFeedback(
                            "Datos actualizados correctamente.",
                            "success",
                        );
                    }
                } catch (err) {
                    console.error("Error al actualizar datos:", err);

                    // Manejo específico de errores
                    let mensaje = "Error al actualizar los datos.";
                    if (err.message && err.message.includes("email")) {
                        mensaje =
                            "El email ya está registrado. Usa otro email diferente.";
                    } else if (err.message) {
                        mensaje = err.message;
                    }
                    showFeedback(mensaje, "error");
                }
            });

        // Formulario contraseña
        document
            .getElementById("profile-password-form")
            ?.addEventListener("submit", async (e) => {
                e.preventDefault();
                const current = document.getElementById(
                    "profile-current-password",
                ).value;
                const newP = document.getElementById(
                    "profile-new-password",
                ).value;
                const confirm = document.getElementById(
                    "profile-new-password-confirm",
                ).value;
                const strengthBar = document.getElementById(
                    "profile-password-strength",
                );

                if (!current) {
                    showFeedback("Introduce tu contraseña actual.", "error");
                    return;
                }
                if (newP.length < 8) {
                    showFeedback(
                        "La nueva contraseña debe tener al menos 8 caracteres.",
                        "error",
                    );
                    return;
                }
                if (newP !== confirm) {
                    showFeedback(
                        "Las contraseñas nuevas no coinciden.",
                        "error",
                    );
                    return;
                }

                try {
                    if (typeof Api !== "undefined" && window.currentUserId) {
                        console.log("🔐 Enviando cambio de contraseña...");
                        const resp = await Api.changeStudentPassword(
                            window.currentStudentId,
                            {
                                current_password: current,
                                password: newP,
                                password_confirmation: confirm,
                            },
                        );

                        console.log("✅ Contraseña actualizada:", resp);
                        showFeedback(
                            "Contraseña actualizada correctamente.",
                            "success",
                        );
                        e.target.reset();
                        if (strengthBar) strengthBar.innerHTML = "";
                    } else {
                        // Fallback: simulación local (sin cambio real)
                        await new Promise((r) => setTimeout(r, 250));
                        showFeedback(
                            "Contraseña actualizada correctamente.",
                            "success",
                        );
                        e.target.reset();
                        if (strengthBar) strengthBar.innerHTML = "";
                    }
                } catch (err) {
                    console.error("Error al cambiar contraseña:", err);
                    showFeedback(
                        err.message || "Error al cambiar la contraseña.",
                        "error",
                    );
                }
            });
    });
})();
