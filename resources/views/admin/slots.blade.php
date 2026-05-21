@extends('layouts.admin')

@section('title', 'Huecos ofertados')
@section('main-id', 'admin-slots-page')

@section('content')
			<header>
				<h1>Gestión de huecos ofertados</h1>
				<a href="/dashboard" class="btn btn-outline btn-sm">Ir al panel</a>
			</header>

			<div id="slots-message" class="hidden" tabindex="-1"></div>

			<section class="card">
				<div class="card-header">
					<h2 id="slot-form-title">Filtrar hueco</h2>
				</div>
				<div class="card-body">
					<form id="slot-form" novalidate role="form" aria-label="Formulario de gestión de huecos de clase">
						<input type="hidden" id="slot-id" name="id">

						<div class="input-group">
							<label class="input-label" for="slot-town">Población</label>
							<select id="slot-town" name="townId" class="input" required>
								<option value="">Selecciona una población</option>
							</select>
						</div>

						<div class="input-group">
							<label class="input-label" for="slot-date">Fecha</label>
							<input type="date" id="slot-date" name="date" class="input" required>
						</div>



						<div class="input-group">
							<label class="input-label" for="slot-professor">Profesor</label>
							<select id="slot-professor" name="professorId" class="input" required>
								<option value="">Selecciona un profesor</option>
							</select>
						</div>
						<div class="input-group" id="slot-time-grid-wrapper">
							<p class="slot-time-help">Pulsa una o varias horas para seleccionarlas. Si vuelves a pulsar una hora roja, se desmarca.</p>
							<div id="slot-time-grid" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;"></div>
							<input type="hidden" id="slot-time" name="time" required>
						</div>

						<div class="input-group">
							<label class="input-label" for="slot-vehicle">Vehículo</label>
							<input
								type="text"
								id="slot-vehicle"
								name="vehicle"
								class="input"
								placeholder="Ej. Seat Ibiza"
								required
							>
						</div>

						<div class="table-actions">
							<button type="submit" id="slot-submit" class="btn btn-primary" aria-label="Filtrar huecos">Filtrar hueco</button>
							<button type="button" id="slot-cancel" class="btn btn-outline hidden" aria-label="Cancelar edición">Cancelar edición</button>
						</div>
					</form>
				</div>
			</section>



	
	<!-- Crear disponiblidad -->
<section class="card" style="margin-top: 1.5rem;">
    <div class="card-header">
        <h2>Crear disponibilidad</h2>
    </div>

    <div class="card-body">
        <form id="availability-form">

            <!-- Día de la semana (solo normal) -->
            <div class="input-group" id="availability-day-wrapper">
                <label class="input-label" for="availability-day">Día de la semana</label>
                <select id="availability-day" class="input" required>
                    <option value="">Selecciona un día</option>
                    <option value="0">Domingo</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                </select>
            </div>

            <!-- Fecha (solo especial) -->
            <div class="input-group hidden" id="availability-date-wrapper">
                <label class="input-label" for="availability-date">Fecha de la disponibilidad especial</label>
                <input type="date" id="availability-date" class="input">
            </div>

            <!-- Razón (solo especial) -->
            <div class="input-group hidden" id="availability-reason-wrapper">
                <label class="input-label" for="availability-reason">Razón de la excepcionalidad</label>
                <input type="text" id="availability-reason" class="input" placeholder="Motivo...">
            </div>

            <!-- Profesor -->
            <div class="input-group">
                <label class="input-label" for="availability-professor">Profesor</label>
                <select id="availability-professor" class="input" required>
                    <option value="">Selecciona un profesor</option>
                </select>
            </div>

            <!-- Población -->
            <div class="input-group">
                <label class="input-label" for="availability-town">Población</label>
                <select id="availability-town" class="input" required>
                    <option value="">Selecciona una población</option>
                </select>
            </div>

            <!-- Horario -->
            <div class="input-group">
                <label class="input-label" for="availability-start-time">Hora de inicio *</label>
                <input type="time" id="availability-start-time" class="input" required>
            </div>

            <div class="input-group">
                <label class="input-label" for="availability-end-time">Hora de fin *</label>
                <input type="time" id="availability-end-time" class="input" required>
            </div>

            <!-- Tipo -->
            <div class="input-group">
                <label class="input-label" for="availability-type">Tipo</label>
                <select id="availability-type" class="input" required>
                    <option value="normal">Normal</option>
                    <option value="especial">Especial</option>
                </select>
            </div>

            <!-- Tipo de bloque -->
            <div class="input-group">
                <label class="input-label" for="availability-block-type">Tipo de bloque</label>
                <select id="availability-block-type" class="input" required>
                    <option value="">Selecciona tipo</option>
                    <option value="block">Bloque</option>
                    <option value="extra">Extra</option>
                </select>
            </div>

            <button type="button" id="availability-create" class="btn btn-success" style="margin-top:1rem;">
                Crear disponibilidad
            </button>

        </form>
    </div>
</section>




	<!-- Listado de huecos -->
			<section class="card">
				<div class="card-header">
					<h2>Listado de huecos</h2>
					<div id="slots-api-status" class="slots-api-status" aria-live="polite">Sincronizando con API...</div>
				</div>
				<div class="card-body table-wrapper">
					<table id="slots-table" class="table table-striped table-hover" role="table" aria-label="Listado de huecos ofertados">
						<thead>
    <tr>
        <th scope="col">Profesor</th>
        <th scope="col">Población</th>
        <th scope="col">Día / Fecha</th>
        <th scope="col">Hora inicio</th>
        <th scope="col">Hora fin</th>
        <th scope="col">Minutos</th>
        <th scope="col">Tipo</th>
        <th scope="col">Activo</th>
        <th scope="col">Acciones</th>
    </tr>
</thead>

						<tbody id="slots-table-body"></tbody>
					</table>
				</div>
			</section>
@endsection

@section('scripts')
	<script>console.log('[COPILOT DEBUG] Blade cargado');</script>
	<script src="{{ asset('js/pages/admin-slots.js') }}" defer></script>
	<style>
.state-message {
  margin: 1.2rem 0 0.7rem 0;
  font-size: 1.08rem;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  outline: none;
}
.state-success {
  background: #eafbe7;
  color: #1a4d1a;
  border: 1.5px solid #b6e2c6;
}
.state-error {
  background: #fff0f0;
  color: #a30000;
  border: 1.5px solid #f5bcbc;
}

/* ───────────────────────────────────────────── */
/*  GRID DE HORAS (Filtrar hueco + Disponibilidad) */
/* ───────────────────────────────────────────── */

/* Layout común para ambos grids */
.slot-time-grid {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

/* Estilo de los botones de hora */
.slot-time-grid .hour-btn {
  border: 1px solid #cfd6dd;
  background: #ffffff;
  color: #1f2937;
  padding: 0.35rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.slot-time-grid .hour-btn:hover:not(:disabled) {
  border-color: #b0b9c3;
  background: #f5f7fa;
}

.slot-time-grid .hour-btn.selected,
.slot-time-grid .hour-btn.selected:hover {
  background: #dc2626;
  border-color: #b91c1c;
  color: #ffffff;
}

.slot-time-grid .hour-btn.hour-booked,
.slot-time-grid .hour-btn.hour-booked:hover {
  background: #eceff3;
  border-color: #d4dbe3;
  color: #8a95a3;
  cursor: not-allowed;
}

/* Texto de ayuda */
.slot-time-help {
  margin: 0;
  color: #5f6b7a;
  font-size: 0.92rem;
}

/* ───────────────────────────────────────────── */

.slots-api-status {
  margin-left: auto;
  margin-right: 0.75rem;
  font-size: 0.88rem;
  color: #4b5563;
}
.slots-api-status.is-ok {
  color: #166534;
}
.slots-api-status.is-error {
  color: #991b1b;
}

/* ── Badges de estado del hueco ── */
.slot-status {
  display: inline-block;
  padding: 0.18em 0.7em;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.slot-status--pending     { background: #dbeafe; color: #1e40af; }
.slot-status--booked      { background: #dcfce7; color: #166534; }
.slot-status--deactivated { background: #f3f4f6; color: #6b7280; }
.slot-status--cancelled   { background: #fee2e2; color: #991b1b; }

/* ── Botones de acción compactos ── */
td .btn-danger  { background: #dc2626; color: #fff; border-color: #b91c1c; }
td .btn-danger:hover  { background: #b91c1c; }
td .btn-success { background: #16a34a; color: #fff; border-color: #15803d; }
td .btn-success:hover { background: #15803d; }

/* ============================================================
   ESTILOS NUEVOS — SOLO PARA LA DISPONIBILIDAD DEL ADMIN
   (NO AFECTA AL GRID DE HUECOS NI A LOS BOTONES EXISTENTES)
   ============================================================ */

/* Contenedor exclusivo del grid de disponibilidad */
#availability-time-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 0.5rem !important;
  margin-top: 0.5rem;
}

/* Botones de hora SOLO dentro del grid de disponibilidad */
#availability-time-grid .hour-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  width: 100%;
  font-size: 0.9rem;
  color: #1f2937;
}

/* Hover */
#availability-time-grid .hour-btn:hover {
  background: #e5e7eb;
}

/* Estado seleccionado (azul, igual que profesor) */
#availability-time-grid .hour-btn.selected {
  background: #2563eb;
  color: white;
  border-color: #1d4ed8;
}

/* Estado seleccionado + hover */
#availability-time-grid .hour-btn.selected:hover {
  background: #1d4ed8;
}

/* Estado deshabilitado (por si algún día lo usas) */
#availability-time-grid .hour-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
	</style>
@endsection