@extends('layouts.admin')

@section('title', 'Crear convocatoria')
@section('main-id', 'admin-convocatoria-create')

@section('content')

<div class="card card-body">
    <h2>Crear convocatoria</h2>

    <form id="convocatoria-create-form">

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

        {{-- Profesor acompañante --}}
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

        {{-- Alumnos preparados --}}
        <div class="form-group mb-4">
            <label>Alumnos preparados para examen</label>

            <div class="card card-body" style="max-height: 300px; overflow-y: auto;" id="students-list">
                <p class="text-muted" id="students-loading">Cargando alumnos...</p>
            </div>
        </div>

        {{-- Botones --}}
        <div class="d-flex justify-content-between mt-4">
            <a href="/admin/convocatorias" class="btn btn-secondary">Volver</a>
            <button type="submit" class="btn btn-primary">Crear convocatoria</button>
        </div>

    </form>
</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/convocatorias-create.js') }}" defer></script>
@endsection
