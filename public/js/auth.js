const Auth = {

    _tokenKey: 'token',
    _userKey: 'user',

    // --- Token ---

    setToken(token) {
        localStorage.setItem(this._tokenKey, token);
    },

    getToken() {
        return localStorage.getItem(this._tokenKey);
    },

    clearToken() {
        localStorage.removeItem(this._tokenKey);
    },

    // --- Estado de sesión ---

    isLogged() {
        return !!this.getToken();
    },

    // --- Usuario ---

    setUser(user) {
        localStorage.setItem(this._userKey, JSON.stringify(user));
    },

    getUser() {
        const rawUser = localStorage.getItem(this._userKey);
        if (!rawUser) return null;

        try {
            return JSON.parse(rawUser);
        } catch (error) {
            this.clearUser();
            return null;
        }
    },

    clearUser() {
        localStorage.removeItem(this._userKey);
    },

    clearSession() {
        this.clearToken();
        this.clearUser();
    },

};
