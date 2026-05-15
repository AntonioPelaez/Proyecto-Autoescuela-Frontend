@extends('layouts.student')

@section('title', 'Disponibilidad')
@section('main-id', 'student-availability-page')

@section('content')
<div class="student-panel">

    <h2>Reservar Clase</h2>

    <!-- Message State -->
    <div id="message-state" class="message-state" style="display: none;"></div>

    <!-- Paso 1 -->
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

    <!-- Paso 2 -->
    <div class="table-section" id="time-slots-section" style="display: none;">
        <h3>⏰ Paso 2: Elige Hora Disponible</h3>

        <div id="time-slots-grid" class="time-slots-grid">
            <!-- Se pobla con JavaScript -->
        </div>

        <p id="time-slots-meta" style="margin-top: 10px; color: #666;">
            Solo se muestran horas reservables. La autoescuela asignará automáticamente profesor y vehículo.
        </p>
    </div>

    <!-- Resumen -->
    <div id="booking-summary" class="booking-summary"
         style="display: none; margin-top: 20px; padding: 20px; background: #f0f4ff; border-radius: 4px; border-left: 4px solid var(--color-primary);">

        <h4>📋 Resumen de tu Reserva</h4>

        <div id="summary-details" style="margin: var(--space-m) 0;"></div>

        <form id="confirm-form" class="table-actions">
            <button type="submit" class="btn btn-success">Confirmar Reserva</button>
            <button type="button" class="btn btn-secondary" id="cancel-booking">Cancelar</button>
        </form>
    </div>

    <!-- ========================= -->
    <!-- CLASES PENDIENTES -->
    <!-- ========================= -->
    <div class="form-section" style="margin-top: 40px;">
        <h3>🕒 Clases Pendientes</h3>
        <div id="pending-classes">
            <p style="color: #999;">Cargando...</p>
        </div>
    </div>

    <!-- ========================= -->
    <!-- CLASES CONFIRMADAS -->
    <!-- ========================= -->
    <div class="form-section" style="margin-top: 40px;">
        <h3>✅ Mis Reservas Confirmadas</h3>
        <div id="bookings-container">
            <p style="color: #999;">Cargando...</p>
        </div>
    </div>

</div>
@endsection

@section('scripts')
<script type="module" src="{{ asset('js/pages/student-availability.js') }}"></script>

<style>
/* ─────────────────────────────────────────────
   BADGES DE ESTADO — Autoescuela AIBE
───────────────────────────────────────────── */

.badge-inline {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
}

/* 🟡 Pendiente */
.badge-pendiente,
.badge-pending {
    background-color: #f7c948;
    color: #000;
}

/* 🔵 Confirmada */
.badge-confirmada,
.badge-confirmed {
    background-color: #0275d8;
    color: #fff;
}

/* 🟣 En curso */
.badge-en-curso,
.badge-in_progress {
    background-color: #6f42c1;
    color: #fff;
}

/* 🟢 Completada */
.badge-completada,
.badge-completed {
    background-color: #5cb85c;
    color: #fff;
}

/* 🔴 Cancelada */
.badge-cancelada,
.badge-cancelled {
    background-color: #d9534f;
    color: #fff;
}

/* Gris por defecto */
.badge-gray {
    background-color: #777;
    color: #fff;
}
</style>
@endsection