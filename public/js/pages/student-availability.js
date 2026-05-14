import { showState } from '../ui-feedback.js';

document.addEventListener('DOMContentLoaded', () => {
    Router.init();

    const townSelect = document.getElementById('town-select');
    const messageBox = document.getElementById('message-state');

    // Cargar poblaciones
    loadTowns();

    async function loadTowns() {
        try {
            const result = await Api.getTowns();
            const towns = Array.isArray(result) ? result : (result.data || []);

            townSelect.innerHTML = '<option value="">Selecciona población</option>';

            towns.forEach(town => {
                if (!town.is_active && !town.active) return;

                const opt = document.createElement('option');
                opt.value = town.id;
                opt.textContent = town.name;
                townSelect.appendChild(opt);
            });

        } catch (err) {
            showState(messageBox, 'error', 'No se pudieron cargar las poblaciones.');
        }
    }

    // Aquí continúa tu lógica de reserva...
});