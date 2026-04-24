// ─────────────────────────────────────────────
// router.js — Navegación y control de acceso por rol
// No contiene lógica de API ni de sesión.
// ─────────────────────────────────────────────

const Router = {

    // Rutas permitidas por rol
    _routes: {
        admin:   ['/dashboard', '/admin/towns', '/admin/professors', '/admin/vehicles'],
        student: ['/dashboard', '/student/home', '/student/availability', '/student/my-classes'],
        teacher: ['/dashboard', '/teacher/home', '/teacher/classes', '/teacher/bookings'],
    },

    // Home canónico por rol
    _roleHome: {
        admin: '/admin/towns',
        student: '/student/home',
        teacher: '/teacher/home',
    },

    // Ruta pública (no requiere sesión)
    _publicRoutes: ['/login'],

    /**
     * Inicializa el router en cada carga de página.
     * Debe llamarse al inicio de cada vista.
     */
    init() {
        const path = this._normalizePath(window.location.pathname);
        const isPublic = this._isPublicRoute(path);

        // Si es ruta pública y ya está logueado → redirigir a dashboard
        if (isPublic) {
            if (Auth.isLogged()) {
                window.location.replace('/dashboard');
            }
            return;
        }

        // Si no está logueado → redirigir a login
        if (!Auth.isLogged()) {
            window.location.replace('/login');
            return;
        }

        // Verificar que el rol tiene acceso a la ruta actual
        const user = Auth.getUser();
        if (!user || !this._roleHome[user.role]) {
            Auth.clearSession();
            window.location.replace('/login');
            return;
        }

        if (!this._canAccess(user.role, path)) {
            window.location.replace(this.getHomeRoute(user.role));
        }
    },

    getHomeRoute(role) {
        return this._roleHome[role] || '/login';
    },

    _normalizePath(path) {
        if (!path) return '/';

        let normalized = path;
        if (!normalized.startsWith('/')) {
            normalized = '/' + normalized;
        }

        normalized = normalized.replace(/\/+$/, '');
        return normalized || '/';
    },

    _isPublicRoute(path) {
        const normalizedPath = this._normalizePath(path);
        return this._publicRoutes.includes(normalizedPath);
    },

    /**
     * Comprueba si un rol tiene acceso a una ruta.
     */
    _canAccess(role, path) {
        const allowed = this._routes[role] || [];
        const normalizedPath = this._normalizePath(path);
        return allowed.includes(normalizedPath);
    },

};
