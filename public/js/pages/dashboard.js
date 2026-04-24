// ─────────────────────────────────────────────
// dashboard.js — Router automático por rol
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    Router.init();

    const user = Auth.getUser();
    if (!user) {
        window.location.replace('/login');
        return;
    }

    const target = Router.getHomeRoute(user.role);

    if (!target) {
        window.location.replace('/login');
        return;
    }

    window.location.replace(target);
});
