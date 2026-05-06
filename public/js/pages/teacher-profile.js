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
    async function loadUserData() {
        try {
            if (typeof Api === 'undefined') {
                console.warn('API no cargada');
                return;
            }

            const response = await Api.getMe();
            const user = response.data || response;

            const [firstName, ...rest] = (user.name || '').split(' ');
            const surname = `${user.surname1 || ''} ${user.surname2 || ''}`.trim();

            const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
            set('profile-name',    firstName);
            set('profile-surname', surname);
            set('profile-email',   user.email);
            set('profile-phone',   user.phone || '');
            set('profile-license', user.license_types || '');
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            showFeedback('Error al cargar los datos del perfil.', 'error');
        }
    }

    // ── Cargar estadísticas ─────────────────────────────────────────
    async function loadStats() {
        const container = document.getElementById('profile-stats');
        if (!container) return;

        let bookings = [];
        try {
            if (typeof Api !== 'undefined') {
                const resp = await Api.getTeacherBookings();
                bookings = resp.data || [];
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            bookings = [];
        }

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
    document.addEventListener('DOMContentLoaded', async () => {
        await loadUserData();
        await loadStats();

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
    try {
        const firstName = document.getElementById('profile-name')?.value || '';
        const surnameFull = document.getElementById('profile-surname')?.value || '';
        const email = document.getElementById('profile-email')?.value || '';
        const phone = document.getElementById('profile-phone')?.value || '';

        if (!firstName || !email) {
            showFeedback('Completa los campos requeridos.', 'error');
            return;
        }

        // Dividir apellidos
        const [surname1, surname2 = ''] = surnameFull.split(' ');

        // Obtener teacher_profile_id REAL
        const me = await Api.getMe();
        const teacherId =
            me.teacher_profile?.id ||
            me.data?.teacher_profile?.id;

        if (!teacherId) {
            showFeedback('No se pudo identificar el perfil del profesor.', 'error');
            return;
        }

        // Llamar al CRUD de profesores
        await Api.updateTeacher(teacherId, {
            name: firstName,
            surname1,
            surname2,
            email,
            phone
        });

        showFeedback('Datos actualizados correctamente.', 'success');

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        showFeedback(error.message || 'Error al actualizar los datos.', 'error');
    }
});


        // Formulario contraseña
        // Formulario contraseña
document.getElementById('profile-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const current = document.getElementById('profile-current-password').value;
    const newP    = document.getElementById('profile-new-password').value;
    const confirm = document.getElementById('profile-new-password-confirm').value;

    if (!current) { showFeedback('Introduce tu contraseña actual.', 'error'); return; }
    if (newP.length < 8) { showFeedback('La nueva contraseña debe tener al menos 8 caracteres.', 'error'); return; }
    if (newP !== confirm) { showFeedback('Las contraseñas nuevas no coinciden.', 'error'); return; }

    try {
        if (typeof Api !== 'undefined') {

            // Obtener datos del usuario autenticado
            const me = await Api.getMe();
            const teacherId = me.teacher_profile_id || me.data?.teacher_profile_id;

            if (!teacherId) {
                showFeedback('No se pudo identificar el perfil del profesor.', 'error');
                return;
            }

            // Llamar al nuevo endpoint de cambio de contraseña
            await Api.updateTeacherPassword(teacherId, {
                current_password: current,
                password: newP,
                password_confirmation: confirm
            });

            showFeedback('Contraseña actualizada correctamente.', 'success');
            e.target.reset();
            const strengthBar = document.getElementById('profile-password-strength');
            if (strengthBar) strengthBar.innerHTML = '';
        }
    } catch (error) {
        console.error('Error actualizando contraseña:', error);
        showFeedback(error.message || 'Error al actualizar la contraseña.', 'error');
    }
});
    });
})();
