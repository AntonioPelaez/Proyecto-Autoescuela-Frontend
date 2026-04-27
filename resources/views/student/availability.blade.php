@extends('layouts.student')

@section('title', 'Disponibilidad')
@section('main-id', 'student-availability-page')

@section('content')
<div class="student-panel">
    <h2>Reservar Clase</h2>

    <!-- Message State -->
    <div id="message-state" class="message-state" style="display: none;"></div>

    <!-- Step 1: Select Town & Date -->
    <div class="filter-section">
        <h3>📍 Paso 1: Elige Población y Fecha</h3>
        <form id="selection-form" class="filter-form">
            <div class="form-group">
                <label for="town-select">Población *</label>
                <select id="town-select" name="town" class="form-control" required>
                    <option value="">Selecciona población</option>
                </select>
            </div>

            <div class="form-group">
                <label for="date-select">Fecha *</label>
                <input type="date" id="date-select" name="date" class="form-control" required>
            </div>

            <div class="table-actions">
                <button type="submit" class="btn btn-primary">Buscar Horarios</button>
            </div>
        </form>
    </div>

    <!-- Step 2: Select Time Slot -->
    <div class="table-section" id="time-slots-section" style="display: none;">
        <h3>⏰ Paso 2: Elige Hora</h3>
        <div id="time-slots-grid" class="time-slots-grid">
            <!-- Se pobla con JavaScript -->
        </div>
    </div>

    <!-- Step 3: Select Professor -->
    <div class="table-section" id="professors-section" style="display: none;">
        <h3>👨‍🏫 Paso 3: Elige Profesor</h3>
        <div id="professors-container">
            <div class="professors-list">
                <!-- Se pobla con JavaScript -->
            </div>
        </div>
    </div>

    <!-- Confirmation -->
    <div id="booking-summary" class="booking-summary" style="display: none; margin-top: 20px; padding: 20px; background: #f0f4ff; border-radius: 4px; border-left: 4px solid var(--color-primary);">
        <h4>📋 Resumen de tu Reserva</h4>
        <div id="summary-details" style="margin: var(--space-m) 0;"></div>
        <form id="confirm-form" class="table-actions">
            <button type="submit" class="btn btn-success">Confirmar Reserva</button>
            <button type="button" class="btn btn-secondary" id="cancel-booking">Cancelar</button>
        </form>
        <input type="hidden" id="selected-professor-id" name="professorId">
    </div>

    <!-- Current Bookings -->
    <div class="form-section">
        <h3>✅ Mis Reservas Confirmadas</h3>
        <div id="bookings-container">
            <p style="color: #999;">Cargando...</p>
        </div>
    </div>
</div>
@endsection

@section('scripts')
	<script src="{{ asset('js/pages/student-availability.js') }}" defer></script>
@endsection
