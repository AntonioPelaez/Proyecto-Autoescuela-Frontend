@extends('layouts.admin')

@section('title', 'Gastos de vehículos')
@section('main-id', 'admin-expenses-index')

@section('content')

<div class="admin-panel">

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Gastos por vehículo</h2>

        {{-- Botón CREAR GASTO --}}
        <a href="{{ route('admin.expenses.create') }}" class="btn btn-primary">
            Crear gasto
        </a>
    </div>

    {{-- Paso 1: Vehículo --}}
    <div class="card card-body mb-4">
        <h5 class="mb-3">Paso 1: Elige Vehículo</h5>

        <select id="vehicle-select" class="form-select">
            <option value="" disabled selected>Selecciona vehículo</option>
        </select>
    </div>

    {{-- Paso 2: Clase --}}
    <div class="card card-body mb-4">
        <h5 class="mb-3">Paso 2: Elige Clase</h5>

        <select id="class-select" class="form-select" disabled>
            <option value="" disabled selected>Selecciona clase</option>
        </select>
    </div>

    {{-- Paso 3: Gastos --}}
    <div id="vehicle-expenses-container">
        <p class="text-muted">Selecciona vehículo y clase para ver los gastos.</p>
    </div>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/admin-expenses-index.js') }}"></script>
@endsection
