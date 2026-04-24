// logout.js — Cierre de sesion reutilizable
(function () {
    'use strict';

    function logout() {
        if (typeof Auth !== 'undefined') {
            Auth.clearSession();
        }
        window.location.replace('/login');
    }

    function init() {
        const buttons = document.querySelectorAll('[data-action="logout"]');
        if (!buttons.length) {
            return;
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                logout();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
