// student-availability.js (MÓDULO ES6)
import { showState } from '../ui-feedback.js';

document.addEventListener('DOMContentLoaded', () => {

    Router.init();

    const townSelect = document.getElementById('town-select');
    const dateSelect = document.getElementById('date-select');
    const messageBox = document.getElementById('message-state');
    const form = document.getElementById('selection-form');

    const slotsSection = document.getElementById('time-slots-section');
    const slotsGrid = document.getElementById('time-slots-grid');

    console.log("student-availability.js cargado correctamente");

    // ============================
    // 1) Cargar poblaciones
    // ============================
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
            console.error(err);
            showState(messageBox, 'error', 'No se pudieron cargar las poblaciones.');
        }
    }

    // ============================
    // 2) Manejar envío del formulario
    // ============================
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // ← evita refresco de página

        const townId = townSelect.value;
        const date = dateSelect.value;

        if (!townId || !date) {
            showState(messageBox, 'error', 'Selecciona población y fecha.');
            return;
        }

        await loadSlots(townId, date);
    });

    // ============================
    // 3) Cargar horarios disponibles
    // ============================
    async function loadSlots(townId, date) {
        try {
            showState(messageBox, 'info', 'Buscando horarios...');

            const result = await Api.getAvailabilitySlots({ town_id: townId, date });
            const slots = Array.isArray(result) ? result : (result.data || []);

            slotsGrid.innerHTML = '';
            slotsSection.style.display = 'block';

            if (!slots.length) {
                slotsGrid.innerHTML = `
                    <p style="color:#999;">No hay horarios disponibles para esta fecha.</p>
                `;
                showState(messageBox, 'success', 'No hay horarios disponibles.');
                return;
            }

            // Renderizar botones de horas
            slots.forEach(slot => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'slot-btn';
                btn.textContent = slot.time || slot.display || 'Hora';

                btn.addEventListener('click', () => {
                    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });

                slotsGrid.appendChild(btn);
            });

            showState(messageBox, 'success', 'Horarios cargados correctamente.');

        } catch (err) {
            console.error(err);
            showState(messageBox, 'error', 'No se pudieron cargar los horarios.');
        }
    }

});