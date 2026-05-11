// teacher-availability.js — Gestión de disponibilidades para profesor
document.addEventListener('DOMContentLoaded', () => {

  // Inyectar estilos específicos para la página de disponibilidad
  const style = document.createElement('style');
  style.textContent = `
    .hour-btn {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      width: 100%;
    }

    .hour-btn:hover {
      background: #e5e7eb;
    }

    .hour-btn.selected {
      background: #2563eb;
      color: white;
      border-color: #1d4ed8;
    }

    .slot-time-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }
  `;
  document.head.appendChild(style);

  Router.init();

  const availabilityForm = document.getElementById('availability-form');
  const professorSelect = document.getElementById('availability-professor');
  const townGroup = document.getElementById('availability-town-group');
  const townSelect = document.getElementById('availability-town');
  const daySelect = document.getElementById('availability-day');
  const timeGrid = document.getElementById('availability-time-grid');
  const startInput = document.getElementById('availability-start');
  const endInput = document.getElementById('availability-end');
  const typeSelect = document.getElementById('availability-type');
  const reasonWrapper = document.getElementById('availability-reason-wrapper');
  const reasonInput = document.getElementById('availability-reason');
  const blockTypeSelect = document.getElementById('availability-block-type');
  const createBtn = document.getElementById('availability-create');
  const messageBox = document.getElementById('availability-message');
  const weeklyBody = document.getElementById('teacher-availability-body');

  let availabilitySelectedTimes = new Set();
  let currentTeacherId = null;
  let teacherTowns = [];

  function showMessage(type, text) {
    if (!messageBox) return;
    if (!text) {
      messageBox.textContent = '';
      messageBox.className = 'hidden';
      return;
    }
    messageBox.textContent = text;
    messageBox.className = type === 'error' ? 'card card-body input-error' : 'card card-body state-message state-success';
    messageBox.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageBox.style.opacity = 0;
    setTimeout(() => messageBox.style.opacity = 1, 10);
    if (type !== 'error') {
      setTimeout(() => {
        messageBox.style.opacity = 0;
        setTimeout(() => {
          messageBox.textContent = '';
          messageBox.className = 'hidden';
        }, 350);
      }, 3000);
    }
  }

  function syncAvailabilityRange() {
    if (availabilitySelectedTimes.size === 0) {
      startInput.value = '';
      endInput.value = '';
      return;
    }
    const sorted = [...availabilitySelectedTimes].sort();
    startInput.value = sorted[0];
    endInput.value = sorted[sorted.length - 1];
  }

  function updateHourUI() {
    if (!timeGrid) return;
    timeGrid.querySelectorAll('.hour-btn').forEach(btn => {
      const hour = btn.textContent.trim();
      btn.classList.toggle('selected', availabilitySelectedTimes.has(hour));
    });
  }

  function renderAvailabilityHourGrid() {
    if (!timeGrid) return;
    timeGrid.innerHTML = '';
    const hours = [
      "08:00","08:45","09:30","10:15","11:00","11:45",
      "12:30","13:15","14:00","14:45","15:30","16:15",
      "17:00","17:45","18:30","19:15","20:00","20:45"
    ];
    hours.forEach(time => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hour-btn';
      btn.textContent = time;
      btn.addEventListener('click', () => {
        if (availabilitySelectedTimes.has(time)) {
          availabilitySelectedTimes.delete(time);
          btn.classList.remove('selected');
        } else {
          availabilitySelectedTimes.add(time);
          btn.classList.add('selected');
        }
        syncAvailabilityRange();
        updateHourUI();
      });
      timeGrid.appendChild(btn);
    });
  }

  async function loadInitialData() {
    try {
      const meResp = await Api.getMe();
      const me = meResp.data || meResp;
      currentTeacherId = me.teacher_profile?.id || me.teacher_profile_id || me.teacher_profile_id;
      const teacherName = (me.name || me.teacher_name || me.teacher_profile?.name) || 'Profesor';
      professorSelect.replaceChildren();
      const opt = document.createElement('option');
      opt.value = currentTeacherId || '';
      opt.textContent = teacherName;
      professorSelect.appendChild(opt);
      if (!currentTeacherId) {
        professorSelect.disabled = true;
      }

      // Cargar poblaciones si el profesor tiene asignadas o cargar todas
      try {
        const townsResp = await Api.getTowns();
        const towns = Array.isArray(townsResp) ? townsResp : (townsResp.data || townsResp);
        // Si el backend devuelve towns asignadas en el perfil, preferirlas
        teacherTowns = me.teacher_profile?.towns || me.towns || [];
        const useTowns = teacherTowns.length ? teacherTowns : towns;
        townSelect.replaceChildren();
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Selecciona una población';
        townSelect.appendChild(defaultOpt);
        useTowns.forEach(t => {
          const option = document.createElement('option');
          option.value = String(t.id || t);
          option.textContent = t.name || t;
          townSelect.appendChild(option);
        });
        // Si solo hay una población, seleccionarla y ocultar el selector
        if (useTowns.length === 1) {
          townSelect.value = String(useTowns[0].id || useTowns[0]);
          townGroup.style.display = 'none';
        } else {
          townGroup.style.display = '';
        }
      } catch (err) {
        townGroup.style.display = 'none';
      }

      renderAvailabilityHourGrid();
      await loadWeeklyAvailabilities();
    } catch (error) {
      console.error('Error inicializando disponibilidad:', error);
      showMessage('error', 'No se pudo cargar datos iniciales.');
    }
  }

  async function loadWeeklyAvailabilities() {
    try {
      const resp = await Api.getWeeklyAvailabilities({ teacher_profile_id: currentTeacherId });
      const slots = resp.data || resp || [];
      weeklyBody.replaceChildren();
      if (!slots.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" style="text-align:center; color:#6b7280;">No hay disponibilidades registradas.</td>';
        weeklyBody.appendChild(tr);
        return;
      }
      slots.forEach(slot => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${slot.teacher_profile_id}</td>
          <td>${slot.town_id || '-'}</td>
          <td>${slot.day_of_week}</td>
          <td>${slot.starts_time}</td>
          <td>${slot.end_time}</td>
          <td>${slot.slot_minutes}</td>
          <td>${slot.is_active ? 'Sí' : 'No'}</td>
        `;
        weeklyBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error cargando disponibilidades semanales:', error);
    }
  }

  // Mostrar/ocultar razón según tipo
  typeSelect.addEventListener('change', () => {
    if (typeSelect.value === 'especial') {
      reasonWrapper.classList.remove('hidden');
    } else {
      reasonWrapper.classList.add('hidden');
    }
  });

  // Crear disponibilidad
  createBtn.addEventListener('click', async () => {
    const teacherId = currentTeacherId;
    const townId = townSelect.value || null;
    const day = daySelect.value;
    const start = startInput.value ? startInput.value + ':00' : '';
    const end = endInput.value ? endInput.value + ':00' : '';
    const type = typeSelect.value;
    const reason = reasonInput.value;
    const blockType = blockTypeSelect.value;

    if (!teacherId || !day || !start || !end || !blockType) {
      showMessage('error', 'Completa los campos obligatorios: día, horario y tipo de bloque.');
      return;
    }

    const payload = {
      teacher_profile_id: teacherId,
      town_id: townId,
      day_of_week: Number(day),
      starts_time: start,
      end_time: end,
      slot_minutes: 45,
      is_active: true,
      type: type,
      block_type: blockType
    };

    if (type === 'especial' && reason) {
      payload.reason = reason;
    }

    try {
    UI.setLoading(true);
    await fetch(`${API_BASE_URL}/teacher-weekly-availabilities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    }).then(handleResponse);

    showMessage('success', 'Disponibilidad creada correctamente.');
    availabilitySelectedTimes.clear();
    syncAvailabilityRange();
    updateHourUI();
    await loadWeeklyAvailabilities();
    } catch (error) {
    console.error('Error creando disponibilidad:', error);
    showMessage('error', 'No se pudo crear la disponibilidad.');
    } finally {
    UI.setLoading(false);
    }
  });

  // Inicializar
  loadInitialData();

});