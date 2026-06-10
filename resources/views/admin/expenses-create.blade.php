@extends('layouts.admin')

@section('title', 'Crear gastos')
@section('main-id', 'admin-expenses-create')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Crear gastos</h2>

    {{-- Vehículo --}}
    <div class="card card-body mb-4">
        <h5>Selecciona vehículo</h5>
        <select id="vehicle-select" class="form-select">
            <option disabled selected>Selecciona vehículo</option>
        </select>
    </div>

    {{-- Clase --}}
    <div class="card card-body mb-4">
        <h5>Selecciona clase</h5>
        <select id="class-select" class="form-select" disabled>
            <option disabled selected>Selecciona clase</option>
        </select>
    </div>

    {{-- Tabla de gastos --}}
    <div class="card card-body">

        <h5 class="mb-3">Gastos de esta clase</h5>

        <div class="table-responsive">
            <table class="table table-striped align-middle">
                <thead>
                    <tr>
                        <th>Tipo de gasto</th>
                        <th>Cantidad (€)</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody id="expense-rows">
                    {{-- El JS rellenará esta tabla --}}
                </tbody>
            </table>
        </div>

        <button id="save-expenses" class="btn btn-success w-100 mt-3">Guardar gastos</button>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/admin-expenses-create.js') }}"></script>
@endsection
