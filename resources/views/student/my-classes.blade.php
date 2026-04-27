@extends('layouts.student')

@section('title', 'Mis Clases')
@section('main-id', 'student-my-classes-page')

@section('content')
<div class="student-panel">
    <h2>Mis Clases</h2>

    <!-- Message State -->
    <div id="message-state" class="message-state" style="display: none;"></div>

    <!-- Próximas Clases -->
    <div class="form-section">
        <h3>📅 Próximas Clases</h3>
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Profesor</th>
                        <th>Vehículo</th>
                        <th>Población</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="upcoming-tbody">
                    <tr><td colspan="7" style="text-align: center; padding: 20px;">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Historial de Clases Pasadas -->
    <div class="form-section">
        <h3>📋 Historial de Clases</h3>
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Profesor</th>
                        <th>Vehículo</th>
                        <th>Población</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="past-tbody">
                    <tr><td colspan="6" style="text-align: center; padding: 20px;">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Cancelación Form (Oculto) -->
    <div id="cancel-form-container" style="display: none; margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px;">
        <h4>Cancelar Clase</h4>
        <p id="cancel-class-info" style="margin: var(--space-m) 0; font-weight: 500; color: #d32f2f;"></p>
        <form id="cancel-form" class="incident-form">
            <input type="hidden" id="cancel-booking-id" name="bookingId">
            <div class="table-actions">
                <button type="submit" class="btn btn-danger">Cancelar Clase</button>
                <button type="button" class="btn btn-secondary" id="cancel-form-cancel">Atrás</button>
            </div>
        </form>
    </div>
</div>

@endsection

@section('scripts')
    <script src="{{ asset('js/pages/student-my-classes.js') }}"></script>
@endsection
