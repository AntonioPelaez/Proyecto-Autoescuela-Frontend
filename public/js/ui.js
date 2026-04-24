// ─────────────────────────────────────────────
// ui.js — Helpers para toasts y loaders
// ─────────────────────────────────────────────

const UI = {

    /**
     * Muestra un toast (notificación temporal)
     * @param {string} message - Texto del mensaje
     * @param {string} type - 'success' | 'error' | 'info' (default: 'info')
     */
    showToast(message, type = 'info') {
        const allowedTypes = ['success', 'error', 'info'];
        const toastType = allowedTypes.includes(type) ? type : 'info';
        const containerClass = 'toast-container';
        let container = document.querySelector(`.${containerClass}`);

        if (!container) {
            container = document.createElement('div');
            container.className = containerClass;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${toastType}`;
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        container.appendChild(toast);

        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    },

    /**
     * Muestra u oculta un loader en un contenedor
     * @param {string} containerId - ID del elemento contenedor
     * @param {boolean} isLoading - true para mostrar, false para ocultar
     */
    setLoading(containerId, isLoading) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let loader = container.querySelector('.loader');
        const isTableBody = container.tagName === 'TBODY';

        if (isLoading) {
            // Crear loader si no existe
            if (!loader) {
                container.innerHTML = '';

                if (isTableBody) {
                    const row = document.createElement('tr');
                    row.className = 'table-empty';

                    const cell = document.createElement('td');
                    cell.colSpan = 99;

                    loader = document.createElement('div');
                    loader.className = 'loader loader-md loader-table';
                    loader.textContent = 'Cargando...';

                    cell.appendChild(loader);
                    row.appendChild(cell);
                    container.appendChild(row);
                } else {
                    loader = document.createElement('div');
                    loader.className = 'loader loader-md loader-inline';
                    loader.textContent = 'Cargando...';
                    container.appendChild(loader);
                }
            }
            loader.style.display = 'inline-flex';
        } else {
            // Ocultar loader si existe
            if (loader) {
                const row = loader.closest('tr');
                if (row && row.parentElement === container) {
                    row.remove();
                } else {
                    loader.remove();
                }
            }
        }
    },

};
