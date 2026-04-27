/**
 * teacher-profile.js — Perfil del profesor (mock)
 * Carga datos del usuario en sesión, permite editar y cambia contraseña.
 */
(function () {
    'use strict';

    // ── Utilidades ──────────────────────────────────────────────────
    function showFeedback(msg, type = 'success') {
        const el = document.getElementById('profile-feedback');
        if (!el) return;
        el.className = `message-state message-state-${type}`;
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 4000);
    }

    function passwordStrength(pwd) {
        if (!pwd) return '';
        let score = 0;
        if (pwd.length >= 8)  score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return '<span class="strength-bar strength-bar-1"></span><span class="strength-label strength-weak">Débil</span>';
        if (score <= 3) return '<span class="strength-bar strength-bar-2"></span><span class="strength-label strength-ok">Aceptable</span>';
        return '<span class="strength-bar strength-bar-3"></span><span class="strength-label strength-strong">Fuerte</span>';
    }

    function togglePasswordVisibility(btn) {
        const input = document.getElementById(btn.getAttribute('data-target'));
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-label', show ? 'Ocultar' : 'Mostrar');
        btn.textContent = show ? '🙈' : '👁';
    }

    // ── Cargar datos del usuario ────────────────────────────────────
    function loadUserData() {
        const raw = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
        let user = null;
        try { user = raw ? JSON.parse(raw) : null; } catch { user = null; }

        if (!user) {
            user = { name: 'Prof. Demo', email: 'profesor@demo.com', phone: '654321987', license_types: 'B, A2' };
        }

        const [firstName, ...rest] = (user.name || '').split(' ');
        const surname = user.surname || rest.join(' ') || '';

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        set('profile-name',    firstName);
        set('profile-surname', surname);
        set('profile-email',   user.email);
        set('profile-phone',   user.phone || '');
        set('profile-license', user.license_types || '');
    }

    // ── Cargar estadísticas ─────────────────────────────────────────
    async function loadStats() {
        const container = document.getElementById('profile-stats');
        if (!container) return;

        let bookings = [];
        try {
            if (typeof Api !== 'undefined') {
                const resp = await Api.getBookings();
                bookings = resp.data || [];
            }
        } catch { bookings = []; }

        const now = new Date();
        const upcoming  = bookings.filter(b => new Date(b.date) >= now);
        const completed = bookings.filter(b => b.status === 'completada');
        const inProgress = bookings.filter(b => b.status === 'en_curso');

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
                <strong>${inProgress.length}</strong>
                <span>En curso</span>
            </article>
            <article class="profile-stat">
                <strong>${bookings.length}</strong>
                <span>Total de clases</span>
            </article>
        `;
    }

    // ── Init ─────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        loadUserData();
        loadStats();

        // Toggle contraseñas
        document.querySelectorAll('.input-password-toggle').forEach(btn => {
            btn.addEventListener('click', () => togglePasswordVisibility(btn));
        });

        // Fortaleza contraseña
        const newPwd = document.getElementById('profile-new-password');
        const strengthBar = document.getElementById('profile-password-strength');
        if (newPwd && strengthBar) {
            newPwd.addEventListener('input', () => {
                strengthBar.innerHTML = passwordStrength(newPwd.value);
            });
        }

        // Formulario datos personales
        document.getElementById('profile-personal-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await new Promise(r => setTimeout(r, 250));
            showFeedback('Datos actualizados correctamente.', 'success');
        });

        // Formulario contraseña
        document.getElementById('profile-password-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const current = document.getElementById('profile-current-password').value;
            const newP    = document.getElementById('profile-new-password').value;
            const confirm = document.getElementById('profile-new-password-confirm').value;

            if (!current) { showFeedback('Introduce tu contraseña actual.', 'error'); return; }
            if (newP.length < 8) { showFeedback('La nueva contraseña debe tener al menos 8 caracteres.', 'error'); return; }
            if (newP !== confirm) { showFeedback('Las contraseñas nuevas no coinciden.', 'error'); return; }

            await new Promise(r => setTimeout(r, 250));
            showFeedback('Contraseña actualizada correctamente.', 'success');
            e.target.reset();
            if (strengthBar) strengthBar.innerHTML = '';
        });
    });
})();
