@extends('layouts.student')

@section('title', 'Convocatorias Disponibles')
@section('main-id', 'student-convocatorias-page')

@section('content')
<div class="student-panel">
    <h2>Convocatorias Disponibles</h2>

    <!-- Message State -->
    <div id="message-state" class="message-state" style="display: none;"></div>

    <!-- Filtros -->
    <div class="form-section" style="margin-bottom: 20px;">
        <div class="table-actions" style="display: flex; gap: 15px; flex-wrap: wrap;">
            <div class="input-group" style="flex: 1; min-width: 200px;">
                <label class="input-label" for="filter-town">Población</label>
                <select id="filter-town" class="input">
                    <option value="">Todas las poblaciones</option>
                </select>
            </div>
            <div class="input-group" style="flex: 1; min-width: 200px;">
                <label class="input-label" for="filter-date">Fecha desde</label>
                <input id="filter-date" type="date" class="input">
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-end;">
                <button id="filter-reset" class="btn btn-secondary">Limpiar filtros</button>
            </div>
        </div>
    </div>

    <!-- Tabla de Convocatorias -->
    <div class="form-section">
        <h3>📋 Convocatorias</h3>
        <div class="table-wrapper">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Población</th>
                        <th>Profesor</th>
                        <th>Vehículo</th>
                        <th>Plazas disponibles</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="convocatorias-tbody">
                    <tr><td colspan="8" style="text-align: center; padding: 20px;">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

@endsection

@section('scripts')
    <script src="{{ asset('js/pages/student-convocatorias.js') }}"></script>
@endsection
