/**
 * register.js — Formulario de registro de alumno (frontend adaptado al backend)
 */
(function() {
    'use strict';

    // ── Utilidades de UI ────────────────────────────────────────────
    function showError(id, msg) {
        const el = document.getElementById(id);
        if (el) { el.textContent = msg;
            el.style.display = msg ? 'block' : 'none'; }
        const input = document.getElementById(id.replace('err-', 'reg-'));
        if (input) input.classList.toggle('input-invalid', !!msg);
    }

    function clearErrors() {
        document.querySelectorAll('.input-error').forEach(el => { el.textContent = '';
            el.style.display = 'none'; });
        document.querySelectorAll('.input-invalid').forEach(el => el.classList.remove('input-invalid'));
    }

    function showGlobalError(msg) {
        const el = document.getElementById('register-error');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
        document.getElementById('register-success')?.classList.add('hidden');
    }

    function showGlobalSuccess(msg) {
        const el = document.getElementById('register-success');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
        document.getElementById('register-error')?.classList.add('hidden');
    }

    function setLoading(on) {
        const spinner = document.getElementById('register-spinner');
        const btn = document.getElementById('register-submit');
        if (spinner) spinner.classList.toggle('hidden', !on);
        if (btn) btn.disabled = on;
    }

    // ── Fortaleza de contraseña ─────────────────────────────────────
    function passwordStrength(pwd) {
        if (!pwd) return { level: 0, label: '' };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { level: 1, label: 'Débil', cls: 'strength-weak' };
        if (score <= 3) return { level: 2, label: 'Aceptable', cls: 'strength-ok' };
        return { level: 3, label: 'Fuerte', cls: 'strength-strong' };
    }

    function renderStrength(inputId, barId) {
        const input = document.getElementById(inputId);
        const bar = document.getElementById(barId);
        if (!input || !bar) return;
        input.addEventListener('input', () => {
            const s = passwordStrength(input.value);
            if (!s.label) { bar.innerHTML = ''; return; }
            bar.innerHTML = `<span class="strength-bar strength-bar-${s.level}"></span>
                             <span class="strength-label ${s.cls}">${s.label}</span>`;
        });
    }

    // ── Validación del formulario ───────────────────────────────────
    function validate(data) {
        let valid = true;

        if (!data.name.trim()) {
            showError('err-name', 'El nombre es obligatorio.');
            valid = false;
        }
        if (!data.surname.trim()) {
            showError('err-surname', 'Los apellidos son obligatorios.');
            valid = false;
        }
        if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            showError('err-email', 'Introduce un email válido.');
            valid = false;
        }
        if (!data.town_id) {
            showError('err-town', 'Selecciona una sede.');
            valid = false;
        }
        if (!data.phone.trim() || !/^[6-9][0-9]{8}$/.test(data.phone.replace(/\s/g, ''))) {
            showError('err-phone', 'Introduce un teléfono español válido (9 dígitos, empieza por 6-9).');
            valid = false;
        }
        if (!data.password || data.password.length < 8) {
            showError('err-password', 'La contraseña debe tener al menos 8 caracteres.');
            valid = false;
        }
        if (data.password !== data.password_confirm) {
            showError('err-password-confirm', 'Las contraseñas no coinciden.');
            valid = false;
        }
        if (!data.terms) {
            showError('err-terms', 'Debes aceptar los términos para continuar.');
            valid = false;
        }

        return valid;
    }

    // ── Cargar sedes desde la API ───────────────────────────────────
    async function loadTowns() {
        const select = document.getElementById('reg-town');

        try {
            const towns = await Api.getTowns(); // ← TU MÉTODO API
            select.innerHTML = '<option value="">Selecciona una sede</option>';

            towns.forEach(town => {
                const opt = document.createElement('option');
                opt.value = town.id;
                opt.textContent = town.name;
                select.appendChild(opt);
            });

        } catch (err) {
            select.innerHTML = '<option value="">Error cargando sedes</option>';
        }
    }

    // ── Inicialización ──────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {

        loadTowns(); // ← Cargar sedes al iniciar

        // Toggle visibilidad contraseñas
        document.querySelectorAll('.input-password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (!input) return;
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
                btn.textContent = show ? '🙈' : '👁';
            });
        });

        // Indicador de fortaleza
        renderStrength('reg-password', 'password-strength');

        // Envío del formulario
        const form = document.getElementById('register-form');
        if (!form) return;

        form.addEventListener('submit', async(e) => {
            e.preventDefault();
            clearErrors();

            // Apellidos → surname1 + surname2
            const surname = document.getElementById('reg-surname').value.trim();
            const [surname1, ...rest] = surname.split(" ");
            const surname2 = rest.join(" ") || null;

            const data = {
                name: document.getElementById('reg-name').value.trim(),
                surname: surname,
                surname1: surname1 || null,
                surname2: surname2,
                email: document.getElementById('reg-email').value.trim(),
                phone: document.getElementById('reg-phone').value.trim(),
                password: document.getElementById('reg-password').value,
                password_confirm: document.getElementById('reg-password-confirm').value,
                terms: document.getElementById('reg-terms').checked,
                town_id: document.getElementById('reg-town').value, // ← CORRECTO
            };

            if (!validate(data)) return;

            // Payload REAL que enviamos al backend
            const payload = {
                name: data.name,
                surname1: data.surname1,
                surname2: data.surname2,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role_id: 3,
                town_id: data.town_id,
                dni: null,
                date_of_birth: null,
                pickup_notes: null,
            };

            setLoading(true);

            try {
                await Api.register(payload);

                showGlobalSuccess('¡Cuenta creada correctamente! En breve recibirás un email de confirmación.');
                form.reset();
                document.getElementById('password-strength').innerHTML = '';

                setTimeout(() => { window.location.href = '/login'; }, 2000);

            } catch (err) {
                if (err.message && err.message.toLowerCase().includes('email')) {
                    showGlobalError('Ya existe una cuenta con ese email. Prueba a iniciar sesión.');
                } else {
                    showGlobalError('Error inesperado. Inténtalo de nuevo.');
                }
            } finally {
                setLoading(false);
            }
        });
    });
})();