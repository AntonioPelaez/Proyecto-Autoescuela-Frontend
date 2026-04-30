// ui-feedback.js
// Centraliza el feedback visual accesible y animado para todos los módulos

export function showState(messageBox, type, message) {
    if (!messageBox) return;
    if (!message) {
        messageBox.textContent = "";
        messageBox.className = "hidden";
        messageBox.removeAttribute('role');
        return;
    }

    messageBox.textContent = message;
    if (type === 'error') {
        messageBox.className = 'card card-body input-error state-message state-error';
        messageBox.setAttribute('role', 'alert');
    } else {
        messageBox.className = 'card card-body state-message state-success';
        messageBox.setAttribute('role', 'status');
    }
    messageBox.setAttribute('aria-live', 'assertive');

    // Animación de aparición
    messageBox.style.opacity = 0;
    messageBox.style.transition = 'opacity 0.3s';
    setTimeout(() => {
        messageBox.style.opacity = 1;
    }, 10);

    // Auto-ocultar después de 3.5s si es éxito
    if (type !== 'error') {
        setTimeout(() => {
            messageBox.style.opacity = 0;
            setTimeout(() => {
                messageBox.textContent = '';
                messageBox.className = 'hidden';
                messageBox.removeAttribute('role');
            }, 350);
        }, 3500);
    }

    if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(message, type === 'error' ? 'error' : 'success');
    }
}
