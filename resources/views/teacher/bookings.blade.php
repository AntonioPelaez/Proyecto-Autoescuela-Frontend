@extends('layouts.teacher')

@section('title', 'Mi Agenda')
@section('main-id', 'teacher-bookings-page')

@section('content')
<div class="teacher-panel">
    <h2>Mi Agenda de Clases</h2>

    <!-- Message State -->
    <div id="message-state" class="message-state" style="display: none;"></div>

    <!-- Availability Calendar Section -->
    <div class="form-section">
        <h3>📊 Mi Disponibilidad de Horarios</h3>
        <form id="availability-filter-form" class="filter-form">
            <div class="form-group">
                <label for="availability-date">Fecha *</label>
                <input type="date" id="availability-date" name="date" class="form-control" required>
            </div>
            <div class="table-actions">
                <button type="submit" class="btn btn-secondary">Ver Disponibilidad</button>
            </div>
        </form>

        <div id="availability-grid" class="availability-grid" style="display: none; margin-top: var(--space-m);">
            <!-- Se pobla con JavaScript -->
        </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
        <h3>Filtrar Agenda</h3>
        <form id="bookings-filter-form" class="filter-form">
            <div class="form-group">
                <label for="filter-date">Fecha (desde) *</label>
                <input type="date" id="filter-date" name="date" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="filter-student">Estudiante (opcional)</label>
                <input type="text" id="filter-student" name="student" class="form-control" placeholder="Buscar por nombre...">
            </div>

            <div class="form-group">
                <label for="filter-status">Estado (opcional)</label>
                <select id="filter-status" name="status" class="form-control">
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
            <table id="upcoming-table" class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estudiante</th>
                        <th>Población</th>
                        <th>Vehículo</th>
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

    <!-- Historial de Clases Section -->
    <div class="table-section">
        <h3>📋 Historial de Clases</h3>
        <div class="table-wrapper">
            <table id="past-table" class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estudiante</th>
                        <th>Población</th>
                        <th>Vehículo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="past-tbody">
                    <tr><td colspan="6" style="text-align: center; padding: 20px;">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Status Change Form (Oculto) -->
    <div id="status-form-container" style="display: none; margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px;">
        <h4>Cambiar Estado de Clase</h4>
        <p id="status-booking-info" style="margin: var(--space-m) 0; font-weight: 500;"></p>
        <form id="status-form" class="incident-form">
            <input type="hidden" id="status-booking-id" name="bookingId">
            <div class="form-group">
                <label for="status-new-status">Nuevo Estado *</label>
                <select id="status-new-status" name="newStatus" class="form-control" required>
                    <option value="">Selecciona estado</option>
                    <option value="en_curso">Marcar como En Curso</option>
                    <option value="completada">Marcar como Completada</option>
                </select>
            </div>
            <div class="table-actions">
                <button type="submit" class="btn btn-success">Actualizar Estado</button>
                <button type="button" class="btn btn-secondary" id="status-cancel">Cancelar</button>
            </div>
        </form>
    </div>
</div>

@endsection

@section('scripts')
    <script src="{{ asset('js/pages/teacher-bookings.js') }}"></script>
@endsection
