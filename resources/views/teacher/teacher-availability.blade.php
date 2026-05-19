@extends('layouts.teacher')

@section('title', 'Mis disponibilidades')
@section('main-id', 'teacher-availability-page')

@section('content')
<header>
  <h1>Mis disponibilidades</h1>
</header>

<div id="availability-message" class="hidden" tabindex="-1"></div>

<section class="card">
  <div class="card-header">
    <h2>Crear / Añadir disponibilidad</h2>
  </div>

  <div class="card-body">
    <form id="availability-form" novalidate role="form" aria-label="Formulario de creación de disponibilidades">

      <!-- Profesor (autorrelleno, solo lectura) -->
      <div class="input-group">
        <label class="input-label" for="availability-professor">Profesor</label>
        <select id="availability-professor" class="input" required>
          <option value="">Cargando...</option>
        </select>
      </div>

      <!-- Población (opcional: se oculta si el profesor no tiene varias) -->
      <div class="input-group" id="availability-town-group">
        <label class="input-label" for="availability-town">Población</label>
        <select id="availability-town" class="input">
          <option value="">Selecciona una población</option>
        </select>
      </div>

      <!-- Tipo (Normal/Especial) -->
      <div class="input-group">
        <label class="input-label" for="availability-type">Tipo de disponibilidad</label>
        <select id="availability-type" class="input" required>
          <option value="">Selecciona un tipo</option>
          <option value="normal">Normal</option>
          <option value="especial">Especial</option>
        </select>
      </div>

      <!-- Día de la semana (solo si es Normal) -->
      <div class="input-group hidden" id="availability-day-wrapper">
        <label class="input-label" for="availability-day">Día de la semana</label>
        <select id="availability-day" class="input">
          <option value="">Selecciona un día</option>
          <option value="1">Lunes</option>
          <option value="2">Martes</option>
          <option value="3">Miércoles</option>
          <option value="4">Jueves</option>
          <option value="5">Viernes</option>
        </select>
      </div>

      <!-- Fecha (solo si es Especial) -->
      <div class="input-group hidden" id="availability-date-wrapper">
        <label class="input-label" for="availability-date">Fecha de la disponibilidad especial *</label>
        <input type="date" id="availability-date" class="input">
      </div>

      <!-- Razón (solo si es Especial) -->
      <div class="input-group hidden" id="availability-reason-wrapper">
        <label class="input-label" for="availability-reason">Razón de la excepcionalidad</label>
        <input type="text" id="availability-reason" class="input" placeholder="Motivo...">
      </div>

      <!-- Horario de inicio y fin -->
      <div class="input-group">
        <label class="input-label" for="availability-start-time">Hora de inicio *</label>
        <input type="time" id="availability-start-time" name="start" class="input" required>
      </div>

      <div class="input-group">
        <label class="input-label" for="availability-end-time">Hora de fin *</label>
        <input type="time" id="availability-end-time" name="end" class="input" required>
      </div>

      <!-- Tipo de bloque (back) -->
      <div class="input-group">
        <label class="input-label" for="availability-block-type">Tipo de bloque</label>
        <select id="availability-block-type" class="input" required>
          <option value="block">Bloque (recurrente)</option>
          <option value="extra">Extra (puntual)</option>
        </select>
      </div>

      <div class="table-actions">
        <button type="button" id="availability-create" class="btn btn-success">Crear disponibilidad</button>
      </div>
    </form>
  </div>
</section>

<section class="card" style="margin-top:1.25rem;">
  <div class="card-header">
    <h2>Mis disponibilidades (semana)</h2>
  </div>
  <div class="card-body">
    <div id="teacher-weekly-availability" class="table-wrapper">
      <table class="table table-striped" id="teacher-availability-table" role="table" aria-label="Disponibilidades semanales">
        <thead>
          <tr>
            <th>Profesor</th>
            <th>Población</th>
            <th>Día</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Minutos</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="teacher-availability-body"></tbody>
      </table>
    </div>
  </div>
</section>
@endsection

@section('scripts')
<script src="{{ asset('js/pages/teacher-availability.js') }}" defer></script>
@endsection