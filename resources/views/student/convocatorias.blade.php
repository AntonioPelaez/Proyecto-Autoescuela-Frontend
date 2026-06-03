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

<style>
/* Wrapper */
#student-convocatorias-page .table-wrapper {
    overflow-x: hidden !important; /* sin scroll horizontal */
    max-width: 100%;
}

/* Tabla */
#student-convocatorias-page .table {
    width: 100% !important;
    table-layout: fixed !important; /* repartir espacio y evitar desbordes */
    border-collapse: collapse;
}

/* Celdas */
#student-convocatorias-page .table td,
#student-convocatorias-page .table th {
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere;
    padding: 12px 10px;
}

/* Anchos porcentuales por columna para evitar cortes sin scroll */
#student-convocatorias-page .table th:nth-child(1),
#student-convocatorias-page .table td:nth-child(1) { width: 15%; }
#student-convocatorias-page .table th:nth-child(2),
#student-convocatorias-page .table td:nth-child(2) { width: 15%; }
#student-convocatorias-page .table th:nth-child(3),
#student-convocatorias-page .table td:nth-child(3) { width: 14%; }
#student-convocatorias-page .table th:nth-child(4),
#student-convocatorias-page .table td:nth-child(4) { width: 16%; }
#student-convocatorias-page .table th:nth-child(5),
#student-convocatorias-page .table td:nth-child(5) { width: 12%; }
#student-convocatorias-page .table th:nth-child(6),
#student-convocatorias-page .table td:nth-child(6) { width: 13%; }
#student-convocatorias-page .table th:nth-child(7),
#student-convocatorias-page .table td:nth-child(7) { width: 19%; }
#student-convocatorias-page .table th:nth-child(8),
#student-convocatorias-page .table td:nth-child(8) { width: 25%; }

/* Asegurar que los botones en Acciones no se corten: permitir que el botón se ajuste dentro de la celda */
#student-convocatorias-page .table td:nth-child(8) .btn {
    display: inline-block;
    white-space: normal;
}
</style>
@endsection
