@extends('layouts.admin')

@section('title', 'Crear gasto')
@section('main-id', 'admin-expenses-create')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Crear gasto</h2>

    {{-- Paso 1: Vehículo --}}
    <div class="card card-body mb-4">
        <h5>Selecciona vehículo</h5>
        <select id="vehicle-select" class="form-select">
            <option disabled selected>Selecciona vehículo</option>
        </select>
    </div>

    {{-- Paso 2: Clase --}}
    <div class="card card-body mb-4">
        <h5>Selecciona clase</h5>
        <select id="class-select" class="form-select" disabled>
            <option disabled selected>Selecciona clase</option>
        </select>
    </div>

    {{-- Paso 3: Datos del gasto --}}
    <div class="card card-body">
        <h5>Datos del gasto</h5>

        <div class="mb-3">
            <label class="form-label">Tipo de gasto</label>
            <select id="expense-type" class="form-select">
                <option disabled selected>Selecciona tipo</option>
            </select>
        </div>

        <div class="mb-3">
            <label class="form-label">Cantidad (€)</label>
            <input type="number" step="0.01" class="form-control" id="amount">
        </div>

        <div class="mb-3">
            <label class="form-label">Notas</label>
            <textarea class="form-control" id="notes"></textarea>
        </div>

        <button class="btn btn-success w-100">Guardar gasto</button>
    </div>

</div>

@endsection
@section('scripts')
<script src="{{ asset('js/pages/admin-expenses-create.js') }}"></script>
@endsection
