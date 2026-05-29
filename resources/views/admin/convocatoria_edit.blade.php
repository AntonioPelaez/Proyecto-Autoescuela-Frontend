@extends('layouts.admin')

@section('title', 'Editar convocatoria')
@section('main-id', 'admin-convocatoria-edit')

@section('content')

<div class="card card-body">
    <h2>Editar convocatoria</h2>

    <form id="convocatoria-edit-form">

        {{-- Fecha y hora --}}
        <div class="form-group mb-3">
            <label for="date_time">Fecha y hora</label>
            <input type="datetime-local" id="date_time" name="date_time" class="form-control" required>
        </div>

        {{-- Población --}}
        <div class="form-group mb-3">
            <label for="town_id">Población</label>
            <select id="town_id" name="town_id" class="form-control" required>
                <option value="">Cargando poblaciones...</option>
            </select>
        </div>

        {{-- Profesor --}}
        <div class="form-group mb-3">
            <label for="teacher_id">Profesor acompañante</label>
            <select id="teacher_id" name="teacher_id" class="form-control" required>
                <option value="">Cargando profesores...</option>
            </select>
        </div>

        {{-- Vehículo --}}
        <div class="form-group mb-3">
            <label for="vehicle_id">Vehículo</label>
            <select id="vehicle_id" name="vehicle_id" class="form-control" required>
                <option value="">Cargando vehículos...</option>
            </select>
        </div>
{{-- Plazas disponibles --}}
<div class="form-group mb-3">
    <label for="max_students">Plazas disponibles</label>
    <input type="number" id="max_students" name="max_students" class="form-control" min="1" placeholder="Número de plazas">
</div>

        {{-- Alumnos --}}
        <div class="form-group mb-4">
            <label class="fw-bold">Alumnos preparados para examen</label>

            <div class="card card-body p-2" style="max-height: 300px; overflow-y: auto;">
                <div id="students-list" class="d-flex flex-column gap-1">
                    <p class="text-muted">Cargando alumnos...</p>
                </div>
            </div>
        </div>

        {{-- Botones --}}
        <div class="convocatoria-buttons d-flex justify-content-between">
            <a href="/admin/convocatorias" class="btn btn-secondary">Volver</a>
            <button type="submit" class="btn btn-primary">Guardar cambios</button>
        </div>

    </form>
</div>

@endsection

@section('styles')
<style>
/* 🔥 Fuerza el layout correcto sin importar el CSS global */
.student-item {
    display: flex !important;
    align-items: center !important;
    gap: 0 !important;              /* 🔥 ESTO ES LO QUE FALTABA */
    column-gap: 0 !important;       /* 🔥 POR SI ALGÚN CSS USA column-gap */
    row-gap: 0 !important;
    padding: 4px 2px !important;
    border-bottom: 1px solid #eee !important;
}

.student-name {
    flex-grow: 1 !important;
    width: auto !important;
    display: inline-block !important;
    margin: 0 !important;
    padding: 0 !important;
}

.student-name,
.student-item label {
    flex-grow: 1 !important;
    width: auto !important;
    max-width: none !important;
    display: inline-block !important;
    margin: 0 !important;
    padding: 0 !important;
}


    .convocatoria-buttons {
        margin-top: 2rem !important;
        padding-top: 1.5rem !important;
        border-top: 1px solid #ddd !important;
    }
</style>
@endsection

@section('scripts')
<script src="{{ asset('js/pages/convocatorias-edit.js') }}" defer></script>
@endsection
