@extends('layouts.student')

@section('title', 'Convocatorias Disponibles')
@section('main-id', 'student-convocatorias-page')

@section('styles')
<style>
    /* Evitar scroll horizontal en esta página */
    #student-convocatorias-page,
    .container.role-layout,
    .role-main,
    .role-main-inner {
        overflow-x: hidden !important;
        max-width: 100% !important;
    }

    /* La tabla se adapta al contenido */
    #student-convocatorias-page .table {
        width: auto !important;        /* NO ocupa 100% */
        max-width: 100% !important;    /* Nunca se sale del contenedor */
        table-layout: auto !important; /* Columnas según contenido */
    }

    /* Wrapper de la tabla */
    #student-convocatorias-page .table-wrapper {
        overflow-x: auto;
        max-width: 100%;
    }

    /* Las celdas pueden romper línea */
    #student-convocatorias-page .table td,
    #student-convocatorias-page .table th {
        white-space: normal !important;   /* Permite que el texto se adapte */
        word-break: break-word !important;/* Evita que algo largo rompa el layout */
    }
</style>
@endsection

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
