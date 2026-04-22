const Auth = {

    // --- Token ---

    setToken(token) {
        localStorage.setItem('token', token);
    },

    getToken() {
        return localStorage.getItem('token');
    },

    clearToken() {
        localStorage.removeItem('token');
    },

    // --- Estado de sesión ---

    isLogged() {
        return !!localStorage.getItem('token');
    },

    // --- Usuario ---

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    clearUser() {
        localStorage.removeItem('user');
    },

};
