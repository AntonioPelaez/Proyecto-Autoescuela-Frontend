@extends('layouts.admin')

@section('title', 'Crear gasto de gasolina')
@section('main-id', 'admin-fuel-logs-create')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4">Crear gasto de gasolina</h2>

    <div class="card card-body">

        {{-- Vehículo --}}
        <div class="mb-3">
            <label class="form-label">Vehículo</label>
            <select id="vehicle-select" class="form-select">
                <option disabled selected>Selecciona vehículo</option>
            </select>
        </div>

        {{-- Mes --}}
        <div class="mb-3">
            <label class="form-label">Mes</label>
            <input type="month" id="month" class="form-control">
        </div>

        {{-- Litros --}}
        <div class="mb-3">
            <label class="form-label">Litros gastados</label>
            <input type="number" step="0.01" id="liters" class="form-control">
        </div>

        {{-- Kilómetros --}}
        <div class="mb-3">
            <label class="form-label">Kilómetros totales del mes</label>
            <input type="number" id="km" class="form-control">
        </div>

        {{-- Dinero gastado --}}
        <div class="mb-3">
            <label class="form-label">Dinero gastado (€)</label>
            <input type="number" step="0.01" id="amount" class="form-control">
        </div>

        {{-- Notas --}}
        <div class="mb-3">
            <label class="form-label">Notas</label>
            <textarea id="notes" class="form-control" rows="3"></textarea>
        </div>

        <button id="save-fuel" class="btn btn-success w-100">Guardar</button>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ asset('js/pages/admin-fuel-logs-create.js') }}"></script>
@endsection
