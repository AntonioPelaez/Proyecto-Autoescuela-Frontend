@extends('layouts.student')

@section('title', 'Disponibilidad')
@section('main-id', 'student-availability-page')

@section('content')
<div class="student-panel">

    <h2>Reservar Clase</h2>

    <!-- Mensajes -->
    <div id="message-state" class="message-state" style="display:none;"></div>

    <!-- Paso 1 -->
    <div class="filter-section">
        <h3>📍 Paso 1: Elige Población y Fecha</h3>

        <form id="selection-form" class="filter-form">
            <div class="form-group">
                <label for="town-select">Población *</label>
                <select id="town-select" class="form-control" required>
                    <option value="">Selecciona población</option>
                </select>
            </div>

            <div class="form-group">
                <label for="date-select">Fecha *</label>
                <input type="date" id="date-select" class="form-control" required>
            </div>

            <div class="table-actions">
                <button type="submit" class="btn btn-primary">Buscar Horarios</button>
            </div>
        </form>
    </div>

    <!-- Paso 2 -->
    <div id="time-slots-section" class="table-section" style="display:none;">
        <h3>⏰ Paso 2: Elige Hora Disponible</h3>

        <div id="time-slots-grid" class="time-slots-grid"></div>

        <p style="margin-top:10px;color:#666;">
            Solo se muestran horas reservables según disponibilidad real.
        </p>
    </div>

    <!-- Paso 3 (solo si hay más de un profesor) -->
    <div id="teacher-selector-section" class="table-section" style="display:none;"></div>

    <!-- Resumen -->
    <div id="booking-summary" class="booking-summary" style="display:none;">
        <h4>📋 Resumen de tu Reserva</h4>

        <div id="summary-details" style="margin:15px 0;"></div>

        <form id="confirm-form" class="table-actions">
            <button type="submit" class="btn btn-success">Proceder con el Pago</button>
            <button type="button" id="cancel-booking" class="btn btn-secondary">Cancelar</button>
        </form>
    </div>

    <!-- Clases confirmadas -->
    <div class="form-section" style="margin-top:40px;">
        <h3>✅ Mis Reservas Confirmadas</h3>
        <div id="bookings-container">
            <p style="color:#999;">Cargando...</p>
        </div>
    </div>

</div>

<!-- POPUP CONFIRMACIÓN -->
<div id="confirm-popup" class="popup hidden">
    <div class="popup-content">
        <p>¿Quieres proceder con el pago?</p>
        <button id="popup-yes" class="btn btn-success">Sí, proceder con el pago</button>
        <button id="popup-no" class="btn btn-secondary">No</button>
    </div>
</div>

@endsection

@section('scripts')
<script type="module" src="{{ asset('js/pages/student-availability.js') }}"></script>

<style>
.popup {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:9999;
}
.popup.hidden { display:none; }
.popup-content {
    background:white;
    padding:20px;
    border-radius:8px;
    text-align:center;
    width:300px;
}
.time-slots-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
    gap:12px;
}
.time-slot-btn {
    padding:12px 18px;
    border-radius:8px;
    border:2px solid #d0d7ff;
    background:#f7f9ff;
    font-size:1rem;
    font-weight:600;
    cursor:pointer;
    display:flex;
    justify-content:space-between;
}
.time-slot-btn.selected {
    background:#4c6fff;
    color:white;
    border-color:#4c6fff;
}
.time-slot-btn.reserved {
    background:#f8d7da;
    border-color:#f5c6cb;
    color:#721c24;
    cursor:not-allowed;
}
.teacher-option-btn {
    padding:12px 18px;
    border-radius:8px;
    border:2px solid #d0d7ff;
    background:#f7f9ff;
    font-size:1rem;
    font-weight:600;
    cursor:pointer;
    display:flex;
    justify-content:space-between;
    margin-bottom:8px;
}
.teacher-option-btn.selected {
    background:#4c6fff;
    color:white;
    border-color:#4c6fff;
}
.booking-summary {
    background:#f0f4ff;
    border-left:4px solid var(--color-primary);
    padding:20px;
    border-radius:4px;
    margin-top:20px;
}
</style>
@endsection
