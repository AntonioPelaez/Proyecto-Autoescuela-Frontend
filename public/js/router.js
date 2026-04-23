// ─────────────────────────────────────────────
// router.js — Navegación y control de acceso por rol
// No contiene lógica de API ni de sesión.
// ─────────────────────────────────────────────

const Router = {

    // Rutas permitidas por rol
    _routes: {
        admin:   ['/dashboard', '/admin/towns', '/admin/professors', '/admin/vehicles'],
        student: ['/dashboard', '/student/availability', '/student/my-classes'],
        teacher: ['/dashboard', '/teacher/classes', '/teacher/bookings'],
    },

    // Ruta pública (no requiere sesión)
    _publicRoutes: ['/login'],

    /**
     * Inicializa el router en cada carga de página.
     * Debe llamarse al inicio de cada vista.
     */
    init() {
        const path = window.location.pathname;

        const isPublic = this._publicRoutes.some(r => path.includes(r));

        // Si es ruta pública y ya está logueado → redirigir a dashboard
        if (isPublic) {
            if (Auth.isLogged()) {
                window.location.href = '/dashboard';
            }
            return;
        }

        // Si no está logueado → redirigir a login
        if (!Auth.isLogged()) {
            window.location.href = '/login';
            return;
        }

        // Verificar que el rol tiene acceso a la ruta actual
        const user = Auth.getUser();
        if (user && !this._canAccess(user.role, path)) {
            window.location.href = '/dashboard';
        }
    },

    /**
     * Comprueba si un rol tiene acceso a una ruta.
     */
    _canAccess(role, path) {
        const allowed = this._routes[role] || [];
        return allowed.some(r => path.includes(r));
    },

};
