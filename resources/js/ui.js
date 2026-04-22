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
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Estilos inline mínimos para funcionalidad
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            toast.remove();
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

        if (isLoading) {
            // Crear loader si no existe
            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'loader';
                loader.textContent = 'Cargando...';
                loader.style.cssText = `
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    font-size: 14px;
                    color: #666;
                `;
                container.innerHTML = '';
                container.appendChild(loader);
            }
            loader.style.display = 'flex';
        } else {
            // Ocultar loader si existe
            if (loader) {
                loader.style.display = 'none';
            }
        }
    },

};
