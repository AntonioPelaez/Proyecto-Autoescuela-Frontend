// ─────────────────────────────────────────────
// login.js — Coordina el flujo de autenticación
// No contiene lógica de API ni de sesión.
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // ...existing code...
    const form        = document.getElementById('login-form');
    const errorBox    = document.getElementById('login-error');
    const spinner     = document.getElementById('login-spinner');
    const btnSubmit   = document.getElementById('login-submit');

    // Redirige si ya está logueado
    if (Auth.isLogged()) {
        const currentUser = Auth.getUser();
        if (currentUser) {
            _redirectByRole(currentUser);
        } else {
            Auth.clearSession();
        }
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // --- Validación básica ---
        if (!email || !password) {
            _showError('El email y la contraseña son obligatorios.');
            return;
        }

        if (!_isValidEmail(email)) {
            _showError('Introduce un email válido.');
            return;
        }

        _clearError();
        _setLoading(true);
        Auth.clearSession();

        try {
            // 1. Llamar a la API de login
            const loginResponse = await Api.login(email, password);

            // Soporta distintos contratos de login del backend
            const token =
                loginResponse?.token ??
                loginResponse?.access_token ??
                loginResponse?.data?.token ??
                loginResponse?.data?.access_token;

            if (!token) {
                throw new Error('La API de login no devolvio token de autenticacion.');
            }

            // 2. Guardar token en sesión
            Auth.setToken(token);

            // 3. Obtener datos del usuario
            let user = await Api.getMe();

            // 4. Mapear role_id a role si es necesario
            if (!user.role && user.role_id) {
                const roleMap = { 1: 'admin', 2: 'teacher', 3: 'student' };
                user.role = roleMap[user.role_id] || 'student';
            }

            // 5. Guardar usuario en sesión
            Auth.setUser(user);

            // 6. Redirigir según rol
            _redirectByRole(user);

        } catch (err) {
            Auth.clearSession();
            _showError(err.message || 'Error al iniciar sesión.');
        } finally {
            _setLoading(false);
        }
    });

    // ─────────────────────────────────────────────
    // Helpers internos de este módulo
    // ─────────────────────────────────────────────

    function _redirectByRole(user) {
        if (!user) return;

        const roleHome = {
            admin: '/admin/towns',
            student: '/student/home',
            teacher: '/teacher/home',
        };

        const target = roleHome[user.role] || '/dashboard';
        window.location.replace(target);
    }

    function _isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function _showError(msg) {
        errorBox.textContent = msg;
        errorBox.classList.remove('hidden');
    }

    function _clearError() {
        errorBox.textContent = '';
        errorBox.classList.add('hidden');
    }

    function _setLoading(state) {
        btnSubmit.disabled = state;
        spinner.classList.toggle('hidden', !state);
    }

});
