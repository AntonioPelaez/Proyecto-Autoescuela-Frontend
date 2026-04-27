@extends('layouts.teacher')

@section('title', 'Mis Clases')
@section('main-id', 'teacher-classes-page')

@section('content')
<div class="teacher-panel">
    <h2>Mis Clases Asignadas</h2>

    <!-- Message State -->
    <div id="message-state" class="message-state" style="display: none;"></div>

    <!-- Filter Section -->
    <div class="filter-section">
        <h3>Filtrar Clases</h3>
        <form id="classes-filter-form" class="filter-form">
            <div class="form-group">
                <label for="filter-date-from">Desde *</label>
                <input type="date" id="filter-date-from" name="dateFrom" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="filter-date-to">Hasta *</label>
                <input type="date" id="filter-date-to" name="dateTo" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="filter-class-status">Estado (opcional)</label>
                <select id="filter-class-status" name="status" class="form-control">
                    <option value="">Todos los estados</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="en_curso">En curso</option>
                    <option value="completada">Completada</option>
                </select>
            </div>

            <div class="table-actions">
                <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
            </div>
        </form>
    </div>

    <!-- Próximas Clases Section -->
    <div class="table-section">
        <h3>📅 Próximas Clases</h3>
        <div class="table-wrapper">
            <table id="upcoming-classes-table" class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estudiante</th>
                        <th>Nivel</th>
                        <th>Vehículo</th>
                        <th>Población</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="upcoming-classes-tbody">
                    <tr><td colspan="8" style="text-align: center; padding: 20px;">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Historial de Clases Section -->
    <div class="table-section">
        <h3>📋 Historial de Clases</h3>
        <div class="table-wrapper">
            <table id="past-classes-table" class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estudiante</th>
                        <th>Nivel</th>
                        <th>Vehículo</th>
                        <th>Población</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="past-classes-tbody">
                    <tr><td colspan="7" style="text-align: center; padding: 20px;">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Class Status Form (Oculto) -->
    <div id="class-status-form-container" style="display: none; margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px;">
        <h4>Actualizar Estado de Clase</h4>
        <p id="class-status-info" style="margin: var(--space-m) 0; font-weight: 500;"></p>
        <form id="class-status-form" class="incident-form">
            <input type="hidden" id="class-status-booking-id" name="bookingId">
            <div class="form-group">
                <label for="class-status-select">Nuevo Estado *</label>
                <select id="class-status-select" name="newStatus" class="form-control" required>
                    <option value="">Selecciona estado</option>
                    <option value="en_curso">Marcar como En Curso</option>
                    <option value="completada">Marcar como Completada</option>
                </select>
            </div>
            <div class="table-actions">
                <button type="submit" class="btn btn-success">Actualizar Estado</button>
                <button type="button" class="btn btn-secondary" id="class-status-cancel">Cancelar</button>
            </div>
        </form>
    </div>
</div>

@endsection

@section('scripts')
    <script src="{{ asset('js/pages/teacher-classes.js') }}"></script>
@endsection
