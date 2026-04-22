// ─────────────────────────────────────────────
// dashboard.js — Carga el contenido según el rol
// No contiene lógica de API ni de sesión.
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // El router ya habrá redirigido si no hay sesión
    Router.init();

    const user = Auth.getUser();
    if (!user) return;

    _renderMenu(user);
    _renderContent(user);
    _renderUserInfo(user);

    // --- Botón de logout ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            Auth.clearToken();
            Auth.clearUser();
            window.location.href = '/login';
        });
    }

    // ─────────────────────────────────────────────
    // Menú lateral según rol
    // ─────────────────────────────────────────────

    function _renderMenu(user) {
        const menu = document.getElementById('sidebar-menu');
        if (!menu) return;

        const items = _getMenuItems(user.role);

        menu.innerHTML = items
            .map(item => `<li><a href="${item.href}">${item.label}</a></li>`)
            .join('');
    }

    function _getMenuItems(role) {
        const menus = {
            admin: [
                { label: 'Dashboard',   href: '/dashboard' },
                { label: 'Poblaciones', href: '/admin/towns' },
                { label: 'Profesores',  href: '/admin/professors' },
            ],
            student: [
                { label: 'Dashboard',        href: '/dashboard' },
                { label: 'Disponibilidad',   href: '/student/availability' },
            ],
            teacher: [
                { label: 'Dashboard', href: '/dashboard' },
            ],
        };

        return menus[role] || [];
    }

    // ─────────────────────────────────────────────
    // Contenido principal según rol
    // ─────────────────────────────────────────────

    function _renderContent(user) {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        const messages = {
            admin:   'Panel de administración. Gestiona poblaciones, profesores y vehículos.',
            student: 'Panel del alumno. Consulta tu disponibilidad y tus clases reservadas.',
            teacher: 'Panel del profesor. Consulta tu agenda de clases.',
        };

        container.textContent = messages[user.role] || 'Bienvenido.';
    }

    // ─────────────────────────────────────────────
    // Nombre del usuario en cabecera
    // ─────────────────────────────────────────────

    function _renderUserInfo(user) {
        const nameEl = document.getElementById('user-name');
        if (nameEl) nameEl.textContent = user.name;

        const roleEl = document.getElementById('user-role');
        if (roleEl) roleEl.textContent = user.role;
    }

});
