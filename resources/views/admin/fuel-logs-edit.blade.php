@extends('layouts.admin')

@section('title', 'Editar gasto de gasolina')
@section('main-id', 'admin-fuel-logs-edit')

@section('content')

<div class="admin-panel">

    <h2 class="mb-4" id="edit-title">Editar gasto de gasolina</h2>

    <div class="card card-body">

        {{-- Vehículo --}}
        <div class="mb-3">
            <label class="form-label">Vehículo</label>

            <div id="loader-vehicles" class="text-muted small d-none mb-1">
                Cargando vehículos...
            </div>

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

            <div id="loader-liters" class="text-muted small d-none mb-1">
                Cargando litros...
            </div>

            <input type="number" step="0.01" id="liters" class="form-control">
        </div>

        {{-- Kilómetros --}}
        <div class="mb-3">
            <label class="form-label">Kilómetros totales del mes</label>

            <div id="loader-km" class="text-muted small d-none mb-1">
                Cargando kilómetros...
            </div>

            <input type="number" id="km" class="form-control">
        </div>

        {{-- Dinero gastado --}}
        <div class="mb-3">
            <label class="form-label">Dinero gastado (€)</label>

            <div id="loader-amount" class="text-muted small d-none mb-1">
                Cargando monto...
            </div>

            <input type="number" step="0.01" id="amount" class="form-control">
        </div>

        {{-- Notas --}}
        <div class="mb-3">
            <label class="form-label">Notas</label>

            <div id="loader-notes" class="text-muted small d-none mb-1">
                Cargando notas...
            </div>

            <textarea id="notes" class="form-control" rows="3"></textarea>
        </div>

        <button id="save-fuel" class="btn btn-success w-100">Guardar cambios</button>

    </div>

</div>

@endsection

@section('scripts')
<script>
    const FUEL_LOG_ID = {{ $id }};
</script>
<script src="{{ asset('js/pages/admin-fuel-logs-edit.js') }}"></script>
@endsection
