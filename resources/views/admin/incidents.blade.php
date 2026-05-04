@extends('layouts.admin')

@section('content')
<div class="admin-panel">
    <h2>Gestión de Incidencias</h2>

    <!-- Filtros -->
    <div class="filter-section">
        <h3>Filtrar Incidencias</h3>
        <form id="filter-form" class="filter-form">
            <div class="form-group">
                <label for="filter-status">Estado</label>
                <select id="filter-status" name="status" class="form-control">
                    <option value="">Todos</option>
                    <option value="abierta">Abierta</option>
                    <option value="en_curso">En curso</option>
                    <option value="cerrada">Cerrada</option>
                </select>
            </div>

            <div class="form-group">
                <label for="filter-priority">Prioridad</label>
                <select id="filter-priority" name="priority" class="form-control">
                    <option value="">Todos</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>

            <div class="form-group">
                <label for="filter-type">Tipo</label>
                <select id="filter-type" name="type" class="form-control">
                    <option value="">Todos</option>
                    <option value="reserva">Problema con reserva</option>
                    <option value="profesor">Cambio de profesor</option>
                    <option value="vehiculo">Cambio de vehículo</option>
                    <option value="otro">Otro</option>
                </select>
            </div>

            <div class="form-group">
                <label for="filter-assigned">Asignado a</label>
                <select id="filter-assigned" name="assigned" class="form-control">
                    <option value="">Todos</option>
                    <option value="sin_asignar">Sin asignar</option>
                    <option id="assigned-me" value="">Mi asignación</option>
                </select>
            </div>

            <div class="form-group">
                <label for="filter-date-from">Desde</label>
                <input type="date" id="filter-date-from" name="dateFrom" class="form-control">
            </div>

            <div class="form-group">
                <label for="filter-date-to">Hasta</label>
                <input type="date" id="filter-date-to" name="dateTo" class="form-control">
            </div>

            <div class="table-actions">
                <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
                <button type="button" id="clear-filters" class="btn btn-secondary">Limpiar</button>
            </div>
        </form>
    </div>

    <!-- Estado de mensaje -->
    <div id="message-state" class="message-state" style="display: none;"></div>

    <!-- Crear Incidencia -->
    <div class="form-section">
        <h3>Crear Nueva Incidencia</h3>
        <form id="incident-form" class="incident-form">
            <input type="hidden" id="incident-id" name="id">

            <div class="form-group">
                <label for="incident-type">Tipo *</label>
                <select id="incident-type" name="type" class="form-control" required>
                    <option value="">Selecciona tipo</option>
                    <option value="reserva">Problema con reserva</option>
                    <option value="profesor">Cambio de profesor</option>
                    <option value="vehiculo">Cambio de vehículo</option>
                    <option value="otro">Otro</option>
                </select>
            </div>

            <div class="form-group">
                <label for="incident-priority">Prioridad *</label>
                <select id="incident-priority" name="priority" class="form-control" required>
                    <option value="">Selecciona prioridad</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>

            <div class="form-group">
                <label for="incident-status">Estado *</label>
                <select id="incident-status" name="status" class="form-control" required>
                    <option value="abierta">Abierta</option>
                    <option value="en_curso">En curso</option>
                    <option value="cerrada">Cerrada</option>
                </select>
            </div>

            <div class="form-group">
                <label for="incident-description">Descripción *</label>
                <textarea id="incident-description" name="description" class="form-control" rows="4" required></textarea>
            </div>

            <div class="form-group">
                <label for="incident-booking">Reserva Relacionada (opcional)</label>
                <input type="text" id="incident-booking" name="bookingId" class="form-control" placeholder="ID de reserva (p.ej., 1)">
            </div>

            <div class="form-group">
                <label for="incident-teacher">Profesor asignado (opcional)</label>
                <select id="incident-teacher" name="teacherId" class="form-control">
                    <option value="">Sin profesor asignado</option>
                </select>
            </div>

            <div class="form-group">
                <label for="incident-student">Alumno asignado (opcional)</label>
                <select id="incident-student" name="studentId" class="form-control">
                    <option value="">Sin alumno asignado</option>
                </select>
            </div>

            <div class="table-actions">
                <button type="submit" class="btn btn-success" id="incident-submit">Crear Incidencia</button>
                <button type="button" class="btn btn-secondary" id="incident-cancel" style="display: none;">Cancelar</button>
            </div>
        </form>
    </div>

    <!-- Tabla de Incidencias -->
    <div class="table-section">
        <h3>Listado de Incidencias</h3>
        <div class="table-wrapper">
            <table id="incidents-table" class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Prioridad</th>
                        <th>Estado</th>
                        <th>Descripción</th>
                        <th>Reserva</th>
                        <th>Creada</th>
                        <th>Profesor / Alumno</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="incidents-tbody">
                    <!-- Rows via JavaScript -->
                </tbody>
            </table>
        </div>
    </div>
</div>

@endsection

@section('scripts')
    <script src="{{ asset('js/pages/admin-incidents.js') }}"></script>
@endsection
